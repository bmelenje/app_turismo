/**
 * BusinessSection.tsx
 * Panel de control directo para el negocio "La Cosecha" con el feed de comentarios de turistas.
 */
import { ChevronLeft, Store, MapPin, Phone, Star, Pencil, Trash2, Map as MapIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/shared/ui/Button';
import { POI_COLORS } from '@/shared/config/constants';
import { getBusinessRatings, type Review } from '../model/mockData';

type Props = {
  onBack: () => void;
  /** Centra el mapa en el negocio y cambia a la sección del mapa. */
  onViewOnMap: () => void;
};

function Stars({ value, className = '' }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= Math.round(value) ? 'fill-accent text-accent' : 'fill-muted text-muted'
          }`}
        />
      ))}
    </span>
  );
}

function relativeDate(daysAgo: number): string {
  if (daysAgo <= 0) return 'hoy';
  if (daysAgo === 1) return 'ayer';
  if (daysAgo < 30) return `hace ${daysAgo} días`;
  const months = Math.round(daysAgo / 30);
  return months === 1 ? 'hace 1 mes' : `hace ${months} meses`;
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-xl">
        {review.flag}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{review.name}</p>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {relativeDate(review.daysAgo)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <Stars value={review.stars} />
          <span className="text-[11px] text-muted-foreground">{review.country}</span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
      </div>
    </div>
  );
}

export function BusinessSection({ onBack, onViewOnMap }: Props) {
  // Datos estáticos preestablecidos para omitir completamente el flujo de registro anterior
  const businessData = {
    id: 'la-cosecha',
    name: 'La Cosecha',
    category: 'restaurante' as const,
    description: 'Sabores tradicionales auténticos y platos típicos de la región.',
    metadata: {
      'Dirección': 'Calle 5 # 4-22, Centro Histórico',
      'Teléfono': '+57 320 123 4567'
    }
  };

  const ratings = getBusinessRatings(businessData.id);
  const color = POI_COLORS[businessData.category] || POI_COLORS.custom;

  function handleActionNotAvailable() {
    toast('Acción protegida en modo de demostración comercial.', { icon: '🔒' });
  }

  return (
    <div className="absolute inset-0 z-[1000] flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button
          onClick={onBack}
          className="rounded-lg p-1.5 text-foreground hover:bg-muted"
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
          <Store className="h-5 w-5 text-primary" /> Mi Negocio
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="flex flex-col gap-5">
          {/* Cabecera del negocio */}
          <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-heading text-lg font-bold text-foreground">
                  {businessData.name}
                </h2>
                <span
                  className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: color }}
                >
                  Restaurante
                </span>
              </div>
              <button
                onClick={onViewOnMap}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <MapIcon className="h-4 w-4" /> Ver en el mapa
              </button>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" /> {businessData.metadata.Dirección}
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" /> {businessData.metadata.Teléfono}
            </p>
          </div>

          {/* Calificación promedio + desglose por estrellas */}
          <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="font-heading text-4xl font-bold text-foreground">
                  {ratings.average.toFixed(1)}
                </div>
                <Stars value={ratings.average} className="mt-1" />
                <p className="mt-1 text-xs text-muted-foreground">{ratings.total} reseñas</p>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratings.breakdown[star as 1 | 2 | 3 | 4 | 5];
                  const pct = ratings.total ? (count / ratings.total) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="w-3 text-right text-xs text-muted-foreground">{star}</span>
                      <Star className="h-3 w-3 fill-accent text-accent" />
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-4 text-right text-xs text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reseñas de los turistas del mockData */}
          <div>
            <h3 className="mb-2 px-1 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Reseñas de turistas
            </h3>
            <div className="flex flex-col gap-3">
              {ratings.reviews.map((r, i) => (
                <ReviewCard key={`${r.name}-${i}`} review={r} />
              ))}
            </div>
          </div>

          {/* Acciones del negocio */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleActionNotAvailable}>
              <Pencil className="h-4 w-4" /> Editar datos
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={handleActionNotAvailable}
            >
              <Trash2 className="h-4 w-4" /> Suspender
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}