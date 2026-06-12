import { useState } from 'react';
import { useUserStore, type Language } from '@/features/auth';

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

  return (
    <>
      <header className="ob-hero">
        <h1>Personaliza<br />tu experiencia</h1>
        <p>Cuéntanos un poco sobre ti</p>
      </header>

      <div className="ob-form">
        <label className="ob-field">
          <span>¿Cómo te llamas?</span>
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="ob-field">
          <span>Edad</span>
          <input
            type="number"
            placeholder="Tu edad"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="1"
            max="120"
          />
        </label>

        <div className="ob-field">
          <span>Idioma preferido</span>
          <div className="ob-lang-options">
            {([
              { code: 'es', label: 'Español', flag: '🇪🇸' },
              { code: 'en', label: 'English', flag: '🇺🇸' },
              { code: 'fr', label: 'Français', flag: '🇫🇷' },
            ] as const).map((l) => (
              <button
                key={l.code}
                className={`ob-lang-btn ${language === l.code ? 'active' : ''}`}
                onClick={() => setLanguage(l.code)}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="ob-cta" disabled={!canContinue} onClick={handleContinue}>
        Continuar
      </button>
    </>
  );
}