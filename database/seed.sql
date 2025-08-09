-- Seed data for Donaciones Pola de Allande
-- PostgreSQL

-- Insert default admin user (password: admin123 - change in production!)
INSERT INTO admin_users (username, email, password_hash, role) VALUES 
('admin', 'admin@polaallande.org', '$2a$10$rOzJqtX5J8kF5YyX5J8kF5YyX5J8kF5YyX5J8kF5YyX5J8kF5YyX5', 'admin');

-- Insert donation goal for El Día del Inmigrante 2026
INSERT INTO donation_goals (title, description, target_amount, start_date, end_date) VALUES
('El Día del Inmigrante 2026 - República Dominicana', 
 'Meta de recaudación para la organización del evento El Día del Inmigrante 2026, homenajeando a República Dominicana',
 25000.00, 
 CURRENT_DATE, 
 '2026-05-15');

-- Insert event content sections
INSERT INTO event_content (section, title, content, display_order) VALUES
('hero', 'El Día del Inmigrante 2026', 
 'Únete a nosotros en la celebración del Día del Inmigrante 2026 en Pola de Allande, donde rendiremos homenaje a República Dominicana y su rica cultura.', 
 1),

('about', 'Sobre el Evento', 
 'El Día del Inmigrante es una celebración anual que honra las contribuciones de las comunidades inmigrantes a nuestra sociedad. Este año 2026, nos enorgullece rendir homenaje especial a República Dominicana, destacando su patrimonio cultural, tradiciones y el impacto positivo de la comunidad dominicana en España.', 
 2),

('dominican_republic', 'República Dominicana - País Homenajeado', 
 'República Dominicana, ubicada en la isla La Española en el Caribe, es conocida por su rica historia, cultura vibrante, música merengue y bachata, y su gente cálida y acogedora. El país ha contribuido significativamente a la diversidad cultural de España a través de su comunidad inmigrante.', 
 3),

('program', 'Programa del Evento', 
 'El evento incluirá espectáculos de música y danza tradicional dominicana, exhibiciones gastronómicas, conferencias sobre la historia y cultura dominicana, y actividades interactivas para toda la familia. Más detalles se anunciarán próximamente.', 
 4),

('donate', '¿Cómo Donar?', 
 'Tu donación ayuda a hacer posible este evento especial. Puedes contribuir mediante transferencia bancaria y recibir un certificado digital de participación. Cada donación, sin importar el monto, marca la diferencia.', 
 5);

-- Insert sample referral codes (for testing)
INSERT INTO referrals (code, name, email) VALUES
('EMBAJADOR2026', 'Embajador Principal', 'embajador@polaallande.org'),
('COMUNIDAD-RD', 'Comunidad República Dominicana', 'comunidad@dominicanos.es'),
('ASTURIAS-AMIGA', 'Amigos de Asturias', 'info@asturiasamiga.org');

-- Insert bank transfer information
INSERT INTO event_content (section, title, content, display_order) VALUES
('bank_info', 'Información Bancaria', 
 'Banco: Banco Santander
Titular: Asociación Cultural Pola de Allande  
IBAN: ES21 1234 5678 9012 3456 7890
SWIFT/BIC: BSCHESMM
Concepto: Donación Día Inmigrante 2026 + [Tu nombre o "Anónimo"]

Por favor, envía el comprobante de transferencia a donaciones@polaallande.org para confirmar tu donación.', 
 6);