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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get total statistics
    const totalStatsQuery = `
      SELECT 
        COUNT(*) as total_donations,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as average_amount,
        COUNT(DISTINCT donor_country) as total_countries
      FROM donations 
      WHERE status = 'confirmed'
    `;

    // Get status breakdown
    const statusBreakdownQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM donations 
      GROUP BY status
    `;

    // Get monthly statistics
    const monthlyStatsQuery = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as donations,
        COALESCE(SUM(amount), 0) as amount
      FROM donations 
      WHERE status = 'confirmed'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
    `;

    // Get country statistics
    const countryStatsQuery = `
      SELECT 
        COALESCE(donor_country, 'No especificado') as country,
        COUNT(*) as donations,
        COALESCE(SUM(amount), 0) as amount
      FROM donations 
      WHERE status = 'confirmed'
      GROUP BY donor_country
      ORDER BY amount DESC, donations DESC
    `;

    // Get referral statistics
    const referralStatsQuery = `
      SELECT 
        r.code,
        r.name,
        r.total_donations as donations,
        r.total_amount as amount
      FROM referrals r
      WHERE r.is_active = true AND (r.total_donations > 0 OR r.total_amount > 0)
      ORDER BY r.total_amount DESC, r.total_donations DESC
    `;

    // Execute all queries
    const [
      totalStatsResult,
      statusBreakdownResult,
      monthlyStatsResult,
      countryStatsResult,
      referralStatsResult
    ] = await Promise.all([
      pool.query(totalStatsQuery),
      pool.query(statusBreakdownQuery),
      pool.query(monthlyStatsQuery),
      pool.query(countryStatsQuery),
      pool.query(referralStatsQuery)
    ]);

    // Process results
    const totalStats = totalStatsResult.rows[0];

    const statusBreakdown = { pending: 0, confirmed: 0, rejected: 0 };
    statusBreakdownResult.rows.forEach(row => {
      statusBreakdown[row.status] = parseInt(row.count);
    });

    const monthlyStats = monthlyStatsResult.rows.map(row => ({
      month: row.month,
      donations: parseInt(row.donations),
      amount: parseFloat(row.amount)
    }));

    const countryStats = countryStatsResult.rows.map(row => ({
      country: row.country,
      donations: parseInt(row.donations),
      amount: parseFloat(row.amount)
    }));

    const referralStats = referralStatsResult.rows.map(row => ({
      code: row.code,
      name: row.name,
      donations: parseInt(row.donations) || 0,
      amount: parseFloat(row.amount) || 0
    }));

    return res.status(200).json({
      totalStats: {
        totalDonations: parseInt(totalStats.total_donations),
        totalAmount: parseFloat(totalStats.total_amount),
        averageAmount: parseFloat(totalStats.average_amount),
        totalCountries: parseInt(totalStats.total_countries)
      },
      statusBreakdown,
      monthlyStats,
      countryStats,
      referralStats
    });

  } catch (error) {
    console.error('Reports error:', error);
    return res.status(500).json({ error: 'Error al generar reportes' });
  }
}