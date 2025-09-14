-- Cria tabela para suporte/contato
CREATE TABLE support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'general',
  assigned_to UUID,
  response TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS na tabela support_tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Políticas para support_tickets
CREATE POLICY "Users can create their own tickets" 
ON support_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own tickets" 
ON support_tickets 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Trigger para atualizar updated_at em support_tickets
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON support_tickets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Cria tabela para profissionais criados pelo admin
CREATE TABLE admin_created_professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  professional_license TEXT NOT NULL,
  license_type TEXT NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  bio TEXT,
  location TEXT,
  verified BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_by_admin BOOLEAN DEFAULT true,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS na tabela admin_created_professionals
ALTER TABLE admin_created_professionals ENABLE ROW LEVEL SECURITY;

-- Política para visualização pública dos profissionais criados pelo admin
CREATE POLICY "Anyone can view active admin created professionals" 
ON admin_created_professionals 
FOR SELECT 
USING (is_active = true);

-- Trigger para atualizar updated_at em admin_created_professionals
CREATE TRIGGER update_admin_created_professionals_updated_at
BEFORE UPDATE ON admin_created_professionals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();