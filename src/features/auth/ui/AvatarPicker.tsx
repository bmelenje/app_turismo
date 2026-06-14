import { useState } from 'react';
import { useUserStore, type Avatar } from '@/features/auth';
import { Button } from '@/shared/ui/Button';

interface Props {
  onComplete: () => void;
}

const AVATARS: { id: Avatar; name: string; emoji: string; desc: string }[] = [
  { id: 'sahumadora', name: 'Sahumadora', emoji: '🌿', desc: 'Tradición y aromas' },
  { id: 'cargero',    name: 'Carguero',   emoji: '✝️', desc: 'Semana Santa' },
  { id: 'empanada',   name: 'Empanada',   emoji: '🥟', desc: 'Sabor de pipián' },
  { id: 'carantanta', name: 'Carantanta', emoji: '🌽', desc: 'Crujiente tradición' },
  { id: 'tamal',      name: 'Tamal',      emoji: '🍃', desc: 'Domingo familiar' },
];

export function AvatarPicker({ onComplete }: Props) {
  const setAvatar = useUserStore((s) => s.setAvatar);
  const userName = useUserStore((s) => s.name);
  const [selected, setSelected] = useState<Avatar | null>(null);

  const handleContinue = () => {
    if (selected) {
      setAvatar(selected);
      onComplete();
    }
  };

  return (
    <>
      <header className="mb-5 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground text-balance">
          Hola, {userName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Elige tu compañero de viaje</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {AVATARS.map((av) => {
          const isSel = selected === av.id;
          return (
            <button
              key={av.id}
              onClick={() => setSelected(av.id)}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-4 text-center transition-all ${
                isSel
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <div className="text-3xl">{av.emoji}</div>
              <div className="font-heading text-sm font-semibold text-foreground">{av.name}</div>
              <div className="text-[11px] leading-tight text-muted-foreground">{av.desc}</div>
            </button>
          );
        })}
      </div>

      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={!selected}
        onClick={handleContinue}
      >
        Empezar aventura
      </Button>
    </>
  );
}
