import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Heart, 
  BookOpen, 
  Video, 
  Calendar, 
  Users, 
  Settings, 
  Star,
  Sparkles,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Focus,
  Palette
} from 'lucide-react';

const SensoryFriendlyHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [achievements] = useState([
    { id: 1, title: "Primeira Rotina", icon: "🌟", earned: true },
    { id: 2, title: "Vídeo Assistido", icon: "🎬", earned: true },
    { id: 3, title: "História Lida", icon: "📚", earned: false }
  ]);
  
  const [preferences, setPreferences] = useState({
    theme: 'calm',
    soundEnabled: true,
    focusMode: false,
    celebrationStyle: 'gentle'
  });

  const quickActions = [
    {
      title: 'Minhas Rotinas',
      description: 'Organizando meu dia',
      icon: Calendar,
      color: 'from-calm-blue/20 to-calm-blue/10',
      borderColor: 'border-calm-blue/30',
      route: '/routines',
      achievement: true
    },
    {
      title: 'Vídeos',
      description: 'Aprender brincando',
      icon: Video,
      color: 'from-gentle-purple/20 to-gentle-purple/10',
      borderColor: 'border-gentle-purple/30',
      route: '/videos',
      achievement: false
    },
    {
      title: 'Histórias',
      description: 'Aventuras e aprendizado',
      icon: BookOpen,
      color: 'from-soft-lilac/20 to-soft-lilac/10',
      borderColor: 'border-soft-lilac/30',
      route: '/stories',
      achievement: false
    },
    {
      title: 'Comunidade',
      description: 'Conectar com outros',
      icon: Users,
      color: 'from-calm-blue/20 to-gentle-purple/10',
      borderColor: 'border-calm-blue/30',
      route: '/community',
      achievement: false
    }
  ];

  const handlePreferenceToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-calm p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with sensory controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Olá, {user?.email?.split('@')[0] || 'Amigo'}! 👋
              </h1>
              <p className="text-text-gentle text-lg">
                Como você está se sentindo hoje?
              </p>
            </div>
            
            {/* Quick sensory controls */}
            <div className="flex items-center space-x-3 bg-card/50 backdrop-blur-sm rounded-2xl p-3 border border-soft-lilac/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePreferenceToggle('soundEnabled')}
                className="p-2 h-auto"
              >
                {preferences.soundEnabled ? 
                  <Volume2 className="h-5 w-5 text-calm-blue" /> : 
                  <VolumeX className="h-5 w-5 text-muted-foreground" />
                }
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePreferenceToggle('focusMode')}
                className="p-2 h-auto"
              >
                <Focus className={`h-5 w-5 ${preferences.focusMode ? 'text-gentle-purple' : 'text-muted-foreground'}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/settings')}
                className="p-2 h-auto"
              >
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
          
          {/* Achievement progress */}
          <Card className="bg-gradient-subtle border-0 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-gentle-purple" />
                  <h3 className="font-semibold text-foreground">Minhas Conquistas</h3>
                </div>
                <Badge variant="secondary" className="bg-gentle-purple/10 text-gentle-purple border-0">
                  2/3 completas
                </Badge>
              </div>
              <div className="flex space-x-4 mb-3">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
                      achievement.earned 
                        ? 'bg-gentle-purple/10 border border-gentle-purple/20' 
                        : 'bg-muted/30 border border-muted/20'
                    }`}
                  >
                    <span className="text-2xl mb-1">{achievement.icon}</span>
                    <span className={`text-xs text-center ${
                      achievement.earned ? 'text-gentle-purple font-medium' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                    </span>
                  </div>
                ))}
              </div>
              <Progress value={67} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main actions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action) => (
            <Card 
              key={action.title}
              className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gentle bg-gradient-to-br ${action.color} border ${action.borderColor} backdrop-blur-sm`}
              onClick={() => navigate(action.route)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} backdrop-blur-sm`}>
                    <action.icon className="h-8 w-8 text-foreground" />
                  </div>
                  {action.achievement && (
                    <Star className="h-5 w-5 text-gentle-purple animate-pulse" />
                  )}
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">
                  {action.title}
                </h3>
                <p className="text-text-gentle text-sm">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's focus */}
        <Card className="bg-card/80 backdrop-blur-sm border-soft-lilac/20 shadow-soft">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Sun className="h-5 w-5 text-gentle-purple" />
              <CardTitle className="text-foreground">Foco de Hoje</CardTitle>
            </div>
            <CardDescription className="text-text-gentle">
              Pequenos passos, grandes conquistas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-calm-blue/10 rounded-xl border border-calm-blue/20">
                <h4 className="font-semibold text-calm-blue mb-2">Rotina da Manhã</h4>
                <p className="text-sm text-text-gentle">3 atividades concluídas</p>
                <Progress value={100} className="mt-2 h-1" />
              </div>
              <div className="p-4 bg-gentle-purple/10 rounded-xl border border-gentle-purple/20">
                <h4 className="font-semibold text-gentle-purple mb-2">Aprendizado</h4>
                <p className="text-sm text-text-gentle">2 vídeos assistidos</p>
                <Progress value={67} className="mt-2 h-1" />
              </div>
              <div className="p-4 bg-soft-lilac/10 rounded-xl border border-soft-lilac/20">
                <h4 className="font-semibold text-soft-lilac mb-2">Conexão</h4>
                <p className="text-sm text-text-gentle">1 nova amizade</p>
                <Progress value={33} className="mt-2 h-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SensoryFriendlyHome;