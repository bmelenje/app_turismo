export interface Photo {
  id: string;
  url: string;             // URL de la foto (o preview con marca de agua si está bloqueada)
  timestamp: string;
  location: string;
  origin: 'remote' | 'ar';
  translatedText?: string;
  isLocked: boolean;       // ← NUEVO: ¿El usuario ya pagó o compartió?
  unlockMethod?: 'share' | 'pay'; // ← NUEVO: Historial de cómo se desbloqueó
}

export interface PhotoState {
  photos: Photo[];
  addPhoto: (photo: Photo) => void;
  unlockPhoto: (id: string, method: 'share' | 'pay') => void; // ← NUEVO: Acción para desbloquear
  clearGallery: () => void;
}