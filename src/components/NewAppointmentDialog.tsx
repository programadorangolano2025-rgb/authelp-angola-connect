import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Clock, User, Stethoscope } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useAppointments } from '@/hooks/useAppointments'

interface NewAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewAppointmentDialog = ({ open, onOpenChange }: NewAppointmentDialogProps) => {
  const { toast } = useToast()
  const { professionals, createAppointment, getAvailableTimeSlots } = useAppointments()

  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedProfessional, setSelectedProfessional] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [serviceCategory, setServiceCategory] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedProfessional || !selectedTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)

    try {
      const success = await createAppointment({
        service_id: selectedProfessional,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        notes: notes.trim() || undefined
      })

      if (success) {
        toast({
          title: "Sucesso!",
          description: "Consulta agendada com sucesso."
        })

        setSelectedDate(undefined)
        setSelectedProfessional('')
        setServiceCategory('')
        setSelectedTime('')
        setNotes('')
        onOpenChange(false)
      } else {
        throw new Error('Failed to create appointment')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível agendar a consulta. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const availableTimeSlots = selectedDate
    ? getAvailableTimeSlots(format(selectedDate, 'yyyy-MM-dd'))
    : []

  const selectedProfessionalData = professionals.find(p => p.id === selectedProfessional)

  const filteredProfessionals = serviceCategory
    ? professionals.filter(p => {
        const specs = p.specializations || []
        return specs.some(s => s.toLowerCase().includes(serviceCategory.toLowerCase()))
      })
    : professionals

  const categories = [
    { id: '', label: 'Todos' },
    { id: 'psicologia', label: 'Psicologia' },
    { id: 'terapia', label: 'Terapia Ocupacional' },
    { id: 'fonoaudiologia', label: 'Fonoaudiologia' },
    { id: 'fisioterapia', label: 'Fisioterapia' },
    { id: 'neurologia', label: 'Neurologia' }
  ]

  // Disable past dates
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Nova Consulta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Filter */}
          <div className="space-y-2">
            <Label>Especialidade</Label>
            <Select value={serviceCategory} onValueChange={setServiceCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por especialidade" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Professional Selection */}
          <div className="space-y-2">
            <Label>Profissional *</Label>
            <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um profissional" />
              </SelectTrigger>
              <SelectContent>
                {filteredProfessionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{professional.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {professional.license_type || professional.specialization || 'Profissional'}
                          {professional.verified && ' ✓'}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProfessionalData && (
              <div className="text-sm text-muted-foreground space-y-1">
                {selectedProfessionalData.bio && <p>{selectedProfessionalData.bio}</p>}
                {selectedProfessionalData.location && (
                  <p className="flex items-center gap-1">
                    📍 {selectedProfessionalData.location}
                  </p>
                )}
                {selectedProfessionalData.specializations && selectedProfessionalData.specializations.length > 0 && (
                  <p>Especializações: {selectedProfessionalData.specializations.join(', ')}</p>
                )}
              </div>
            )}
            {filteredProfessionals.length === 0 && (
              <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                Nenhum profissional encontrado para esta especialidade.
              </p>
            )}
          </div>


          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Data da Consulta *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="space-y-2">
              <Label>Horário *</Label>
              {availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableTimeSlots.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={selectedTime === time ? "calm" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="text-sm"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {time}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                  Não há horários disponíveis para esta data.
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione informações importantes sobre a consulta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Summary */}
          {selectedProfessionalData && selectedDate && selectedTime && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-text-gentle">Resumo do Agendamento:</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Profissional:</span> {selectedProfessionalData.full_name}</p>
                <p><span className="text-muted-foreground">Data:</span> {format(selectedDate, "PPP", { locale: ptBR })}</p>
                <p><span className="text-muted-foreground">Horário:</span> {selectedTime}</p>
                {selectedProfessionalData.license_type && (
                  <p><span className="text-muted-foreground">Tipo:</span> {selectedProfessionalData.license_type}</p>
                )}
                {selectedProfessionalData.location && (
                  <p><span className="text-muted-foreground">Localização:</span> {selectedProfessionalData.location}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="calm"
              disabled={submitting || !selectedDate || !selectedProfessional || !selectedTime}
              className="flex-1"
            >
              {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}