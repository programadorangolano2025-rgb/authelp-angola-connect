import { useState, useEffect } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Clock, Check, Volume2, Loader2, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { useRoutines } from "@/hooks/useRoutines"
import { AddRoutineDialog } from "@/components/AddRoutineDialog"

const Routines = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const {
    routines,
    loading,
    toggleRoutineCompletion,
    deleteRoutine,
    isRoutineCompleted,
    getCompletedCount
  } = useRoutines()
  
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Login necessário",
        description: "Faça login para acessar suas rotinas.",
        variant: "destructive"
      })
      navigate('/login')
    }
  }, [user, loading, navigate, toast])

  const handleDeleteRoutine = async (routineId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    
    const success = await deleteRoutine(routineId)
    if (success) {
      toast({
        title: "Rotina removida",
        description: "A rotina foi removida com sucesso."
      })
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível remover a rotina.",
        variant: "destructive"
      })
    }
  }

  const getTimeFromSlots = (timeSlots: any) => {
    if (timeSlots?.default_time) {
      return timeSlots.default_time
    }
    return '07:00'
  }

  const completedCount = getCompletedCount()
  const totalTasks = routines.length
  const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0

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
              <h1 className="text-xl font-bold text-text-gentle">Minhas Rotinas</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-8">
        {/* Progress Card */}
        <Card className="mb-6 shadow-soft border-0 bg-background/95">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="text-3xl">🌟</div>
              <h2 className="text-lg font-medium text-text-gentle">
                Progresso de Hoje
              </h2>
              <div className="space-y-2">
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-calm-blue h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {completedCount} de {totalTasks} tarefas concluídas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routines List */}
        {routines.length === 0 ? (
          <Card className="shadow-soft border-0 bg-background/95">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="font-medium text-text-gentle mb-2">Nenhuma rotina criada</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira rotina diária
              </p>
              <Button 
                variant="calm" 
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Rotina
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {routines.map((routine) => {
              const isCompleted = isRoutineCompleted(routine.id)
              
              return (
                <Card 
                  key={routine.id}
                  className={`shadow-soft border-0 transition-all duration-300 cursor-pointer group ${
                    isCompleted 
                      ? "bg-calm-blue/20 border-calm-blue/30" 
                      : "bg-background/95 hover:shadow-gentle"
                  }`}
                  onClick={() => toggleRoutineCompletion(routine.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Task Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                        isCompleted ? "bg-calm-blue/30" : "bg-muted"
                      }`}>
                        {routine.icon_name || '🌟'}
                      </div>
                      
                      {/* Task Details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`font-medium ${
                              isCompleted ? "text-text-gentle line-through" : "text-text-gentle"
                            }`}>
                              {routine.title}
                            </h3>
                            {routine.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {routine.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              {getTimeFromSlots(routine.time_slots)}
                            </div>
                            
                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleDeleteRoutine(routine.id, e)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            
                            {/* Completion Checkbox */}
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isCompleted 
                                ? "bg-calm-blue border-calm-blue" 
                                : "border-muted-foreground"
                            }`}>
                              {isCompleted && (
                                <Check className="h-4 w-4 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Add New Routine Button */}
        {routines.length > 0 && (
          <Card className="mt-6 shadow-soft border-0 bg-background/95">
            <CardContent className="p-4">
              <Button 
                variant="gentle" 
                className="w-full" 
                size="lg"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Nova Rotina
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completion Message */}
        {totalTasks > 0 && completedCount === totalTasks && (
          <Card className="mt-4 shadow-soft border-0 bg-calm-blue/10 border-calm-blue/30">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="font-medium text-text-gentle mb-1">
                Parabéns! Todas as tarefas concluídas!
              </h3>
              <p className="text-sm text-muted-foreground">
                Você teve um dia muito produtivo!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Routine Dialog */}
      <AddRoutineDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
    </div>
  )
}

export default Routines