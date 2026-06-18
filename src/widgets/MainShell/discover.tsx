import {
  Menu,
  Search,
  Heart,
  Share2,
  Download,
  Map as MapIcon,
  Footprints,
  Clock,
  CloudSun,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ENV } from '@/shared/config/env';
import { DEMO_POIS } from '@/widgets/MapWithPOIs/demoPOIs';

type Props = {
  onOpenMenu: () => void;
  onOpenMap: () => void;
  onOpenPlace: (poi: (typeof DEMO_POIS)[number]) => void;
};

// Metadatos de recorrido (demo) para las tarjetas
const TOUR_META: Record<string, { dist: string; min: string; likes: number; tag: string }> = {
  caldas: { dist: '0.2 km', min: '15 Min', likes: 24, tag: 'Plaza' },
  catedral: { dist: '0.3 km', min: '40 Min', likes: 31, tag: 'Iglesia' },
  torre: { dist: '0.4 km', min: '20 Min', likes: 18, tag: 'Histórico' },
  ra_fachada: { dist: '0.3 km', min: '10 Min', likes: 12, tag: 'RA' },
  camara_principal: { dist: '0.5 km', min: '5 Min', likes: 9, tag: 'Cámara' },
  cafe: { dist: '0.6 km', min: '30 Min', likes: 27, tag: 'Café' },
};

function TourCard({
  poi,
  onOpen,
}: {
  poi: (typeof DEMO_POIS)[number];
  onOpen: (poi: (typeof DEMO_POIS)[number]) => void;
}) {
  const meta = TOUR_META[poi.id] ?? { dist: '0.3 km', min: '20 Min', likes: 10, tag: 'Sitio' };
  return (
    <article
      onClick={() => onOpen(poi)}
      className="relative w-64 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition-shadow hover:shadow-md"
    >
      <div
        className="relative h-40 w-full bg-muted bg-cover bg-center"
        style={{ backgroundImage: poi.imageUrl ? `url(${poi.imageUrl})` : 'none' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {/* Badge gratis */}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-[#3B6D11] px-2 py-1 text-[11px] font-semibold text-white shadow">
          🎟️ Visita gratuita
        </span>

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.success(`❤️ ${poi.name} guardado en favoritos`);
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow"
          aria-label="Guardar"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Stats */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 px-3 pb-2.5 text-xs font-medium text-white">
          <span className="flex items-center gap-1">
            <Footprints className="h-3.5 w-3.5" /> {meta.dist}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {meta.min}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 fill-white" /> {meta.likes}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 p-3">
        <h3 className="truncate font-heading text-sm font-semibold text-foreground">{poi.name}</h3>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {meta.tag}
        </span>
      </div>
    </article>
  );
}

export default function Discover({ onOpenMenu, onOpenMap, onOpenPlace }: Props) {
  const autoguiadas = DEMO_POIS.slice(0, 4);
  const aPie = DEMO_POIS.slice(2);

  return (
    <div className="absolute inset-0 z-[1000] flex flex-col overflow-y-auto bg-background pb-24">
      {/* HERO */}
      <header className="relative h-72 w-full shrink-0">
        <img
          src="/images/popayan-hero.png"
          alt={ENV.APP_CITY}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

        {/* Barra superior de iconos */}
        <div className="relative flex items-center justify-between px-4 pt-5">
          <IconBtn label="Menú" onClick={onOpenMenu}>
            <Menu className="h-5 w-5" />
          </IconBtn>
          <div className="flex items-center gap-2">
            <IconBtn label="Buscar" onClick={() => toast('🔍 Búsqueda próximamente')}>
              <Search className="h-5 w-5" />
            </IconBtn>
            <IconBtn label="Idioma" onClick={() => toast('🌐 ES')}>
              <span className="text-xs font-bold">ES</span>
            </IconBtn>
            <IconBtn label="Favoritos" onClick={() => toast('❤️ Favoritos')}>
              <Heart className="h-5 w-5" />
            </IconBtn>
            <IconBtn label="Compartir" onClick={() => toast('🔗 Compartir')}>
              <Share2 className="h-5 w-5" />
            </IconBtn>
          </div>
        </div>

        {/* Clima */}
        <div className="absolute right-4 top-20 flex items-center gap-1 rounded-full bg-card/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow backdrop-blur-sm">
          <CloudSun className="h-4 w-4 text-accent" /> 18°C
        </div>

        {/* Título ciudad */}
        <div className="absolute inset-x-0 bottom-16 px-5 text-white">
          <h1 className="font-heading text-4xl font-bold drop-shadow">{ENV.APP_CITY}</h1>
          <p className="text-sm opacity-90 drop-shadow">La Ciudad Blanca</p>
        </div>

        {/* Acciones */}
        <div className="absolute inset-x-0 bottom-4 flex items-center gap-3 px-5">
          <button
            onClick={() => toast.success('⬇️ Descargando guía para uso sin conexión…')}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground/85 px-4 py-2.5 text-sm font-semibold text-background backdrop-blur-sm"
          >
            <Download className="h-4 w-4" /> Guía fuera de línea
          </button>
          <button
            onClick={onOpenMap}
            className="flex items-center justify-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow"
          >
            <MapIcon className="h-4 w-4 text-primary" /> Mapa
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 pt-6">
        {/* Visitas autoguiadas */}
        <section>
          <h2 className="mb-3 px-5 font-heading text-lg font-bold text-foreground">
            Visitas autoguiadas
          </h2>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5">
            {autoguiadas.map((poi) => (
              <TourCard key={poi.id} poi={poi} onOpen={onOpenPlace} />
            ))}
          </div>
        </section>

        {/* Centro histórico a pie */}
        <section>
          <h2 className="mb-3 px-5 font-heading text-lg font-bold text-foreground">
            Centro histórico a pie
          </h2>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5">
            {aPie.map((poi) => (
              <TourCard key={poi.id} poi={poi} onOpen={onOpenPlace} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-card/85 text-foreground shadow backdrop-blur-sm transition-transform hover:scale-105"
    >
      {children}
    </button>
  );
}
