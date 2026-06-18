import { ChevronLeft, Camera, Lock, CreditCard, Share2 } from 'lucide-react';
import { usePhotoStore } from '@/entities/photo';

interface GalleryPageProps {
  onBack: () => void;
}

export function GalleryPage({ onBack }: GalleryPageProps) {
  const { photos, unlockPhoto } = usePhotoStore();
  const hasPhotos = photos.length > 0;

  return (
    <div className="absolute inset-0 z-[1050] flex flex-col bg-background animate-in fade-in duration-200 overflow-hidden">
      
      {/* Header */}
      <header className="flex items-center gap-2 border-b bg-card px-4 py-3 shadow-sm">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground hover:bg-accent transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-heading text-lg font-bold text-foreground">Galería de fotos</h1>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-4 max-w-5xl w-full mx-auto">
        {hasPhotos ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative rounded-2xl overflow-hidden border bg-card shadow-sm flex flex-col group">
                
                {/* Contenedor de la imagen */}
                <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                  <img 
                    src={photo.url} 
                    alt={photo.title} 
                    className={`h-full w-full object-cover transition-all duration-300 ${photo.isLocked ? 'blur-md scale-105 select-none pointer-events-none' : ''}`}
                  />

                  {/* Capa de Bloqueo */}
                  {photo.isLocked && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center text-white">
                      <div className="bg-black/60 p-2 rounded-full mb-1 border border-white/10">
                        <Lock className="h-4 w-4 text-amber-400 fill-amber-400" />
                      </div>
                      <span className="text-xs font-bold tracking-wide">Imagen Protegida</span>
                      <p className="text-[10px] text-zinc-300 max-w-[180px] mt-0.5">Desbloquea para guardarla en alta calidad</p>
                    </div>
                  )}
                </div>

                {/* Info e Interacción */}
                <div className="p-3 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm truncate text-foreground">{photo.title}</h3>
                    <p className="text-[11px] text-muted-foreground">{photo.createdAt}</p>
                  </div>

                  {photo.isLocked ? (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <button
                        onClick={() => unlockPhoto(photo.id)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity active:scale-[0.98]"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        Pagar
                      </button>
                      <button
                        onClick={() => unlockPhoto(photo.id)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 transition-colors active:scale-[0.98]"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Compartir
                      </button>
                    </div>
                  ) : (
                    <div className="w-full text-center py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in duration-300">
                       de 🔓 Imagen Desbloqueada
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[60vh] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/70 text-muted-foreground">
              <Camera className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-heading text-base font-bold text-foreground">Tu galería está limpia</h2>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">Ve al módulo de la cámara para capturar fotos en los monumentos.</p>
          </div>
        )}
      </main>
    </div>
  );
}