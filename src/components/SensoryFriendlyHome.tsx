import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { 
  Video, 
  BookOpen, 
  Users, 
  Calendar,
  TrendingUp,
  Play,
  ChevronRight,
  Gamepad2
} from 'lucide-react';

const SensoryFriendlyHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Jogos',
      description: 'Aprenda brincando',
      icon: Gamepad2,
      gradient: 'from-purple-500 to-pink-500',
      route: '/games',
      featured: true,
    },
    {
      title: 'Vídeos',
      description: 'Conteúdo educativo',
      icon: Video,
      gradient: 'from-blue-500 to-cyan-500',
      route: '/videos',
    },
    {
      title: 'Histórias',
      description: 'Leia e aprenda',
      icon: BookOpen,
      gradient: 'from-green-500 to-emerald-500',
      route: '/stories',
    },
    {
      title: 'Comunidade',
      description: 'Conecte-se',
      icon: Users,
      gradient: 'from-orange-500 to-yellow-500',
      route: '/community',
    },
    {
      title: 'Rotinas',
      description: 'Organize seu dia',
      icon: Calendar,
      gradient: 'from-pink-500 to-rose-500',
      route: '/routines',
    }
  ];

  const stats = [
    { label: 'Vídeos assistidos', value: '12', icon: Play },
    { label: 'Histórias lidas', value: '8', icon: BookOpen },
    { label: 'Progresso', value: '85%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground px-4 pt-8 pb-12 rounded-b-[2rem]">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            Olá, {user?.email?.split('@')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            Pronto para aprender hoje?
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4 bg-card border-border">
              <stat.icon className="h-5 w-5 text-primary mb-2" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Continue Watching */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-foreground">Continue assistindo</h2>
            <button 
              onClick={() => navigate('/videos')}
              className="text-primary text-sm font-medium flex items-center gap-1"
            >
              Ver tudo
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Card 
            className="relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => navigate('/videos')}
          >
            <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Play className="h-16 w-16 text-white" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-1">Último vídeo assistido</h3>
              <p className="text-sm text-muted-foreground">Continue de onde parou</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-3">Explorar</h2>
          
          {/* Featured Game Card - Full Width */}
          {quickActions.filter(a => a.featured).map((action) => (
            <Card 
              key={action.title}
              className="cursor-pointer hover:scale-[1.02] transition-transform overflow-hidden mb-3"
              onClick={() => navigate(action.route)}
            >
              <div className={`h-40 bg-gradient-to-br ${action.gradient} flex items-center justify-center relative`}>
                <action.icon className="h-20 w-20 text-white" />
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-semibold">DESTAQUE</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground text-lg mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Card>
          ))}
          
          {/* Other Actions - Grid */}
          <div className="grid grid-cols-2 gap-3">
            {quickActions.filter(a => !a.featured).map((action) => (
              <Card 
                key={action.title}
                className="cursor-pointer hover:scale-[1.02] transition-transform overflow-hidden"
                onClick={() => navigate(action.route)}
              >
                <div className={`h-24 bg-gradient-to-br ${action.gradient} flex items-center justify-center`}>
                  <action.icon className="h-10 w-10 text-white" />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-foreground text-sm mb-0.5">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensoryFriendlyHome;