import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Play, Map, Compass, Camera, Palette, Headphones, Award, Trophy } from 'lucide-react';
import { ENV } from '@/shared/config/env';
import { DEMO_POIS } from '@/widgets/MapWithPOIs/demoPOIs';

export function HomePage() {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 19) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  const quickActions = [
    { id: 'map',      label: 'Mapa',       icon: Map,        path: '/map' },
    { id: 'routes',   label: 'Rutas',      icon: Compass,    path: '/routes' },
    { id: 'gallery',  label: 'Galería',    icon: Camera,     path: '/gallery' },
    { id: 'ar',       label: 'RA',         icon: Palette,    path: '/ar' },
    { id: 'audio',    label: 'Audioguías', icon: Headphones, path: '/audio' },
    { id: 'passport', label: 'Pasaporte',  icon: Award,      path: '/passport' },
  ];

  const highlights = DEMO_POIS.slice(0, 3);

  return (
    <div className="min-h-dvh bg-background pb-10">
      {/* HERO */}
      <header className="relative overflow-hidden rounded-b-[2rem] bg-secondary px-6 pb-8 pt-12 text-secondary-foreground">
        <img
          src="/images/popayan-hero.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/70 to-secondary" />
        <div className="relative">
          <p className="text-sm font-medium opacity-90">{greeting}</p>
          <h1 className="mt-1 font-heading text-4xl font-bold leading-none">
            Descubre
            <br />
            {ENV.APP_CITY}
          </h1>
          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-accent">{ENV.APP_NAME}</p>

          <div className="mt-6 flex gap-3">
            {[
              { num: DEMO_POIS.length, label: 'Lugares' },
              { num: '2h', label: 'Recorrido' },
              { num: '∞', label: 'Historias' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 rounded-2xl bg-white/10 px-3 py-2.5 text-center backdrop-blur-sm"
              >
                <div className="font-heading text-xl font-bold">{s.num}</div>
                <div className="text-[11px] opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* CTA principal */}
      <div className="px-6">
        <button
          onClick={() => navigate('/map')}
          className="-mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 font-heading text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:translate-y-px"
        >
          <Play className="h-5 w-5 fill-current" />
          Comenzar recorrido
        </button>
      </div>

      {/* GRID de accesos */}
      <section className="px-6 pt-7">
        <h2 className="mb-3 font-heading text-lg font-bold text-foreground">Explora</h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* TARJETAS DE DESCUBRIMIENTO */}
      <section className="pt-7">
        <div className="mb-3 flex items-center justify-between px-6">
          <h2 className="font-heading text-lg font-bold text-foreground">Lugares destacados</h2>
          <button
            onClick={() => navigate('/map')}
            className="text-sm font-medium text-primary hover:underline"
          >
            Ver todos →
          </button>
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-6 pb-1">
          {highlights.map((poi) => (
            <article
              key={poi.id}
              onClick={() => navigate('/map')}
              className="w-56 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border transition-shadow hover:shadow-md"
            >
              <div
                className="relative h-32 w-full bg-muted bg-cover bg-center"
                style={{ backgroundImage: poi.imageUrl ? `url(${poi.imageUrl})` : 'none' }}
              >
                <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-primary shadow-sm backdrop-blur-sm">
                  {poi.category}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-heading text-sm font-semibold leading-tight text-foreground">
                  {poi.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                  {poi.description.slice(0, 70)}…
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Reto del día */}
      <section className="px-6 pt-7">
        <div
          onClick={() => navigate('/passport')}
          className="flex cursor-pointer items-center gap-4 rounded-2xl bg-accent/15 p-4 ring-1 ring-accent/40"
        >
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground/80">
              Reto del día
            </p>
            <h3 className="mt-0.5 font-heading text-sm font-semibold leading-tight text-foreground">
              Visita 3 lugares hoy y gana tu primer sello
            </h3>
            <p className="mt-1.5 text-xs font-medium text-primary">Ver pasaporte →</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Trophy className="h-6 w-6" />
          </div>
        </div>
      </section>

      <footer className="flex items-center justify-center gap-2 pt-8 text-sm text-muted-foreground">
        <button onClick={() => navigate('/settings')} className="hover:text-foreground">
          Ajustes
        </button>
        <span>·</span>
        <button onClick={() => navigate('/about')} className="hover:text-foreground">
          Acerca de
        </button>
      </footer>
    </div>
  );
}
