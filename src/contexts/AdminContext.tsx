import { createContext, useContext, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
  checkAdminStatus: (userId: string) => Promise<boolean>;
  logout: () => void;
  logAction: (action: string, details?: any, affectedTable?: string, affectedRecordId?: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc('has_role', { 
          _user_id: userId, 
          _role: 'admin' 
        });

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return false;
      }

      setIsAdmin(!!data);
      return !!data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAdmin(false);
  };

  const logAction = async (
    action: string,
    details?: any,
    affectedTable?: string,
    affectedRecordId?: string
  ) => {
    try {
      await supabase
        .from('admin_logs')
        .insert({
          action,
          details: details || {},
          session_id: null,
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
      isAdmin,
      loading,
      checkAdminStatus,
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