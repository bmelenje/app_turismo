import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings as SettingsIcon } from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button
          onClick={() => navigate('/')}
          className="rounded-lg p-1.5 text-foreground hover:bg-muted"
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-foreground">Configuración</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <SettingsIcon className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="font-heading text-lg font-semibold text-foreground">Configuración</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Pronto podrás ajustar idioma, notificaciones y modo offline.
        </p>
      </div>
    </div>
  );
}
