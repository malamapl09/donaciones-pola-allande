import { Router, Request, Response } from 'express';
import pool from '../utils/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT section, title, content, image_url, display_order
      FROM event_content 
      WHERE is_published = true
      ORDER BY display_order ASC
    `);

    const content = result.rows.reduce((acc, row) => {
      acc[row.section] = {
        title: row.title,
        content: row.content,
        imageUrl: row.image_url,
        displayOrder: row.display_order
      };
      return acc;
    }, {});

    res.json(content);

  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/section/:section', async (req: Request, res: Response) => {
  try {
    const { section } = req.params;

    const result = await pool.query(`
      SELECT title, content, image_url, display_order
      FROM event_content 
      WHERE section = $1 AND is_published = true
    `, [section]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sección no encontrada' });
    }

    const content = result.rows[0];
    res.json({
      title: content.title,
      content: content.content,
      imageUrl: content.image_url,
      displayOrder: content.display_order
    });

  } catch (error) {
    console.error('Error fetching section content:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/goals', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        title, description, target_amount, current_amount,
        start_date, end_date, created_at
      FROM donation_goals 
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.json({
        title: 'Sin meta activa',
        targetAmount: 0,
        currentAmount: 0,
        progress: 0
      });
    }

    const goal = result.rows[0];
    const progress = goal.target_amount > 0 
      ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
      : 0;

    res.json({
      title: goal.title,
      description: goal.description,
      targetAmount: parseFloat(goal.target_amount),
      currentAmount: parseFloat(goal.current_amount),
      progress: Math.round(progress * 100) / 100,
      startDate: goal.start_date,
      endDate: goal.end_date,
      createdAt: goal.created_at
    });

  } catch (error) {
    console.error('Error fetching donation goal:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;