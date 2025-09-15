import { useState } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

const Login = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      cleanupAuthState()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      if (data.user) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando...",
        })
        navigate('/home')
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      })
      
      if (error) {
        toast({
          title: "Erro no login com Google",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-calm p-4">
      <div className="max-w-md mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6 pt-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-text-gentle">Entrar</h1>
        </div>

        <Card className="shadow-soft border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl text-text-gentle">Bem-vindo de volta!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Entre com seus dados para acessar sua conta
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-text-gentle">Email ou Telefone</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1 h-12 text-base"
                    placeholder="exemplo@email.com ou +244..."
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-text-gentle">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="mt-1 h-12 text-base"
                    placeholder="Digite sua senha"
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <button
                  type="button"
                  className="text-calm-blue hover:underline text-sm"
                >
                  Esqueceu a senha?
                </button>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="large" 
                className="w-full"
                disabled={!formData.email || !formData.password || isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              {/* Alternative Options */}
              <div className="space-y-4 pt-4">
                <div className="text-center">
                  <span className="text-muted-foreground text-sm">ou</span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  type="button"
                  onClick={handleGoogleLogin}
                >
                  Entrar com Google
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="text-calm-blue hover:underline text-sm"
                  >
                    Não tem conta? Criar conta
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login