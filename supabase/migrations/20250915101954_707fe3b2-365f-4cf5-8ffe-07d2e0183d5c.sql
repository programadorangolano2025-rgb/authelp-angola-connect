-- Create user preferences table for sensory-friendly customizations
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_preference TEXT DEFAULT 'calm' CHECK (theme_preference IN ('calm', 'vibrant', 'high_contrast')),
  font_size TEXT DEFAULT 'normal' CHECK (font_size IN ('small', 'normal', 'large', 'extra_large')),
  reduce_animations BOOLEAN DEFAULT false,
  audio_feedback BOOLEAN DEFAULT true,
  haptic_feedback BOOLEAN DEFAULT true,
  focus_mode BOOLEAN DEFAULT false,
  color_scheme TEXT DEFAULT 'blue' CHECK (color_scheme IN ('blue', 'green', 'purple', 'neutral')),
  pictogram_mode BOOLEAN DEFAULT false,
  celebration_style TEXT DEFAULT 'gentle' CHECK (celebration_style IN ('gentle', 'enthusiastic', 'minimal')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB DEFAULT '{}',
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_viewed BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
ON public.user_achievements 
FOR UPDATE 
USING (auth.uid() = user_id);