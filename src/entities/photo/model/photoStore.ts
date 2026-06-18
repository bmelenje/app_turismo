import { create } from 'zustand';

export interface Photo {
  id: string;
  url: string;
  isLocked: boolean;
  createdAt: string;
  title: string;
}

interface PhotoState {
  photos: Photo[];
  addPhoto: (url: string) => void;
  unlockPhoto: (id: string) => void;
}

export const usePhotoStore = create<PhotoState>((set) => ({
  photos: [],
  
  addPhoto: (url) => set((state) => ({
    photos: [
      {
        id: crypto.randomUUID(),
        url,
        isLocked: true, // 🔒 Nace bloqueada por defecto
        createdAt: new Date().toLocaleDateString(),
        title: `Captura Popayán - ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
      },
      ...state.photos
    ]
  })),

  unlockPhoto: (id) => set((state) => ({
    photos: state.photos.map((photo) => 
      photo.id === id ? { ...photo, isLocked: false } : photo
    )
  }))
}));