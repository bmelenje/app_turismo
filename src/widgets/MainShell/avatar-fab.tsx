import { Sparkles } from 'lucide-react';
import { useUserStore } from '@/features/auth';
import { AVATAR_IMAGE } from './types';

type Props = {
  onClick: () => void;
};

/**
 * Botón flotante con el avatar elegido (esquina inferior derecha), al estilo
 * de las burbujas de soporte/chat. Al pulsarlo abre la Guía IA.
 */
export default function AvatarFab({ onClick }: Props) {
  const avatar = useUserStore((s) => s.avatar);
  if (!avatar) return null;

  const image = AVATAR_IMAGE[avatar];

  return (
    <button
      onClick={onClick}
      aria-label="Abrir Guía IA"
      className="absolute bottom-20 right-4 z-[1070] flex h-14 w-14 items-center justify-center rounded-full border-2 border-card bg-primary text-2xl shadow-xl transition-transform hover:scale-105 active:scale-95"
    >
      {image && <img src={image} alt="" className="h-full w-full rounded-full object-cover" />}
      {/* Indicador de asistente IA */}
      <span className="absolute -right-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-accent text-accent-foreground shadow">
        <Sparkles className="h-3 w-3" />
      </span>
      {/* Pulso sutil */}
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-primary/40" />
    </button>
  );
}
