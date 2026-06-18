// Constantes globales del proyecto
export const PROXIMITY_RADIUS_M = 50;   // metros para disparar geofencing
export const MAX_GEOFENCES_IOS  = 20;   // límite del sistema iOS
export const MAX_GEOFENCES_ANDROID = 100;
export const CAMERA_TIMEOUT_MS = 10_000;
export const SYNC_INTERVAL_MS  = 30_000;
export const MAP_ANIMATION_DURATION_MS = 550;

export const POI_COLORS = {
  interes:     '#BA7517',
  ra:          '#534AB7',
  camara:      '#993C1D',
  serv:        '#3B6D11',
  mirador:     '#0F6E56',
  restaurante: '#E8730C',
  hotel:       '#1A73E8',
  supermercado:'#0F9D58',
  custom:      '#555555',
} as const;
