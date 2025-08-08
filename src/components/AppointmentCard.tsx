import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/enhanced-button"
import { Calendar, Clock, User, FileText, X, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Service {
  id: string
  name: string
  description?: string
  category: string
  location?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  rating?: number
  total_reviews?: number
  verified?: boolean
}

interface Professional {
  id: string
  full_name: string
  user_type: string
  bio?: string
  phone?: string
  location?: string
}

interface Appointment {
  id: string
  patient_id: string
  service_id: string
  appointment_date: string
  status?: string
  notes?: string
  created_at: string
  updated_at: string
  services?: Service
  profiles?: Professional
}

interface AppointmentCardProps {
  appointment: Appointment
  onCancel: (id: string) => void
  onUpdate: (id: string, updates: any) => void
}

const statusConfig = {
  scheduled: { 
    label: 'Agendado', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock 
  },
  confirmed: { 
    label: 'Confirmado', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle 
  },
  completed: { 
    label: 'Concluído', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle 
  },
  cancelled: { 
    label: 'Cancelado', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: X 
  }
}

export const AppointmentCard = ({ appointment, onCancel, onUpdate }: AppointmentCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const isUpcoming = () => {
    const now = new Date()
    const aptDate = new Date(appointment.appointment_date)
    return aptDate > now
  }

  const canCancel = appointment.status === 'scheduled' || appointment.status === 'confirmed'
  const canConfirm = appointment.status === 'scheduled'

  const status = statusConfig[appointment.status as keyof typeof statusConfig] || statusConfig.scheduled
  const StatusIcon = status.icon

  return (
    <Card className="shadow-soft border-0 bg-background/95 hover:shadow-gentle transition-all duration-300">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-calm-blue/20">
                <Calendar className="h-5 w-5 text-calm-blue" />
              </div>
              <div>
                <h3 className="font-medium text-text-gentle">
                  {appointment.services?.name || 'Consulta'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {appointment.services?.category || 'Serviço'}
                </p>
              </div>
            </div>
            <Badge className={status.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>

          {/* Date */}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(appointment.appointment_date)}</span>
            </div>
          </div>

          {/* Service Location */}
          {appointment.services?.location && (
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-text-gentle">
                {appointment.services.location}
              </span>
            </div>
          )}

          {/* Service Details */}
          {appointment.services && (
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-1">Serviço:</p>
              <p className="text-sm text-text-gentle font-medium">
                {appointment.services.description}
              </p>
              {appointment.services.phone && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">
                    Telefone: {appointment.services.phone}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                <p className="text-sm text-text-gentle">{appointment.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isUpcoming() && (
            <div className="flex space-x-2 pt-2">
              {canConfirm && (
                <Button
                  variant="calm"
                  size="sm"
                  onClick={() => onUpdate(appointment.id, { status: 'confirmed' })}
                  className="flex-1"
                >
                  Confirmar
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(appointment.id)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}