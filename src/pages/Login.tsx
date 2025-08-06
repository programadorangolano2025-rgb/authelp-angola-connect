import { useState } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here would be the login logic
    navigate("/home")
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
                disabled={!formData.email || !formData.password}
              >
                Entrar
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