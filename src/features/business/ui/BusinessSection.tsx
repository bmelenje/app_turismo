import { useState } from 'react';
import { ChevronLeft, Store, MapPin, Phone, Star, Pencil, Trash2, Map as MapIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/shared/ui/Button';
import { ENV } from '@/shared/config/env';
import { POI_COLORS } from '@/shared/config/constants';
import type { POICategory } from '@/entities/poi';
import { useBusinessStore } from '../model/businessStore';
import { geocodeAddress } from '../lib/geocode';
import { getBusinessRatings, type Review } from '../model/mockData';

type Props = {
  onBack: () => void;
  /** Centra el mapa en el negocio y cambia a la sección del mapa. */
  onViewOnMap: () => void;
};

const CATEGORY_OPTIONS: { value: POICategory; label: string; emoji: string }[] = [
  { value: 'restaurante', label: 'Restaurante', emoji: '🍴' },
  { value: 'hotel', label: 'Hotel', emoji: '🏨' },
  { value: 'serv', label: 'Café / Servicio', emoji: '☕' },
  { value: 'supermercado', label: 'Supermercado', emoji: '🛒' },
  { value: 'custom', label: 'Otro', emoji: '📌' },
];

const CATEGORY_LABEL = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.value, c.label]),
) as Record<string, string>;

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
  const business = useBusinessStore((s) => s.business);
  const registerBusiness = useBusinessStore((s) => s.registerBusiness);
  const clearBusiness = useBusinessStore((s) => s.clearBusiness);

  // Si no hay negocio, arrancamos en el formulario; si lo hay, en el panel.
  const [editing, setEditing] = useState(!business);

  // Campos del formulario (precargados si estamos editando).
  const [name, setName] = useState(business?.name ?? '');
  const [category, setCategory] = useState<POICategory>(business?.category ?? 'restaurante');
  const [address, setAddress] = useState(
    (business?.metadata?.['Dirección'] as string) ?? '',
  );
  const [description, setDescription] = useState(business?.description ?? '');
  const [phone, setPhone] = useState((business?.metadata?.['Teléfono'] as string) ?? '');
  const [saving, setSaving] = useState(false);

  const canSubmit = name.trim().length > 1 && address.trim().length > 3 && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    const toastId = toast.loading('Ubicando tu negocio en el mapa…');

    const coords = await geocodeAddress(address);
    const finalCoords = coords ?? { lng: ENV.MAP_CENTER_LNG, lat: ENV.MAP_CENTER_LAT };

    registerBusiness({
      name,
      category,
      address,
      description,
      phone: phone || undefined,
      coordinates: finalCoords,
    });

    if (coords) {
      toast.success('¡Negocio registrado y ubicado en el mapa!', { id: toastId });
    } else {
      toast(
        'Registrado, pero no pudimos ubicar la dirección exacta: lo pusimos en el centro de Popayán.',
        { id: toastId, icon: '📍', duration: 5000 },
      );
    }
    setEditing(false);
    setSaving(false);
  }

  function handleDelete() {
    clearBusiness();
    setName('');
    setCategory('restaurante');
    setAddress('');
    setDescription('');
    setPhone('');
    setEditing(true);
    toast('Negocio eliminado', { icon: '🗑️' });
  }

  const inputCls =
    'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

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
          <Store className="h-5 w-5 text-primary" /> Tu negocio
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {editing ? (
          /* ─────────── Formulario de registro / edición ─────────── */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="rounded-2xl bg-primary/5 p-4 text-sm text-muted-foreground ring-1 ring-primary/15">
              Registra tu negocio para que aparezca en el mapa de Popayán y conoce lo que opinan
              los turistas que te visitan.
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Nombre del negocio</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Restaurante La Cosecha"
                className={inputCls}
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Categoría</span>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
                      category === c.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="text-lg">{c.emoji}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">
                Dirección <span className="font-normal text-muted-foreground">(se ubica en el mapa)</span>
              </span>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej. Calle 5 # 4-22, Centro"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Descripción</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cuéntales a los turistas qué ofreces…"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">
                Teléfono <span className="font-normal text-muted-foreground">(opcional)</span>
              </span>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 320 123 4567"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </label>

            <div className="mt-2 flex gap-2">
              {business && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={!canSubmit}>
                {saving ? 'Guardando…' : business ? 'Guardar cambios' : 'Registrar negocio'}
              </Button>
            </div>
          </form>
        ) : business ? (
          /* ─────────── Panel / dashboard ─────────── */
          <BusinessDashboard
            onEdit={() => setEditing(true)}
            onDelete={handleDelete}
            onViewOnMap={onViewOnMap}
            business={business}
            categoryLabel={CATEGORY_LABEL[business.category] ?? business.category}
          />
        ) : null}
      </div>
    </div>
  );
}

function BusinessDashboard({
  business,
  categoryLabel,
  onEdit,
  onDelete,
  onViewOnMap,
}: {
  business: NonNullable<ReturnType<typeof useBusinessStore.getState>['business']>;
  categoryLabel: string;
  onEdit: () => void;
  onDelete: () => void;
  onViewOnMap: () => void;
}) {
  const ratings = getBusinessRatings(business.id);
  const color = POI_COLORS[business.category] || POI_COLORS.custom;

  return (
    <div className="flex flex-col gap-5">
      {/* Cabecera del negocio */}
      <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-heading text-lg font-bold text-foreground">
              {business.name}
            </h2>
            <span
              className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {categoryLabel}
            </span>
          </div>
          <button
            onClick={onViewOnMap}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <MapIcon className="h-4 w-4" /> Ver en el mapa
          </button>
        </div>
        {business.metadata?.['Dirección'] && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" /> {String(business.metadata['Dirección'])}
          </p>
        )}
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

      {/* Reseñas recientes */}
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

      {/* Acciones */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onEdit}>
          <Pencil className="h-4 w-4" /> Editar negocio
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" /> Eliminar
        </Button>
      </div>
    </div>
  );
}
