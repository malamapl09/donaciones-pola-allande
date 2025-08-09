import { Router, Request, Response } from 'express';
import pool from '../utils/database';
import { generateReferralCode } from '../utils/generateCode';
import { validateReferral } from '../middleware/validation';
import { CreateReferralRequest } from '../types';

const router = Router();

router.post('/', validateReferral, async (req: Request, res: Response) => {
  try {
    const { name, email, phone }: CreateReferralRequest = req.body;
    
    const code = generateReferralCode(name);

    const result = await pool.query(`
      INSERT INTO referrals (code, name, email, phone)
      VALUES ($1, $2, $3, $4)
      RETURNING id, code, name, created_at
    `, [code, name, email, phone]);

    const referral = result.rows[0];

    res.status(201).json({
      id: referral.id,
      code: referral.code,
      name: referral.name,
      createdAt: referral.created_at,
      shareUrl: `${req.protocol}://${req.get('host')}?ref=${referral.code}`,
      message: 'Enlace de referencia creado exitosamente'
    });

  } catch (error: any) {
    console.error('Error creating referral:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Ya existe un código similar. Intenta con otro nombre.' });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const referralQuery = `
      SELECT 
        r.id, r.code, r.name, r.email, r.created_at, r.is_active,
        r.total_donations, r.total_amount
      FROM referrals r
      WHERE r.code = $1 AND r.is_active = true
    `;

    const donationsQuery = `
      SELECT 
        d.amount, d.donor_name, d.created_at, d.is_anonymous, d.status
      FROM donations d
      JOIN referrals r ON d.referral_id = r.id
      WHERE r.code = $1 AND d.status = 'confirmed'
      ORDER BY d.created_at DESC
      LIMIT 10
    `;

    const [referralResult, donationsResult] = await Promise.all([
      pool.query(referralQuery, [code]),
      pool.query(donationsQuery, [code])
    ]);

    if (referralResult.rows.length === 0) {
      return res.status(404).json({ error: 'Código de referencia no encontrado o inactivo' });
    }

    const referral = referralResult.rows[0];

    res.json({
      id: referral.id,
      code: referral.code,
      name: referral.name,
      email: referral.email,
      createdAt: referral.created_at,
      totalDonations: referral.total_donations,
      totalAmount: parseFloat(referral.total_amount),
      isActive: referral.is_active,
      recentDonations: donationsResult.rows.map(row => ({
        amount: parseFloat(row.amount),
        donorName: row.is_anonymous ? 'Donante Anónimo' : row.donor_name,
        createdAt: row.created_at,
        status: row.status
      })),
      shareUrl: `${req.protocol}://${req.get('host')}?ref=${referral.code}`
    });

  } catch (error) {
    console.error('Error fetching referral:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        code, name, total_donations, total_amount, created_at
      FROM referrals 
      WHERE is_active = true AND total_donations > 0
      ORDER BY total_amount DESC
      LIMIT 20
    `);

    const leaderboard = result.rows.map(row => ({
      code: row.code,
      name: row.name,
      totalDonations: row.total_donations,
      totalAmount: parseFloat(row.total_amount),
      createdAt: row.created_at
    }));

    res.json({ leaderboard });

  } catch (error) {
    console.error('Error fetching referral leaderboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;