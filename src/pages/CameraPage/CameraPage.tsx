import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Camera, AlertTriangle, Upload, Radio, Sparkles, Wifi } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { usePhotoStore } from '@/entities/photo';

interface CameraPageProps {
  onBack: () => void;
  onNavigateToGallery: () => void;
}

export function CameraPage({ onBack, onNavigateToGallery }: CameraPageProps) {
  const addPhoto = usePhotoStore((s) => s.addPhoto);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  // Datos simulados de la cámara IP del Parque Caldas
  const simulatedIp = '192.168.10.45';
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsMobile(native);

    // Simular un pequeño delay de conexión de red a la IP para darle realismo
    const timer = setTimeout(() => {
      setIsConnecting(false);
    }, 1200);

    if (native) {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error('Error de hardware de cámara nativa:', err);
          setCameraError(true);
        });
    }

    return () => {
      clearTimeout(timer);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Captura para dispositivos móviles (hardware real)
  const handleCaptureMobile = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL('image/jpeg');
      addPhoto(imageDataUrl); // Se guarda bloqueada en el store
      onNavigateToGallery();
    }
  };

  // Simulación para computador (carga de archivo local)
  const handleWebFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        addPhoto(reader.result); // Inyecta la imagen cargada como si fuera la captura IP
        onNavigateToGallery();
      }
    };
    reader.readAsDataURL(file);
  };

  // Pantalla de carga: conectando al nodo IP de la cámara
  if (isConnecting) {
    return (
      <div className="absolute inset-0 z-[1050] flex flex-col items-center justify-center bg-card p-6 text-center">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/25" />
          <div className="relative rounded-2xl bg-primary p-4 shadow-lg shadow-primary/30">
            <Wifi className="h-6 w-6 animate-pulse text-primary-foreground" />
          </div>
        </div>
        <h2 className="font-heading text-base font-bold text-foreground">Conectando con la cámara</h2>
        <p className="mt-1 text-xs text-muted-foreground">Parque Caldas · {simulatedIp}</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[1050] flex flex-col overflow-hidden bg-zinc-950 text-white animate-in fade-in duration-300">
      {/* Encabezado */}
      <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/85 to-transparent px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md transition-transform active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="font-heading text-sm font-bold text-white">Cámara remota · Parque Caldas</h1>
            </div>
            <p className="text-[11px] text-white/60">Conectado a {simulatedIp}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-[oklch(0.78_0.15_82)] ring-1 ring-white/15 backdrop-blur-md">
          <Sparkles className="h-3 w-3" />
          IA lista
        </div>
      </header>

      {/* Visor central (dinámico según entorno web o móvil) */}
      <div className="relative flex flex-1 items-center justify-center bg-zinc-950">
        <span className="absolute right-5 top-[4.5rem] text-[10px] font-medium tracking-wider text-white/50 select-none">
          REC ●
        </span>

        {isMobile ? (
          cameraError ? (
            <div className="z-10 mx-auto max-w-xs rounded-3xl bg-white/5 p-6 text-center ring-1 ring-white/10">
              <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-amber-400" />
              <p className="text-sm text-white/70">
                Habilita los permisos de cámara de la app en los ajustes de tu dispositivo Android.
              </p>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          )
        ) : (
          <div className="m-4 flex max-w-sm flex-col items-center rounded-3xl bg-card p-6 text-center text-card-foreground shadow-xl">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <h3 className="font-heading text-sm font-bold text-foreground">Modo simulador de escritorio</h3>
            <p className="mt-1 mb-4 px-2 text-xs text-muted-foreground">
              Sube una foto de prueba para simular la captura remota. Se guardará en la galería con bloqueo.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleWebFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
            >
              <Upload className="h-3.5 w-3.5" />
              Subir foto de prueba
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Barra inferior - botón de captura (oculto en web, usa el botón de subida) */}
      <footer className="relative flex items-center justify-center border-t border-white/10 bg-zinc-950 p-6 pb-8">
        {isMobile ? (
          <button
            onClick={handleCaptureMobile}
            disabled={cameraError}
            aria-label="Tomar foto remota"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl ring-4 ring-primary/40 transition-transform active:scale-90 disabled:opacity-30"
          >
            <Camera className="h-7 w-7 text-primary" />
          </button>
        ) : (
          <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
            Esperando foto del simulador
          </span>
        )}
      </footer>
    </div>
  );
}
