import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Settings {
  // Tema e aparência
  theme: 'light' | 'dark' | 'system';
  colorScheme: 'default' | 'high-contrast' | 'warm' | 'cool';
  fontSize: number; // 12-24
  
  // Acessibilidade
  speechEnabled: boolean;
  speechRate: number; // 0.5-2
  speechVoice: string;
  speechToTextEnabled: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Notificações
  pushNotifications: boolean;
  emailNotifications: boolean;
  reminderSounds: boolean;
  
  // Privacidade
  shareLocation: boolean;
  publicProfile: boolean;
}

const defaultSettings: Settings = {
  theme: 'light',
  colorScheme: 'default',
  fontSize: 16,
  speechEnabled: false,
  speechRate: 1,
  speechVoice: '',
  speechToTextEnabled: false,
  reducedMotion: false,
  highContrast: false,
  pushNotifications: true,
  emailNotifications: true,
  reminderSounds: true,
  shareLocation: false,
  publicProfile: true,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  isLoading: boolean;
  speakText: (text: string) => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
  isListening: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const { user } = useAuth();
  
  // Speech synthesis
  const [speechSynth] = useState(() => window.speechSynthesis);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Speech recognition
  const [recognition, setRecognition] = useState<any>(null);

  // Inicializar vozes disponíveis
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynth.getVoices();
      setVoices(availableVoices);
      
      // Selecionar voz portuguesa como padrão
      if (!settings.speechVoice && availableVoices.length > 0) {
        const portugueseVoice = availableVoices.find(voice => 
          voice.lang.startsWith('pt') || voice.lang.startsWith('pt-BR')
        );
        if (portugueseVoice) {
          setSettings(prev => ({ ...prev, speechVoice: portugueseVoice.name }));
        }
      }
    };

    loadVoices();
    speechSynth.onvoiceschanged = loadVoices;
  }, [speechSynth, settings.speechVoice]);

  // Inicializar Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'pt-BR';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Speech recognized:', transcript);
        // Aqui você pode adicionar lógica para processar o texto reconhecido
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Erro no reconhecimento de voz');
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Carregar configurações do usuário
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data && (data as any).settings) {
          setSettings({ ...defaultSettings, ...(data as any).settings });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Erro ao carregar configurações');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Aplicar configurações ao DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar tema
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else { // system
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    }
    
    // Aplicar tamanho da fonte
    root.style.fontSize = `${settings.fontSize}px`;
    
    // Aplicar movimento reduzido
    if (settings.reducedMotion) {
      root.style.setProperty('--transition-calm', 'none');
    } else {
      root.style.removeProperty('--transition-calm');
    }
    
    // Aplicar esquema de cores
    switch (settings.colorScheme) {
      case 'high-contrast':
        root.classList.add('high-contrast');
        break;
      case 'warm':
        root.style.setProperty('--primary', '35 100% 85%');
        root.style.setProperty('--secondary', '25 30% 92%');
        break;
      case 'cool':
        root.style.setProperty('--primary', '200 100% 85%');
        root.style.setProperty('--secondary', '190 30% 92%');
        break;
      default:
        root.classList.remove('high-contrast');
        root.style.removeProperty('--primary');
        root.style.removeProperty('--secondary');
    }
  }, [settings]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ settings: updatedSettings } as any)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast.success('Configurações salvas');
      } catch (error) {
        console.error('Error saving settings:', error);
        toast.error('Erro ao salvar configurações');
        // Reverter alterações em caso de erro
        setSettings(settings);
      }
    }
  };

  const speakText = (text: string) => {
    if (!settings.speechEnabled || !text.trim()) return;
    
    speechSynth.cancel(); // Cancelar qualquer fala anterior
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.speechRate;
    
    if (settings.speechVoice) {
      const voice = voices.find(v => v.name === settings.speechVoice);
      if (voice) utterance.voice = voice;
    }
    
    speechSynth.speak(utterance);
  };

  const startListening = async () => {
    if (!settings.speechToTextEnabled || !recognition) {
      toast.error('Reconhecimento de voz não disponível');
      return;
    }
    
    try {
      setIsListening(true);
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      toast.error('Erro ao iniciar reconhecimento de voz');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      isLoading,
      speakText,
      startListening,
      stopListening,
      isListening,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};