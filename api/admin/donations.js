const { Pool } = require('pg');

// Create database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '20', status } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build WHERE clause
      let whereClause = '';
      let queryParams = [parseInt(limit), offset];
      let paramCount = 2;

      if (status) {
        whereClause = 'WHERE d.status = $' + (++paramCount);
        queryParams.push(status);
      }

      // Get donations with referral info
      const donationsQuery = `
        SELECT 
          d.*,
          r.code as referral_code,
          r.name as referral_name
        FROM donations d
        LEFT JOIN referrals r ON d.referral_id = r.id
        ${whereClause}
        ORDER BY d.created_at DESC
        LIMIT $1 OFFSET $2
      `;

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM donations d
        ${whereClause}
      `;

      const countParams = status ? [status] : [];

      const [donationsResult, countResult] = await Promise.all([
        pool.query(donationsQuery, queryParams),
        pool.query(countQuery, countParams)
      ]);

      const donations = donationsResult.rows.map(row => ({
        id: row.id,
        referenceNumber: row.reference_number,
        donorName: row.is_anonymous ? 'Donante Anónimo' : row.donor_name,
        donorEmail: row.is_anonymous ? null : row.donor_email,
        donorPhone: row.is_anonymous ? null : row.donor_phone,
        donorCountry: row.donor_country,
        amount: parseFloat(row.amount),
        currency: 'EUR',
        status: row.status,
        isAnonymous: row.is_anonymous,
        message: row.message,
        createdAt: row.created_at,
        confirmedAt: row.confirmed_at,
        confirmedBy: row.confirmed_by,
        referralCode: row.referral_code,
        referralName: row.referral_name
      }));

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / parseInt(limit));
      const currentPage = parseInt(page);

      return res.status(200).json({
        donations,
        pagination: {
          page: currentPage,
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1
        }
      });

    } catch (error) {
      console.error('Admin donations fetch error:', error);
      return res.status(500).json({ error: 'Error al obtener donaciones' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}