-- Insert sample video resources
INSERT INTO public.resources (title, description, content_type, category, url, thumbnail_url, is_published, created_by) VALUES 
('Exercícios Sensoriais para Autismo', 'Vídeo com exercícios práticos para desenvolvimento sensorial', 'video', 'Sensorial', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', true, NULL),
('Técnicas de Comunicação Visual', 'Como usar pictogramas e símbolos para comunicação', 'video', 'Comunicação', 'https://www.youtube.com/watch?v=J---aiyznGQ', 'https://img.youtube.com/vi/J---aiyznGQ/maxresdefault.jpg', true, NULL),
('Desenvolvendo Habilidades Sociais', 'Estratégias para melhorar interações sociais', 'video', 'Habilidades Sociais', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg', true, NULL),
('Criando Rotinas Estruturadas', 'Como estabelecer rotinas eficazes para crianças autistas', 'video', 'Rotinas', 'https://www.youtube.com/watch?v=jNQXAC9IVRw', 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg', true, NULL),
('Atividades Educacionais Adaptadas', 'Métodos de ensino personalizados para autismo', 'video', 'Educacional', 'https://www.youtube.com/watch?v=y6120QOlsfU', 'https://img.youtube.com/vi/y6120QOlsfU/maxresdefault.jpg', true, NULL),
('Terapias Comportamentais ABA', 'Introdução às terapias comportamentais aplicadas', 'video', 'Terapias', 'https://www.youtube.com/watch?v=9bZkp7q19f0', 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg', true, NULL);

-- Insert sample story resources
INSERT INTO public.resources (title, description, content_type, category, url, thumbnail_url, is_published, created_by) VALUES 
('A História da Primeira Ida ao Médico', 'História social sobre como se preparar para uma consulta médica', 'story', 'Emoções', 'https://example.com/historia-medico.pdf', '/placeholder.svg', true, NULL),
('Minha Rotina Matinal', 'História que ensina sobre a importância das rotinas diárias', 'story', 'Rotinas', 'https://example.com/rotina-matinal.pdf', '/placeholder.svg', true, NULL),
('Fazendo Novos Amigos na Escola', 'Como interagir com colegas e fazer amizades', 'story', 'Habilidades Sociais', 'https://example.com/novos-amigos.pdf', '/placeholder.svg', true, NULL),
('Jantar em Família', 'A importância dos momentos em família e como participar', 'story', 'Família', 'https://example.com/jantar-familia.pdf', '/placeholder.svg', true, NULL),
('Meu Primeiro Dia na Escola Nova', 'Preparação para mudanças no ambiente escolar', 'story', 'Escola', 'https://example.com/escola-nova.pdf', '/placeholder.svg', true, NULL),
('Lidando com Barulhos Altos', 'Como gerenciar sensibilidades sensoriais auditivas', 'story', 'Sensorial', 'https://example.com/barulhos-altos.pdf', '/placeholder.svg', true, NULL);

-- Update counts for sample data
UPDATE public.resources SET likes_count = floor(random() * 50) + 1, downloads_count = floor(random() * 100) + 10 WHERE content_type IN ('video', 'story');