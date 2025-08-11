const { Pool } = require('pg');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Get admin users (without passwords)
    const result = await pool.query(`
      SELECT id, username, email, name, role, is_active, created_at, last_login
      FROM admin_users 
      ORDER BY created_at DESC
    `);
    
    return res.status(200).json({
      status: 'success',
      users: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Admin users query error:', error);
    return res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
}