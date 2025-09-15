import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserPreferences {
  id?: string;
  user_id: string;
  theme_preference: 'calm' | 'vibrant' | 'high_contrast';
  font_size: 'small' | 'normal' | 'large' | 'extra_large';
  reduce_animations: boolean;
  audio_feedback: boolean;
  haptic_feedback: boolean;
  focus_mode: boolean;
  color_scheme: 'blue' | 'green' | 'purple' | 'neutral';
  pictogram_mode: boolean;
  celebration_style: 'gentle' | 'enthusiastic' | 'minimal';
  created_at?: string;
  updated_at?: string;
}

const defaultPreferences: Omit<UserPreferences, 'user_id'> = {
  theme_preference: 'calm',
  font_size: 'normal',
  reduce_animations: false,
  audio_feedback: true,
  haptic_feedback: true,
  focus_mode: false,
  color_scheme: 'blue',
  pictogram_mode: false,
  celebration_style: 'gentle'
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setPreferences(data as UserPreferences);
        applyPreferences(data as UserPreferences);
      } else {
        // Create default preferences for new user
        const newPreferences = {
          ...defaultPreferences,
          user_id: user.id
        };
        await createPreferences(newPreferences);
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
      setError('Erro ao carregar preferências');
      // Set default preferences on error
      setPreferences({
        ...defaultPreferences,
        user_id: user.id
      });
    } finally {
      setLoading(false);
    }
  };

  const createPreferences = async (newPreferences: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert([newPreferences])
        .select()
        .single();

      if (error) throw error;
      
      setPreferences(data as UserPreferences);
      applyPreferences(data as UserPreferences);
      return data;
    } catch (err) {
      console.error('Error creating preferences:', err);
      throw err;
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user || !preferences) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data as UserPreferences);
      applyPreferences(data as UserPreferences);
      
      toast.success('Preferências atualizadas!', {
        description: 'Suas configurações foram salvas.',
      });
      
      return data;
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Erro ao salvar preferências');
      toast.error('Erro ao salvar preferências');
      throw err;
    }
  };

  const applyPreferences = (prefs: UserPreferences) => {
    const root = document.documentElement;
    
    // Apply font size
    root.style.fontSize = {
      small: '14px',
      normal: '16px',
      large: '18px',
      extra_large: '20px'
    }[prefs.font_size];

    // Apply color scheme
    root.setAttribute('data-color-scheme', prefs.color_scheme);
    
    // Apply theme
    root.setAttribute('data-theme', prefs.theme_preference);
    
    // Apply animation preferences
    if (prefs.reduce_animations) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
    }

    // Apply focus mode
    if (prefs.focus_mode) {
      root.setAttribute('data-focus-mode', 'true');
    } else {
      root.removeAttribute('data-focus-mode');
    }
  };

  const playAudioFeedback = (type: 'success' | 'error' | 'click' = 'click') => {
    if (!preferences?.audio_feedback) return;
    
    // Create simple audio feedback
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies = {
      success: 800,
      error: 300,
      click: 600
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!preferences?.haptic_feedback || !navigator.vibrate) return;
    
    const patterns = {
      light: 50,
      medium: 100,
      heavy: 200
    };
    
    navigator.vibrate(patterns[type]);
  };

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    playAudioFeedback,
    triggerHapticFeedback,
    refetch: fetchPreferences
  };
};