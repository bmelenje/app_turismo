import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Camera, AlertTriangle, Upload, Radio, Cpu, Network } from 'lucide-react';
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
  
  // Datos simulados de la Cámara IP del Parque Caldas
  const simulatedIp = "192.168.10.45";
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
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Error de hardware de cámara nativa:", err);
        setCameraError(true);
      });
    }

    return () => {
      clearTimeout(timer);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Captura para Dispositivos Móviles (Hardware Real)
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

  // Simulación para Computador (Carga de archivo local)
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

  // UI DE CARGA: Conectando al nodo IP de la cámara
  if (isConnecting) {
    return (
      <div className="absolute inset-0 z-[1050] flex flex-col bg-zinc-950 items-center justify-center text-center p-6 text-white">
        <div className="relative flex h-16 w-16 items-center justify-center mb-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500/30 opacity-75"></span>
          <div className="relative rounded-2xl bg-orange-600 p-4">
            <Network className="h-6 w-6 text-white animate-pulse" />
          </div>
        </div>
        <h2 className="font-heading text-base font-bold tracking-wider text-zinc-200">ESTABLECIENDO ENLACE IP</h2>
        <p className="mt-1 text-xs text-zinc-400 font-mono">rtsp://{simulatedIp}:554/stream1</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[1050] flex flex-col bg-black text-white overflow-hidden animate-in fade-in duration-300">
      
      {/* HUD Superior - Información de la Cámara IP */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/10 active:scale-95 transition-transform">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-heading text-xs font-bold tracking-widest text-zinc-200 uppercase">CAM_PARQUE_CALDAS_02</h1>
            </div>
            <p className="text-[10px] font-mono text-orange-400">IP: {simulatedIp} · Latencia: 34ms</p>
          </div>
        </div>

        <div className="flex gap-1.5 items-center bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/5 text-[10px] font-mono text-zinc-400">
          <Cpu className="h-3 w-3 text-orange-500" />
          <span>AI ONDEMAND: READY</span>
        </div>
      </header>

      {/* Visor Central (Dinámico según entorno Web o Móvil) */}
      <div className="relative flex-1 flex items-center justify-center bg-zinc-950">
        
        {/* Grillas estéticas de cámara de seguridad */}
        <div className="absolute inset-0 pointer-events-none border-[16px] border-transparent opacity-20 before:absolute before:inset-0 before:border before:border-white"></div>
        <span className="absolute top-16 right-6 font-mono text-[10px] tracking-wider opacity-60 text-white select-none">REC ●</span>

        {isMobile ? (
          /* MÓVIL: Sensor de cámara real */
          cameraError ? (
            <div className="p-4 text-center max-w-xs z-10">
              <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
              <p className="text-xs text-zinc-400">Por favor, habilita los permisos de acceso a la cámara en tu dispositivo Android.</p>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          )
        ) : (
          /* WEB / COMPUTADOR: Interfaz de simulación por carga de archivos */
          <div className="p-6 text-center max-w-sm z-10 flex flex-col items-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/60 backdrop-blur-sm m-4">
            <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-3 border border-zinc-700 text-orange-400">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <h3 className="font-heading text-sm font-bold text-zinc-200">Entorno Web (Modo Simulador)</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-4 px-2">
              Para simular la captura remota de la cámara IP desde tu PC, sube una foto de prueba. Se procesará automáticamente en la galería con bloqueo.
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
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-500 active:scale-95 transition-all shadow-md shadow-orange-950/20"
            >
              <Upload className="h-3.5 w-3.5" />
              Subir foto de prueba
            </button>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Barra Inferior - Botón de captura (Oculto en Web ya que usa el botón de subida) */}
      <footer className="bg-zinc-950 p-6 pb-8 flex justify-center items-center relative border-t border-zinc-900">
        {isMobile ? (
          <button
            onClick={handleCaptureMobile}
            disabled={cameraError}
            className="h-16 w-16 bg-white rounded-full flex items-center justify-center border-4 border-zinc-700 active:scale-90 transition-transform disabled:opacity-30 shadow-xl"
            aria-label="Tomar Foto Remota"
          >
            <Camera className="h-7 w-7 text-black fill-zinc-200" />
          </button>
        ) : (
          <span className="text-[10px] font-mono text-zinc-600 tracking-widest uppercase">
            Esperando Payload del Simulador
          </span>
        )}
      </footer>
    </div>
  );
}