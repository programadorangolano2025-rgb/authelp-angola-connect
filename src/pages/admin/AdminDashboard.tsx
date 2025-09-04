import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Briefcase, MessageSquare, BookOpen, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';


interface DashboardStats {
  totalUsers: number;
  totalProfessionals: number;
  totalServices: number;
  totalPosts: number;
  totalResources: number;
  pendingVerifications: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProfessionals: 0,
    totalServices: 0,
    totalPosts: 0,
    totalResources: 0,
    pendingVerifications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch all stats in parallel
      const [
        usersResult,
        professionalsResult,
        servicesResult,
        postsResult,
        resourcesResult,
        verificationsResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_professional', true),
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('community_posts').select('id', { count: 'exact', head: true }),
        supabase.from('resources').select('id', { count: 'exact', head: true }),
        supabase.from('professional_verifications').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending')
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalProfessionals: professionalsResult.count || 0,
        totalServices: servicesResult.count || 0,
        totalPosts: postsResult.count || 0,
        totalResources: resourcesResult.count || 0,
        pendingVerifications: verificationsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers,
      description: 'Usuários registrados no sistema',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Profissionais',
      value: stats.totalProfessionals,
      description: 'Profissionais de saúde registrados',
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'Serviços',
      value: stats.totalServices,
      description: 'Serviços disponíveis',
      icon: Briefcase,
      color: 'text-purple-600'
    },
    {
      title: 'Posts da Comunidade',
      value: stats.totalPosts,
      description: 'Posts publicados na comunidade',
      icon: MessageSquare,
      color: 'text-orange-600'
    },
    {
      title: 'Recursos',
      value: stats.totalResources,
      description: 'Recursos educativos disponíveis',
      icon: BookOpen,
      color: 'text-indigo-600'
    },
    {
      title: 'Verificações Pendentes',
      value: stats.pendingVerifications,
      description: 'Profissionais aguardando verificação',
      icon: Activity,
      color: 'text-red-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <CardDescription>
                {card.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas ações administrativas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Sistema iniciado</span>
                <span className="text-muted-foreground">
                  {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Dashboard visualizado</span>
                <span className="text-muted-foreground">Agora</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>
              Indicadores de saúde do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Banco de Dados</span>
                <span className="text-green-600 font-medium">Operacional</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Autenticação</span>
                <span className="text-green-600 font-medium">Ativa</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Painel Admin</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;