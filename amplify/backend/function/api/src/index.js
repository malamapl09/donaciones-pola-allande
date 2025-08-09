const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('combined'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Get user from database
    const result = await pool.query(
      'SELECT * FROM admin_users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Update last login
    await pool.query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Get content
app.get('/api/content', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM event_content WHERE is_active = true ORDER BY display_order'
    );
    
    const content = {};
    result.rows.forEach(row => {
      content[row.section] = {
        title: row.title,
        content: row.content
      };
    });
    
    res.json(content);
  } catch (error) {
    console.error('Content error:', error);
    res.status(500).json({ error: 'Error al obtener contenido' });
  }
});

// Get donation stats
app.get('/api/donations/stats', async (req, res) => {
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

    res.json({
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
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Create donation
app.post('/api/donations', async (req, res) => {
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
      req.ip || '127.0.0.1'
    ]);

    const donation = result.rows[0];

    // Get bank transfer info
    const bankInfoResult = await pool.query(
      "SELECT content FROM event_content WHERE section = 'bank_info' AND is_active = true"
    );
    
    const bankTransferInfo = bankInfoResult.rows.length > 0 
      ? bankInfoResult.rows[0].content 
      : 'Información bancaria no disponible';

    res.status(201).json({
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
    res.status(500).json({ error: 'Error al crear la donación' });
  }
});

// Get referral by code
app.get('/api/referrals/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const result = await pool.query(`
      SELECT r.*, 
        COALESCE(r.total_donations, 0) as totalDonations,
        COALESCE(r.total_amount, 0) as totalAmount
      FROM referrals r 
      WHERE r.code = $1 AND r.is_active = true
    `, [code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Código de referencia no encontrado' });
    }

    const referral = result.rows[0];

    // Get recent donations for this referral
    const donationsResult = await pool.query(`
      SELECT donor_name, amount, created_at, status, is_anonymous
      FROM donations 
      WHERE referral_id = $1 AND status IN ('confirmed', 'pending')
      ORDER BY created_at DESC 
      LIMIT 10
    `, [referral.id]);

    const recentDonations = donationsResult.rows.map(d => ({
      donorName: d.is_anonymous ? 'Donante Anónimo' : (d.donor_name || 'Donante Anónimo'),
      amount: parseFloat(d.amount),
      createdAt: d.created_at,
      status: d.status
    }));

    res.json({
      id: referral.id,
      code: referral.code,
      name: referral.name,
      email: referral.email,
      totalDonations: parseInt(referral.totaldonations),
      totalAmount: parseFloat(referral.totalamount),
      createdAt: referral.created_at,
      shareUrl: `${process.env.FRONTEND_URL}?ref=${referral.code}`,
      recentDonations
    });

  } catch (error) {
    console.error('Referral fetch error:', error);
    res.status(500).json({ error: 'Error al obtener información de referencia' });
  }
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Export for serverless
module.exports.handler = serverless(app);