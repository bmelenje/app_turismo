import { create } from 'zustand';

export type Avatar = 'sahumadora' | 'cargero' | 'empanada' | 'carantanta' | 'tamal';
export type Language = 'es' | 'en' | 'fr';

interface UserState {
  name: string;
  age: number | null;
  language: Language;
  avatar: Avatar | null;
  registered: boolean;
  setProfile: (data: { name: string; age: number; language: Language }) => void;
  setAvatar: (avatar: Avatar) => void;
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
  ...loadInitial(),
  setProfile: (data) => set({ ...data }),
  setAvatar: (avatar) => set({ avatar, registered: true }),
  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ name: '', age: null, language: 'es', avatar: null, registered: false });
  },
}));

// Persistir cambios
useUserStore.subscribe((state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
});