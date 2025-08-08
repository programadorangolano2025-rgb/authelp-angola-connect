import { Button } from "@/components/ui/enhanced-button"
import { useNavigate } from "react-router-dom"
import { AuthTest } from "@/components/AuthTest"
import autismInclusionImage from "@/assets/autism-inclusion.jpg"

const Welcome = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-calm flex flex-col">
      {/* Header */}
      <div className="text-center pt-8 pb-6">
        <img 
          src="/lovable-uploads/c0b4cc3e-1360-49ba-9d29-9007ef61fea9.png" 
          alt="AutHelp - Apoio para a jornada autista"
          className="h-16 mx-auto mb-4"
        />
        <div className="w-24 h-1 bg-calm-blue mx-auto rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="max-w-md w-full space-y-8">
          {/* Illustration */}
          <div className="flex justify-center">
            <img 
              src={autismInclusionImage} 
              alt="Ilustração de inclusão e apoio ao autismo"
              className="w-80 h-60 object-cover rounded-2xl shadow-soft"
            />
          </div>

          {/* Impact Phrase */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-text-gentle leading-relaxed">
              Apoio para cada passo da jornada autista
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Uma plataforma segura e acessível para pessoas autistas, famílias e profissionais em Angola.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            <Button 
              variant="large" 
              className="w-full" 
              onClick={() => navigate("/login")}
            >
              Entrar
            </Button>
            <Button 
              variant="gentle" 
              size="xl" 
              className="w-full" 
              onClick={() => navigate("/register")}
            >
              Criar Conta
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-6">
            <p className="text-sm text-muted-foreground">
              Feito com cuidado para a comunidade autista angolana
            </p>
          </div>
        </div>
      </div>
      
      {/* Auth Test Component */}
      <AuthTest />
    </div>
  )
}

export default Welcome