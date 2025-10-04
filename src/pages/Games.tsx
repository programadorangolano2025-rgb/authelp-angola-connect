import { useState } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Game {
  id: string;
  title: string;
  description: string;
  gradient: string;
  component: React.ComponentType;
}

// Jogo 1: Jogo da Memória de Cores
const MemoryGame = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  
  const colors = [
    { id: 0, color: 'bg-red-500', name: 'Vermelho' },
    { id: 1, color: 'bg-blue-500', name: 'Azul' },
    { id: 2, color: 'bg-green-500', name: 'Verde' },
    { id: 3, color: 'bg-yellow-500', name: 'Amarelo' },
  ];

  const startGame = () => {
    const newSequence = [Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    setPlayerSequence([]);
    setScore(0);
    setIsPlaying(true);
    playSequence(newSequence);
  };

  const playSequence = (seq: number[]) => {
    seq.forEach((colorId, index) => {
      setTimeout(() => {
        const element = document.getElementById(`color-${colorId}`);
        element?.classList.add('ring-4', 'ring-white');
        setTimeout(() => {
          element?.classList.remove('ring-4', 'ring-white');
        }, 300);
      }, index * 600);
    });
  };

  const handleColorClick = (colorId: number) => {
    if (!isPlaying) return;
    
    const newPlayerSequence = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setIsPlaying(false);
      alert(`Fim de jogo! Pontuação: ${score}`);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      const newScore = score + 1;
      setScore(newScore);
      const newSequence = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(newSequence);
      setPlayerSequence([]);
      setTimeout(() => playSequence(newSequence), 1000);
    }
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Jogo da Memória</h3>
        <p className="text-muted-foreground mb-4">Repita a sequência de cores!</p>
        <div className="text-xl font-semibold text-primary">Pontuação: {score}</div>
      </div>
      
      {!isPlaying && (
        <Button onClick={startGame} className="w-full mb-6" size="lg">
          <Play className="mr-2 h-5 w-5" />
          Iniciar Jogo
        </Button>
      )}

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        {colors.map((color) => (
          <button
            key={color.id}
            id={`color-${color.id}`}
            onClick={() => handleColorClick(color.id)}
            className={`${color.color} h-32 rounded-xl transition-all active:scale-95 disabled:opacity-50`}
            disabled={!isPlaying}
          >
            <span className="text-white font-semibold text-lg">{color.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Jogo 2: Jogo de Matemática Rápida
const MathGame = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const generateQuestion = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setAnswer('');
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    generateQuestion();
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPlaying(false);
          alert(`Fim de jogo! Pontuação final: ${score}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const checkAnswer = () => {
    if (parseInt(answer) === num1 + num2) {
      setScore(score + 1);
      generateQuestion();
    } else {
      alert('Resposta incorreta! Tente novamente.');
    }
    setAnswer('');
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Matemática Rápida</h3>
        <p className="text-muted-foreground mb-4">Resolva o máximo de somas em 30 segundos!</p>
        <div className="flex justify-center gap-4 text-lg font-semibold">
          <span className="text-primary">Pontuação: {score}</span>
          {isPlaying && <span className="text-orange-500">Tempo: {timeLeft}s</span>}
        </div>
      </div>

      {!isPlaying ? (
        <Button onClick={startGame} className="w-full mb-6" size="lg">
          <Play className="mr-2 h-5 w-5" />
          Iniciar Jogo
        </Button>
      ) : (
        <div className="max-w-md mx-auto">
          <Card className="p-8 mb-6 bg-gradient-to-br from-blue-500 to-purple-500">
            <div className="text-center text-white">
              <div className="text-5xl font-bold mb-4">
                {num1} + {num2} = ?
              </div>
            </div>
          </Card>
          
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            className="w-full p-4 text-2xl text-center rounded-lg border-2 border-primary mb-4"
            placeholder="Sua resposta"
            autoFocus
          />
          
          <Button onClick={checkAnswer} className="w-full" size="lg">
            Verificar Resposta
          </Button>
        </div>
      )}
    </div>
  );
};

// Jogo 3: Jogo de Adivinhar Número
const GuessNumberGame = () => {
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const startGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setAttempts(0);
    setMessage('');
    setIsPlaying(true);
  };

  const makeGuess = () => {
    const guessNum = parseInt(guess);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guessNum === targetNumber) {
      setMessage(`🎉 Parabéns! Você acertou em ${newAttempts} tentativas!`);
      setIsPlaying(false);
    } else if (guessNum < targetNumber) {
      setMessage('📈 O número é MAIOR! Tente novamente.');
    } else {
      setMessage('📉 O número é MENOR! Tente novamente.');
    }
    setGuess('');
  };

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Adivinhe o Número</h3>
        <p className="text-muted-foreground mb-4">Adivinhe o número entre 1 e 100!</p>
        {isPlaying && <div className="text-lg font-semibold text-primary">Tentativas: {attempts}</div>}
      </div>

      {!isPlaying && attempts === 0 ? (
        <Button onClick={startGame} className="w-full mb-6" size="lg">
          <Play className="mr-2 h-5 w-5" />
          Iniciar Jogo
        </Button>
      ) : !isPlaying ? (
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-green-500 mb-4">{message}</div>
          <Button onClick={startGame} className="w-full" size="lg">
            Jogar Novamente
          </Button>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          {message && (
            <Card className="p-4 mb-4 bg-gradient-to-r from-purple-500 to-pink-500">
              <p className="text-white text-center font-semibold">{message}</p>
            </Card>
          )}
          
          <input
            type="number"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && makeGuess()}
            className="w-full p-4 text-2xl text-center rounded-lg border-2 border-primary mb-4"
            placeholder="Digite um número"
            min="1"
            max="100"
            autoFocus
          />
          
          <Button onClick={makeGuess} className="w-full" size="lg">
            Adivinhar
          </Button>
        </div>
      )}
    </div>
  );
};

const Games = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const games: Game[] = [
    {
      id: 'memory',
      title: 'Jogo da Memória',
      description: 'Teste sua memória com sequências de cores',
      gradient: 'from-purple-500 to-pink-500',
      component: MemoryGame,
    },
    {
      id: 'math',
      title: 'Matemática Rápida',
      description: 'Resolva somas contra o tempo',
      gradient: 'from-blue-500 to-cyan-500',
      component: MathGame,
    },
    {
      id: 'guess',
      title: 'Adivinhe o Número',
      description: 'Descubra o número secreto',
      gradient: 'from-green-500 to-emerald-500',
      component: GuessNumberGame,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground px-4 pt-8 pb-12 rounded-b-[2rem]">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate('/home')}
            className="mb-4 flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold mb-2">🎮 Jogos</h1>
          <p className="text-primary-foreground/80 text-lg">
            Divirta-se aprendendo!
          </p>
        </div>
      </div>

      {/* Games List */}
      <div className="max-w-lg mx-auto px-4 -mt-6">
        <div className="space-y-4">
          {games.map((game) => (
            <Card 
              key={game.id}
              className="overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => setSelectedGame(game)}
            >
              <div className={`h-32 bg-gradient-to-br ${game.gradient} flex items-center justify-center`}>
                <Play className="h-16 w-16 text-white" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground text-lg mb-1">
                  {game.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {game.description}
                </p>
                <Button className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Jogar Agora
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Game Dialog */}
      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedGame?.title}</DialogTitle>
          </DialogHeader>
          {selectedGame && <selectedGame.component />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Games;
