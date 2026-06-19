/**
 * Sidebar.tsx
 * Menú lateral de navegación con acceso a funcionalidades del ecosistema Caldas.
 */
import { useState } from 'react';
import {
  Map,
  MapPin,
  Route,
  Image,
  QrCode,
  Headphones,
  Camera,
  Bell,
  WifiOff,
  Globe,
  Settings,
  LogOut,
  X,
  Trophy,
  CreditCard,
  Store, // <-- Importación del icono para la sección de negocio
} from 'lucide-react';
import { useUserStore } from '@/features/auth';
import { AVATAR_IMAGE, type Section } from './types';

type NavItem = { id: Section; label: string; icon: any };

// Estructura de navegación corregida sin Guía IA ni Pasaporte, incluyendo Tu Negocio
const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Explorar',
    items: [
      { id: 'mapa', label: 'Mapa', icon: Map },
      { id: 'lugares', label: 'Lugares de interés', icon: MapPin },
      { id: 'rutas', label: 'Rutas guiadas', icon: Route },
      { id: 'audio', label: 'Audioguías', icon: Headphones },
    ],
  },
  {
    title: 'Mi Cuenta',
    items: [
      { id: 'card-caldas', label: 'Tarjeta GO Popayán', icon: CreditCard },
      { id: 'negocio', label: 'Tu Negocio', icon: Store }, // <-- Integrado correctamente aquí con el id 'negocio'
    ],
  },
  {
    title: 'Experiencias',
    items: [
      { id: 'ra', label: 'Escáner QR y Traductor', icon: QrCode },
      { id: 'camara', label: 'Cámara remota', icon: Camera },
      { id: 'galeria', label: 'Galería de fotos', icon: Image },
    ],
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
  active: Section;
  onNavigate: (s: Section) => void;
  onLogout: () => void;
  geofencing: boolean;
  onToggleGeofencing: () => void;
};

export default function Sidebar({
  open,
  onClose,
  active,
  onNavigate,
  onLogout,
  geofencing,
  onToggleGeofencing,
}: Props) {
  const name = useUserStore((s) => s.name);
  const avatar = useUserStore((s) => s.avatar);
  const [lang, setLang] = useState<'ES' | 'EN'>('ES');
  const [offline, setOffline] = useState(false);

  const avatarImage = (avatar && AVATAR_IMAGE[avatar]) || null;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`absolute inset-0 z-[1100] bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`absolute inset-y-0 left-0 z-[1200] flex w-[300px] max-w-[85%] flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menú de navegación"
      >
        <div className="relative overflow-hidden p-6 pb-5">
          <img
            src="/images/popayan-hero.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-sidebar/70" />
          <div className="relative flex items-center justify-between">
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-sidebar-foreground/80 hover:bg-sidebar-accent"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mt-3 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-card bg-primary text-3xl shadow-lg">
              {avatarImage ? (
                <img src={avatarImage} alt="" className="h-full w-full object-cover" />
              ) : (
                '🧭'
              )}
            </div>
            <p className="mt-3 font-heading text-lg font-semibold leading-tight">
              {name || 'Viajero'}
            </p>
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-bold text-primary shadow-sm">
              <Trophy className="h-3 w-3 text-accent" /> Nivel 4 · Turista Experto
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-3">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-card text-primary shadow-sm'
                        : 'text-sidebar-foreground/90 hover:bg-sidebar-accent'
                    } ${item.id === 'card-caldas' ? 'border border-primary/20 bg-primary/5' : ''}`}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-primary" />
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={onToggleGeofencing}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent"
          >
            <Bell className="h-5 w-5 text-primary" />
            <span className="flex-1 text-left">Alertas de cercanía</span>
            <Toggle on={geofencing} />
          </button>
          <button
            onClick={() => setOffline((o) => !o)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent"
          >
            <WifiOff className="h-5 w-5 text-primary" />
            <span className="flex-1 text-left">Modo offline</span>
            <Toggle on={offline} />
          </button>
          <button
            onClick={() => setLang((l) => (l === 'ES' ? 'EN' : 'ES'))}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent"
          >
            <Globe className="h-5 w-5 text-primary" />
            <span className="flex-1 text-left">Idioma</span>
            <span className="rounded-md bg-sidebar-accent px-2 py-0.5 text-xs font-semibold">
              {lang}
            </span>
          </button>
          <button
            onClick={() => onNavigate('ajustes')}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active === 'ajustes'
                ? 'bg-card text-primary shadow-sm'
                : 'text-sidebar-foreground/90 hover:bg-sidebar-accent'
            }`}
          >
            <Settings className="h-5 w-5 text-primary" />
            <span className="flex-1 text-left">Ajustes</span>
          </button>
          <button
            onClick={onLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <LogOut className="h-5 w-5 text-white" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      // AQUÍ FALTABAN LAS COMILLAS INVERTIDAS ` `
      className={`relative h-5 w-9 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-sidebar-accent'}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-card transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </span>
  );
}