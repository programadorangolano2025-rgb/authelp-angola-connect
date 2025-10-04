import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpdatePromptProps {
  onUpdate: () => void;
}

export const UpdatePrompt = ({ onUpdate }: UpdatePromptProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top-2">
      <div className="bg-primary text-primary-foreground px-4 py-3 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <RefreshCw className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium">Nova versão disponível</p>
          </div>
          
          <Button
            onClick={onUpdate}
            size="sm"
            variant="secondary"
            className="flex-shrink-0"
          >
            Atualizar
          </Button>
        </div>
      </div>
    </div>
  );
};
