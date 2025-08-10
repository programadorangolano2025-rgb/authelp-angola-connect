import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  isAuthenticated: boolean;
  sessionId: string | null;
  loading: boolean;
  login: (pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  logAction: (action: string, details?: any, affectedTable?: string, affectedRecordId?: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_SESSION_KEY = 'admin_session';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const storedSession = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!storedSession) {
        setLoading(false);
        return;
      }

      const session = JSON.parse(storedSession);
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);

      if (now >= expiresAt) {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setLoading(false);
        return;
      }

      // Verify session in database
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('id')
        .eq('session_token', session.token)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setSessionId(session.id);
    } catch (error) {
      console.error('Error checking admin session:', error);
      localStorage.removeItem(ADMIN_SESSION_KEY);
    } finally {
      setLoading(false);
    }
  };

  const login = async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verify PIN
      const { data: settings, error: settingsError } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'admin_pin')
        .single();

      if (settingsError || !settings) {
        return { success: false, error: 'Erro ao verificar credenciais' };
      }

      const correctPin = typeof settings.setting_value === 'string' 
        ? JSON.parse(settings.setting_value)
        : settings.setting_value;
      if (pin !== correctPin) {
        return { success: false, error: 'PIN incorreto' };
      }

      // Create admin session
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          ip_address: 'unknown',
          user_agent: navigator.userAgent
        })
        .select()
        .single();

      if (sessionError || !session) {
        return { success: false, error: 'Erro ao criar sessão' };
      }

      // Store session locally
      const sessionData = {
        id: session.id,
        token: sessionToken,
        expiresAt: expiresAt.toISOString()
      };

      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
      setIsAuthenticated(true);
      setSessionId(session.id);

      // Log login action
      await logAction('admin_login', { timestamp: new Date().toISOString() });

      return { success: true };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const logout = async () => {
    try {
      if (sessionId) {
        // Log logout action
        await logAction('admin_logout', { timestamp: new Date().toISOString() });

        // Delete session from database
        await supabase
          .from('admin_sessions')
          .delete()
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      setIsAuthenticated(false);
      setSessionId(null);
    }
  };

  const logAction = async (
    action: string,
    details?: any,
    affectedTable?: string,
    affectedRecordId?: string
  ) => {
    if (!sessionId) return;

    try {
      await supabase
        .from('admin_logs')
        .insert({
          action,
          details: details || {},
          session_id: sessionId,
          ip_address: 'unknown',
          affected_table: affectedTable,
          affected_record_id: affectedRecordId
        });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated,
      sessionId,
      loading,
      login,
      logout,
      logAction
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};