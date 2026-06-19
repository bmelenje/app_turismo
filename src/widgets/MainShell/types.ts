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
<<<<<<< HEAD
  | 'ar'
  | 'card-caldas'
  | 'negocio'; // <-- 1. Agregamos el tipo literal aquí
=======
  | 'ar' // Mantenemos ambos para no romper herencias
  | 'card-caldas';
>>>>>>> 42e01cf6f3b670dec921692858cdda7aee06576c

export const SECTION_TITLES: Record<Section, string> = {
  descubrir: 'Descubrir',
  mapa: 'Mapa',
  lugares: 'Lugares de interés',
  rutas: 'Rutas guiadas',
  galeria: 'Galería de fotos',
  ra: 'Realidad Aumentada', 
  ar: 'Realidad Aumentada',
  audio: 'Audioguías',
  guia: 'Guía IA',
  camara: 'Cámara remota',
  pasaporte: 'Pasaporte',
  favoritos: 'Favoritos',
  retos: 'Retos',
  ajustes: 'Ajustes',
  perfil: 'Perfil',
  'card-caldas': 'Tarjeta GO Popayán',
<<<<<<< HEAD
  negocio: 'Mi Negocio', // <-- 2. Satisface el Record agregando la traducción aquí
=======
>>>>>>> 42e01cf6f3b670dec921692858cdda7aee06576c
};

export const AVATAR_EMOJI: Record<string, string> = {
  sahumadora: '🌿',
  catedral: '⛪',
};

export const AVATAR_NAME: Record<string, string> = {
  sahumadora: 'Sahumadora',
  catedral: 'Catedral',
};

export const AVATAR_IMAGE: Record<string, string> = {
  sahumadora: '/images/AvatarSahumadora.png',
  catedral: '/images/AvatarCatedral.png',
};

export const AVATAR_VIDEO: Record<string, string> = {
  sahumadora: '/videos/sahumadora_fab.gif',
  catedral: '/videos/iglesia_fab.gif',
};