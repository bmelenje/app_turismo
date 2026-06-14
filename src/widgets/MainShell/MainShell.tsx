import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/features/auth';
import { usePOIStore, type POI } from '@/entities/poi';
import { MapWithPOIs } from '@/widgets/MapWithPOIs';
import Sidebar from './sidebar';
import BottomNav from './bottom-nav';
import SectionView from './section-view';
import GuiaIA from './guia-ia';
import Discover from './discover';
import Profile from './profile';
import { ENV } from '@/shared/config/env';
import type { Section } from './types';

export function MainShell() {
  const navigate = useNavigate();
  const reset = useUserStore((s) => s.reset);
  const selectPOI = usePOIStore((s) => s.selectPOI);

  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState<Section>('descubrir');
  const [geofencing, setGeofencing] = useState(true);

  function handleNavigate(s: Section) {
    setSection(s);
    setMenuOpen(false);
  }

  // Abre un lugar en el mapa interactivo (desde Lugares / Descubrir)
  function openPlaceOnMap(poi: POI) {
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
      toast(next ? '🔔 Alertas de cercanía activadas' : '🔕 Alertas de cercanía desactivadas');
      return next;
    });
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background">
      {/* Mapa funcional (MapLibre + geofencing) siempre montado como base */}
      <MapWithPOIs />

      {/* Pantalla principal de descubrimiento (por defecto tras el login) */}
      {section === 'descubrir' && (
        <Discover
          onOpenMenu={() => setMenuOpen(true)}
          onOpenMap={() => setSection('mapa')}
          onOpenPlace={openPlaceOnMap}
        />
      )}

      {/* Barra superior: menú + buscador (solo sobre el mapa) */}
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

      {/* Guía IA tiene su propia pantalla de chat */}
      {section === 'guia' && <GuiaIA onBack={() => setSection('mapa')} />}

      {/* Perfil con gamificación (ranking, retos y logros) */}
      {section === 'perfil' && <Profile onLogout={handleLogout} />}

      {/* Resto de funcionalidades cubren el mapa */}
      {section !== 'mapa' &&
        section !== 'guia' &&
        section !== 'descubrir' &&
        section !== 'perfil' && (
          <SectionView
            section={section}
            onBack={() => setSection('descubrir')}
            onLogout={handleLogout}
            onSelectPlace={openPlaceOnMap}
          />
        )}

      {/* Slider menu */}
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active={section}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        geofencing={geofencing}
        onToggleGeofencing={toggleGeofencing}
      />

      {/* Navegación inferior */}
      <BottomNav active={section} onNavigate={handleNavigate} />
    </div>
  );
}
