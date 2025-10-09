/*
  # Comprehensive Database Setup
  
  1. Tables Created
    - profiles: User profiles with types (autistic, caregiver, professional)
    - services: Professional services and clinics
    - appointments: Appointment bookings between patients and services
    - professional_verifications: Verification requests from user-registered professionals
    - admin_created_professionals: Professionals created directly by admins
    - routines, resources, community_posts, community_comments: Supporting tables
    
  2. Professional System
    - Users can register as professionals and request verification
    - Admins can manually create verified professional profiles
    - Services can be linked to both types of professionals
    
  3. Security
    - RLS enabled on all tables
    - Appropriate policies for each table
    - Verified professionals and admin-created professionals are publicly viewable
*/

-- Create enums
CREATE TYPE public.user_type AS ENUM ('autistic', 'caregiver', 'professional');
CREATE TYPE public.subscription_plan AS ENUM ('free', 'premium', 'professional');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  user_type user_type NOT NULL,
  subscription_plan subscription_plan NOT NULL DEFAULT 'free',
  avatar_url TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  verified BOOLEAN DEFAULT FALSE,
  is_professional BOOLEAN DEFAULT FALSE,
  professional_status TEXT DEFAULT 'unverified' CHECK (professional_status IN ('unverified', 'pending', 'verified', 'rejected')),
  specialization TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create professional verifications table
CREATE TABLE public.professional_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_created_professionals table
CREATE TABLE public.admin_created_professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  professional_license TEXT NOT NULL,
  license_type TEXT NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  bio TEXT,
  location TEXT,
  verified BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by_admin BOOLEAN DEFAULT TRUE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.admin_created_professionals(id) ON DELETE CASCADE,
  user_professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routines table
CREATE TABLE public.routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  time_slots JSONB,
  days_of_week INTEGER[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL,
  category TEXT NOT NULL,
  url TEXT,
  file_path TEXT,
  thumbnail_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  downloads_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_moderated BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community comments table
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_created_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for professional_verifications
CREATE POLICY "Users can view their own verification" ON public.professional_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own verification" ON public.professional_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own verification" ON public.professional_verifications FOR UPDATE USING (auth.uid() = user_id AND verification_status = 'pending');

-- RLS Policies for admin_created_professionals
CREATE POLICY "Anyone can view active admin created professionals" ON public.admin_created_professionals FOR SELECT USING (is_active = true);

-- RLS Policies for services
CREATE POLICY "Anyone can view published services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Service providers can create services" ON public.services FOR INSERT WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Service providers can update their services" ON public.services FOR UPDATE USING (auth.uid() = provider_id);

-- RLS Policies for appointments
CREATE POLICY "Users can view their appointments" ON public.appointments FOR SELECT USING (
  auth.uid() = patient_id OR 
  auth.uid() IN (SELECT provider_id FROM public.services WHERE id = service_id)
);
CREATE POLICY "Patients can create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update their appointments" ON public.appointments FOR UPDATE USING (
  auth.uid() = patient_id OR 
  auth.uid() IN (SELECT provider_id FROM public.services WHERE id = service_id)
);

-- RLS Policies for routines
CREATE POLICY "Users can view their own routines" ON public.routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own routines" ON public.routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own routines" ON public.routines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own routines" ON public.routines FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for resources
CREATE POLICY "Anyone can view published resources" ON public.resources FOR SELECT USING (is_published = true);
CREATE POLICY "Authenticated users can create resources" ON public.resources FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Resource creators can update their resources" ON public.resources FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for community posts
CREATE POLICY "Anyone can view approved posts" ON public.community_posts FOR SELECT USING (is_approved = true);
CREATE POLICY "Authenticated users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their posts" ON public.community_posts FOR UPDATE USING (auth.uid() = author_id);

-- RLS Policies for community comments
CREATE POLICY "Anyone can view comments on approved posts" ON public.community_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.community_posts WHERE id = post_id AND is_approved = true)
);
CREATE POLICY "Authenticated users can create comments" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_professional_verifications_updated_at BEFORE UPDATE ON public.professional_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_created_professionals_updated_at BEFORE UPDATE ON public.admin_created_professionals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON public.routines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data ->> 'user_type')::user_type, 'autistic')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_professional_status ON public.profiles(professional_status) WHERE is_professional = true;
CREATE INDEX idx_services_professional_id ON public.services(professional_id);
CREATE INDEX idx_services_user_professional_id ON public.services(user_professional_id);
CREATE INDEX idx_admin_professionals_active ON public.admin_created_professionals(is_active) WHERE is_active = true;
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_service_id ON public.appointments(service_id);