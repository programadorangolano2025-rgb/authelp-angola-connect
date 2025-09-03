import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
      return;
    }

    const autoLogin = async () => {
      try {
        const result = await login();
        
        if (result.success) {
          toast({
            title: "Acesso liberado",
            description: "Bem-vindo ao painel administrativo"
          });
          navigate('/admin');
        } else {
          toast({
            title: "Erro",
            description: result.error || "Erro ao acessar painel",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro interno do servidor",
          variant: "destructive"
        });
      }
    };

    autoLogin();
  }, [login, navigate, toast, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Painel Administrativo</CardTitle>
          <CardDescription>
            Redirecionando para o painel de administração...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Carregando...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;