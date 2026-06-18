import { ChevronLeft, Route as RouteIcon, Palette, Camera, MapPin, Play, Navigation, Trophy, Bookmark, Target, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { DEMO_POIS } from '@/widgets/MapWithPOIs/demoPOIs';
import { POI_COLORS } from '@/shared/config/constants';
import { useUserStore } from '@/features/auth';
import { useFavoritesStore } from '@/entities/poi';
import { Button } from '@/shared/ui/Button';
import { AVATAR_IMAGE, AVATAR_NAME, SECTION_TITLES, type Section } from './types';

type Props = {
  section: Section;
  onBack: () => void;
  onLogout: () => void;
  onSelectPlace: (poi: (typeof DEMO_POIS)[number]) => void;
};

const CATEGORY_LABEL: Record<string, string> = {
  interes: 'Interés',
  ra: 'Realidad Aumentada',
  camara: 'Cámara',
  serv: 'Servicio',
  mirador: 'Mirador',
  custom: 'Punto',
};

function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, string> = {
    interes: '📍',
    ra: '🎨',
    camara: '📷',
    serv: '☕',
    mirador: '🔭',
  };
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg text-white shadow-sm"
      style={{ backgroundColor: POI_COLORS[category as keyof typeof POI_COLORS] || POI_COLORS.custom }}
    >
      {icons[category] || '📌'}
    </div>
  );
}

