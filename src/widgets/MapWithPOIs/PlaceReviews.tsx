import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '@/features/auth';
import { useReviewsStore, getBaseRatings, type Review } from '@/features/reviews/reviewsStore';

/** Estrellas de solo lectura. */
function StarRow({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(value) ? 'fill-accent text-accent' : 'fill-muted text-muted'}`}
        />
      ))}
    </span>
  );
}

function relativeDate(daysAgo: number): string {
  if (daysAgo <= 0) return 'hoy';
  if (daysAgo === 1) return 'ayer';
  if (daysAgo < 30) return `hace ${daysAgo} días`;
  const m = Math.round(daysAgo / 30);
  return m === 1 ? 'hace 1 mes' : `hace ${m} meses`;
}

/** Extrae la bandera (emoji inicial) del país guardado, p. ej. "🇫🇷 Francia" → "🇫🇷". */
function flagFromCountry(country?: string): string {
  if (!country) return '🇨🇴';
  const first = country.trim().split(' ')[0];
  return /\p{Emoji}/u.test(first) ? first : '🇨🇴';
}

/**
 * Sección de reseñas (estrellas + comentarios) para lugares turísticos/históricos.
 * Muestra el promedio y los comentarios, y permite al turista dejar el suyo.
 */
export function PlaceReviews({ placeId }: { placeId: string }) {
  const name = useUserStore((s) => s.name);
  const country = useUserStore((s) => s.country);

  // Seleccionamos el objeto completo (referencia estable) y derivamos localmente,
  // para no devolver un array nuevo en cada render (causaría un bucle de renders).
  const userReviewsMap = useReviewsStore((s) => s.userReviews);
  const addReview = useReviewsStore((s) => s.addReview);
  const userReviews = userReviewsMap[placeId] ?? [];

  const [myStars, setMyStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  const base = getBaseRatings(placeId);
  const reviews: Review[] = [...userReviews, ...base.reviews];
  const total = reviews.length;
  const average = reviews.reduce((a, r) => a + r.stars, 0) / total;

  function submit() {
    if (myStars < 1) {
      toast('Toca las estrellas para calificar 🙂', { icon: '⭐' });
      return;
    }
    addReview(placeId, {
      name: (name || 'Tú').split(' ')[0],
      flag: flagFromCountry(country),
      stars: myStars,
      comment: comment.trim() || '¡Me encantó este lugar!',
      daysAgo: 0,
    });
    setMyStars(0);
    setHover(0);
    setComment('');
    toast.success('¡Gracias por tu reseña!');
  }

  return (
    <div className="mt-5 border-t border-border pt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-bold text-foreground">Reseñas</h3>
        <div className="flex items-center gap-2">
          <StarRow value={average} />
          <span className="text-sm font-semibold text-foreground">{average.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({total})</span>
        </div>
      </div>

      {/* Dejar una reseña */}
      <div className="mt-3 rounded-2xl bg-muted/50 p-3">
        <p className="text-xs font-medium text-foreground">Califica este lugar</p>
        <div className="mt-1.5 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMyStars(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${i} estrella${i > 1 ? 's' : ''}`}
              className="p-0.5"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  i <= (hover || myStars) ? 'fill-accent text-accent' : 'fill-muted text-muted'
                }`}
              />
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Escribe un comentario…"
            className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={submit}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
            aria-label="Publicar reseña"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lista de comentarios */}
      <div className="mt-3 flex flex-col gap-3">
        {reviews.map((r, i) => (
          <div key={`${r.name}-${i}`} className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
              {r.flag}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {relativeDate(r.daysAgo)}
                </span>
              </div>
              <StarRow value={r.stars} />
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
