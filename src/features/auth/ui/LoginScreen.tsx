import type React from 'react';
import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { MapPin, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

interface Props {
  /** Se llama al iniciar sesión o registrarse. Devuelve el nombre capturado (si lo hay). */
  onComplete: (name: string) => void;
  /** Se llama al pulsar "Continuar como invitado": entra directo sin cuenta. */
  onGuest: () => void;
  /** Se llama al pulsar "Continuar con Google" (simulado, solo front). */
  onGoogle: () => void;
  /** Pestaña inicial (p. ej. abrir directamente en "Registrarse"). */
  initialMode?: 'login' | 'register';
}

export function LoginScreen({ onComplete, onGuest, onGoogle, initialMode = 'login' }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(name.trim());
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
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <MapPin className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-4xl font-bold text-white drop-shadow-md">Popayán</h1>
          <p className="mt-1 text-sm font-medium uppercase tracking-[0.2em] text-accent drop-shadow">
            La Ciudad Blanca
          </p>
        </div>

        <div className="w-full max-w-sm rounded-3xl bg-card/95 p-6 shadow-2xl backdrop-blur-sm">
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
            {mode === 'register' && (
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
                    placeholder="Tu nombre"
                    className={`${inputCls} pl-10 pr-3`}
                  />
                </div>
              </div>
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

            <Button type="submit" size="lg" className="mt-2 w-full">
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
