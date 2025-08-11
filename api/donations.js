const { Pool } = require('pg');

// Create database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    // Get donation statistics
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_donations,
          COALESCE(SUM(amount), 0) as total_amount,
          COALESCE(AVG(amount), 0) as average_donation
        FROM donations 
        WHERE status = 'confirmed'
      `;
      
      const recentQuery = `
        SELECT donor_name, amount, created_at, is_anonymous
        FROM donations 
        WHERE status = 'confirmed'
        ORDER BY created_at DESC 
        LIMIT 5
      `;

      const [statsResult, recentResult] = await Promise.all([
        pool.query(statsQuery),
        pool.query(recentQuery)
      ]);

      const stats = statsResult.rows[0];
      const recentDonations = recentResult.rows;

      return res.status(200).json({
        totalAmount: parseFloat(stats.total_amount),
        totalDonations: parseInt(stats.total_donations),
        averageDonation: parseFloat(stats.average_donation),
        recentDonations: recentDonations.map(donation => ({
          donorName: donation.is_anonymous ? null : donation.donor_name,
          amount: parseFloat(donation.amount),
          createdAt: donation.created_at,
          isAnonymous: donation.is_anonymous
        }))
      });
    } catch (error) {
      console.error('Stats error:', error);
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
  
  if (req.method === 'POST') {
    // Create donation
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
      } = req.body;

      // Validate required fields
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Monto inválido' });
      }

      // Generate reference number
      const referenceNumber = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Get referral ID if referral code provided
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

      // Insert donation
      const result = await pool.query(`
        INSERT INTO donations (
          reference_number, donor_name, donor_email, donor_phone, 
          donor_country, amount, is_anonymous, message, referral_id,
          utm_source, utm_medium, utm_campaign, created_by_ip
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
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
        utmCampaign,
        req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1'
      ]);

      const donation = result.rows[0];

      // Get bank transfer info
      const bankInfoResult = await pool.query(
        "SELECT content FROM event_content WHERE section = 'bank_info' AND is_active = true"
      );
      
      const bankTransferInfo = bankInfoResult.rows.length > 0 
        ? bankInfoResult.rows[0].content 
        : `DATOS BANCARIOS PARA TRANSFERENCIA:

Banco: Banco Santander
Titular: Asociación Cultural Pola de Allande
IBAN: ES21 1234 5678 9012 3456 7890
Concepto: Donación El Día del Inmigrante 2026 - [Tu número de referencia]

IMPORTANTE: 
- Incluye tu número de referencia en el concepto de la transferencia
- Envía el comprobante a donaciones@polaallande.org`;

      return res.status(201).json({
        donation: {
          id: donation.id,
          referenceNumber: donation.reference_number,
          amount: parseFloat(donation.amount),
          status: donation.status,
          createdAt: donation.created_at
        },
        bankTransferInfo: bankTransferInfo.replace('[Tu número de referencia]', donation.reference_number)
      });

    } catch (error) {
      console.error('Donation creation error:', error);
      return res.status(500).json({ error: 'Error al crear la donación' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}