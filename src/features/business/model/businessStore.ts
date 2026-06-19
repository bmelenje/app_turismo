import { create } from 'zustand';
import type { POI, POICategory } from '@/entities/poi';

/** Datos que captura el dueño en el formulario de "Tu negocio". */
export interface BusinessData {
  name: string;
  category: POICategory;
  address: string;
  description: string;
  phone?: string;
  coordinates: { lat: number; lng: number };
}

interface BusinessState {
  /** Negocio registrado por el usuario (uno por dispositivo en v1). */
  business: POI | null;
  /** Crea/actualiza el negocio a partir de los datos del formulario. Devuelve el POI. */
  registerBusiness: (data: BusinessData) => POI;
  /** Elimina el negocio registrado. */
  clearBusiness: () => void;
}

const STORAGE_KEY = 'business';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 32);
}

/** Construye un POI a partir de los datos del negocio para mostrarlo en el mapa. */
function toPOI(data: BusinessData, existingId?: string): POI {
  const id = existingId ?? `biz-${slugify(data.name) || Date.now()}`;
  return {
    id,
    name: data.name.trim(),
    description: data.description.trim(),
    category: data.category,
    coordinates: data.coordinates,
    proximityRadiusM: 50,
    metadata: {
      Dirección: data.address.trim(),
      ...(data.phone?.trim() ? { Teléfono: data.phone.trim() } : {}),
    },
  };
}

const loadInitial = (): POI | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as POI) : null;
  } catch {
    return null;
  }
};

export const useBusinessStore = create<BusinessState>((set, get) => ({
  business: loadInitial(),
  registerBusiness: (data) => {
    // Conserva el id si ya existía (modo edición), así el marcador se reutiliza.
    const poi = toPOI(data, get().business?.id);
    set({ business: poi });
    return poi;
  },
  clearBusiness: () => set({ business: null }),
}));

// Persistir cambios en localStorage
useBusinessStore.subscribe((state) => {
  if (state.business) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.business));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
});
