import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoginScreen, AvatarPicker, useUserStore } from '@/features/auth';

// Cuenta de Google simulada (solo front, sin integración real)
const MOCK_GOOGLE_ACCOUNT = { name: 'María González', email: 'maria.gonzalez@gmail.com' };

type Step = 'login' | 'avatar';

export function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setProfile = useUserStore((s) => s.setProfile);
  const continueAsGuest = useUserStore((s) => s.continueAsGuest);
  const [step, setStep] = useState<Step>('login');

  // Permite que el modal "Regístrate" abra esta pantalla directo en la pestaña de registro.
  const initialMode = (location.state as { mode?: 'login' | 'register' } | null)?.mode ?? 'login';

  function handleLoginComplete(name: string) {
    setProfile({ name: name || 'Viajero', age: 0, language: 'es' });
    setStep('avatar');
  }

  // Modo invitado: sin avatar, directo a la interfaz principal (sección Descubrir).
  function handleGuest() {
    continueAsGuest();
    navigate('/home');
  }

  // Registro rápido con Google (simulado): autorrellena el perfil con los datos de la cuenta.
  function handleGoogle() {
    setProfile({ name: MOCK_GOOGLE_ACCOUNT.name, age: 0, language: 'es' });
    toast.success(`Sesión iniciada como ${MOCK_GOOGLE_ACCOUNT.email}`);
    setStep('avatar');
  }

  // Paso 1: login tal cual el repo (solo imagen de Popayán, sin overlay rojo)
  if (step === 'login') {
    return (
      <LoginScreen
        onComplete={handleLoginComplete}
        onGuest={handleGuest}
        onGoogle={handleGoogle}
        initialMode={initialMode}
      />
    );
  }

  // Paso 2: selección de avatar (sahumadora, carguero, etc.)
  return (
    <div className="relative flex min-h-dvh flex-col overflow-y-auto">
      {/* Fondo con la imagen de Popayán */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/images/popayan-hero.png"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <MapPin className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white drop-shadow-md">Popayán</h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-accent drop-shadow">
            La Ciudad Blanca
          </p>
        </div>

        <div className="w-full max-w-sm rounded-3xl bg-card/95 p-6 shadow-2xl backdrop-blur-sm">
          <AvatarPicker onComplete={() => navigate('/home', { state: { justRegistered: true } })} />
        </div>
      </div>
    </div>
  );
}
