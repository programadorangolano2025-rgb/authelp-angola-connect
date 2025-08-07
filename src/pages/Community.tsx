import { useState, useEffect } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Heart, MessageCircle, Share, Flag, Plus, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { useCommunityLikes } from "@/hooks/useCommunityLikes"

interface CommunityPost {
  id: string
  content: string
  title?: string
  author_id: string
  likes_count: number
  comments_count: number
  created_at: string
  profiles: {
    full_name: string
    user_type: string
  } | null
}

const Community = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { toggleLike: handleLike, isLiked } = useCommunityLikes()
  
  const [newPost, setNewPost] = useState("")
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Load posts from database
  useEffect(() => {
    loadPosts()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('community-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_posts'
        },
        () => {
          loadPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadPosts = async () => {
    try {
      // First get the posts
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (postsError) throw postsError

      // Then get the profiles for each post
      const postsWithProfiles = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, user_type')
            .eq('user_id', post.author_id)
            .single()

          return {
            ...post,
            profiles: profile
          }
        })
      )

      setPosts(postsWithProfiles as CommunityPost[])
    } catch (error) {
      console.error('Error loading posts:', error)
      toast({
        title: "Erro ao carregar posts",
        description: "Não foi possível carregar os posts da comunidade.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNewPost = async () => {
    if (!newPost.trim() || !user) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          content: newPost.trim(),
          author_id: user.id
        })

      if (error) throw error

      setNewPost("")
      toast({
        title: "Post publicado!",
        description: "Seu post foi compartilhado com a comunidade."
      })
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: "Erro ao publicar",
        description: "Não foi possível publicar seu post. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para curtir posts.",
        variant: "destructive"
      })
      return
    }

    const wasLiked = isLiked(postId)
    const success = await handleLike(postId)
    
    if (success) {
      // Update the local posts state to reflect the change
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + (wasLiked ? -1 : 1) }
          : post
      ))
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o like.",
        variant: "destructive"
      })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInDays > 0) {
      return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`
    } else if (diffInHours > 0) {
      return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`
    } else {
      return 'Agora mesmo'
    }
  }

  const getUserTypeEmoji = (userType: string) => {
    switch (userType?.toLowerCase()) {
      case 'parent': case 'pai': case 'mãe': return '👨‍👩‍👧‍👦'
      case 'professional': case 'psicólogo': case 'terapeuta': return '👨‍⚕️'
      case 'teacher': case 'professor': case 'professora': return '👩‍🏫'
      case 'autistic': return '🌟'
      default: return '👤'
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
        {user && (
          <Card className="mb-6 shadow-soft border-0 bg-background/95">
            <CardContent className="p-4">
              <div className="space-y-3">
                <h4 className="font-medium text-text-gentle">Compartilhe com a comunidade</h4>
                <Textarea
                  placeholder="O que você gostaria de compartilhar ou perguntar?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {newPost.length}/500 caracteres
                  </span>
                  <Button 
                    variant="calm" 
                    size="sm"
                    onClick={handleNewPost}
                    disabled={!newPost.trim() || submitting}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {submitting ? 'Publicando...' : 'Publicar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts Feed */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-calm-blue" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="shadow-soft border-0 bg-background/95">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-medium text-text-gentle mb-2">Nenhum post ainda</h3>
              <p className="text-muted-foreground">
                Seja o primeiro a compartilhar algo com a comunidade!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const postIsLiked = isLiked(post.id)
              
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
                          {getUserTypeEmoji(post.profiles?.user_type || 'user')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-text-gentle">
                              {post.profiles?.full_name || 'Usuário'}
                            </h4>
                            <span className="text-xs bg-soft-lilac text-secondary-foreground px-2 py-1 rounded-full">
                              {post.profiles?.user_type || 'Membro'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatTimeAgo(post.created_at)}
                          </p>
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
                              postIsLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                            }`}
                            disabled={!user}
                          >
                            <Heart className={`h-5 w-5 ${postIsLiked ? "fill-current" : ""}`} />
                            <span className="text-sm">{post.likes_count}</span>
                          </button>
                          
                          <button className="flex items-center space-x-2 text-muted-foreground hover:text-calm-blue transition-colors">
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-sm">{post.comments_count}</span>
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
        )}

        {/* Login prompt for non-authenticated users */}
        {!user && (
          <Card className="mt-6 shadow-soft border-0 bg-soft-lilac/20 border-soft-lilac/30">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <h4 className="font-medium text-text-gentle">Participe da Comunidade</h4>
                <p className="text-sm text-muted-foreground">
                  Faça login para curtir, comentar e criar posts
                </p>
                <Button 
                  variant="calm" 
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="mt-2"
                >
                  Fazer Login
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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