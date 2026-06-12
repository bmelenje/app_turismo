export interface RouteStep {
  poiId: string;
  order: number;
  notes?: string;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  steps: RouteStep[];
  durationMinutes: number;
  distanceMeters: number;
}
