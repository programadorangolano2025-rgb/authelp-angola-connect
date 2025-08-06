import { useState } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, MapPin, Phone, Star, Filter, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Services = () => {
  const navigate = useNavigate()
  const [selectedFilter, setSelectedFilter] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")

  const services = [
    {
      id: 1,
      name: "Centro de Apoio Autista Luanda",
      type: "clinic",
      address: "Bairro Maculusso, Luanda",
      phone: "+244 923 456 789",
      rating: 4.8,
      distance: "2.3 km",
      description: "Centro especializado em diagnóstico e terapias para autismo"
    },
    {
      id: 2,
      name: "Dra. Ana Silva - Psicóloga",
      type: "therapist",
      address: "Av. 4 de Fevereiro, Luanda",
      phone: "+244 934 567 890",
      rating: 4.9,
      distance: "1.8 km",
      description: "Especialista em terapia comportamental para crianças autistas"
    },
    {
      id: 3,
      name: "Escola Inclusiva Esperança",
      type: "school",
      address: "Bairro Viana, Luanda",
      phone: "+244 912 345 678",
      rating: 4.6,
      distance: "5.2 km",
      description: "Escola com programa de educação inclusiva"
    },
    {
      id: 4,
      name: "Terapia Ocupacional Vida",
      type: "therapist",
      address: "Bairro Talatona, Luanda",
      phone: "+244 945 678 901",
      rating: 4.7,
      distance: "3.1 km",
      description: "Terapia ocupacional e desenvolvimento de habilidades"
    },
    {
      id: 5,
      name: "Hospital Pediátrico Josina Machel",
      type: "clinic",
      address: "Ilha de Luanda",
      phone: "+244 956 789 012",
      rating: 4.5,
      distance: "4.7 km",
      description: "Atendimento neurológico especializado"
    }
  ]

  const filters = [
    { id: "todos", label: "Todos", icon: "🏥" },
    { id: "clinic", label: "Clínicas", icon: "🏥" },
    { id: "therapist", label: "Terapeutas", icon: "👩‍⚕️" },
    { id: "school", label: "Escolas", icon: "🎓" }
  ]

  const filteredServices = services.filter(service => {
    const matchesFilter = selectedFilter === "todos" || service.type === selectedFilter
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getServiceIcon = (type: string) => {
    switch(type) {
      case "clinic": return "🏥"
      case "therapist": return "👩‍⚕️"
      case "school": return "🎓"
      default: return "🏥"
    }
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
              <h1 className="text-xl font-bold text-text-gentle">Serviços</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Filter Tabs */}
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

        {/* Location Banner */}
        <Card className="mb-6 shadow-soft border-0 bg-background/95">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-calm-blue/20 rounded-2xl">
                <MapPin className="h-6 w-6 text-calm-blue" />
              </div>
              <div>
                <h3 className="font-medium text-text-gentle">Sua Localização</h3>
                <p className="text-sm text-muted-foreground">Luanda, Angola</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services List */}
        <div className="space-y-4">
          {filteredServices.map((service) => (
            <Card 
              key={service.id}
              className="shadow-soft border-0 bg-background/95 hover:shadow-gentle transition-all duration-300 cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl mt-1">
                        {getServiceIcon(service.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-text-gentle">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-muted-foreground">{service.rating}</span>
                    </div>
                  </div>

                  {/* Location and Distance */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {service.address}
                    </div>
                    <span>• {service.distance}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button variant="calm" size="sm" className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Ligar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver no Mapa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredServices.length === 0 && (
          <Card className="shadow-soft border-0 bg-background/95">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-medium text-text-gentle mb-2">
                Nenhum serviço encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Tente ajustar seus filtros ou termo de busca
              </p>
            </CardContent>
          </Card>
        )}

        {/* Add Service Button */}
        <Card className="mt-6 shadow-soft border-0 bg-background/95">
          <CardContent className="p-4">
            <Button variant="gentle" className="w-full" size="lg">
              Sugerir Novo Serviço
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Services