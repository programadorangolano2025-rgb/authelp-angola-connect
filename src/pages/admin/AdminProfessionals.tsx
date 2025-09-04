import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

import { UserCheck, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfessionalVerification {
  id: string;
  user_id: string;
  professional_license: string;
  license_type: string;
  specializations: string[];
  verification_status: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  } | null;
}

const AdminProfessionals = () => {
  const [verifications, setVerifications] = useState<ProfessionalVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_verifications')
        .select(`
          *,
          profiles!professional_verifications_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications((data as any) || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar verificações de profissionais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

      // Action completed successfully

      toast({
        title: "Sucesso",
        description: `Verificação ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso`
      });

      fetchVerifications();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar verificação",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filterVerificationsByStatus = (status: string) => {
    return verifications.filter(v => v.verification_status === status);
  };

  const renderVerificationCard = (verification: ProfessionalVerification) => (
    <Card key={verification.id}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={verification.profiles?.avatar_url} />
              <AvatarFallback>
                {verification.profiles?.full_name?.charAt(0).toUpperCase() || 'P'}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{verification.profiles?.full_name || 'Nome não disponível'}</h3>
                <Badge className={getStatusColor(verification.verification_status)}>
                  {getStatusIcon(verification.verification_status)}
                  <span className="ml-1">{verification.verification_status}</span>
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Licença:</strong> {verification.professional_license}</p>
                <p><strong>Tipo:</strong> {verification.license_type}</p>
                {verification.specializations.length > 0 && (
                  <p><strong>Especializações:</strong> {verification.specializations.join(', ')}</p>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Solicitado em {new Date(verification.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
            
            {verification.verification_status === 'pending' && (
              <>
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => updateVerificationStatus(verification.id, 'approved')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => updateVerificationStatus(verification.id, 'rejected', 'Documentação insuficiente')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profissionais</h1>
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded w-full mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profissionais</h1>
        <div className="flex items-center space-x-2">
          <UserCheck className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {verifications.length} solicitações de verificação
          </span>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pendentes ({filterVerificationsByStatus('pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprovados ({filterVerificationsByStatus('approved').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejeitados ({filterVerificationsByStatus('rejected').length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {filterVerificationsByStatus('pending').map(renderVerificationCard)}
          {filterVerificationsByStatus('pending').length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma verificação pendente</h3>
                <p className="text-muted-foreground">
                  Não há solicitações de verificação aguardando análise.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          {filterVerificationsByStatus('approved').map(renderVerificationCard)}
          {filterVerificationsByStatus('approved').length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum profissional aprovado</h3>
                <p className="text-muted-foreground">
                  Ainda não há profissionais aprovados no sistema.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          {filterVerificationsByStatus('rejected').map(renderVerificationCard)}
          {filterVerificationsByStatus('rejected').length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma verificação rejeitada</h3>
                <p className="text-muted-foreground">
                  Não há verificações que foram rejeitadas.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProfessionals;