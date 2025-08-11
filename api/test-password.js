const bcrypt = require('bcryptjs');
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

    // Get the password hash for the test user
    const result = await pool.query(
      'SELECT email, password_hash FROM admin_users WHERE email = $1',
      ['newadmin@test.com']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const storedHash = user.password_hash;
    
    // Test various passwords
    const testPasswords = [
      'NewAdmin123!',
      'Admin2026!',
      '+KyhITAke7HEFUda1FTbWw==',
      'TestAdmin123!',
      'newadmin123'
    ];
    
    const results = {};
    for (const password of testPasswords) {
      const isValid = await bcrypt.compare(password, storedHash);
      results[password] = isValid;
    }
    
    // Also create a fresh hash for NewAdmin123! to compare
    const freshHash = await bcrypt.hash('NewAdmin123!', 12);
    const freshHashTest = await bcrypt.compare('NewAdmin123!', freshHash);
    
    return res.status(200).json({
      email: user.email,
      storedHash: storedHash,
      freshHash: freshHash,
      freshHashTest: freshHashTest,
      passwordTests: results,
      bcryptWorking: await bcrypt.compare('test', await bcrypt.hash('test', 12))
    });
    
  } catch (error) {
    console.error('Password test error:', error);
    return res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
}