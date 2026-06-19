import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
import { useUserStore } from '@/features/auth';
import { ensureLocationPermission } from '@/features/geofencing';
import { usePOIStore, type POI } from '@/entities/poi';
import { MapWithPOIs } from '@/widgets/MapWithPOIs';

// IMPORTACIONES DE LOS MÓDULOS DE HARDWARE, AR Y GAMIFICACIÓN
import { CameraPage } from '@/pages/CameraPage'; 
import { GalleryPage } from '@/pages/GalleryPage';
import { AugmentedRealityPage } from '@/pages/AugmentedRealityPage'; 
import { ChallengesPage } from '@/pages/ChallengesPage'; // <-- Módulo de Retos Integrado

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

  useEffect(() => {
    let cancelled = false;
    ensureLocationPermission().then((status) => {
      if (cancelled || status === 'granted') return;
      const msg =
        status === 'denied' && Capacitor.isNativePlatform()
          ? '📍 Habilita la ubicación en Ajustes para alertas de cercanía y rutas'
          : '📍 Activa la ubicación para alertas de cercanía y rutas';
      toast(msg, { duration: 4000 });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleNavigate(s: Section) {
    if (isGuest && s !== 'descubrir') {
      setMenuOpen(false);
      setGateOpen(true);
      return;
    }
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

  function goToRegister() {
    setGateOpen(false);
    navigate('/onboarding', { state: { mode: 'register' } });
  }

  function handleLogout() {
    reset();
    navigate('/');
  }

  function toggleGeofencing() {
    setGeofencing((g) => {
      const next = !g;
      toast(next ? '🔔 Alertas de cercanía activadas' : '🔕 Alertas de cercanía desactivadas');
      return next;
    });
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      {/* Capa Base: Renderizado continuo del mapa */}
      <MapWithPOIs />

      {/* Pantalla: Descubrir */}
      {section === 'descubrir' && (
        <Discover
          onOpenMenu={() => setMenuOpen(true)}
          onOpenMap={() => handleNavigate('mapa')}
          onOpenPlace={openPlaceOnMap}
        />
      )}

      {/* Barra superior de telemetría y búsqueda */}
      {section === 'mapa' && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] p-4">
          <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-2 rounded-2xl bg-card/95 p-2 shadow-lg backdrop-blur-sm">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex flex-1 items-center gap-2 px-1 text-muted-foreground">
              <Search className="h-4 w-4" />
              <span className="text-sm">Buscar en {ENV.APP_CITY}…</span>
            </div>
          </div>
        </div>
      )}

      {/* Pantalla: Guía IA */}
      {section === 'guia' && (
        <GuiaIA
          onBack={() => setSection('mapa')}
          onDrawRoute={(ids) => {
            requestRoute(ids);
            setSection('mapa');
          }}
        />
      )}

      {/* Pantalla: Perfil */}
      {section === 'perfil' && <Profile onLogout={handleLogout} />}

      {/* Módulo: Cámara Fotográfica IP */}
      {section === 'camara' && (
        <CameraPage 
          onBack={() => setSection('descubrir')} 
          onNavigateToGallery={() => setSection('galeria')} 
        />
      )}

      {/* Módulo: Galería Memory Unlock */}
      {section === 'galeria' && (
        <GalleryPage 
          onBack={() => setSection('camara')} 
        />
      )}

      {/* =================================================================== */}
      {/* INTERCEPCIÓN DEL MÓDULO DE REALIDAD AUMENTADA */}
      {/* =================================================================== */}
      {(section === 'ar' || section === 'ra') && (
        <AugmentedRealityPage 
          onBack={() => setSection('descubrir')} 
        />
      )}

      {/* =================================================================== */}
      {/* INTERCEPCIÓN DEL MÓDULO DE GAMIFICACIÓN / RETOS */}
      {/* =================================================================== */}
      {section === 'retos' && (
        <ChallengesPage 
          onBack={() => setSection('descubrir')} 
        />
      )}
      {/* =================================================================== */}

      {/* Fallback estructural */}
      {section !== 'mapa' &&
        section !== 'guia' &&
        section !== 'descubrir' &&
        section !== 'perfil' && 
        section !== 'camara' && 
        section !== 'galeria' &&
        section !== 'ar' &&
        section !== 'ra' &&
        section !== 'retos' && (
          <SectionView
            section={section}
            onBack={() => setSection('descubrir')}
            onLogout={handleLogout}
            onSelectPlace={openPlaceOnMap}
          />
        )}

      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active={section}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        geofencing={geofencing}
        onToggleGeofencing={toggleGeofencing}
      />

      {/* Escondemos el Fab de la IA en modos inmersivos para no obstruir la visión */}
      {section !== 'guia' && section !== 'camara' && section !== 'galeria' && section !== 'ar' && section !== 'ra' && section !== 'retos' && (
        <AvatarFab onClick={() => handleNavigate('guia')} />
      )}

      <BottomNav
        active={section}
        onNavigate={handleNavigate}
        hidden={section === 'guia' || section === 'camara' || section === 'galeria' || section === 'ar'}
      />

      <GuestGateModal open={gateOpen} onClose={() => setGateOpen(false)} onRegister={goToRegister} />

      <WelcomeModal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} />
    </div>
  );
}