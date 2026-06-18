import { create } from 'zustand';
import { Geolocation } from '@capacitor/geolocation';
import { calculateDistance } from '@/shared/lib/distance';
import { PROXIMITY_RADIUS_M } from '@/shared/config/constants';
import { requestLocationPermission } from '../lib/requestLocationPermission';
import type { POI } from '@/entities/poi';

interface GeofencingStore {
  watchId: string | null;
  notifiedPOIs: Set<string>;
  onProximity: ((poi: POI) => void) | null;
  start: (pois: POI[], onProximity: (poi: POI) => void) => Promise<void>;
  stop: () => Promise<void>;
  reset: () => void;
}

export const useGeofencingStore = create<GeofencingStore>((set, get) => ({
  watchId: null,
  notifiedPOIs: new Set(),
  onProximity: null,

  start: async (pois, onProximity) => {
    set({ onProximity, notifiedPOIs: new Set() });

    // Asegura el permiso antes de observar la posición (necesario en nativo).
    await requestLocationPermission();

    const id = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (position) => {
        if (!position) return;
        const { latitude, longitude } = position.coords;
        const { notifiedPOIs } = get();

        pois.forEach((poi) => {
          const radius = poi.proximityRadiusM ?? PROXIMITY_RADIUS_M;
          const dist = calculateDistance(latitude, longitude, poi.coordinates.lat, poi.coordinates.lng);

          if (dist <= radius && !notifiedPOIs.has(poi.id)) {
            const updated = new Set(notifiedPOIs);
            updated.add(poi.id);
            set({ notifiedPOIs: updated });
            get().onProximity?.(poi);
          }
        });
      },
    );

    set({ watchId: id });
  },

  stop: async () => {
    const { watchId } = get();
    if (watchId) await Geolocation.clearWatch({ id: watchId });
    set({ watchId: null });
  },

  reset: () => set({ notifiedPOIs: new Set() }),
}));
