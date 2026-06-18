import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, QrCode, Languages, Sparkles, RefreshCw, Scan, Info } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';

interface ARPageProps {
  onBack: () => void;
}

const MOCK_AR_TARGETS = [
  {
    id: 'caldas',
    name: 'Monumento al Sabio Caldas',
    qrLabel: 'QR_NODO_CENTRAL_01',
    originalText: 'Francisco José de Caldas y Tenorio. Sabio, científico y prócer de la independencia nacido en Popayán. Ejecutado en 1816.',
    translatedText: 'Francisco Jose de Caldas y Tenorio. Scientist, polymath, and hero of New Granada independence born in Popayan. Executed in 1816.',
    arImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
    yearOverlay: 'Restauración Digital 3D'
  },
  {
    id: 'catedral',
    name: 'Catedral Basílica de Nuestra Señora',
    qrLabel: 'QR_FACHADA_P_02',
    originalText: 'Estructura neoclásica destruida por el terremoto de 1983 y reconstruida fielmente. Epicentro de la Semana Santa.',
    translatedText: 'Neoclassical structure destroyed by the 1983 earthquake and faithfully rebuilt. Epicenter of Holy Week.',
    arImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=600&auto=format&fit=crop',
    yearOverlay: 'Capa Histórica Colonial'
  }
];

