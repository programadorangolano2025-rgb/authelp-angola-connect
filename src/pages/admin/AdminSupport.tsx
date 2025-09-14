import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Mail,
  Calendar,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  category: string;
  response?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

const AdminSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar tickets de suporte.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = async (ticketId: string, updates: Partial<SupportTicket>) => {
    try {
      const updateData: any = { ...updates };
      
      if (updates.status === 'resolved' && !updates.resolved_at) {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Ticket atualizado com sucesso.",
      });

      fetchTickets();
      
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, ...updateData });
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar ticket.",
        variant: "destructive"
      });
    }
  };

  const handleSendResponse = async () => {
    if (!selectedTicket || !response.trim()) return;

    await updateTicket(selectedTicket.id, {
      response: response.trim(),
      status: 'responded'
    });

    setResponse('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500 text-white';
      case 'responded': return 'bg-yellow-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'responded': return <MessageCircle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filterTicketsByStatus = (status: string) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTicketCard = (ticket: SupportTicket) => (
    <Card 
      key={ticket.id} 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedTicket?.id === ticket.id ? 'border-primary' : ''
      }`}
      onClick={() => setSelectedTicket(ticket)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(ticket.status)}>
                {getStatusIcon(ticket.status)}
                <span className="ml-1 capitalize">{ticket.status}</span>
              </Badge>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
            </div>
            <CardTitle className="text-lg">{ticket.subject}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {ticket.name}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {ticket.email}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(ticket.created_at)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {ticket.message}
        </p>
        <Badge variant="outline" className="mt-2">
          {ticket.category}
        </Badge>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Suporte</h1>
        </div>
        <div>Carregando tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Suporte</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total: {tickets.length} tickets
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lista de Tickets */}
        <div className="space-y-4">
          <Tabs defaultValue="open" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="open">
                Abertos ({filterTicketsByStatus('open').length})
              </TabsTrigger>
              <TabsTrigger value="responded">
                Respondidos ({filterTicketsByStatus('responded').length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolvidos ({filterTicketsByStatus('resolved').length})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Fechados ({filterTicketsByStatus('closed').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="space-y-4">
              {filterTicketsByStatus('open').map(renderTicketCard)}
              {filterTicketsByStatus('open').length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum ticket aberto
                </p>
              )}
            </TabsContent>

            <TabsContent value="responded" className="space-y-4">
              {filterTicketsByStatus('responded').map(renderTicketCard)}
              {filterTicketsByStatus('responded').length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum ticket respondido
                </p>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {filterTicketsByStatus('resolved').map(renderTicketCard)}
              {filterTicketsByStatus('resolved').length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum ticket resolvido
                </p>
              )}
            </TabsContent>

            <TabsContent value="closed" className="space-y-4">
              {filterTicketsByStatus('closed').map(renderTicketCard)}
              {filterTicketsByStatus('closed').length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum ticket fechado
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Detalhes do Ticket Selecionado */}
        <div className="space-y-4">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status}
                      </Badge>
                      <Badge className={getPriorityColor(selectedTicket.priority)}>
                        {selectedTicket.priority}
                      </Badge>
                      <Badge variant="outline">
                        {selectedTicket.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Informações do Cliente</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Nome:</strong> {selectedTicket.name}</p>
                    <p><strong>Email:</strong> {selectedTicket.email}</p>
                    <p><strong>Data:</strong> {formatDate(selectedTicket.created_at)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Mensagem</h4>
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    {selectedTicket.message}
                  </div>
                </div>

                {selectedTicket.response && (
                  <div>
                    <h4 className="font-medium mb-2">Resposta Anterior</h4>
                    <div className="bg-blue-50 p-3 rounded-lg text-sm">
                      {selectedTicket.response}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select 
                      value={newStatus || selectedTicket.status}
                      onValueChange={setNewStatus}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Aberto</SelectItem>
                        <SelectItem value="responded">Respondido</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Prioridade</label>
                    <Select 
                      value={newPriority || selectedTicket.priority}
                      onValueChange={setNewPriority}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(newStatus || newPriority) && (
                  <Button
                    onClick={() => {
                      const updates: any = {};
                      if (newStatus) updates.status = newStatus;
                      if (newPriority) updates.priority = newPriority;
                      updateTicket(selectedTicket.id, updates);
                      setNewStatus('');
                      setNewPriority('');
                    }}
                    className="w-full"
                  >
                    Atualizar Ticket
                  </Button>
                )}

                <div>
                  <label className="text-sm font-medium">Resposta</label>
                  <Textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Digite sua resposta..."
                    rows={4}
                  />
                  <Button
                    onClick={handleSendResponse}
                    disabled={!response.trim()}
                    className="w-full mt-2"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Resposta
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Selecione um ticket para ver os detalhes
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;