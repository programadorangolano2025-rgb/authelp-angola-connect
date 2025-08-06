import { useState } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Clock, Check, Volume2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Routines = () => {
  const navigate = useNavigate()
  const [completedTasks, setCompletedTasks] = useState<number[]>([])

  const routines = [
    { id: 1, task: "Escovar os dentes", time: "07:00", icon: "🦷", completed: false },
    { id: 2, task: "Tomar café da manhã", time: "07:30", icon: "🥣", completed: false },
    { id: 3, task: "Ir para a escola", time: "08:00", icon: "🎒", completed: false },
    { id: 4, task: "Almoçar", time: "12:00", icon: "🍽️", completed: false },
    { id: 5, task: "Fazer lição de casa", time: "15:00", icon: "📚", completed: false },
    { id: 6, task: "Brincar/Relaxar", time: "16:30", icon: "🎨", completed: false },
    { id: 7, task: "Jantar", time: "18:00", icon: "🍲", completed: false },
    { id: 8, task: "Tomar banho", time: "19:00", icon: "🛁", completed: false },
    { id: 9, task: "Dormir", time: "21:00", icon: "😴", completed: false }
  ]

  const toggleTaskCompletion = (taskId: number) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const completedCount = completedTasks.length
  const totalTasks = routines.length
  const progressPercentage = (completedCount / totalTasks) * 100

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
        <div className="space-y-3">
          {routines.map((routine) => {
            const isCompleted = completedTasks.includes(routine.id)
            
            return (
              <Card 
                key={routine.id}
                className={`shadow-soft border-0 transition-all duration-300 cursor-pointer ${
                  isCompleted 
                    ? "bg-calm-blue/20 border-calm-blue/30" 
                    : "bg-background/95 hover:shadow-gentle"
                }`}
                onClick={() => toggleTaskCompletion(routine.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Task Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                      isCompleted ? "bg-calm-blue/30" : "bg-muted"
                    }`}>
                      {routine.icon}
                    </div>
                    
                    {/* Task Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${
                          isCompleted ? "text-text-gentle line-through" : "text-text-gentle"
                        }`}>
                          {routine.task}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 mr-1" />
                            {routine.time}
                          </div>
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

        {/* Add New Routine Button */}
        <Card className="mt-6 shadow-soft border-0 bg-background/95">
          <CardContent className="p-4">
            <Button 
              variant="gentle" 
              className="w-full" 
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar Nova Rotina
            </Button>
          </CardContent>
        </Card>

        {/* Completion Message */}
        {completedCount === totalTasks && (
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
    </div>
  )
}

export default Routines