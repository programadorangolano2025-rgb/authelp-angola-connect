import { useState } from 'react';
import { ArrowLeft, Volume2, Mic, Eye, Palette, Bell, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/hooks/useAuth';

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, speakText, startListening, stopListening, isListening } = useSettings();
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'appearance',
      title: 'Aparência',
      icon: Palette,
      description: 'Cores, tema e tamanho da fonte'
    },
    {
      id: 'accessibility',
      title: 'Acessibilidade',
      icon: Eye,
      description: 'Narrador, microfone e contraste'
    },
    {
      id: 'audio',
      title: 'Áudio e Voz',
      icon: Volume2,
      description: 'Text-to-speech e reconhecimento'
    },
    {
      id: 'notifications',
      title: 'Notificações',
      icon: Bell,
      description: 'Alertas e lembretes'
    },
    {
      id: 'privacy',
      title: 'Privacidade',
      icon: Shield,
      description: 'Localização e perfil público'
    },
    {
      id: 'account',
      title: 'Conta',
      icon: User,
      description: 'Perfil e configurações da conta'
    }
  ];

  const testSpeech = () => {
    speakText('Olá! Esta é uma demonstração da funcionalidade de narrador. Como você está hoje?');
  };

  const testListening = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Tema</h4>
              <Select 
                value={settings.theme} 
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  updateSettings({ theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Esquema de Cores</h4>
              <Select 
                value={settings.colorScheme} 
                onValueChange={(value: 'default' | 'high-contrast' | 'warm' | 'cool') => 
                  updateSettings({ colorScheme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="high-contrast">Alto Contraste</SelectItem>
                  <SelectItem value="warm">Cores Quentes</SelectItem>
                  <SelectItem value="cool">Cores Frias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Tamanho da Fonte: {settings.fontSize}px
              </h4>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSettings({ fontSize: value })}
                min={12}
                max={24}
                step={2}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Pequeno</span>
                <span>Grande</span>
              </div>
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Movimento Reduzido</h4>
                <p className="text-xs text-muted-foreground">Reduzir animações e transições</p>
              </div>
              <Switch
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Alto Contraste</h4>
                <p className="text-xs text-muted-foreground">Aumentar contraste para melhor visibilidade</p>
              </div>
              <Switch
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
              />
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Narrador Ativado</h4>
                <p className="text-xs text-muted-foreground">Ler textos em voz alta</p>
              </div>
              <Switch
                checked={settings.speechEnabled}
                onCheckedChange={(checked) => updateSettings({ speechEnabled: checked })}
              />
            </div>

            {settings.speechEnabled && (
              <>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Velocidade da Fala: {settings.speechRate}x
                  </h4>
                  <Slider
                    value={[settings.speechRate]}
                    onValueChange={([value]) => updateSettings({ speechRate: value })}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Lento</span>
                    <span>Rápido</span>
                  </div>
                </div>

                <Button onClick={testSpeech} variant="outline" className="w-full">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Testar Narrador
                </Button>
              </>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Reconhecimento de Voz</h4>
                <p className="text-xs text-muted-foreground">Controlar por comandos de voz</p>
              </div>
              <Switch
                checked={settings.speechToTextEnabled}
                onCheckedChange={(checked) => updateSettings({ speechToTextEnabled: checked })}
              />
            </div>

            {settings.speechToTextEnabled && (
              <Button 
                onClick={testListening} 
                variant={isListening ? "destructive" : "outline"} 
                className="w-full"
              >
                <Mic className={`h-4 w-4 mr-2 ${isListening ? 'animate-pulse' : ''}`} />
                {isListening ? 'Parar Escuta' : 'Testar Microfone'}
              </Button>
            )}
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Notificações Push</h4>
                <p className="text-xs text-muted-foreground">Alertas no navegador</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSettings({ pushNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Notificações por Email</h4>
                <p className="text-xs text-muted-foreground">Receber emails importantes</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Sons de Lembrete</h4>
                <p className="text-xs text-muted-foreground">Alertas sonoros para rotinas</p>
              </div>
              <Switch
                checked={settings.reminderSounds}
                onCheckedChange={(checked) => updateSettings({ reminderSounds: checked })}
              />
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Compartilhar Localização</h4>
                <p className="text-xs text-muted-foreground">Para encontrar serviços próximos</p>
              </div>
              <Switch
                checked={settings.shareLocation}
                onCheckedChange={(checked) => updateSettings({ shareLocation: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-foreground">Perfil Público</h4>
                <p className="text-xs text-muted-foreground">Visível na comunidade</p>
              </div>
              <Switch
                checked={settings.publicProfile}
                onCheckedChange={(checked) => updateSettings({ publicProfile: checked })}
              />
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="text-2xl">👤</div>
              <h3 className="font-medium text-foreground">
                {user?.user_metadata?.full_name || 'Usuário'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>

            <Separator />

            <Button 
              onClick={signOut} 
              variant="destructive" 
              className="w-full"
            >
              Sair da Conta
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (activeSection) {
    const section = sections.find(s => s.id === activeSection);
    return (
      <div className="min-h-screen bg-gradient-calm">
        <div className="bg-background/90 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveSection(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{section?.title}</h1>
                <p className="text-sm text-muted-foreground">{section?.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto p-4">
          <Card className="shadow-soft border-0 bg-background/95">
            <CardContent className="p-6">
              {renderSection(activeSection)}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-calm">
      <div className="bg-background/90 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Configurações</h1>
              <p className="text-sm text-muted-foreground">Personalize sua experiência</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-8">
        <div className="space-y-4">
          {sections.map((section) => (
            <Card 
              key={section.id}
              className="shadow-soft border-0 bg-background/95 hover:shadow-gentle transition-all duration-300 cursor-pointer"
              onClick={() => setActiveSection(section.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-calm-blue/20">
                    <section.icon className="h-6 w-6 text-calm-blue" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{section.title}</h4>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;