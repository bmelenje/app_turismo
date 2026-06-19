// Reseñas y calificaciones CONFIGURADAS para La Cosecha.
// No hay backend ni reseñas reales: se presentan de forma fija y enfocada en gastronomía.

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

// Pool de turistas (nacionales y extranjeros) con comentarios específicos de La Cosecha.
const REVIEW_POOL: Review[] = [
  { name: 'Sophie Martin', flag: '🇫🇷', country: 'Francia', stars: 5, comment: 'Un lugar encantador. Probé las empanadas de pipián y el champús, ¡todo exquisito y muy auténtico!', daysAgo: 2 },
  { name: 'James Carter', flag: '🇺🇸', country: 'Estados Unidos', stars: 5, comment: 'Loved it! Outstanding traditional food, great service and a wonderful taste of Popayán gastronomy.', daysAgo: 4 },
  { name: 'Mariana López', flag: '🇨🇴', country: 'Colombia', stars: 4, comment: 'El tripazo y el aplanchado deliciosos. Tuvimos que esperar un poco por mesa, pero la sazón payanesa lo vale por completo.', daysAgo: 6 },
  { name: 'Lukas Müller', flag: '🇩🇪', country: 'Alemania', stars: 5, comment: 'Sehr schön! Excelente tamal de pipián con un auténtico encanto colonial en el servicio.', daysAgo: 9 },
  { name: 'Giulia Rossi', flag: '🇮🇹', country: 'Italia', stars: 4, comment: 'Bonita experiencia gastronómica, precios justos, carantanta deliciosa y la gente muy amable.', daysAgo: 12 },
  { name: 'Pedro Almeida', flag: '🇧🇷', country: 'Brasil', stars: 5, comment: 'Maravilhoso! O mejor plato típico de la Ciudad Blanca. El lomo y los aborrajados espectaculares.', daysAgo: 15 },
  { name: 'Emma Thompson', flag: '🇬🇧', country: 'Reino Unido', stars: 5, comment: 'Absolutely charming. Traditional flavors were incredible and the staff went out of their way to explain the dishes.', daysAgo: 21 },
  { name: 'Valentina Suárez', flag: '🇦🇷', country: 'Argentina', stars: 5, comment: '¡Espectacular! Ideal para conocer la cultura culinaria payanesa. La sopa de carantanta es de otro planeta.', daysAgo: 25 },
  { name: 'Ana Beltrán', flag: '🇪🇸', country: 'España', stars: 5, comment: '¡Una joya de la cocina tradicional! Repetiría sin pensarlo. Sabor criollo, trato cercano y de calidad.', daysAgo: 34 }
];

/**
 * Devuelve las calificaciones configuradas para el negocio.
 */
export function getBusinessRatings(_id: string): BusinessRatings {
  const reviews = REVIEW_POOL;

  const breakdown: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  
  for (const r of reviews) {
    breakdown[r.stars as 1 | 2 | 3 | 4 | 5]++;
    sum += r.stars;
  }
  
  const average = Math.round((sum / reviews.length) * 10) / 10;

  return { 
    average, 
    total: reviews.length, 
    breakdown, 
    reviews 
  };
}
