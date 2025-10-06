import React, { useEffect } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { InstallPrompt } from './InstallPrompt';
import { UpdatePrompt } from './UpdatePrompt';
import { OfflineIndicator } from './OfflineIndicator';
import { toast } from 'sonner';

interface PWAWrapperProps {
  children: React.ReactNode;
}

export const PWAWrapper = ({ children }: PWAWrapperProps) => {
  const { isUpdateAvailable, isOffline, updateServiceWorker } = useServiceWorker();

  useEffect(() => {
    if (isOffline) {
      toast.error('Você está offline');
    }
  }, [isOffline]);

  return (
    <>
      {children}
      <InstallPrompt />
      {isUpdateAvailable && <UpdatePrompt onUpdate={updateServiceWorker} />}
      {isOffline && <OfflineIndicator />}
    </>
  );
};
