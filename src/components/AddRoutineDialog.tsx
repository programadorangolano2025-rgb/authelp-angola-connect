import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/enhanced-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useRoutines } from '@/hooks/useRoutines'

interface AddRoutineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const commonIcons = [
  { emoji: '🦷', name: 'Escovar dentes' },
  { emoji: '🥣', name: 'Comer' },
  { emoji: '🎒', name: 'Escola' },
  { emoji: '📚', name: 'Estudar' },
  { emoji: '🎨', name: 'Brincar' },
  { emoji: '🛁', name: 'Banho' },
  { emoji: '😴', name: 'Dormir' },
  { emoji: '🏃‍♂️', name: 'Exercício' },
  { emoji: '📱', name: 'Tecnologia' },
  { emoji: '🧘‍♀️', name: 'Relaxar' },
  { emoji: '👕', name: 'Vestir roupa' },
  { emoji: '🍽️', name: 'Comer' }
]

export const AddRoutineDialog = ({ open, onOpenChange }: AddRoutineDialogProps) => {
  const { toast } = useToast()
  const { createRoutine } = useRoutines()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('🌟')
  const [time, setTime] = useState('07:00')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, adicione um título para a rotina.",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    
    try {
      const success = await createRoutine({
        title: title.trim(),
        description: description.trim() || undefined,
        icon_name: selectedIcon,
        time_slots: { default_time: time },
        days_of_week: [1, 2, 3, 4, 5, 6, 0] // Segunda a domingo (1-6, 0)
      })

      if (success) {
        toast({
          title: "Sucesso!",
          description: "Nova rotina adicionada com sucesso."
        })
        
        // Reset form
        setTitle('')
        setDescription('')
        setSelectedIcon('🌟')
        setTime('07:00')
        onOpenChange(false)
      } else {
        throw new Error('Failed to create routine')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a rotina. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Rotina</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Rotina</Label>
            <Input
              id="title"
              placeholder="Ex: Escovar os dentes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Adicione detalhes sobre esta rotina..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={300}
            />
          </div>

          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-6 gap-2">
              {commonIcons.map((icon) => (
                <button
                  key={icon.emoji}
                  type="button"
                  className={`p-3 text-2xl rounded-xl border-2 transition-all ${
                    selectedIcon === icon.emoji
                      ? 'border-calm-blue bg-calm-blue/10'
                      : 'border-border hover:border-calm-blue/50'
                  }`}
                  onClick={() => setSelectedIcon(icon.emoji)}
                  title={icon.name}
                >
                  {icon.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Horário Sugerido</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

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
              disabled={submitting || !title.trim()}
              className="flex-1"
            >
              {submitting ? 'Criando...' : 'Criar Rotina'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}