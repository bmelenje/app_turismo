// Reseñas y calificaciones SIMULADAS (mock) del negocio.
// No hay backend ni reseñas reales: se generan de forma determinista a partir
// del id del negocio, así cada negocio tiene cifras estables y distintas.

export interface Review {
  name: string;
  flag: string; // emoji de bandera de la nacionalidad del turista
  country: string;
  stars: number; // 1..5
  comment: string;
  daysAgo: number;
}

export interface BusinessRatings {
  average: number; // 1.0 .. 5.0
  total: number;
  breakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  reviews: Review[];
}

// Pool de turistas (nacionales y extranjeros) con su comentario.
const REVIEW_POOL: Review[] = [
  { name: 'Sophie Martin', flag: '🇫🇷', country: 'Francia', stars: 5, comment: 'Un lugar encantador, la atención fue excelente y todo muy auténtico.', daysAgo: 2 },
  { name: 'James Carter', flag: '🇺🇸', country: 'Estados Unidos', stars: 5, comment: 'Loved it! Great service and a wonderful taste of Popayán.', daysAgo: 4 },
  { name: 'Mariana López', flag: '🇨🇴', country: 'Colombia', stars: 4, comment: 'Muy rico todo, aunque tuve que esperar un poco. Volvería sin duda.', daysAgo: 6 },
  { name: 'Lukas Müller', flag: '🇩🇪', country: 'Alemania', stars: 5, comment: 'Sehr schön! Auténtico y con mucho encanto colonial.', daysAgo: 9 },
  { name: 'Giulia Rossi', flag: '🇮🇹', country: 'Italia', stars: 4, comment: 'Bonita experiencia, precios justos y gente muy amable.', daysAgo: 12 },
  { name: 'Pedro Almeida', flag: '🇧🇷', country: 'Brasil', stars: 5, comment: 'Maravilhoso! Uno de los mejores lugares que visité en la Ciudad Blanca.', daysAgo: 15 },
  { name: 'Carlos Ramírez', flag: '🇲🇽', country: 'México', stars: 3, comment: 'Estuvo bien, pero esperaba un poco más por las reseñas. Buen ambiente igual.', daysAgo: 18 },
  { name: 'Emma Thompson', flag: '🇬🇧', country: 'Reino Unido', stars: 5, comment: 'Absolutely charming. The staff went out of their way to help us.', daysAgo: 21 },
  { name: 'Valentina Suárez', flag: '🇦🇷', country: 'Argentina', stars: 4, comment: 'Muy lindo lugar, ideal para conocer la cultura payanesa. Recomendado.', daysAgo: 25 },
  { name: 'Daniel Torres', flag: '🇨🇱', country: 'Chile', stars: 4, comment: 'Buena onda y muy buena ubicación. La pasamos genial.', daysAgo: 30 },
  { name: 'Ana Beltrán', flag: '🇪🇸', country: 'España', stars: 5, comment: '¡Una joya! Repetiría sin pensarlo. Trato cercano y de calidad.', daysAgo: 34 },
  { name: 'Kenji Tanaka', flag: '🇯🇵', country: 'Japón', stars: 4, comment: 'とても良い! Experiencia muy agradable y diferente.', daysAgo: 40 },
];

// Hash simple y estable para sembrar la generación a partir del id del negocio.
function seedFrom(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Devuelve calificaciones simuladas pero deterministas para un negocio.
 * El mismo id siempre produce las mismas cifras.
 */
export function getBusinessRatings(id: string): BusinessRatings {
  const seed = seedFrom(id);
  // Elegimos entre 5 y 11 reseñas, rotando el pool según la semilla.
  const count = 5 + (seed % 7);
  const offset = seed % REVIEW_POOL.length;
  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) {
    reviews.push(REVIEW_POOL[(offset + i) % REVIEW_POOL.length]);
  }

  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    breakdown[r.stars as 1 | 2 | 3 | 4 | 5]++;
    sum += r.stars;
  }
  const average = Math.round((sum / reviews.length) * 10) / 10;

  return { average, total: reviews.length, breakdown, reviews };
}
