import { create } from 'zustand';
import type { POI, POICategory } from './types';

interface POIStore {
  pois: POI[];
  selectedPOI: POI | null;
  filteredCategory: POICategory | 'all';
  setPOIs: (pois: POI[]) => void;
  selectPOI: (poi: POI | null) => void;
  setFilter: (cat: POICategory | 'all') => void;
  getFilteredPOIs: () => POI[];
}

export const usePOIStore = create<POIStore>((set, get) => ({
  pois: [],
  selectedPOI: null,
  filteredCategory: 'all',
  setPOIs: (pois) => set({ pois }),
  selectPOI: (poi) => set({ selectedPOI: poi }),
  setFilter: (cat) => set({ filteredCategory: cat }),
  getFilteredPOIs: () => {
    const { pois, filteredCategory } = get();
    return filteredCategory === 'all' ? pois : pois.filter((p) => p.category === filteredCategory);
  },
}));
