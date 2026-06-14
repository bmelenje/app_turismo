import { useState } from 'react';
import { useUserStore, type Language } from '@/features/auth';
import { Button } from '@/shared/ui/Button';

interface Props {
  onComplete: () => void;
}

export function RegisterForm({ onComplete }: Props) {
  const setProfile = useUserStore((s) => s.setProfile);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [language, setLanguage] = useState<Language>('es');

  const canContinue = name.trim().length > 1 && Number(age) > 0;

  const handleContinue = () => {
    setProfile({ name: name.trim(), age: Number(age), language });
    onComplete();
  };

  const inputCls =
    'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <>
      <header className="mb-5 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground text-balance">
          Personaliza tu experiencia
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Cuéntanos un poco sobre ti</p>
      </header>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">¿Cómo te llamas?</span>
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Edad</span>
          <input
            type="number"
            placeholder="Tu edad"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="1"
            max="120"
            className={inputCls}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Idioma preferido</span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { code: 'es', label: 'Español', flag: '🇪🇸' },
                { code: 'en', label: 'English', flag: '🇺🇸' },
                { code: 'fr', label: 'Français', flag: '🇫🇷' },
              ] as const
            ).map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
                  language === l.code
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={!canContinue}
        onClick={handleContinue}
      >
        Continuar
      </Button>
    </>
  );
}
