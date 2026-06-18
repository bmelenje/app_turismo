import { Info, Star, Trophy, LogOut } from 'lucide-react';
import { useUserStore } from '@/features/auth';
import { Button } from '@/shared/ui/Button';
import { ENV } from '@/shared/config/env';
import { AVATAR_IMAGE } from './types';

type Props = {
  onLogout: () => void;
};

type RankRow = { rank: number; name: string; level: number; points: number; me?: boolean };

type Challenge =
  | { title: string; kind: 'progress'; progress: number; total: number }
  | { title: string; kind: 'points'; points: number };

export default function Profile({ onLogout }: Props) {
  const name = useUserStore((s) => s.name);
  const avatar = useUserStore((s) => s.avatar);
  const avatarImage = (avatar && AVATAR_IMAGE[avatar]) || null;

  const level = 7;
  const points = 3450;
  const goal = 4000;
  const pct = Math.min(100, Math.round((points / goal) * 100));

  const ranking: RankRow[] = [
    { rank: 1, name: 'Camila R.', level: 7, points: 3450 },
    { rank: 2, name: 'Andrés M.', level: 6, points: 1730 },
    { rank: 3, name: name || 'Tú', level: level, points: points, me: true },
  ];

  const challenges: Challenge[] = [
    { title: 'Visita 3 templos en 2 horas', kind: 'progress', progress: 1, total: 3 },
    { title: 'Desbloquea la Medalla de Gastronomía', kind: 'points', points: 500 },
    { title: 'Desbloquea la Medalla de Semana Santa', kind: 'points', points: 500 },
  ];

  return (
    <div className="absolute inset-0 z-[1000] flex flex-col bg-background">
      <header className="border-b border-border bg-card px-4 py-4 text-center">
        <h1 className="font-heading text-lg font-bold text-foreground">
          Mi Turista: Desafío {ENV.APP_CITY}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-28">
        {/* Tarjeta de perfil */}
        <section className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-primary text-3xl shadow-md">
                {avatarImage ? (
                  <img src={avatarImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  '🧭'
                )}
              </div>
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background shadow">
                Nivel {level}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-heading text-lg font-bold text-foreground">
                {name || 'Viajero'}
              </h2>
              <p className="text-sm text-muted-foreground">Rastreador Colonial</p>
            </div>
          </div>

          {/* Barra de puntos */}
          <div className="mt-5 flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow">
              8
            </span>
          </div>
          <p className="mt-1.5 text-right text-xs font-medium text-muted-foreground">
            {points.toLocaleString()} / {goal.toLocaleString()} Pts
          </p>
        </section>

        {/* Ranking */}
        <section className="mt-6">
          <div className="mb-3 flex items-center gap-1.5">
            <h2 className="font-heading text-lg font-bold text-foreground">
              Ranking de Exploradores
            </h2>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-2">
            {ranking.map((r) => (
              <div
                key={r.rank}
                className={`flex items-center gap-3 rounded-2xl p-3 ring-1 ${
                  r.me ? 'bg-primary/10 ring-primary/30' : 'bg-card ring-border'
                }`}
              >
                <RankBadge rank={r.rank} />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg">
                  {r.me && avatarImage ? (
                    <img src={avatarImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    '🧑'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-semibold text-foreground">
                    {r.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Nivel {r.level}</p>
                </div>
                <span className="font-heading text-sm font-bold text-foreground">
                  {r.points.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Retos y logros */}
        <section className="mt-6">
          <h2 className="mb-3 font-heading text-lg font-bold text-foreground">Retos y Logros</h2>
          <div className="flex flex-col gap-3">
            {challenges.map((c) => (
              <div
                key={c.title}
                className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-secondary-foreground shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-sm font-semibold leading-tight">{c.title}</p>
                  <p className="mt-0.5 text-xs opacity-80">Progreso</p>
                  {c.kind === 'progress' && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary-foreground/20">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${(c.progress / c.total) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="text-xs font-bold">
                    {c.kind === 'progress' ? `${c.progress}/${c.total}` : `${c.points} Pts`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Button variant="outline" className="mt-6 w-full" onClick={onLogout}>
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Button>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, string> = {
    1: 'bg-accent text-accent-foreground',
    2: 'bg-muted-foreground/25 text-foreground',
    3: 'bg-[#993C1D] text-white',
  };
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
        styles[rank] ?? 'bg-muted text-foreground'
      }`}
    >
      {rank <= 3 ? <Trophy className="h-3.5 w-3.5" /> : rank}
    </span>
  );
}
