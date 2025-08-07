import { useEffect } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Brain, 
  MapPin, 
  GraduationCap, 
  Users, 
  Calendar,
  Bell,
  Settings,
  LogOut
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

const Home = () => {
  const navigate = useNavigate()
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      navigate("/")
    }
  }, [user, loading, navigate])

  const menuItems = [
    {
      title: "Minhas Rotinas",
      description: "Agenda visual e lembretes",
      icon: Brain,
      color: "calm",
      route: "/routines"
    },
    {
      title: "Serviços Perto de Mim",
      description: "Clínicas e terapeutas",
      icon: MapPin,
      color: "gentle",
      route: "/services"
    },
    {
      title: "Recursos Educativos",
      description: "Guias e materiais",
      icon: GraduationCap,
      color: "calm",
      route: "/resources"
    },
    {
      title: "Comunidade Segura",
      description: "Conecte-se com outros",
      icon: Users,
      color: "gentle",
      route: "/community"
    },
    {
      title: "Agenda de Consultas",
      description: "Marcar e acompanhar",
      icon: Calendar,
      color: "calm",
      route: "/appointments"
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-calm flex items-center justify-center">
        <div className="text-text-gentle">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Header */}
      <div className="bg-background/90 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-text-gentle">Olá, {user.user_metadata?.full_name || "Usuário"}!</h1>
              <p className="text-sm text-muted-foreground">Como você está hoje?</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={signOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 pb-8">
        {/* Welcome Message */}
        <Card className="mb-6 shadow-soft border-0 bg-background/95">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl">🌟</div>
              <h2 className="text-lg font-medium text-text-gentle">
                Bem-vinda ao seu espaço seguro
              </h2>
              <p className="text-sm text-muted-foreground">
                Hoje é um novo dia cheio de possibilidades
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Menu Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-gentle mb-4">
            O que você gostaria de fazer?
          </h3>
          
          <div className="grid gap-4">
            {menuItems.map((item, index) => (
              <Card 
                key={index}
                className="shadow-soft border-0 bg-background/95 hover:shadow-gentle transition-all duration-300 cursor-pointer"
                onClick={() => navigate(item.route)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-2xl ${
                      item.color === 'calm' ? 'bg-calm-blue/20' : 'bg-soft-lilac/30'
                    }`}>
                      <item.icon className={`h-6 w-6 ${
                        item.color === 'calm' ? 'text-calm-blue' : 'text-gentle-purple'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-text-gentle">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 shadow-soft border-0 bg-background/95">
          <CardContent className="p-4">
            <h4 className="font-medium text-text-gentle mb-3">Ações Rápidas</h4>
            <div className="flex gap-3">
              <Button variant="gentle" size="sm" className="flex-1">
                SOS Crise
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Respirar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Home