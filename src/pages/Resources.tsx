import { useState } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Download, Play, FileText, Search, Headphones } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Resources = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")

  const resources = [
    {
      id: 1,
      title: "Guia para Pais: Primeiros Sinais do Autismo",
      type: "pdf",
      category: "education",
      description: "Manual completo para identificar sinais precoces",
      duration: "15 min leitura",
      downloads: 1240,
      language: "Português"
    },
    {
      id: 2,
      title: "Técnicas de Comunicação Alternativa",
      type: "video",
      category: "communication",
      description: "Como usar PECS e outras ferramentas",
      duration: "25 min",
      downloads: 890,
      language: "Português/Legendas"
    },
    {
      id: 3,
      title: "Musicoterapia para Crianças Autistas",
      type: "audio",
      category: "therapy",
      description: "Exercícios de relaxamento e estímulo",
      duration: "30 min",
      downloads: 650,
      language: "Português"
    },
    {
      id: 4,
      title: "Estratégias para Sala de Aula Inclusiva",
      type: "pdf",
      category: "education",
      description: "Manual para professores e educadores",
      duration: "20 min leitura",
      downloads: 2100,
      language: "Português"
    },
    {
      id: 5,
      title: "Terapia ABA: Fundamentos Básicos",
      type: "video",
      category: "therapy",
      description: "Introdução à Análise do Comportamento Aplicada",
      duration: "40 min",
      downloads: 1560,
      language: "Português"
    },
    {
      id: 6,
      title: "Comunicação Visual: Pictogramas",
      type: "pdf",
      category: "communication",
      description: "Conjunto de pictogramas para comunicação",
      duration: "Download imediato",
      downloads: 3200,
      language: "Universal"
    }
  ]

  const categories = [
    { id: "todos", label: "Todos", icon: "📚" },
    { id: "education", label: "Educação", icon: "🎓" },
    { id: "communication", label: "Comunicação", icon: "💬" },
    { id: "therapy", label: "Terapias", icon: "🩺" }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === "todos" || resource.category === selectedCategory
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getResourceIcon = (type: string) => {
    switch(type) {
      case "pdf": return <FileText className="h-5 w-5" />
      case "video": return <Play className="h-5 w-5" />
      case "audio": return <Headphones className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getResourceColor = (type: string) => {
    switch(type) {
      case "pdf": return "text-red-500"
      case "video": return "text-blue-500"
      case "audio": return "text-green-500"
      default: return "text-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Header */}
      <div className="bg-background/90 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/home")}
              className="mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-text-gentle">Recursos Educativos</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar recursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "calm" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex-shrink-0"
            >
              <span className="mr-1">{category.icon}</span>
              {category.label}
            </Button>
          ))}
        </div>

        {/* Info Banner */}
        <Card className="mb-6 shadow-soft border-0 bg-background/95">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl">📖</div>
              <h3 className="font-medium text-text-gentle">
                Recursos Gratuitos
              </h3>
              <p className="text-sm text-muted-foreground">
                Materiais desenvolvidos por especialistas para apoiar famílias e profissionais
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resources List */}
        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <Card 
              key={resource.id}
              className="shadow-soft border-0 bg-background/95 hover:shadow-gentle transition-all duration-300"
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-muted ${getResourceColor(resource.type)}`}>
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-text-gentle">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {resource.description}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>{resource.duration}</span>
                      <span>• {resource.language}</span>
                    </div>
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      {resource.downloads}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button variant="calm" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      {resource.type === 'video' ? 'Assistir' : 
                       resource.type === 'audio' ? 'Ouvir' : 'Baixar'}
                    </Button>
                    <Button variant="outline" size="sm">
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <Card className="shadow-soft border-0 bg-background/95">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-medium text-text-gentle mb-2">
                Nenhum recurso encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                Tente ajustar sua categoria ou termo de busca
              </p>
            </CardContent>
          </Card>
        )}

        {/* Suggestion Card */}
        <Card className="mt-6 shadow-soft border-0 bg-background/95">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <h4 className="font-medium text-text-gentle">
                Precisa de um recurso específico?
              </h4>
              <p className="text-sm text-muted-foreground">
                Nossa equipe está sempre criando novos materiais
              </p>
              <Button variant="gentle" size="lg" className="w-full">
                Solicitar Recurso
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Resources