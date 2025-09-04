import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Shield, 
  Mail, 
  Globe, 
  Database,
  Users,
  MessageSquare,
  FileText,
  Save,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  support_email: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  community_moderation: boolean;
  auto_approve_posts: boolean;
  max_file_size: number;
  allowed_file_types: string[];
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: 'AutHelp',
    site_description: 'Plataforma de apoio para pessoas com autismo',
    contact_email: 'contato@authelp.com',
    support_email: 'suporte@authelp.com',
    maintenance_mode: false,
    registration_enabled: true,
    community_moderation: true,
    auto_approve_posts: false,
    max_file_size: 10,
    allowed_file_types: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const settingsMap: { [key: string]: any } = {};
        data.forEach(setting => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });

        setSettings(prev => ({
          ...prev,
          ...settingsMap
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Convert settings to array format for database
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        description: getSettingDescription(key)
      }));

      // Delete existing settings
      await supabase.from('system_settings').delete().neq('id', '');

      // Insert new settings
      const { error } = await supabase
        .from('system_settings')
        .insert(settingsArray);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getSettingDescription = (key: string): string => {
    const descriptions: { [key: string]: string } = {
      site_name: 'Nome do site/aplicação',
      site_description: 'Descrição do site',
      contact_email: 'Email de contato principal',
      support_email: 'Email de suporte técnico',
      maintenance_mode: 'Modo de manutenção ativo',
      registration_enabled: 'Permitir novos registros',
      community_moderation: 'Moderação da comunidade ativa',
      auto_approve_posts: 'Aprovação automática de posts',
      max_file_size: 'Tamanho máximo de arquivo (MB)',
      allowed_file_types: 'Tipos de arquivo permitidos',
      smtp_host: 'Servidor SMTP para envio de emails',
      smtp_port: 'Porta do servidor SMTP',
      smtp_user: 'Usuário SMTP',
      smtp_password: 'Senha SMTP'
    };
    return descriptions[key] || '';
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie as configurações globais da plataforma
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="community">
            <MessageSquare className="w-4 h-4 mr-2" />
            Comunidade
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="files">
            <FileText className="w-4 h-4 mr-2" />
            Arquivos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Configure as informações básicas do site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site_name">Nome do Site</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => updateSetting('site_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="site_description">Descrição do Site</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => updateSetting('site_description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Email de Contato</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => updateSetting('contact_email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="support_email">Email de Suporte</Label>
                    <Input
                      id="support_email"
                      type="email"
                      value={settings.support_email}
                      onChange={(e) => updateSetting('support_email', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>
                  Gerencie as configurações de segurança e acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar modo de manutenção para manutenções do sistema
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Registros Habilitados</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que novos usuários se registrem na plataforma
                    </p>
                  </div>
                  <Switch
                    checked={settings.registration_enabled}
                    onCheckedChange={(checked) => updateSetting('registration_enabled', checked)}
                  />
                </div>
                {settings.maintenance_mode && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800">
                        O modo de manutenção está ativo. Os usuários não poderão acessar a plataforma.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="community">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Comunidade</CardTitle>
                <CardDescription>
                  Gerencie como a comunidade funciona na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Moderação Ativa</Label>
                    <p className="text-sm text-muted-foreground">
                      Requer aprovação manual de posts antes da publicação
                    </p>
                  </div>
                  <Switch
                    checked={settings.community_moderation}
                    onCheckedChange={(checked) => updateSetting('community_moderation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aprovação Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Aprovar automaticamente posts de usuários verificados
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_approve_posts}
                    onCheckedChange={(checked) => updateSetting('auto_approve_posts', checked)}
                    disabled={!settings.community_moderation}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="email">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Email</CardTitle>
                <CardDescription>
                  Configure o servidor SMTP para envio de emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp_host">Servidor SMTP</Label>
                    <Input
                      id="smtp_host"
                      value={settings.smtp_host}
                      onChange={(e) => updateSetting('smtp_host', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp_port">Porta</Label>
                    <Input
                      id="smtp_port"
                      type="number"
                      value={settings.smtp_port}
                      onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp_user">Usuário</Label>
                    <Input
                      id="smtp_user"
                      value={settings.smtp_user}
                      onChange={(e) => updateSetting('smtp_user', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp_password">Senha</Label>
                    <Input
                      id="smtp_password"
                      type="password"
                      value={settings.smtp_password}
                      onChange={(e) => updateSetting('smtp_password', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Arquivos</CardTitle>
                <CardDescription>
                  Configure limites e tipos de arquivo permitidos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max_file_size">Tamanho Máximo (MB)</Label>
                  <Input
                    id="max_file_size"
                    type="number"
                    value={settings.max_file_size}
                    onChange={(e) => updateSetting('max_file_size', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="allowed_types">Tipos de Arquivo Permitidos</Label>
                  <Input
                    id="allowed_types"
                    value={settings.allowed_file_types.join(', ')}
                    onChange={(e) => updateSetting('allowed_file_types', e.target.value.split(', '))}
                    placeholder="jpg, png, pdf, doc"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separe os tipos com vírgula e espaço
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;