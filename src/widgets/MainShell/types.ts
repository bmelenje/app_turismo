export type Section =
  | 'descubrir'
  | 'mapa'
  | 'lugares'
  | 'rutas'
  | 'galeria'
  | 'ra'
  | 'audio'
  | 'guia'
  | 'camara'
  | 'pasaporte'
  | 'favoritos'
  | 'retos'
  | 'ajustes'
  | 'perfil'
  | 'ar'; // Mantenemos ambos para no romper herencias

export const SECTION_TITLES: Record<Section, string> = {
  descubrir: 'Descubrir',
  mapa: 'Mapa',
  lugares: 'Lugares de interés',
  rutas: 'Rutas guiadas',
  galeria: 'Galería de fotos',
  ra: 'Realidad Aumentada', 
  ar: 'Realidad Aumentada', // ¡CORREGIDO!: Agregada esta propiedad para satisfacer al Record<Section, string>
  audio: 'Audioguías',
  guia: 'Guía IA',
  camara: 'Cámara remota',
  pasaporte: 'Pasaporte',
  favoritos: 'Favoritos',
  retos: 'Retos',
  ajustes: 'Ajustes',
  perfil: 'Perfil',
};

export const AVATAR_EMOJI: Record<string, string> = {
  sahumadora: '🌿',
  catedral: '⛪',
};

export const AVATAR_NAME: Record<string, string> = {
  sahumadora: 'Sahumadora',
  catedral: 'Catedral',
};

// Imagen de cada avatar (se usa en la selección y en toda la app)
export const AVATAR_IMAGE: Record<string, string> = {
  sahumadora: '/images/AvatarSahumadora.png',
  catedral: '/images/AvatarCatedral.png',
};