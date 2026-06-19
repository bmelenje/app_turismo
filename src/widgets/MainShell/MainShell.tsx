import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
import { useUserStore } from '@/features/auth';
import { ensureLocationPermission } from '@/features/geofencing';
import { usePOIStore, type POI } from '@/entities/poi';
import { MapWithPOIs } from '@/widgets/MapWithPOIs';

import { CameraPage } from '@/pages/CameraPage';
import { GalleryPage } from '@/pages/GalleryPage';
import { AugmentedRealityPage } from '@/pages/AugmentedRealityPage';
import { ChallengesPage } from '@/pages/ChallengesPage';
import { CardPage } from '@/pages/CardPage';

// Importación corregida apuntando exactamente a la estructura de la característica (feature)
import { BusinessSection } from '@/features/business/ui/BusinessSection';

import Sidebar from './sidebar';
import BottomNav from './bottom-nav';
import SectionView from './section-view';
import GuiaIA from './guia-ia';
import Discover from './discover';
import Profile from './profile';
import GuestGateModal from './guest-gate-modal';
import AvatarFab from './avatar-fab';
import WelcomeModal from './welcome-modal';
import { ENV } from '@/shared/config/env';
import type { Section } from './types';

export function MainShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const reset = useUserStore((s) => s.reset);
  const isGuest = useUserStore((s) => s.guest && !s.registered);
  const selectPOI = usePOIStore((s) => s.selectPOI);
  const requestRoute = usePOIStore((s) => s.requestRoute);

  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState<Section>('descubrir');
  const [geofencing, setGeofencing] = useState(true);
  const [gateOpen, setGateOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(
    () => (location.state as { justRegistered?: boolean } | null)?.justRegistered === true,
  );

  // Mantenemos las exclusiones de pantalla completa para ocultar el mapa de fondo
  const fullScreenSections = ['guia', 'camara', 'galeria', 'ar', 'ra', 'retos', 'card-caldas', 'negocio', 'pasaporte'];
  const isFullScreen = fullScreenSections.includes(section);

  useEffect(() => {
    let cancelled = false;
    ensureLocationPermission().then((status) => {
      if (cancelled || status === 'granted') return;
      const msg = status === 'denied' && Capacitor.isNativePlatform()
        ? '📍 Habilita la ubicación en Ajustes para alertas de cercanía'
        : '📍 Activa la ubicación para alertas de cercanía';
      toast(msg, { duration: 4000 });
    });
    return () => { cancelled = true; };
  }, []);

  function handleNavigate(s: Section) {
    setSection(s);
    setMenuOpen(false);
  }

  function openPlaceOnMap(poi: POI) {
    if (isGuest) {
      setMenuOpen(false);
      setGateOpen(true);
      return;
    }
    selectPOI(poi);
    setSection('mapa');
    setMenuOpen(false);
  }

  function handleLogout() {
    reset();
    navigate('/');
  }

  function toggleGeofencing() {
    setGeofencing((g) => {
      const next = !g;
      toast(next ? '🔔 Alertas activadas' : '🔕 Alertas desactivadas');
      return next;
    });
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      {/* MAPA: Oculto dinámicamente si se activa una sección de pantalla completa */}
      {!isFullScreen && <MapWithPOIs />}

      {/* RENDERIZADO DE PÁGINAS */}
      {section === 'descubrir' && (
        <Discover
          onOpenMenu={() => setMenuOpen(true)}
          onOpenMap={() => handleNavigate('mapa')}
          onOpenPlace={openPlaceOnMap}
        />
      )}

      {section === 'mapa' && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-4">
          <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-2 rounded-2xl bg-card/95 p-2 shadow-lg backdrop-blur-sm">
            <button onClick={() => setMenuOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex flex-1 items-center gap-2 px-1 text-muted-foreground">
              <Search className="h-4 w-4" />
              <span className="text-sm">Buscar en {ENV.APP_CITY}…</span>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla: Guía IA con callback para trazar rutas */}
      {section === 'guia' && (
        <GuiaIA
          onBack={() => setSection('mapa')}
          onDrawRoute={(ids) => {
            requestRoute(ids);
            setSection('mapa');
          }}
        />
      )}

      {section === 'perfil' && <Profile onLogout={handleLogout} />}
      {section === 'camara' && <CameraPage onBack={() => setSection('descubrir')} onNavigateToGallery={() => setSection('galeria')} />}
      {section === 'galeria' && <GalleryPage onBack={() => setSection('camara')} />}
      {(section === 'ar' || section === 'ra') && <AugmentedRealityPage onBack={() => setSection('descubrir')} />}
      {section === 'retos' && <ChallengesPage onBack={() => setSection('descubrir')} />}
      {section === 'card-caldas' && <CardPage onBack={() => setSection('descubrir')} />}

      {/* Renderizado de la sección: Tu Negocio */}
      {section === 'negocio' && (
        <BusinessSection
          onBack={() => setSection('descubrir')}
          onViewOnMap={() => setSection('mapa')}
        />
      )}

      {/* Fallback para secciones genéricas */}
      {!['descubrir', 'mapa', 'guia', 'perfil', 'camara', 'galeria', 'ar', 'ra', 'retos', 'card-caldas', 'negocio', 'pasaporte'].includes(section) && (
        <SectionView section={section} onBack={() => setSection('descubrir')} onLogout={handleLogout} onSelectPlace={openPlaceOnMap} />
      )}

      {/* INTERFAZ FIJA */}
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active={section}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        geofencing={geofencing}
        onToggleGeofencing={toggleGeofencing}
      />

      {!isFullScreen && <AvatarFab onClick={() => handleNavigate('guia')} />}

      <BottomNav
        active={section}
        onNavigate={handleNavigate}
        hidden={section === 'guia' || section === 'camara' || section === 'galeria' || section === 'ar' || section === 'negocio' || section === 'pasaporte'}
      />

      <GuestGateModal
        open={gateOpen}
        onClose={() => setGateOpen(false)}
        onRegister={() => {
          setGateOpen(false);
          navigate('/onboarding', { state: { mode: 'register' } });
        }}
      />

      <WelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
    </div>
  );
}