import { create } from 'zustand';

export type Avatar = 'sahumadora' | 'catedral';
export type Language = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'it';

/** De dónde nos visita el turista: del país (nacional) o del exterior (extranjero). */
export type TravelerOrigin = 'national' | 'foreign';

/** Documento de identidad según el origen del viajero. */
export type DocumentType = 'cc' | 'passport';

/** Datos capturados en el registro (válidos para turista nacional y extranjero). */
export interface RegisterData {
  name: string;
  email?: string;
  language: Language;
  age?: number;
  origin?: TravelerOrigin;
  /** País de origen / nacionalidad (clave para el turista extranjero). */
  country?: string;
  documentType?: DocumentType;
  documentId?: string;
  /** Teléfono con indicativo internacional, p. ej. +1 415 555 0100. */
  phone?: string;
}

interface UserState {
  name: string;
  age: number | null;
  language: Language;
  email?: string;
  origin?: TravelerOrigin;
  country?: string;
  documentType?: DocumentType;
  documentId?: string;
  phone?: string;
  avatar: Avatar | null;
  registered: boolean;
  /** Entró como invitado: puede ver "Descubrir" pero no el resto de funcionalidades. */
  guest: boolean;
  setProfile: (data: RegisterData) => void;
  setAvatar: (avatar: Avatar) => void;
  /** Acceso rápido sin cuenta: marca la sesión como invitada. */
  continueAsGuest: () => void;
  reset: () => void;
}

const STORAGE_KEY = 'user';

// Carga inicial desde localStorage
const loadInitial = (): Partial<UserState> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const useUserStore = create<UserState>((set) => ({
  name: '',
  age: null,
  language: 'es',
  avatar: null,
  registered: false,
  guest: false,
  ...loadInitial(),
  setProfile: (data) => set({ ...data }),
  setAvatar: (avatar) => set({ avatar, registered: true, guest: false }),
  continueAsGuest: () => set({ name: 'Invitado', guest: true, registered: false }),
  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      name: '',
      age: null,
      language: 'es',
      email: undefined,
      origin: undefined,
      country: undefined,
      documentType: undefined,
      documentId: undefined,
      phone: undefined,
      avatar: null,
      registered: false,
      guest: false,
    });
  },
}));

// Persistir cambios
useUserStore.subscribe((state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
});