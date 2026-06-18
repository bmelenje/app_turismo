import { Lock, X, Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

type Props = {
  open: boolean;
  onClose: () => void;
  onRegister: () => void;
};

/**
 * Aviso emergente para invitados: al intentar entrar a una funcionalidad
 * que no sea "Descubrir", se les invita a registrarse.
 */
export default function GuestGateModal({ open, onClose, onRegister }: Props) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[1300] flex items-center justify-center p-6">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Tarjeta */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-gate-title"
        className="relative w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>

        <h2 id="guest-gate-title" className="font-heading text-xl font-bold text-foreground">
          Regístrate para más funcionalidades
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Estás explorando como invitado. Crea tu cuenta para desbloquear el mapa, las rutas
          guiadas, la guía IA y todas las experiencias de Popayán.
        </p>

        <Button size="lg" className="mt-6 w-full" onClick={onRegister}>
          <Sparkles className="h-4 w-4" />
          Registrarme
        </Button>
        <button
          onClick={onClose}
          className="mt-3 w-full text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Seguir explorando
        </button>
      </div>
    </div>
  );
}
