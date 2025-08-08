-- Add settings column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN settings jsonb DEFAULT '{}';

-- Update the column comment
COMMENT ON COLUMN public.profiles.settings IS 'User settings including theme, accessibility, and preferences stored as JSON';