const { Pool } = require('pg');

// Create database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get all referrals with their statistics
    const query = `
      SELECT 
        r.code,
        r.name,
        r.total_donations,
        r.total_amount,
        r.created_at,
        r.is_active
      FROM referrals r
      WHERE r.is_active = true
      ORDER BY r.total_amount DESC, r.total_donations DESC, r.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    const leaderboard = result.rows.map(row => ({
      code: row.code,
      name: row.name,
      totalDonations: parseInt(row.total_donations) || 0,
      totalAmount: parseFloat(row.total_amount) || 0,
      createdAt: row.created_at
    }));
    
    return res.status(200).json({
      leaderboard,
      total: leaderboard.length
    });
    
  } catch (error) {
    console.error('Referrals error:', error);
    return res.status(500).json({ error: 'Error al obtener referencias' });
  }
}