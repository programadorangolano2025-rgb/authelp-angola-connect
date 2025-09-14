import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, X, Clock, UserCheck, User, Shield, AlertCircle, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfessionalVerification {
  id: string;
  user_id: string;
  professional_license: string;
  license_type: string;
  specializations: string[];
  verification_status: string;
  created_at: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
  profiles?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

interface AdminCreatedProfessional {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  professional_license: string;
  license_type: string;
  specializations: string[];
  bio?: string;
  location?: string;
  verified: boolean;
  is_active: boolean;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export const AdminProfessionals = () => {
  const [verifications, setVerifications] = useState<ProfessionalVerification[]>([]);
  const [adminProfessionals, setAdminProfessionals] = useState<AdminCreatedProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProfessional, setNewProfessional] = useState({
    full_name: '',
    email: '',
    phone: '',
    professional_license: '',
    license_type: '',
    specializations: '',
    bio: '',
    location: '',
    admin_notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVerifications();
    fetchAdminProfessionals();
  }, []);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching verifications:', error);
        throw error;
      }

      console.log('Fetched verifications:', data);
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar verificações de profissionais.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_created_professionals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching admin professionals:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar profissionais criados pelo admin.",
        variant: "destructive"
      });
    }
  };

  const updateVerificationStatus = async (
    verificationId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) => {
    try {
      const updateData: any = {
        verification_status: status,
        verified_at: status === 'approved' ? new Date().toISOString() : null
      };

      if (reason) {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from('professional_verifications')
        .update(updateData)
        .eq('id', verificationId);

      if (error) throw error;

      // Update profile status
      const verification = verifications.find(v => v.id === verificationId);
      if (verification) {
        await supabase
          .from('profiles')
          .update({
            professional_status: status === 'approved' ? 'verified' : 'rejected',
            is_professional: status === 'approved'
          })
          .eq('user_id', verification.user_id);
      }

      toast({
        title: "Sucesso",
        description: `Verificação ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso.`
      });

      fetchVerifications();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar verificação.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <Check className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filterVerificationsByStatus = (status: string) => {
    return verifications.filter(v => v.verification_status === status);
  };

  const renderVerificationCard = (verification: ProfessionalVerification) => (
    <Card key={verification.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              {verification.profiles?.full_name || 'Nome não disponível'}
              <Badge className={getStatusColor(verification.verification_status)}>
                {getStatusIcon(verification.verification_status)}
                <span className="ml-1 capitalize">{verification.verification_status}</span>
              </Badge>
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm"><strong>Licença:</strong> {verification.professional_license}</p>
          <p className="text-sm"><strong>Tipo:</strong> {verification.license_type}</p>
          {verification.specializations.length > 0 && (
            <p className="text-sm"><strong>Especializações:</strong> {verification.specializations.join(', ')}</p>
          )}
        </div>

        {verification.verification_status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => updateVerificationStatus(verification.id, 'approved')}
            >
              <Check className="h-4 w-4 mr-1" />
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateVerificationStatus(verification.id, 'rejected', 'Documentação insuficiente')}
            >
              <X className="h-4 w-4 mr-1" />
              Rejeitar
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Solicitado em: {new Date(verification.created_at).toLocaleDateString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  );

  const createProfessional = async () => {
    if (!newProfessional.full_name || !newProfessional.email || !newProfessional.professional_license) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_created_professionals')
        .insert({
          ...newProfessional,
          specializations: newProfessional.specializations ? newProfessional.specializations.split(',').map(s => s.trim()) : []
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Profissional criado com sucesso."
      });

      setNewProfessional({
        full_name: '',
        email: '',
        phone: '',
        professional_license: '',
        license_type: '',
        specializations: '',
        bio: '',
        location: '',
        admin_notes: ''
      });
      setIsCreating(false);
      fetchAdminProfessionals();
    } catch (error) {
      console.error('Error creating professional:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar profissional.",
        variant: "destructive"
      });
    }
  };

  const toggleProfessionalStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_created_professionals')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Profissional ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`
      });

      fetchAdminProfessionals();
    } catch (error) {
      console.error('Error updating professional status:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do profissional.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profissionais</h1>
        </div>
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profissionais</h1>
        <div className="flex items-center gap-4">
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Profissional
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Profissional</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome Completo *</label>
                    <Input
                      value={newProfessional.full_name}
                      onChange={(e) => setNewProfessional({...newProfessional, full_name: e.target.value})}
                      placeholder="Nome completo do profissional"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      value={newProfessional.email}
                      onChange={(e) => setNewProfessional({...newProfessional, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Telefone</label>
                    <Input
                      value={newProfessional.phone}
                      onChange={(e) => setNewProfessional({...newProfessional, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Localização</label>
                    <Input
                      value={newProfessional.location}
                      onChange={(e) => setNewProfessional({...newProfessional, location: e.target.value})}
                      placeholder="Cidade, Estado"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Número da Licença *</label>
                    <Input
                      value={newProfessional.professional_license}
                      onChange={(e) => setNewProfessional({...newProfessional, professional_license: e.target.value})}
                      placeholder="Ex: CRP 12345"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo de Licença *</label>
                    <Select 
                      value={newProfessional.license_type}
                      onValueChange={(value) => setNewProfessional({...newProfessional, license_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CRP">CRP - Psicólogo</SelectItem>
                        <SelectItem value="CRM">CRM - Médico</SelectItem>
                        <SelectItem value="CREFITO">CREFITO - Fisioterapeuta</SelectItem>
                        <SelectItem value="CRFa">CRFa - Fonoaudiólogo</SelectItem>
                        <SelectItem value="CRESS">CRESS - Assistente Social</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Especializações</label>
                  <Input
                    value={newProfessional.specializations}
                    onChange={(e) => setNewProfessional({...newProfessional, specializations: e.target.value})}
                    placeholder="Separar por vírgulas: Autismo, TDAH, etc."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Biografia</label>
                  <Textarea
                    value={newProfessional.bio}
                    onChange={(e) => setNewProfessional({...newProfessional, bio: e.target.value})}
                    placeholder="Breve descrição do profissional"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Notas Administrativas</label>
                  <Textarea
                    value={newProfessional.admin_notes}
                    onChange={(e) => setNewProfessional({...newProfessional, admin_notes: e.target.value})}
                    placeholder="Notas internas (não visíveis ao público)"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={createProfessional} className="flex-1">
                    Criar Profissional
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreating(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="text-sm text-muted-foreground">
            Verificações: {verifications.length} | Criados: {adminProfessionals.length}
          </div>
        </div>
      </div>

      <Tabs defaultValue="pendentes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pendentes">
            Pendentes ({filterVerificationsByStatus('pending').length})
          </TabsTrigger>
          <TabsTrigger value="aprovados">
            Aprovados ({filterVerificationsByStatus('approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejeitados">
            Rejeitados ({filterVerificationsByStatus('rejected').length})
          </TabsTrigger>
          <TabsTrigger value="criados">
            Criados pelo Admin ({adminProfessionals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="space-y-4">
          {filterVerificationsByStatus('pending').map(renderVerificationCard)}
          {filterVerificationsByStatus('pending').length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma verificação pendente encontrada.
            </div>
          )}
        </TabsContent>

        <TabsContent value="aprovados" className="space-y-4">
          {filterVerificationsByStatus('approved').map(renderVerificationCard)}
          {filterVerificationsByStatus('approved').length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma verificação aprovada encontrada.
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejeitados" className="space-y-4">
          {filterVerificationsByStatus('rejected').map(renderVerificationCard)}
          {filterVerificationsByStatus('rejected').length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma verificação rejeitada encontrada.
            </div>
          )}
        </TabsContent>

        <TabsContent value="criados" className="space-y-4">
          {adminProfessionals.map((professional) => (
            <Card key={professional.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {professional.full_name}
                      <Badge className={professional.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                        {professional.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Badge className="bg-blue-500 text-white">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-2">
                      <p><strong>Email:</strong> {professional.email}</p>
                      {professional.phone && <p><strong>Telefone:</strong> {professional.phone}</p>}
                      {professional.location && <p><strong>Localização:</strong> {professional.location}</p>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm"><strong>Licença:</strong> {professional.license_type} - {professional.professional_license}</p>
                  {professional.specializations.length > 0 && (
                    <p className="text-sm"><strong>Especializações:</strong> {professional.specializations.join(', ')}</p>
                  )}
                  {professional.bio && (
                    <p className="text-sm"><strong>Bio:</strong> {professional.bio}</p>
                  )}
                  {professional.admin_notes && (
                    <div className="bg-yellow-50 p-2 rounded text-sm">
                      <strong>Notas Admin:</strong> {professional.admin_notes}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={professional.is_active ? "destructive" : "default"}
                    onClick={() => toggleProfessionalStatus(professional.id, professional.is_active)}
                  >
                    {professional.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Criado em: {new Date(professional.created_at).toLocaleDateString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          ))}
          {adminProfessionals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum profissional criado pelo admin encontrado.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};