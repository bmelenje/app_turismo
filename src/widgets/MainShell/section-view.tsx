import { ChevronLeft, Route as RouteIcon, Camera, MapPin, Play, Navigation, Trophy, Bookmark, Star, LogOut } from 'lucide-react';
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
      { emoji: '🗺️', title: 'Explorador', desc: 'Visita 5 lugares del centro', done: 3, total: 5, points: 50, color: '#E8730C' },
      { emoji: '🎧', title: 'Buen oído', desc: 'Escucha 3 audioguías', done: 1, total: 3, points: 30, color: '#1A73E8' },
      { emoji: '🧭', title: 'Caminante', desc: 'Completa una ruta guiada', done: 0, total: 1, points: 40, color: '#0F9D58' },
      { emoji: '🔖', title: 'Coleccionista', desc: 'Guarda 4 lugares favoritos', done: savedIds.size, total: 4, points: 25, color: '#8B5CF6' },
      { emoji: '📷', title: 'Fotógrafo', desc: 'Toma una foto con cámara remota', done: 0, total: 1, points: 35, color: '#EA4335' },
    ];
    const completed = challenges.filter((c) => c.done >= c.total).length;
    const earned = challenges.reduce((s, c) => s + (c.done >= c.total ? c.points : 0), 0);
    const totalPoints = challenges.reduce((s, c) => s + c.points, 0);
    const overall = Math.round((completed / challenges.length) * 100);
    const level = 1 + Math.floor(earned / 50);

    content = (
      <div className="flex flex-col gap-5">
        {/* HERO de progreso */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary to-secondary/75 p-5 text-secondary-foreground shadow-lg">
          {/* círculos decorativos */}
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold backdrop-blur-sm">
                <Trophy className="h-3.5 w-3.5" /> Nivel {level}
              </span>
              <p className="mt-3 font-heading text-4xl font-bold leading-none">
                {earned}
                <span className="ml-1 text-base font-semibold opacity-80">pts</span>
              </p>
              <p className="mt-1.5 text-sm opacity-85">
                {completed} de {challenges.length} retos completados
              </p>
            </div>

            {/* anillo de progreso */}
            <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-[88px] w-[88px] -rotate-90">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3.2" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeDasharray={`${overall} 100`}
                  className="text-accent transition-all duration-500"
                />
              </svg>
              <span className="absolute font-heading text-lg font-bold">{overall}%</span>
            </div>
          </div>

          {/* barra de puntos hacia el total */}
          <div className="relative mt-4">
            <div className="mb-1.5 flex justify-between text-[11px] font-medium opacity-85">
              <span>{earned} pts</span>
              <span>Meta · {totalPoints} pts</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${(earned / totalPoints) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lista de retos */}
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-heading text-base font-bold text-foreground">Tus retos</h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {completed}/{challenges.length}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {challenges.map((c) => {
            const isDone = c.done >= c.total;
            const pct = Math.min(100, (c.done / c.total) * 100);
            return (
              <div
                key={c.title}
                className={`relative overflow-hidden rounded-2xl bg-card p-4 shadow-sm ring-1 transition-shadow hover:shadow-md ${
                  isDone ? 'ring-2 ring-accent/45' : 'ring-border'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* icono con color de categoría */}
                  <div
                    className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
                    style={{ backgroundColor: `${c.color}1A` }}
                  >
                    <span>{c.emoji}</span>
                    {isDone && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground shadow ring-2 ring-card">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-heading text-sm font-bold text-foreground">
                        {c.title}
                      </h3>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent-foreground">
                        <Star className="h-3 w-3 fill-current" /> +{c.points}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{c.desc}</p>

                    <div className="mt-2.5 flex items-center gap-2.5">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-accent' : ''}`}
                          style={isDone ? { width: `${pct}%` } : { width: `${pct}%`, backgroundColor: c.color }}
                        />
                      </div>
                      <span
                        className={`shrink-0 text-[11px] font-bold ${isDone ? 'text-accent-foreground' : 'text-muted-foreground'}`}
                      >
                        {isDone ? '¡Listo!' : `${Math.min(c.done, c.total)}/${c.total}`}
                      </span>
                    </div>
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
