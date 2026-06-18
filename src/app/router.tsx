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
  { path: '/',           element: <OnboardingPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  
  // Convertimos a MainShell en la ruta Padre con seguridad integrada
  {
    path: '/',
    element: <RequireAuth><MainShell /></RequireAuth>,
    children: [
      // Al entrar a /home o /inicio, se pintará el HomePage dentro del MainShell
      { path: 'home',     element: <HomePage /> },
      { path: 'inicio',   element: <HomePage /> },
      { path: 'map',      element: <MapPage /> },
      { 
        path: 'gallery', 
        element: <GalleryPage onBack={() => window.history.back()} /> 
      }, // ¡Ahora sí heredará el cascarón!
      { path: 'settings', element: <SettingsPage /> },
    ]
  },
]);