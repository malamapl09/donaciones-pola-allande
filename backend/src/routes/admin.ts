import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../utils/database';
import { authenticateToken } from '../middleware/auth';
import { loginRateLimit } from '../middleware/rateLimit';
import { auditLogger } from '../middleware/logging';

const router = Router();

router.post('/login', loginRateLimit, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const result = await pool.query(
      'SELECT id, username, email, password_hash, role, is_active FROM admin_users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await pool.query(
      'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    auditLogger('ADMIN_LOGIN', user.id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/donations', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let queryParams: any[] = [limit, offset];
    let paramIndex = 3;

    if (status && ['pending', 'confirmed', 'rejected'].includes(status)) {
      whereClause = 'WHERE d.status = $3';
      queryParams.push(status);
      paramIndex++;
    }

    const donationsQuery = `
      SELECT 
        d.id, d.reference_number, d.donor_name, d.donor_email, d.donor_phone,
        d.donor_country, d.amount, d.currency, d.status, d.is_anonymous,
        d.message, d.created_at, d.confirmed_at, d.confirmed_by,
        r.code as referral_code, r.name as referral_name
      FROM donations d
      LEFT JOIN referrals r ON d.referral_id = r.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM donations d 
      ${whereClause}
    `;

    const [donationsResult, countResult] = await Promise.all([
      pool.query(donationsQuery, queryParams),
      pool.query(countQuery, status ? [status] : [])
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      donations: donationsResult.rows.map(row => ({
        id: row.id,
        referenceNumber: row.reference_number,
        donorName: row.is_anonymous ? 'Anónimo' : row.donor_name,
        donorEmail: row.donor_email,
        donorPhone: row.donor_phone,
        donorCountry: row.donor_country,
        amount: parseFloat(row.amount),
        currency: row.currency,
        status: row.status,
        isAnonymous: row.is_anonymous,
        message: row.message,
        createdAt: row.created_at,
        confirmedAt: row.confirmed_at,
        confirmedBy: row.confirmed_by,
        referralCode: row.referral_code,
        referralName: row.referral_name
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching admin donations:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.patch('/donations/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { user } = req as any;

    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const result = await pool.query(`
      UPDATE donations 
      SET 
        status = $1, 
        confirmed_at = CASE WHEN $1 = 'confirmed' THEN CURRENT_TIMESTAMP ELSE confirmed_at END,
        confirmed_by = CASE WHEN $1 = 'confirmed' THEN $3 ELSE confirmed_by END
      WHERE id = $2
      RETURNING id, reference_number, status, confirmed_at
    `, [status, id, user.username]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donación no encontrada' });
    }

    res.json({
      message: `Donación ${status === 'confirmed' ? 'confirmada' : 'rechazada'} exitosamente`,
      donation: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating donation status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/dashboard', authenticateToken, async (req: Request, res: Response) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_donations,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_donations,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_donations,
        COALESCE(SUM(amount) FILTER (WHERE status = 'confirmed'), 0) as total_confirmed_amount,
        COUNT(DISTINCT donor_country) FILTER (WHERE status = 'confirmed' AND donor_country IS NOT NULL) as unique_countries
      FROM donations
    `;

    const recentQuery = `
      SELECT reference_number, donor_name, amount, status, created_at, is_anonymous
      FROM donations
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const topReferralsQuery = `
      SELECT code, name, total_donations, total_amount
      FROM referrals
      WHERE is_active = true AND total_donations > 0
      ORDER BY total_amount DESC
      LIMIT 5
    `;

    const [statsResult, recentResult, referralsResult] = await Promise.all([
      pool.query(statsQuery),
      pool.query(recentQuery),
      pool.query(topReferralsQuery)
    ]);

    const stats = statsResult.rows[0];

    res.json({
      stats: {
        pendingDonations: parseInt(stats.pending_donations),
        confirmedDonations: parseInt(stats.confirmed_donations),
        rejectedDonations: parseInt(stats.rejected_donations),
        totalConfirmedAmount: parseFloat(stats.total_confirmed_amount),
        uniqueCountries: parseInt(stats.unique_countries)
      },
      recentDonations: recentResult.rows.map(row => ({
        referenceNumber: row.reference_number,
        donorName: row.is_anonymous ? 'Anónimo' : row.donor_name,
        amount: parseFloat(row.amount),
        status: row.status,
        createdAt: row.created_at
      })),
      topReferrals: referralsResult.rows.map(row => ({
        code: row.code,
        name: row.name,
        totalDonations: row.total_donations,
        totalAmount: parseFloat(row.total_amount)
      }))
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;