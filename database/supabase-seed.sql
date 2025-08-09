-- Donaciones Pola de Allande - Supabase Seed Data
-- Run this AFTER the schema in Supabase SQL Editor

-- Insert admin user (password: +KyhITAke7HEFUda1FTbWw== hashed with bcrypt)
INSERT INTO admin_users (username, email, password_hash, role, name) VALUES 
('admin', 'admin@polaallande.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ux/XhzVEK', 'super_admin', 'Administrador Sistema');

-- Insert donation goal for El Día del Inmigrante 2026
INSERT INTO donation_goals (title, description, target_amount, start_date, end_date, is_active) VALUES
('El Día del Inmigrante 2026 - República Dominicana', 
 'Meta de recaudación para la organización del evento El Día del Inmigrante 2026, homenajeando a República Dominicana',
 25000.00, 
 CURRENT_DATE, 
 '2026-05-15',
 true);

-- Insert event content sections
INSERT INTO event_content (section, title, content, display_order, is_active) VALUES
('hero', 'El Día del Inmigrante 2026', 
 'Únete a nosotros en la celebración del Día del Inmigrante 2026 en Pola de Allande, donde rendiremos homenaje a República Dominicana y su rica cultura.', 
 1, true),

('about', 'Sobre el Evento', 
 'El Día del Inmigrante es una celebración anual que honra las contribuciones de las comunidades inmigrantes a nuestra sociedad. Este año 2026, nos enorgullece rendir homenaje especial a República Dominicana, destacando su patrimonio cultural, tradiciones y el impacto positivo de la comunidad dominicana en España.', 
 2, true),

('dominican_republic', 'República Dominicana - País Homenajeado', 
 'República Dominicana, ubicada en la isla La Española en el Caribe, es conocida por su rica historia, cultura vibrante, música merengue y bachata, y su gente cálida y acogedora. El país ha contribuido significativamente a la diversidad cultural de España a través de su comunidad inmigrante.', 
 3, true),

('program', 'Programa del Evento', 
 'El evento incluirá espectáculos de música y danza tradicional dominicana, exhibiciones gastronómicas, conferencias sobre la historia y cultura dominicana, y actividades interactivas para toda la familia. Más detalles se anunciarán próximamente.', 
 4, true),

('donate', '¿Cómo Donar?', 
 'Tu donación ayuda a hacer posible este evento especial. Puedes contribuir mediante transferencia bancaria y recibir un certificado digital de participación. Cada donación, sin importar el monto, marca la diferencia.', 
 5, true),

('bank_info', 'Información Bancaria', 
 'Banco: Banco Santander
Titular: Asociación Cultural Pola de Allande  
IBAN: ES21 1234 5678 9012 3456 7890
SWIFT/BIC: BSCHESMM
Concepto: Donación Día Inmigrante 2026 + [Tu número de referencia]

Por favor, envía el comprobante de transferencia a donaciones@polaallande.org para confirmar tu donación.', 
 6, true);

-- Insert sample referral codes (for testing)
INSERT INTO referrals (code, name, email, phone, created_by_ip) VALUES
('EMBAJADOR2026', 'Embajador Principal', 'embajador@polaallande.org', '+34123456789', '127.0.0.1'),
('COMUNIDAD-RD', 'Comunidad República Dominicana', 'comunidad@dominicanos.es', '+34987654321', '127.0.0.1'),
('ASTURIAS-AMIGA', 'Amigos de Asturias', 'info@asturiasamiga.org', '+34555123456', '127.0.0.1');

-- Update referral share URLs (will be updated with actual domain later)
UPDATE referrals SET share_url = 'https://[YOUR-DOMAIN]?ref=' || code;

-- Note: No sample donations inserted to keep the database clean for production
-- The triggers will automatically update totals when real donations come in

-- Verify data was inserted
DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully!';
    RAISE NOTICE 'Admin users: %', (SELECT COUNT(*) FROM admin_users);
    RAISE NOTICE 'Event content sections: %', (SELECT COUNT(*) FROM event_content);
    RAISE NOTICE 'Donation goals: %', (SELECT COUNT(*) FROM donation_goals);
    RAISE NOTICE 'Referral codes: %', (SELECT COUNT(*) FROM referrals);
END $$;