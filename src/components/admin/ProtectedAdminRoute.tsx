import { Navigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { checkAdminStatus, loading: adminLoading } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      if (user) {
        const hasAdminRole = await checkAdminStatus(user.id);
        setIsAdmin(hasAdminRole);
      }
      setChecked(true);
    };

    if (!authLoading) {
      verifyAdmin();
    }
  }, [user, authLoading, checkAdminStatus]);

  if (authLoading || adminLoading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verificando acesso...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/PFLGMANEGER/login" replace />;
  }

  return <>{children}</>;
};