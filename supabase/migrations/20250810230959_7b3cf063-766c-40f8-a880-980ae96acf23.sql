-- Create admin sessions table
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create admin logs table
CREATE TABLE public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  details JSONB,
  session_id UUID REFERENCES public.admin_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  affected_table TEXT,
  affected_record_id UUID
);

-- Create professional verifications table
CREATE TABLE public.professional_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  professional_license TEXT NOT NULL,
  license_type TEXT NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  documents_url TEXT[],
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  rejection_reason TEXT,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create content moderation table
CREATE TABLE public.content_moderation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'resource')),
  content_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'flagged', 'reported')),
  reason TEXT,
  moderator_session_id UUID REFERENCES public.admin_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  details JSONB
);

-- Create system settings table
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all admin tables
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin tables (admin bypass policies will be handled in code)
CREATE POLICY "Admin sessions are private" ON public.admin_sessions FOR ALL USING (false);
CREATE POLICY "Admin logs are private" ON public.admin_logs FOR ALL USING (false);
CREATE POLICY "System settings are private" ON public.system_settings FOR ALL USING (false);
CREATE POLICY "Content moderation is private" ON public.content_moderation FOR ALL USING (false);

-- Professional verifications policies
CREATE POLICY "Users can view their own verification" 
ON public.professional_verifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification" 
ON public.professional_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification" 
ON public.professional_verifications 
FOR UPDATE 
USING (auth.uid() = user_id AND verification_status = 'pending');

-- Add verification status to profiles table
ALTER TABLE public.profiles ADD COLUMN is_professional BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN professional_status TEXT DEFAULT 'unverified' CHECK (professional_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- Create trigger for updating timestamps
CREATE TRIGGER update_professional_verifications_updated_at
BEFORE UPDATE ON public.professional_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('admin_pin', '"admin2026"', 'PIN for admin authentication'),
('session_timeout_hours', '24', 'Admin session timeout in hours'),
('auto_approve_posts', 'true', 'Automatically approve community posts'),
('require_professional_verification', 'true', 'Require verification for healthcare professionals'),
('maintenance_mode', 'false', 'Enable maintenance mode for the application');