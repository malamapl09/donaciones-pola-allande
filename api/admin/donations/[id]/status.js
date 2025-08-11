const { Pool } = require('pg');

// Create database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'ID y estado son requeridos' });
    }

    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    // Update donation status
    const updateQuery = `
      UPDATE donations 
      SET 
        status = $1,
        confirmed_at = CASE WHEN $1 = 'confirmed' THEN NOW() ELSE confirmed_at END,
        confirmed_by = CASE WHEN $1 IN ('confirmed', 'rejected') THEN 'admin' ELSE confirmed_by END
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donación no encontrada' });
    }

    const donation = result.rows[0];

    // If confirmed, update referral statistics
    if (status === 'confirmed' && donation.referral_id) {
      await pool.query(`
        UPDATE referrals 
        SET 
          total_donations = total_donations + 1,
          total_amount = total_amount + $1
        WHERE id = $2
      `, [donation.amount, donation.referral_id]);
    }

    return res.status(200).json({
      success: true,
      donation: {
        id: donation.id,
        status: donation.status,
        confirmedAt: donation.confirmed_at,
        confirmedBy: donation.confirmed_by
      }
    });

  } catch (error) {
    console.error('Update donation status error:', error);
    return res.status(500).json({ error: 'Error al actualizar estado de donación' });
  }
}