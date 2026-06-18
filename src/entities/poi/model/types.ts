export type POICategory =
  | 'interes'
  | 'ra'
  | 'camara'
  | 'serv'
  | 'mirador'
  | 'restaurante'
  | 'hotel'
  | 'supermercado'
  | 'custom';

export interface POI {
  id: string;
  name: string;
  description: string;
  category: POICategory;
  coordinates: { lat: number; lng: number };
  distanceMeters?: number;
  audioUrl?: string;
  imageUrl?: string;
  arModelUrl?: string;
  cameraUrl?: string;
  proximityRadiusM?: number;
  metadata?: Record<string, unknown>;
}
