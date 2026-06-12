import React from 'react';
import { Toaster } from 'react-hot-toast';
//import { startSync } from '@/features/offline-sync';

// Inicializa sincronización al arrancar la app
//startSync();

interface ProvidersProps {
  children: React.ReactNode;
}

// Agrega aquí cualquier Context Provider que necesites en el futuro
export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      {/* Sistema global de notificaciones toast */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2600,
          style: {
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />
    </>
  );
}
