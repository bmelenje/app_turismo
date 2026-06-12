import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage }       from '@/pages/HomePage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { MapPage }        from '@/pages/MapPage';
import { GalleryPage }    from '@/pages/GalleryPage';
import { SettingsPage }   from '@/pages/SettingsPage';
import { useUserStore }   from '@/features/auth';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const registered = useUserStore((s) => s.registered);
  return registered ? <>{children}</> : <Navigate to="/onboarding" replace />;
}

export const router = createBrowserRouter([
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '/',           element: <RequireAuth><HomePage /></RequireAuth> },
  { path: '/map',        element: <RequireAuth><MapPage /></RequireAuth> },
  { path: '/gallery',    element: <RequireAuth><GalleryPage /></RequireAuth> },
  { path: '/settings',   element: <RequireAuth><SettingsPage /></RequireAuth> },
]);