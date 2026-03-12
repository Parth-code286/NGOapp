-- Create the translations table
CREATE TABLE translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  language_code TEXT NOT NULL,
  translation_key TEXT NOT NULL,
  translation_value TEXT NOT NULL,
  UNIQUE(language_code, translation_key)
);

-- Enable Row Level Security
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Allow public read access (Anyone can fetch translations)
CREATE POLICY "Allow public read access to translations" 
ON translations FOR SELECT 
USING (true);

-- Insert the base Landing Page translations in English
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('en', 'nav.home', 'Home'),
('en', 'nav.features', 'Features'),
('en', 'nav.about', 'About Us'),
('en', 'nav.login', 'Login'),
('en', 'nav.dashboard', 'Dashboard'),
('en', 'hero.title', 'Welcome to Impact Hub'),
('en', 'hero.subtitle', 'Connecting Passionate Volunteers with Meaningful NGO Events.'),
('en', 'hero.cta', 'Get Started Today'),
('en', 'features.title', 'Our Features'),
('en', 'features.f1_title', 'Discover Events'),
('en', 'features.f1_desc', 'Find local events that match your interests.'),
('en', 'features.f2_title', 'Track Impact'),
('en', 'features.f2_desc', 'Visualize volunteer contributions over time.'),
('en', 'features.f3_title', 'Build Communities'),
('en', 'features.f3_desc', 'Engage with like-minded individuals.'),
('en', 'footer.rights', '© 2024 Impact Hub. All rights reserved.');

-- Insert Spanish translations 
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('es', 'nav.home', 'Inicio'),
('es', 'nav.features', 'Características'),
('es', 'nav.about', 'Sobre nosotros'),
('es', 'nav.login', 'Iniciar sesión'),
('es', 'nav.dashboard', 'Panel'),
('es', 'hero.title', 'Bienvenido a Impact Hub'),
('es', 'hero.subtitle', 'Conectando voluntarios apasionados con eventos significativos.'),
('es', 'hero.cta', 'Comienza Hoy');

-- Insert French translations 
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
('fr', 'nav.home', 'Accueil'),
('fr', 'nav.features', 'Fonctionnalités'),
('fr', 'nav.about', 'À propos'),
('fr', 'nav.login', 'Connexion'),
('fr', 'nav.dashboard', 'Tableau de bord'),
('fr', 'hero.title', 'Bienvenue sur Impact Hub'),
('fr', 'hero.subtitle', 'Connecter des bénévoles passionnés avec des événements significatifs.'),
('fr', 'hero.cta', 'Commencez aujourd''hui');
