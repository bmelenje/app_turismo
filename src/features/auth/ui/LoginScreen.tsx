import type React from 'react';
import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Mail, Lock, Eye, EyeOff, User, Globe, Phone, CreditCard } from 'lucide-react';
import type { Language, TravelerOrigin, RegisterData } from '@/features/auth';

interface Props {
  /** Se llama al iniciar sesión o registrarse con los datos capturados. */
  onComplete: (data: RegisterData) => void;
  /** Se llama al pulsar "Continuar como invitado": entra directo sin cuenta. */
  onGuest: () => void;
  /** Se llama al pulsar "Continuar con Google" (simulado, solo front). */
  onGoogle: () => void;
  /** Pestaña inicial (p. ej. abrir directamente en "Registrarse"). */
  initialMode?: 'login' | 'register';
}

// Países/nacionalidades frecuentes entre quienes visitan Popayán (+ "Otro").
const COUNTRIES = [
  '🇺🇸 Estados Unidos',
  '🇨🇦 Canadá',
  '🇲🇽 México',
  '🇧🇷 Brasil',
  '🇦🇷 Argentina',
  '🇨🇱 Chile',
  '🇵🇪 Perú',
  '🇪🇨 Ecuador',
  '🇻🇪 Venezuela',
  '🇪🇸 España',
  '🇫🇷 Francia',
  '🇩🇪 Alemania',
  '🇮🇹 Italia',
  '🇬🇧 Reino Unido',
  '🇳🇱 Países Bajos',
  '🇵🇹 Portugal',
  '🌎 Otro',
];

// Idiomas disponibles (el extranjero suele necesitar algo distinto del español).
const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

export function LoginScreen({ onComplete, onGuest, onGoogle, initialMode = 'login' }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Campos del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [origin, setOrigin] = useState<TravelerOrigin>('national');
  const [country, setCountry] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState<Language>('es');

  const isRegister = mode === 'register';
  const isForeign = origin === 'foreign';

  // Al cambiar de origen ajustamos los valores por defecto sensatos.
  function selectOrigin(next: TravelerOrigin) {
    setOrigin(next);
    if (next === 'national') {
      setCountry('🇨🇴 Colombia');
      setLanguage('es');
    } else {
      setCountry('');
    }
  }

  const canSubmit = isRegister
    ? name.trim().length > 1 &&
      email.trim().length > 3 &&
      documentId.trim().length > 3 &&
      (!isForeign || country.trim().length > 0)
    : email.trim().length > 3;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    if (isRegister) {
      onComplete({
        name: name.trim(),
        email: email.trim(),
        origin,
        country: isForeign ? country : '🇨🇴 Colombia',
        documentType: isForeign ? 'passport' : 'cc',
        documentId: documentId.trim(),
        phone: phone.trim() || undefined,
        language,
      });
    } else {
      // Inicio de sesión: solo el correo identifica al viajero en este front.
      onComplete({ name: name.trim(), email: email.trim(), language: 'es' });
    }
  }

  const inputCls =
    'w-full rounded-lg border border-input bg-background py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <div className="relative flex min-h-dvh flex-col overflow-y-auto">
      {/* Fondo: solo la imagen de Popayán (sin overlay rojo) */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/images/popayan-hero.png"
          alt="Vista panorámica de Popayán, la Ciudad Blanca"
          className="h-full w-full object-cover"
        />
        {/* Degradado neutro sutil solo para legibilidad del texto blanco */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        {/* Card con logo flotante encima */}
        <div className="relative mt-16 w-full max-w-sm">
          {/* Círculo con logo — mitad fuera del card, mitad dentro */}
          <div className="absolute inset-x-0 -top-16 z-10 flex justify-center">
            <div className="flex h-36 w-36 items-center justify-center rounded-full bg-card shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-4 ring-card/60">
              <img
                src="/images/logo-original.png"
                alt="Popayán"
                className="h-[130px] w-[130px] object-contain"
              />
            </div>
          </div>

        <div className="w-full rounded-3xl bg-card/95 pt-24 px-6 pb-6 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <>
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Como aparece en tu documento"
                      className={`${inputCls} pl-10 pr-3`}
                    />
                  </div>
                </div>

                {/* ¿De dónde nos visita? — define qué datos pedimos después */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">¿De dónde nos visitas?</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { value: 'national', label: 'Soy de Colombia', flag: '🇨🇴' },
                        { value: 'foreign', label: 'Vengo del exterior', flag: '🌎' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => selectOrigin(opt.value)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
                          origin === opt.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        <span className="text-base">{opt.flag}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* País / nacionalidad — solo para el turista extranjero */}
                {isForeign && (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="country" className="text-sm font-medium text-foreground">
                      País de origen / nacionalidad
                    </label>
                    <div className="relative">
                      <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={`${inputCls} pl-10 pr-3 ${country ? '' : 'text-muted-foreground'}`}
                      >
                        <option value="" disabled>
                          Selecciona tu país
                        </option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Documento: pasaporte para extranjeros, cédula para nacionales */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="document" className="text-sm font-medium text-foreground">
                    {isForeign ? 'Número de pasaporte' : 'Cédula de ciudadanía'}
                  </label>
                  <div className="relative">
                    <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="document"
                      type="text"
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      placeholder={isForeign ? 'Ej. X1234567' : 'Ej. 1061234567'}
                      className={`${inputCls} pl-10 pr-3`}
                    />
                  </div>
                </div>

                {/* Teléfono con indicativo — útil para contactar al viajero */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Teléfono <span className="font-normal text-muted-foreground">(con indicativo)</span>
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={isForeign ? '+1 415 555 0100' : '+57 300 123 4567'}
                      className={`${inputCls} pl-10 pr-3`}
                    />
                  </div>
                </div>

                {/* Idioma preferido — sobre todo para el turista extranjero */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">Idioma preferido</span>
                  <div className="grid grid-cols-3 gap-2">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setLanguage(l.code)}
                        className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs font-medium transition-colors ${
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
              </>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="turista@ejemplo.com"
                  className={`${inputCls} pl-10 pr-3`}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`${inputCls} px-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <button
                type="button"
                className="self-end text-xs font-medium text-secondary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}

            <Button type="submit" size="lg" className="mt-2 w-full" disabled={!canSubmit}>
              {mode === 'login' ? 'Entrar a la ciudad' : 'Crear cuenta'}
            </Button>
          </form>

          {/* Separador */}
          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">o</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Registro rápido con Google (simulado) */}
          <button
            type="button"
            onClick={onGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-input bg-background py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <GoogleIcon className="h-5 w-5" />
            Continuar con Google
          </button>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            Al continuar aceptas explorar el patrimonio histórico de Popayán.
          </p>
        </div>
        </div>{/* cierre wrapper relativo */}

        <button
          type="button"
          onClick={onGuest}
          className="relative z-10 mt-6 text-sm font-medium text-white/90 underline-offset-4 drop-shadow hover:underline"
        >
          Continuar como invitado
        </button>
      </div>
    </div>
  );
}

/** Logo oficial de Google (4 colores). */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
