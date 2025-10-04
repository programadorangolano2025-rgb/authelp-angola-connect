import { WifiOff } from 'lucide-react';

export const OfflineIndicator = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top-2">
      <div className="bg-destructive text-destructive-foreground px-4 py-2">
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          <p className="text-sm font-medium">Você está offline</p>
        </div>
      </div>
    </div>
  );
};
