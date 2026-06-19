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
  | 'ar' // Mantenemos ambos para no romper herencias
  | 'card-caldas';

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
  'card-caldas': 'Tarjeta GO Popayán',
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

// Video animado (GIF con fondo transparente) de cada avatar, para el FAB.
// Generados con scripts/make_fab_gifs.py a partir de public/videos/*.gif.
export const AVATAR_VIDEO: Record<string, string> = {
  sahumadora: '/videos/sahumadora_fab.gif',
  catedral: '/videos/iglesia_fab.gif',
};