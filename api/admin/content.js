const { Pool } = require('pg');

// Create database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Get all content sections
      const query = `
        SELECT section, title, content, display_order, is_active
        FROM event_content
        ORDER BY display_order, section
      `;
      
      const result = await pool.query(query);
      
      const sections = result.rows.map(row => ({
        section: row.section,
        title: row.title,
        content: row.content,
        displayOrder: row.display_order,
        isActive: row.is_active
      }));

      return res.status(200).json({ sections });

    } catch (error) {
      console.error('Get content error:', error);
      return res.status(500).json({ error: 'Error al obtener contenido' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { section, title, content, displayOrder, isActive } = req.body;

      if (!section || !title || !content) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      // Update or insert content section
      const query = `
        INSERT INTO event_content (section, title, content, display_order, is_active, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (section)
        DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          display_order = EXCLUDED.display_order,
          is_active = EXCLUDED.is_active,
          updated_at = EXCLUDED.updated_at
        RETURNING *
      `;

      const result = await pool.query(query, [
        section,
        title,
        content,
        displayOrder || 0,
        isActive !== undefined ? isActive : true
      ]);

      const updatedSection = result.rows[0];

      return res.status(200).json({
        success: true,
        section: {
          section: updatedSection.section,
          title: updatedSection.title,
          content: updatedSection.content,
          displayOrder: updatedSection.display_order,
          isActive: updatedSection.is_active
        }
      });

    } catch (error) {
      console.error('Update content error:', error);
      return res.status(500).json({ error: 'Error al actualizar contenido' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}