import { create } from 'zustand';

const STORAGE_KEY = 'saved-pois';

const load = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
};

interface FavoritesStore {
  ids: Set<string>;
  toggle: (id: string) => boolean; // devuelve el nuevo estado (true = guardado)
  isSaved: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  ids: load(),
  toggle: (id) => {
    const ids = new Set(get().ids);
    const nowSaved = !ids.has(id);
    if (nowSaved) ids.add(id);
    else ids.delete(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    set({ ids });
    return nowSaved;
  },
  isSaved: (id) => get().ids.has(id),
}));
