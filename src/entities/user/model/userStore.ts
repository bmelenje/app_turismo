import { create } from 'zustand';

export type Avatar = 'sahumadora' | 'cargero' | 'empanada' | 'carantanta' | 'tamal';

interface UserState {
  name: string;
  age: number | null;
  language: 'es' | 'en' | 'fr';
  avatar: Avatar | null;
  registered: boolean;
  setProfile: (data: { name: string; age: number; language: 'es' | 'en' | 'fr' }) => void;
  setAvatar: (avatar: Avatar) => void;
}

export const useUserStore = create<UserState>((set) => ({
  name: '',
  age: null,
  language: 'es',
  avatar: null,
  registered: false,
  setProfile: (data) => set({ ...data }),
  setAvatar: (avatar) => set({ avatar, registered: true }),
}));