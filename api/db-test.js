const { Pool } = require('pg');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // Create database pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test basic connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();

    // Test admin_users table
    const usersResult = await pool.query('SELECT COUNT(*) as user_count FROM admin_users');
    
    return res.status(200).json({
      status: 'success',
      connection: 'OK',
      currentTime: result.rows[0].current_time,
      adminUserCount: usersResult.rows[0].user_count,
      databaseUrl: process.env.DATABASE_URL ? 'SET (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT SET'
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    return res.status(500).json({
      status: 'error',
      error: error.message,
      code: error.code,
      detail: error.detail,
      databaseUrl: process.env.DATABASE_URL ? 'SET (length: ' + process.env.DATABASE_URL.length + ')' : 'NOT SET'
    });
  }
}