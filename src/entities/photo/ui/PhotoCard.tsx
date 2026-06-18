import React from 'react';
import { Photo } from '../model/types';

interface PhotoCardProps {
  photo: Photo;
  onUnlockRequest?: (photo: Photo) => void; // Evento para cuando dé clic en desbloquear
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onUnlockRequest }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 relative">
      <div className="relative aspect-square bg-gray-900">
        <img 
          src={photo.url} 
          alt={photo.location} 
          className={`w-full h-full object-cover transition-all duration-300 ${
            photo.isLocked ? 'blur-md opacity-50' : ''
          }`}
          loading="lazy"
        />
        
        {/* Badge de origen */}
        <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full text-white z-10 ${
          photo.origin === 'remote' ? 'bg-blue-600' : 'bg-purple-600'
        }`}>
          {photo.origin === 'remote' ? '📸 Remota' : '🎨 AR'}
        </span>

        {/* Capa de bloqueo sobre la imagen si está locked */}
        {photo.isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-black/30 z-20">
            <span className="text-2xl mb-1">🔒</span>
            <button 
              onClick={() => onUnlockRequest?.(photo)}
              className="bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-md transition-transform active:scale-95"
            >
              Desbloquear HD
            </button>
          </div>
        )}
      </div>
      
      <div className="p-3">
        <p className="text-xs text-gray-500 font-medium truncate">{photo.location}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {new Date(photo.timestamp).toLocaleDateString('es-CO', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};