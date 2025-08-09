import { Router, Request, Response } from 'express';
import pool from '../utils/database';
import { generateReferenceNumber } from '../utils/generateCode';
import { validateDonation } from '../middleware/validation';
import { donationRateLimit } from '../middleware/rateLimit';
import { validateDonationAmount } from '../middleware/security';
import { donationLogger } from '../middleware/logging';
import { CreateDonationRequest, DonationStats } from '../types';

const router = Router();

router.post('/', donationRateLimit, validateDonation, validateDonationAmount, async (req: Request, res: Response) => {
  try {
    const {
      donorName,
      donorEmail,
      donorPhone,
      donorCountry,
      amount,
      isAnonymous,
      message,
      referralCode,
      utmSource,
      utmMedium,
      utmCampaign
    }: CreateDonationRequest = req.body;

    const referenceNumber = generateReferenceNumber();
    let referralId = null;

    if (referralCode) {
      const referralResult = await pool.query(
        'SELECT id FROM referrals WHERE code = $1 AND is_active = true',
        [referralCode]
      );
      
      if (referralResult.rows.length > 0) {
        referralId = referralResult.rows[0].id;
      }
    }

    const result = await pool.query(`
      INSERT INTO donations (
        reference_number, donor_name, donor_email, donor_phone, donor_country,
        amount, is_anonymous, message, referral_id, utm_source, utm_medium, utm_campaign
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, reference_number, amount, created_at
    `, [
      referenceNumber,
      isAnonymous ? null : donorName,
      isAnonymous ? null : donorEmail,
      isAnonymous ? null : donorPhone,
      donorCountry,
      amount,
      isAnonymous,
      message,
      referralId,
      utmSource,
      utmMedium,
      utmCampaign
    ]);

    const donation = result.rows[0];

    const bankInfo = await pool.query(`
      SELECT content FROM event_content WHERE section = 'bank_info' AND is_published = true
    `);

    const donationData = {
      id: donation.id,
      referenceNumber: donation.reference_number,
      amount: donation.amount,
      createdAt: donation.created_at
    };

    donationLogger('DONATION_CREATED', req, {
      ...donationData,
      isAnonymous,
      referralCode
    });

    res.status(201).json({
      donation: donationData,
      bankTransferInfo: bankInfo.rows[0]?.content || 'Información bancaria no disponible',
      message: 'Donación registrada exitosamente. Procede con la transferencia bancaria.'
    });

  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const statsQuery = `
      SELECT 
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(*) as total_donations,
        COALESCE(AVG(amount), 0) as average_donation
      FROM donations 
      WHERE status = 'confirmed'
    `;
    
    const goalQuery = `
      SELECT target_amount, current_amount 
      FROM donation_goals 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    const countriesQuery = `
      SELECT 
        donor_country as country,
        COUNT(*) as count,
        SUM(amount) as amount
      FROM donations 
      WHERE status = 'confirmed' AND donor_country IS NOT NULL
      GROUP BY donor_country 
      ORDER BY amount DESC 
      LIMIT 5
    `;

    const recentQuery = `
      SELECT amount, donor_name, created_at, is_anonymous
      FROM donations 
      WHERE status = 'confirmed'
      ORDER BY created_at DESC 
      LIMIT 10
    `;

    const [statsResult, goalResult, countriesResult, recentResult] = await Promise.all([
      pool.query(statsQuery),
      pool.query(goalQuery),
      pool.query(countriesQuery),
      pool.query(recentQuery)
    ]);

    const stats = statsResult.rows[0];
    const goal = goalResult.rows[0];
    const goalProgress = goal ? (goal.current_amount / goal.target_amount) * 100 : 0;

    const response: DonationStats = {
      totalAmount: parseFloat(stats.total_amount),
      totalDonations: parseInt(stats.total_donations),
      averageDonation: parseFloat(stats.average_donation),
      goalProgress: Math.min(goalProgress, 100),
      topCountries: countriesResult.rows.map(row => ({
        country: row.country,
        count: parseInt(row.count),
        amount: parseFloat(row.amount)
      })),
      recentDonations: recentResult.rows.map(row => ({
        amount: parseFloat(row.amount),
        donorName: row.is_anonymous ? null : row.donor_name,
        createdAt: row.created_at,
        isAnonymous: row.is_anonymous
      }))
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching donation stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:referenceNumber', async (req: Request, res: Response) => {
  try {
    const { referenceNumber } = req.params;

    const result = await pool.query(`
      SELECT 
        d.id, d.reference_number, d.amount, d.status, d.created_at, d.confirmed_at,
        d.donor_name, d.is_anonymous, d.message
      FROM donations d
      WHERE d.reference_number = $1
    `, [referenceNumber]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donación no encontrada' });
    }

    const donation = result.rows[0];
    res.json({
      id: donation.id,
      referenceNumber: donation.reference_number,
      amount: parseFloat(donation.amount),
      status: donation.status,
      createdAt: donation.created_at,
      confirmedAt: donation.confirmed_at,
      donorName: donation.is_anonymous ? null : donation.donor_name,
      isAnonymous: donation.is_anonymous,
      message: donation.message
    });

  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;