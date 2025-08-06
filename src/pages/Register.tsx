import { useState } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Users, GraduationCap } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

const Register = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [userType, setUserType] = useState<string>("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  const userTypes = [
    { id: "autistic", label: "Sou Autista", icon: User, description: "Pessoa autista" },
    { id: "caregiver", label: "Sou Cuidador", icon: Users, description: "Familiar ou cuidador" },
    { id: "professional", label: "Sou Profissional", icon: GraduationCap, description: "Terapeuta, médico ou educador" }
  ]

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Senha muito fraca",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      cleanupAuthState()

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/home`,
          data: {
            full_name: formData.fullName,
            user_type: userType
          }
        }
      })

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      if (data.user) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        })
        window.location.href = "/home"
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

  const handleGoogleSignup = async () => {
    if (!userType) {
      toast({
        title: "Selecione o tipo de usuário",
        description: "Por favor, selecione se você é autista, cuidador ou profissional.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
          queryParams: {
            user_type: userType
          }
        }
      })
      
      if (error) {
        toast({
          title: "Erro no cadastro com Google",
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
          <h1 className="text-2xl font-bold text-text-gentle">Criar Conta</h1>
        </div>

        <Card className="shadow-soft border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl text-text-gentle">Bem-vindo ao AutHelp</CardTitle>
            <CardDescription className="text-muted-foreground">
              Preencha os dados para criar sua conta
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label className="text-text-gentle font-medium">Eu sou:</Label>
                <div className="grid gap-3">
                  {userTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setUserType(type.id)}
                      className={`flex items-center p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        userType === type.id
                          ? "border-calm-blue bg-calm-blue/10 shadow-gentle"
                          : "border-border hover:border-calm-blue/50 hover:bg-accent/50"
                      }`}
                    >
                      <type.icon className="h-5 w-5 mr-3 text-calm-blue" />
                      <div>
                        <div className="font-medium text-text-gentle">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-text-gentle">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="mt-1 h-12 text-base"
                    placeholder="Digite seu nome completo"
                  />
                </div>

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
                    placeholder="Crie uma senha segura"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-text-gentle">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="mt-1 h-12 text-base"
                    placeholder="Digite a senha novamente"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="large" 
                className="w-full mt-6"
                disabled={!userType || !formData.fullName || !formData.email || !formData.password || isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
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
                  onClick={handleGoogleSignup}
                >
                  Entrar com Google
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-calm-blue hover:underline text-sm"
                  >
                    Já tem conta? Faça login
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

export default Register