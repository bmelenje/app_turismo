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
  | 'ajustes'
  | 'perfil';

export const SECTION_TITLES: Record<Section, string> = {
  descubrir: 'Descubrir',
  mapa: 'Mapa',
  lugares: 'Lugares de interés',
  rutas: 'Rutas guiadas',
  galeria: 'Galería de fotos',
  ra: 'Realidad Aumentada',
  audio: 'Audioguías',
  guia: 'Guía IA',
  camara: 'Cámara remota',
  pasaporte: 'Pasaporte',
  favoritos: 'Favoritos',
  ajustes: 'Ajustes',
  perfil: 'Perfil',
};

export const AVATAR_EMOJI: Record<string, string> = {
  sahumadora: '🌿',
  cargero: '✝️',
  empanada: '🥟',
  carantanta: '🌽',
  tamal: '🍃',
};
