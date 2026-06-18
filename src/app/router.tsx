import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage }       from '@/pages/HomePage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { MapPage }        from '@/pages/MapPage';
import { GalleryPage }    from '@/pages/GalleryPage';
import { SettingsPage }   from '@/pages/SettingsPage';
import { MainShell }      from '@/widgets/MainShell';
import { useUserStore }   from '@/features/auth';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const registered = useUserStore((s) => s.registered);
  const guest = useUserStore((s) => s.guest);
  // Los invitados también acceden (con funcionalidades limitadas a "Descubrir").
  return registered || guest ? <>{children}</> : <Navigate to="/" replace />;
}

export const router = createBrowserRouter([
  // Pantalla por defecto al arrancar la app: el login
  { path: '/',           element: <OnboardingPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  // Interfaz principal: barra superior + slider menu + funcionalidades
  { path: '/home',       element: <RequireAuth><MainShell /></RequireAuth> },
  { path: '/inicio',     element: <RequireAuth><HomePage /></RequireAuth> },
  { path: '/map',        element: <RequireAuth><MapPage /></RequireAuth> },
  { path: '/gallery',    element: <RequireAuth><GalleryPage /></RequireAuth> },
  { path: '/settings',   element: <RequireAuth><SettingsPage /></RequireAuth> },
]);