function PoiRow({
  poi,
  right,
  onClick,
}: {
  poi: (typeof DEMO_POIS)[number];
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border ${
        onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''
      }`}
    >
      <CategoryIcon category={poi.category} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-heading text-sm font-semibold text-foreground">{poi.name}</h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">{poi.description}</p>
      </div>
      {right}
    </div>
  );
}

function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-3xl">
        {emoji}
      </div>
      <p className="font-heading text-lg font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

export default function SectionView({ section, onBack, onLogout, onSelectPlace }: Props) {
  const name = useUserStore((s) => s.name);
  const avatar = useUserStore((s) => s.avatar);
  const language = useUserStore((s) => s.language);
  const savedIds = useFavoritesStore((s) => s.ids);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  let content: React.ReactNode = null;

  if (section === 'lugares') {
    content = (
      <div className="flex flex-col gap-3">
        {DEMO_POIS.map((poi) => (
          <PoiRow
            key={poi.id}
            poi={poi}
            onClick={() => onSelectPlace(poi)}
            right={
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {CATEGORY_LABEL[poi.category]}
              </span>
            }
          />
        ))}
      </div>
    );
  } else if (section === 'audio') {
    const withAudio = DEMO_POIS.filter((p) => p.audioUrl);
    content = withAudio.length ? (
      <div className="flex flex-col gap-3">
        {withAudio.map((poi) => (
          <PoiRow
            key={poi.id}
            poi={poi}
            right={
              <button
                onClick={() => toast.success(`▶ Reproduciendo audioguía de ${poi.name}`)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
                aria-label="Reproducir"
              >
                <Play className="h-4 w-4 fill-current" />
              </button>
            }
          />
        ))}
      </div>
    ) : (
      <EmptyState emoji="🎧" title="Audioguías" desc="Los puntos con narración aparecerán aquí." />
    );
  } else if (section === 'rutas') {
    content = (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl bg-secondary p-5 text-secondary-foreground">
          <p className="text-sm opacity-90">Ruta sugerida</p>
          <h3 className="mt-0.5 font-heading text-xl font-bold">Centro histórico</h3>
          <p className="mt-1 flex items-center gap-3 text-sm opacity-90">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {DEMO_POIS.length} paradas
            </span>
            <span className="flex items-center gap-1">
              <RouteIcon className="h-4 w-4" /> ~2 h
            </span>
          </p>
          <Button
            className="mt-3 w-full bg-card text-primary hover:bg-card/90"
            onClick={() => toast.success('🧭 Ruta iniciada')}
          >
            <Navigation className="h-4 w-4" /> Iniciar ruta guiada
          </Button>
        </div>
        <ol className="flex flex-col gap-3">
          {DEMO_POIS.map((poi, i) => (
            <li key={poi.id} className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div className="flex-1">
                <PoiRow poi={poi} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  } else if (section === 'ra') {
    const raPois = DEMO_POIS.filter((p) => p.category === 'ra');
    content = (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-2xl bg-[#534AB7]/10 p-4 ring-1 ring-[#534AB7]/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#534AB7] text-white">
            <Palette className="h-6 w-6" />
          </div>
          <p className="text-sm text-foreground">
            Apunta tu cámara a los puntos marcados para ver reconstrucciones históricas en 3D (WebAR).
          </p>
        </div>
        {raPois.map((poi) => (
          <PoiRow
            key={poi.id}
            poi={poi}
            right={
              <button
                onClick={() => toast('🎨 Abriendo experiencia AR…', { icon: '🕶️' })}
                className="rounded-lg bg-[#534AB7] px-3 py-1.5 text-xs font-semibold text-white"
              >
                Ver
              </button>
            }
          />
        ))}
      </div>
    );
  } else if (section === 'camara') {
    const cams = DEMO_POIS.filter((p) => p.category === 'camara');
    content = (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-2xl bg-[#993C1D]/10 p-4 ring-1 ring-[#993C1D]/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#993C1D] text-white">
            <Camera className="h-6 w-6" />
          </div>
          <p className="text-sm text-foreground">
            Solicita una foto bajo demanda a las cámaras IP del parque. Se procesa con IA antes de guardarla.
          </p>
        </div>
        {cams.map((poi) => (
          <div key={poi.id} className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border">
            <PoiRow poi={poi} />
            <Button
              className="mt-3 w-full"
              onClick={() => toast.success(`📷 Solicitando captura a ${poi.name}…`)}
            >
              <Camera className="h-4 w-4" /> Solicitar captura
            </Button>
          </div>
        ))}
      </div>
    );
  } else if (section === 'favoritos') {
    const saved = DEMO_POIS.filter((p) => savedIds.has(p.id));
    content = saved.length ? (
      <div className="flex flex-col gap-3">
        {saved.map((poi) => (
          <PoiRow
            key={poi.id}
            poi={poi}
            onClick={() => onSelectPlace(poi)}
            right={
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(poi.id);
                  toast(`Quitado de guardados`, { icon: '➖' });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
                aria-label={`Quitar ${poi.name} de guardados`}
              >
                <Bookmark className="h-4 w-4 fill-primary" />
              </button>
            }
          />
        ))}
      </div>
    ) : (
      <EmptyState
        emoji="🔖"
        title="Tus favoritos"
        desc="Toca «Guardar» en cualquier lugar del mapa para encontrarlo aquí."
      />
    );
  } else if (section === 'retos') {
    const challenges = [
      { emoji: '🗺️', title: 'Explorador', desc: 'Visita 5 lugares del centro', done: 3, total: 5 },
      { emoji: '🎧', title: 'Buen oído', desc: 'Escucha 3 audioguías', done: 1, total: 3 },
      { emoji: '🧭', title: 'Caminante', desc: 'Completa una ruta guiada', done: 0, total: 1 },
      { emoji: '🔖', title: 'Coleccionista', desc: 'Guarda 4 lugares favoritos', done: savedIds.size, total: 4 },
      { emoji: '📷', title: 'Fotógrafo', desc: 'Toma una foto con cámara remota', done: 0, total: 1 },
    ];
    const completed = challenges.filter((c) => c.done >= c.total).length;
    content = (
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl bg-secondary p-5 text-secondary-foreground">
          <p className="flex items-center gap-1.5 text-sm opacity-90">
            <Target className="h-4 w-4" /> Retos completados
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-heading text-4xl font-bold">{completed}</span>
            <span className="mb-1 text-sm opacity-80">de {challenges.length}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary-foreground/20">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${(completed / challenges.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {challenges.map((c) => {
            const isDone = c.done >= c.total;
            const pct = Math.min(100, (c.done / c.total) * 100);
            return (
              <div
                key={c.title}
                className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
                    isDone ? 'bg-accent/20' : 'bg-muted'
                  }`}
                >
                  {isDone ? '🏅' : c.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-heading text-sm font-semibold text-foreground">
                      {c.title}
                    </h3>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      {Math.min(c.done, c.total)}/{c.total}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{c.desc}</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${isDone ? 'bg-accent' : 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else if (section === 'galeria') {
    content = (
      <EmptyState
        emoji="📷"
        title="Galería de fotos"
        desc="Tus capturas y fotos remotas aparecerán aquí."
      />
    );
  } else if (section === 'pasaporte') {
    const visited = 3;
    content = (
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl bg-secondary p-5 text-secondary-foreground">
          <p className="text-sm opacity-90">Sellos conseguidos</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-heading text-4xl font-bold">{visited}</span>
            <span className="mb-1 text-sm opacity-80">de {DEMO_POIS.length}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary-foreground/20">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${(visited / DEMO_POIS.length) * 100}%` }}
            />
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-sm">
            <Trophy className="h-4 w-4 text-accent" /> ¡Sigue explorando para ganar medallas!
          </p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {DEMO_POIS.map((poi, i) => (
            <div
              key={poi.id}
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl text-center ring-1 ${
                i < visited ? 'bg-accent/15 ring-accent/40' : 'bg-muted ring-border opacity-60'
              }`}
            >
              <span className="text-xl">{i < visited ? '🏅' : '🔒'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (section === 'ajustes') {
    content = (
      <div className="flex flex-col gap-3">
        <Field label="Nombre" value={name || '—'} />
        <Field label="Avatar" value={(avatar && AVATAR_NAME[avatar]) || '—'} />
        <Field label="Idioma" value={language.toUpperCase()} />
        <EmptyState
          emoji="⚙️"
          title="Más ajustes pronto"
          desc="Notificaciones, descargas offline y privacidad."
        />
      </div>
    );
  } else if (section === 'perfil') {
    content = (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-primary text-4xl shadow-lg">
          {avatar && AVATAR_IMAGE[avatar] ? (
            <img src={AVATAR_IMAGE[avatar]} alt="" className="h-full w-full object-cover" />
          ) : (
            '🧭'
          )}
        </div>
        <div>
          <p className="font-heading text-2xl font-bold text-foreground">{name || 'Viajero'}</p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent-foreground">
            <Trophy className="h-3 w-3 text-accent" /> Nivel 4 · Turista Experto
          </span>
        </div>
        <div className="grid w-full grid-cols-3 gap-3 pt-2">
          <Stat num={3} label="Visitados" />
          <Stat num={DEMO_POIS.length} label="Lugares" />
          <Stat num={3} label="Sellos" />
        </div>
        <Button variant="outline" className="mt-4 w-full" onClick={onLogout}>
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[1000] flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button
          onClick={onBack}
          className="rounded-lg p-1.5 text-foreground hover:bg-muted"
          aria-label="Volver al mapa"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-foreground">{SECTION_TITLES[section]}</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 pb-24">{content}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function Stat({ num, label }: { num: number; label: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 text-center shadow-sm ring-1 ring-border">
      <div className="font-heading text-xl font-bold text-foreground">{num}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
