const { Pool } = require('pg');

// Create database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { section } = req.query;
    
    if (section) {
      // Get specific section content
      const result = await pool.query(
        'SELECT * FROM event_content WHERE section = $1 AND is_active = true',
        [section]
      );
      
      if (result.rows.length === 0) {
        // Return default bank info if section is bank_info
        if (section === 'bank_info') {
          return res.status(200).json({
            section: 'bank_info',
            title: 'Información Bancaria',
            content: `DATOS BANCARIOS PARA TRANSFERENCIA:

Banco: Banco Santander
Titular: Asociación Cultural Pola de Allande
IBAN: ES21 1234 5678 9012 3456 7890
Concepto: Donación El Día del Inmigrante 2026 - [Tu número de referencia]

IMPORTANTE: 
- Incluye tu número de referencia en el concepto de la transferencia
- Envía el comprobante a donaciones@polaallande.org`
          });
        }
        
        return res.status(404).json({ error: 'Section not found' });
      }
      
      const content = result.rows[0];
      return res.status(200).json({
        section: content.section,
        title: content.title,
        content: content.content
      });
    }
    
    // Get all content
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
    
    return res.status(200).json(content);
    
  } catch (error) {
    console.error('Content error:', error);
    return res.status(500).json({ error: 'Error al obtener contenido' });
  }
}