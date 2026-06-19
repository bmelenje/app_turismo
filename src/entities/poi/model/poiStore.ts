import { create } from 'zustand';
import type { POI, POICategory } from './types';

interface POIStore {
  pois: POI[];
  selectedPOI: POI | null;
  filteredCategory: POICategory | 'all';
  /** IDs de POIs que el mapa debe dibujar como ruta (lo pide la Guía IA). */
  pendingRoute: string[] | null;
  setPOIs: (pois: POI[]) => void;
  selectPOI: (poi: POI | null) => void;
  setFilter: (cat: POICategory | 'all') => void;
  getFilteredPOIs: () => POI[];
  /** La Guía IA pide al mapa trazar una ruta por estos POIs (en orden). */
  requestRoute: (ids: string[]) => void;
  clearPendingRoute: () => void;
}

export const usePOIStore = create<POIStore>((set, get) => ({
  pois: [],
  selectedPOI: null,
  filteredCategory: 'all',
  pendingRoute: null,
  setPOIs: (pois) => set({ pois }),
  selectPOI: (poi) => set({ selectedPOI: poi }),
  setFilter: (cat) => set({ filteredCategory: cat }),
  getFilteredPOIs: () => {
    const { pois, filteredCategory } = get();
    return filteredCategory === 'all' ? pois : pois.filter((p) => p.category === filteredCategory);
  },
  requestRoute: (ids) => set({ pendingRoute: ids }),
  clearPendingRoute: () => set({ pendingRoute: null }),
}));
