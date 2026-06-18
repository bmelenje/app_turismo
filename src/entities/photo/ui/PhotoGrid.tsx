import React from 'react';
import { Photo } from '../model/types';
import { PhotoCard } from './PhotoCard';

interface PhotoGridProps {
  photos: Photo[];
  onUnlockRequest: (photo: Photo) => void; // ← Agregamos este prop
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onUnlockRequest }) => {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <div className="text-4xl mb-2">📸</div>
        <p className="text-sm font-medium text-gray-600">Tu galería está vacía</p>
        <p className="text-xs text-gray-400 mt-1 max-w-[240px]">
          Las fotos que captures en el Parque Caldas o tus traducciones AR aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <PhotoCard 
          key={photo.id} 
          photo={photo} 
          onUnlockRequest={onUnlockRequest} // ← Lo pasamos al hijo
        />
      ))}
    </div>
  );
};