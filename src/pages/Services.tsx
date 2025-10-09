import { useState, useEffect } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Phone, Star, Filter, Search, User, CheckCircle, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Professional {
  id: string
  full_name: string
  email?: string
  phone?: string
  bio?: string
  location?: string
  specialization?: string
  specializations?: string[]
  license_type?: string
  professional_license?: string
  verified: boolean
  is_admin_created: boolean
  professional_status?: string
}

const Services = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [selectedFilter, setSelectedFilter] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    setLoading(true)
    try {
      const [userProfsResponse, adminProfsResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'professional')
          .eq('professional_status', 'verified')
          .order('full_name'),
        supabase
          .from('admin_created_professionals')
          .select('*')
          .eq('is_active', true)
          .order('full_name')
      ])

      if (userProfsResponse.error) throw userProfsResponse.error
      if (adminProfsResponse.error) throw adminProfsResponse.error

      const userProfessionals = (userProfsResponse.data || []).map(prof => ({
        ...prof,
        verified: prof.professional_status === 'verified',
        is_admin_created: false
      }))

      const adminProfessionals = (adminProfsResponse.data || []).map(prof => ({
        ...prof,
        verified: prof.verified || true,
        is_admin_created: true
      }))

      const allProfessionals = [...userProfessionals, ...adminProfessionals]
      setProfessionals(allProfessionals)
    } catch (error) {
      console.error('Error loading professionals:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os profissionais.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filters = [
    { id: "todos", label: "Todos", icon: "👥" },
    { id: "psicologia", label: "Psicólogos", icon: "🧠" },
    { id: "terapia", label: "Terapeutas", icon: "🤝" },
    { id: "fonoaudiologia", label: "Fonoaudiólogos", icon: "🗣️" },
    { id: "fisioterapia", label: "Fisioterapeutas", icon: "💪" },
    { id: "neurologia", label: "Neurologistas", icon: "⚕️" }
  ]

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch =
      professional.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.specializations?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))

    if (selectedFilter === "todos") {
      return matchesSearch
    }

    const matchesFilter =
      professional.license_type?.toLowerCase().includes(selectedFilter.toLowerCase()) ||
      professional.specialization?.toLowerCase().includes(selectedFilter.toLowerCase()) ||
      professional.specializations?.some(s => s.toLowerCase().includes(selectedFilter.toLowerCase()))

    return matchesSearch && matchesFilter
  })

  const getProfessionalIcon = (professional: Professional) => {
    const licenseType = professional.license_type?.toLowerCase() || ''
    const specialization = professional.specialization?.toLowerCase() || ''

    if (licenseType.includes('crp') || licenseType.includes('psico') || specialization.includes('psico')) return '🧠'
    if (licenseType.includes('crfa') || licenseType.includes('fono') || specialization.includes('fono')) return '🗣️'
    if (licenseType.includes('crefito') || licenseType.includes('fisio') || specialization.includes('fisio')) return '💪'
    if (licenseType.includes('crm') || licenseType.includes('neuro') || specialization.includes('neuro')) return '⚕️'
    return '👨‍⚕️'
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
              <h1 className="text-xl font-bold text-text-gentle">Profissionais</h1>
            </div>
            <Badge variant="secondary">{filteredProfessionals.length}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar profissionais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "calm" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className="flex-shrink-0"
            >
              <span className="mr-1">{filter.icon}</span>
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredProfessionals.map((professional) => (
            <Card
              key={professional.id}
              className="shadow-soft border-0 bg-background/95 hover:shadow-gentle transition-all duration-300"
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl mt-1">
                        {getProfessionalIcon(professional)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-text-gentle">
                            {professional.full_name}
                          </h3>
                          {professional.verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        {professional.license_type && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {professional.license_type}
                            {professional.professional_license && ` - ${professional.professional_license}`}
                          </p>
                        )}
                        {professional.bio && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {professional.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {professional.specializations && professional.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {professional.specializations.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {professional.location && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{professional.location}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    {professional.phone && (
                      <Button
                        variant="calm"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`tel:${professional.phone}`)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Ligar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate('/appointments')}
                    >
                      Agendar Consulta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProfessionals.length === 0 && (
          <Card className="shadow-soft border-0 bg-background/95">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-medium text-text-gentle mb-2">
                Nenhum profissional encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Tente ajustar seus filtros ou termo de busca
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Services
