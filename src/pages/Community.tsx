import { useState } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Heart, MessageCircle, Share, Flag, Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Community = () => {
  const navigate = useNavigate()
  const [newPost, setNewPost] = useState("")
  const [likedPosts, setLikedPosts] = useState<number[]>([])

  const posts = [
    {
      id: 1,
      author: "Maria Santos",
      userType: "Mãe",
      time: "2 horas atrás",
      content: "Hoje meu filho conseguiu se comunicar usando os pictogramas que aprendemos aqui! Muito obrigada pela ajuda de todos. 💙",
      likes: 24,
      comments: 8,
      avatar: "👩‍💼"
    },
    {
      id: 2,
      author: "Dr. João Silva",
      userType: "Psicólogo",
      time: "4 horas atrás",
      content: "Dica importante: A rotina visual funciona melhor quando a criança participa da criação. Deixem eles escolherem as cores e símbolos!",
      likes: 18,
      comments: 12,
      avatar: "👨‍⚕️"
    },
    {
      id: 3,
      author: "Ana Costa",
      userType: "Professora",
      time: "1 dia atrás",
      content: "Compartilho aqui uma atividade sensorial que tem funcionado muito bem na minha sala inclusiva. As crianças adoram!",
      likes: 31,
      comments: 15,
      avatar: "👩‍🏫"
    },
    {
      id: 4,
      author: "Carlos Mendes",
      userType: "Pai",
      time: "2 dias atrás",
      content: "Alguém tem dicas para lidar com crises sensoriais em locais públicos? Meu filho tem dificuldades em shoppings.",
      likes: 12,
      comments: 23,
      avatar: "👨‍💼"
    }
  ]

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const handleNewPost = () => {
    if (newPost.trim()) {
      // Here would be the logic to submit the new post
      setNewPost("")
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
              <h1 className="text-xl font-bold text-text-gentle">Comunidade</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Flag className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-8">
        {/* Community Guidelines */}
        <Card className="mb-6 shadow-soft border-0 bg-background/95">
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-2xl">🤝</div>
              <h3 className="font-medium text-text-gentle">
                Espaço Seguro e Respeitoso
              </h3>
              <p className="text-sm text-muted-foreground">
                Compartilhe experiências, faça perguntas e apoie outros membros da comunidade
              </p>
            </div>
          </CardContent>
        </Card>

        {/* New Post */}
        <Card className="mb-6 shadow-soft border-0 bg-background/95">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="font-medium text-text-gentle">Compartilhe com a comunidade</h4>
              <Textarea
                placeholder="O que você gostaria de compartilhar ou perguntar?"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {newPost.length}/300 caracteres
                </span>
                <Button 
                  variant="calm" 
                  size="sm"
                  onClick={handleNewPost}
                  disabled={!newPost.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Publicar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => {
            const isLiked = likedPosts.includes(post.id)
            
            return (
              <Card 
                key={post.id}
                className="shadow-soft border-0 bg-background/95 hover:shadow-gentle transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Post Header */}
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-2xl">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-text-gentle">{post.author}</h4>
                          <span className="text-xs bg-soft-lilac text-secondary-foreground px-2 py-1 rounded-full">
                            {post.userType}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{post.time}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <p className="text-text-gentle leading-relaxed">{post.content}</p>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => toggleLike(post.id)}
                          className={`flex items-center space-x-2 transition-colors ${
                            isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                          <span className="text-sm">{post.likes + (isLiked ? 1 : 0)}</span>
                        </button>
                        
                        <button className="flex items-center space-x-2 text-muted-foreground hover:text-calm-blue transition-colors">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                      </div>

                      <button className="text-muted-foreground hover:text-calm-blue transition-colors">
                        <Share className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Load More */}
        <Card className="mt-6 shadow-soft border-0 bg-background/95">
          <CardContent className="p-4">
            <Button variant="outline" className="w-full" size="lg">
              Carregar Mais Posts
            </Button>
          </CardContent>
        </Card>

        {/* Community Rules */}
        <Card className="mt-6 shadow-soft border-0 bg-soft-lilac/20 border-soft-lilac/30">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="font-medium text-text-gentle">Regras da Comunidade</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Seja respeitoso e empático</li>
                <li>• Não compartilhe informações pessoais</li>
                <li>• Reporte conteúdo inadequado</li>
                <li>• Mantenha um ambiente seguro para todos</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Community