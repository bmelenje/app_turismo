import { create } from 'zustand';

// Reseñas de LUGARES turísticos/históricos. Las base son simuladas (mock) y
// deterministas por id de lugar; a ellas se suman las que deja el turista,
// que se persisten en localStorage.

export interface Review {
  name: string;
  flag: string; // emoji de bandera de la nacionalidad
  stars: number; // 1..5
  comment: string;
  daysAgo: number;
}

// Comentarios típicos de turistas sobre sitios históricos de Popayán.
const REVIEW_POOL: Review[] = [
  { name: 'Sophie Martin', flag: '🇫🇷', stars: 5, comment: 'Impresionante arquitectura colonial, una joya de la Ciudad Blanca.', daysAgo: 3 },
  { name: 'James Carter', flag: '🇺🇸', stars: 5, comment: 'A must-see. Beautiful history and great photo spot.', daysAgo: 6 },
  { name: 'Mariana López', flag: '🇨🇴', stars: 4, comment: 'Hermoso lugar, muy bien conservado. Vale la pena la visita.', daysAgo: 8 },
  { name: 'Lukas Müller', flag: '🇩🇪', stars: 5, comment: 'Wunderschön! La historia se siente en cada rincón.', daysAgo: 11 },
  { name: 'Giulia Rossi', flag: '🇮🇹', stars: 4, comment: 'Muy bonito y tranquilo, ideal para caminar y tomar fotos.', daysAgo: 14 },
  { name: 'Pedro Almeida', flag: '🇧🇷', stars: 5, comment: 'Lugar maravilhoso, cheio de cultura e história.', daysAgo: 19 },
  { name: 'Emma Thompson', flag: '🇬🇧', stars: 5, comment: 'Stunning architecture and very well preserved.', daysAgo: 23 },
  { name: 'Valentina Suárez', flag: '🇦🇷', stars: 4, comment: 'Un imperdible del centro histórico. Muy recomendado.', daysAgo: 28 },
  { name: 'Daniel Torres', flag: '🇨🇱', stars: 5, comment: 'Espectacular, sobre todo al atardecer. Volvería sin dudarlo.', daysAgo: 33 },
  { name: 'Ana Beltrán', flag: '🇪🇸', stars: 4, comment: 'Precioso. Se nota el valor patrimonial del lugar.', daysAgo: 40 },
];

export interface PlaceRatings {
  average: number;
  total: number;
  reviews: Review[];
}

function seedFrom(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

/** Reseñas base (mock) deterministas para un lugar: el mismo id da las mismas. */
export function getBaseRatings(id: string): PlaceRatings {
  const seed = seedFrom(id);
  const count = 4 + (seed % 6); // 4..9 reseñas
  const offset = seed % REVIEW_POOL.length;
  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) reviews.push(REVIEW_POOL[(offset + i) % REVIEW_POOL.length]);
  const sum = reviews.reduce((a, r) => a + r.stars, 0);
  return { average: sum / reviews.length, total: reviews.length, reviews };
}

interface ReviewsState {
  /** Reseñas escritas por el turista, por id de lugar. */
  userReviews: Record<string, Review[]>;
  addReview: (placeId: string, review: Review) => void;
  /** Reseñas combinadas (las del turista primero) + promedio y total. */
  getRatings: (placeId: string) => PlaceRatings;
}

const STORAGE_KEY = 'place-reviews';

const loadInitial = (): Record<string, Review[]> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Review[]>) : {};
  } catch {
    return {};
  }
};

export const useReviewsStore = create<ReviewsState>((set, get) => ({
  userReviews: loadInitial(),
  addReview: (placeId, review) =>
    set((state) => ({
      userReviews: {
        ...state.userReviews,
        [placeId]: [review, ...(state.userReviews[placeId] ?? [])],
      },
    })),
  getRatings: (placeId) => {
    const base = getBaseRatings(placeId);
    const mine = get().userReviews[placeId] ?? [];
    const reviews = [...mine, ...base.reviews];
    const sum = reviews.reduce((a, r) => a + r.stars, 0);
    return { average: sum / reviews.length, total: reviews.length, reviews };
  },
}));

useReviewsStore.subscribe((state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.userReviews));
});
