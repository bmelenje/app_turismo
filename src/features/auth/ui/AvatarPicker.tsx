import { useState } from 'react';
import { useUserStore, type Avatar } from '@/features/auth';

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
      <header className="ob-hero">
        <h1>Hola, {userName}</h1>
        <p>Elige tu compañero de viaje</p>
      </header>

      <div className="ob-avatar-grid">
        {AVATARS.map((av) => (
          <button
            key={av.id}
            className={`ob-avatar-card ${selected === av.id ? 'selected' : ''}`}
            onClick={() => setSelected(av.id)}
          >
            <div className="ob-avatar-emoji">{av.emoji}</div>
            <div className="ob-avatar-name">{av.name}</div>
            <div className="ob-avatar-desc">{av.desc}</div>
          </button>
        ))}
      </div>

      <button className="ob-cta" disabled={!selected} onClick={handleContinue}>
        Empezar aventura
      </button>
    </>
  );
}