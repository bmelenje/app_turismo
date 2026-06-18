import { Compass } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useUserStore } from '@/features/auth';
import { AVATAR_IMAGE } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Modal de bienvenida que aparece una sola vez, justo después de registrarse
 * y entrar a la interfaz principal. Saluda al usuario por su nombre.
 */
export default function WelcomeModal({ open, onClose }: Props) {
  const name = useUserStore((s) => s.name);
  const avatar = useUserStore((s) => s.avatar);
  if (!open) return null;

  const avatarImage = (avatar && AVATAR_IMAGE[avatar]) || null;
  const firstName = (name || 'Viajero').split(' ')[0];

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
        aria-labelledby="welcome-title"
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card text-center shadow-2xl"
      >
        {/* Cabecera con la imagen de Popayán */}
        <div className="relative h-28 w-full">
          <img
            src="/images/popayan-hero.png"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-card" />
          <div className="absolute inset-x-0 -bottom-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-primary text-3xl shadow-lg">
              {avatarImage ? (
                <img src={avatarImage} alt="" className="h-full w-full object-cover" />
              ) : (
                '🧭'
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-10">
          <h2 id="welcome-title" className="font-heading text-2xl font-bold text-foreground">
            ¡Bienvenido, {firstName}! 👋
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu aventura por la Ciudad Blanca comienza ahora. Explora lugares, rutas guiadas y
            experiencias únicas de Popayán.
          </p>

          <Button size="lg" className="mt-6 w-full" onClick={onClose}>
            <Compass className="h-4 w-4" />
            Comenzar a explorar
          </Button>
        </div>
      </div>
    </div>
  );
}
