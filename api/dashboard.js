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
    // Get dashboard statistics
    const statsQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_donations,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_donations,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_donations,
        COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) as total_confirmed_amount,
        COUNT(DISTINCT donor_country) as unique_countries
      FROM donations
    `;
    
    // Get recent donations
    const recentDonationsQuery = `
      SELECT 
        reference_number,
        CASE 
          WHEN is_anonymous THEN 'Donante Anónimo'
          WHEN donor_name IS NOT NULL THEN donor_name
          ELSE 'Donante Anónimo'
        END as donor_name,
        amount,
        status,
        created_at
      FROM donations 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    // Get top referrals
    const topReferralsQuery = `
      SELECT 
        r.code,
        r.name,
        COALESCE(r.total_donations, 0) as total_donations,
        COALESCE(r.total_amount, 0) as total_amount
      FROM referrals r
      WHERE r.is_active = true
      ORDER BY r.total_amount DESC, r.total_donations DESC
      LIMIT 5
    `;
    
    // Execute all queries in parallel
    const [statsResult, recentDonationsResult, topReferralsResult] = await Promise.all([
      pool.query(statsQuery),
      pool.query(recentDonationsQuery), 
      pool.query(topReferralsQuery)
    ]);
    
    const stats = statsResult.rows[0];
    const recentDonations = recentDonationsResult.rows;
    const topReferrals = topReferralsResult.rows;
    
    return res.status(200).json({
      stats: {
        pendingDonations: parseInt(stats.pending_donations) || 0,
        confirmedDonations: parseInt(stats.confirmed_donations) || 0,
        rejectedDonations: parseInt(stats.rejected_donations) || 0,
        totalConfirmedAmount: parseFloat(stats.total_confirmed_amount) || 0,
        uniqueCountries: parseInt(stats.unique_countries) || 0
      },
      recentDonations: recentDonations.map(donation => ({
        referenceNumber: donation.reference_number,
        donorName: donation.donor_name,
        amount: parseFloat(donation.amount),
        status: donation.status,
        createdAt: donation.created_at
      })),
      topReferrals: topReferrals.map(referral => ({
        code: referral.code,
        name: referral.name,
        totalDonations: parseInt(referral.total_donations) || 0,
        totalAmount: parseFloat(referral.total_amount) || 0
      }))
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
}