export function AugmentedRealityPage({ onBack }: ARPageProps) {
  // Corregido: Inicialización síncrona obligatoria para que el tag <video> exista en el DOM antes de instanciar el stream
  const [isMobile] = useState<boolean>(() => Capacitor.isNativePlatform());
  const [status, setStatus] = useState<'initializing' | 'scanning' | 'detected'>('initializing');
  const [selectedTarget, setSelectedTarget] = useState(MOCK_AR_TARGETS[0]);
  
  const [ocrStatus, setOcrStatus] = useState<'searching' | 'parsing' | 'ready'>('searching');
  const [isTranslating, setIsTranslating] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Control del ciclo de hardware de la cámara IP / Local
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const initTimer = setTimeout(() => {
      setStatus('scanning');
    }, 1200);

    if (isMobile) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        .then((stream) => {
          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          } else {
            stream.getTracks().forEach(track => track.stop());
          }
        })
        .catch((err) => {
          console.error("Fallo de permisos de cámara en AR:", err);
          toast.error('Permiso de cámara denegado para AR');
        });
    }

    return () => {
      clearTimeout(initTimer);
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isMobile]);

  // Control del pipeline de simulación OCR
  useEffect(() => {
    if (status === 'detected') {
      setOcrStatus('searching');
      setIsTranslating(false);

      const parseTimer = setTimeout(() => {
        setOcrStatus('parsing');
      }, 1200);

      const readyTimer = setTimeout(() => {
        setOcrStatus('ready');
        toast('Texto de placa indexado para traducción', { icon: '📝', id: 'ocr-success' });
      }, 2600);

      return () => {
        clearTimeout(parseTimer);
        clearTimeout(readyTimer);
      };
    }
  }, [status, selectedTarget]);

  const triggerScanSuccess = (targetId: string) => {
    const target = MOCK_AR_TARGETS.find(t => t.id === targetId);
    if (target) {
      setSelectedTarget(target);
      setStatus('detected');
      toast.success('¡Código QR e hito espacial vinculados!', { icon: '🎯', id: 'qr-success' });
    }
  };

  if (status === 'initializing') {
    return (
      <div className="absolute inset-0 z-[1050] flex flex-col bg-zinc-950 items-center justify-center text-center p-6 text-white font-mono">
        <RefreshCw className="h-7 w-7 text-[#534AB7] animate-spin mb-4" />
        <p className="text-xs tracking-widest text-zinc-400 uppercase">INICIALIZANDO MOTOR WEBAR</p>
        <div className="mt-2 text-[9px] text-zinc-500 max-w-xs leading-relaxed">
          [OK] Tracking Matrix Loaded <br />
          [OK] Spatial SLAM Mesh: READY
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-[1050] flex flex-col bg-black text-white overflow-hidden animate-in fade-in duration-300">
      
      {/* HUD SUPERIOR */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent px-4 py-4 font-mono">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/10 active:scale-95 transition-transform">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="text-xs font-bold tracking-widest text-zinc-200">VISION_AR_CV</h1>
            </div>
            <p className="text-[9px] text-zinc-400">FPS: 60.0 · Nodes: 1,420</p>
          </div>
        </div>

        {status === 'detected' && (
          <button 
            onClick={() => setStatus('scanning')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-[10px] text-zinc-200 font-bold uppercase active:scale-95 transition-all"
          >
            <QrCode className="h-3 w-3 text-cyan-400" />
            Reiniciar Escáner
          </button>
        )}
      </header>

      {/* VISOR CENTRAL DE LA CÁMARA */}
      <div className="relative flex-1 flex items-center justify-center bg-zinc-950">
        <div className="absolute inset-x-6 inset-y-24 pointer-events-none border-x border-white/5 flex justify-between items-center opacity-30">
          <div className="w-3 h-[1px] bg-white"></div>
          <div className="w-3 h-[1px] bg-white"></div>
        </div>

        {isMobile ? (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover opacity-75" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black flex flex-col items-center justify-center p-4">
            {status === 'scanning' && (
              <div className="p-4 text-center max-w-xs border border-zinc-800 rounded-2xl bg-zinc-900/30 backdrop-blur-sm mb-28 animate-pulse flex items-center gap-2">
                <Info className="h-4 w-4 text-[#534AB7] shrink-0" />
                <p className="text-[10px] font-mono text-zinc-400 text-left">
                  [Simulador Web] Usa los controles de inyección inferiores para disparar la detección del Pitch.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ESTADO 1: ESCANEO */}
        {status === 'scanning' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-cyan-400"></div>
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-cyan-400"></div>
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-cyan-400"></div>
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-cyan-400"></div>
              <div className="w-full h-[2px] bg-cyan-400 shadow-md shadow-cyan-400 absolute animate-[bounce_2s_infinite]"></div>
              <QrCode className="w-12 h-12 text-zinc-800" />
            </div>
            
            <p className="mt-4 text-[10px] font-mono tracking-wider text-cyan-400 bg-black/70 px-3 py-1 rounded-full border border-cyan-500/20 uppercase">
              Detectando Tag QR del Monumento
            </p>

            <div className="absolute bottom-24 inset-x-4 flex flex-col gap-1.5 max-w-xs mx-auto z-50">
              <span className="text-[9px] font-mono text-center text-zinc-500 block uppercase tracking-widest">Inyectar QR (Demo Control)</span>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => triggerScanSuccess('caldas')} className="py-2.5 px-3 bg-[#534AB7] hover:bg-[#4339a2] text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-purple-950/20">
                  Sabio Caldas
                </button>
                <button onClick={() => triggerScanSuccess('catedral')} className="py-2.5 px-3 bg-[#534AB7] hover:bg-[#4339a2] text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-purple-950/20">
                  La Catedral
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ESTADO 2: DETECTADO */}
        {status === 'detected' && (
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <div className="flex-1 flex items-center justify-center mt-16 mb-44 animate-in zoom-in-95 duration-300">
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl max-w-xs w-60 aspect-square bg-zinc-900/90 backdrop-blur-sm">
                <img src={selectedTarget.arImage} alt="AR Render" className="w-full h-full object-cover mix-blend-screen opacity-85" />
                <div className="absolute bottom-2 right-2 bg-cyan-900/80 backdrop-blur-md text-cyan-300 text-[8px] font-mono px-2 py-0.5 rounded border border-cyan-500/30 uppercase tracking-widest">
                  {selectedTarget.yearOverlay}
                </div>
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(rgba(34,211,238,0.1)_1px,transparent_1px)] [background-size:10px_10px]" />
              </div>
            </div>

            <div className="w-full max-w-sm mx-auto bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-zinc-800 p-3.5 shadow-xl mb-16 z-10 transition-all">
              <div className="flex items-start justify-between gap-2 border-b border-zinc-800/60 pb-2 mb-2.5">
                <div>
                  <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-wider">{selectedTarget.qrLabel}</span>
                  <h3 className="font-heading text-sm font-bold text-zinc-100">{selectedTarget.name}</h3>
                </div>

                <button
                  disabled={ocrStatus !== 'ready'}
                  onClick={() => setIsTranslating(!isTranslating)}
                  className={`flex items-center gap-1 py-1 px-2.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${
                    isTranslating ? 'bg-amber-500 text-zinc-950 border-amber-500 font-mono shadow-md shadow-amber-500/10' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  <Languages className="h-3 w-3" />
                  {isTranslating ? 'SPANISH' : 'ENGLISH'}
                </button>
              </div>

              <div className="bg-black/50 rounded-xl p-2.5 border border-zinc-800/80 min-h-[72px] flex flex-col justify-center relative overflow-hidden">
                {ocrStatus === 'searching' && (
                  <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400 animate-pulse">
                    <Scan className="h-3.5 w-3.5 text-zinc-500 animate-spin" />
                    <span>Buscando caracteres en placa física...</span>
                  </div>
                )}

                {ocrStatus === 'parsing' && (
                  <div className="w-full py-1 border border-dashed border-amber-500/40 bg-amber-500/5 rounded relative text-center animate-pulse">
                    <div className="w-full h-[1px] bg-amber-400/70 absolute top-0 animate-[bounce_1.2s_infinite]" />
                    <span className="text-[8px] font-mono text-amber-400 tracking-widest uppercase">[OCR_MATRIX_LOCKING]</span>
                  </div>
                )}

                {ocrStatus === 'ready' && (
                  <div className="animate-in fade-in duration-300">
                    {isTranslating ? (
                      <p className="text-xs text-amber-300 font-mono leading-relaxed">
                        <Sparkles className="h-3 w-3 inline mr-1 text-amber-400 fill-amber-400 animate-pulse" />
                        "{selectedTarget.translatedText}"
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-300 leading-relaxed">"{selectedTarget.originalText}"</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-zinc-950 p-4 pb-6 border-t border-zinc-900 text-center font-mono text-[10px] text-zinc-600 tracking-wider">
        SYSTEM STATE: COGNITIVE OVERLAY SECURE
      </footer>
    </div>
  );
}