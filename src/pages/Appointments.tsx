import { useState, useEffect } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Calendar, Clock, Loader2, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { useAppointments } from "@/hooks/useAppointments"
import { AppointmentCard } from "@/components/AppointmentCard"
import { NewAppointmentDialog } from "@/components/NewAppointmentDialog"
import { Input } from "@/components/ui/input"

const Appointments = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { 
    appointments, 
    loading, 
    cancelAppointment, 
    updateAppointment,
    getUpcomingAppointments 
  } = useAppointments()
  
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('upcoming')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Login necessário",
        description: "Faça login para acessar seus agendamentos.",
        variant: "destructive"
      })
      navigate('/login')
    }
  }, [user, loading, navigate, toast])

  const handleCancelAppointment = async (appointmentId: string) => {
    const success = await cancelAppointment(appointmentId)
    if (success) {
      toast({
        title: "Consulta cancelada",
        description: "A consulta foi cancelada com sucesso."
      })
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a consulta.",
        variant: "destructive"
      })
    }
  }

  const handleUpdateAppointment = async (appointmentId: string, updates: any) => {
    const success = await updateAppointment(appointmentId, updates)
    if (success) {
      toast({
        title: "Consulta atualizada",
        description: "A consulta foi atualizada com sucesso."
      })
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a consulta.",
        variant: "destructive"
      })
    }
  }

  const upcomingAppointments = getUpcomingAppointments()
  const completedAppointments = appointments.filter(apt => apt.status === 'completed')
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled')

  const filterAppointments = (appointmentsList: any[]) => {
    if (!searchTerm) return appointmentsList
    
    return appointmentsList.filter(apt => 
      apt.services?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.profiles?.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-calm flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-calm-blue" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Header */}
      <div className="bg-background/90 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/home")}
                className="mr-3"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-text-gentle">Consultas</h1>
            </div>
            <Button 
              variant="calm" 
              size="sm"
              onClick={() => setShowNewDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="shadow-soft border-0 bg-background/95">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-calm-blue">{upcomingAppointments.length}</div>
              <p className="text-sm text-muted-foreground">Próximas</p>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-0 bg-background/95">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gentle-purple">{completedAppointments.length}</div>
              <p className="text-sm text-muted-foreground">Concluídas</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por serviço ou profissional..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Próximas</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
            <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {filterAppointments(upcomingAppointments).length === 0 ? (
              <Card className="shadow-soft border-0 bg-background/95">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className="font-medium text-text-gentle mb-2">
                    {searchTerm ? 'Nenhuma consulta encontrada' : 'Nenhuma consulta agendada'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? 'Tente buscar por outros termos' 
                      : 'Agende sua primeira consulta'
                    }
                  </p>
                  {!searchTerm && (
                    <Button 
                      variant="calm" 
                      onClick={() => setShowNewDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agendar Consulta
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterAppointments(upcomingAppointments).map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={handleCancelAppointment}
                    onUpdate={handleUpdateAppointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filterAppointments(completedAppointments).length === 0 ? (
              <Card className="shadow-soft border-0 bg-background/95">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="font-medium text-text-gentle mb-2">
                    {searchTerm ? 'Nenhuma consulta encontrada' : 'Nenhuma consulta concluída'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? 'Tente buscar por outros termos' 
                      : 'Suas consultas concluídas aparecerão aqui'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterAppointments(completedAppointments).map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={handleCancelAppointment}
                    onUpdate={handleUpdateAppointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {filterAppointments(cancelledAppointments).length === 0 ? (
              <Card className="shadow-soft border-0 bg-background/95">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">❌</div>
                  <h3 className="font-medium text-text-gentle mb-2">
                    {searchTerm ? 'Nenhuma consulta encontrada' : 'Nenhuma consulta cancelada'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? 'Tente buscar por outros termos' 
                      : 'Suas consultas canceladas aparecerão aqui'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterAppointments(cancelledAppointments).map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={handleCancelAppointment}
                    onUpdate={handleUpdateAppointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        {appointments.length > 0 && (
          <Card className="mt-6 shadow-soft border-0 bg-background/95">
            <CardContent className="p-4">
              <Button 
                variant="gentle" 
                className="w-full" 
                size="lg"
                onClick={() => setShowNewDialog(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Agendar Nova Consulta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Appointment Dialog */}
      <NewAppointmentDialog 
        open={showNewDialog} 
        onOpenChange={setShowNewDialog} 
      />
    </div>
  )
}

export default Appointments