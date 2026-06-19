import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  QrCode,
  Languages,
  MapPin,
  Upload,
  Loader2,
  ImageOff,
  ArrowLeftRight,
  Copy,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { DEMO_POIS } from '@/widgets/MapWithPOIs/demoPOIs';
import type { POI } from '@/entities/poi';
import { POI_COLORS } from '@/shared/config/constants';
import { Button } from '@/shared/ui/Button';
import { translateText, TRANSLATE_LANGUAGES } from '@/shared/api/groq';

type Tab = 'scan' | 'translate';

type Props = {
  onBack: () => void;
  /** Centra el lugar reconocido en el mapa (mismo flujo que "Lugares"). */
  onSelectPlace?: (poi: POI) => void;
};

// Lugares turísticos que tendrían un código QR físico junto al monumento.
const LANDMARKS = DEMO_POIS.filter((p) => p.category === 'interes');

function qrValueForPoi(poi: POI): string {
  return `popayan:poi:${poi.id}`;
}

/** Empareja el texto leído del QR con un lugar real de la app. */
function matchPoiFromQrText(raw: string): POI | null {
  const text = raw.trim();
  if (!text) return null;
  const m = /^popayan:poi:([a-z0-9_-]+)$/i.exec(text);
  const id = (m ? m[1] : text).toLowerCase();
  return (
    DEMO_POIS.find((p) => p.id.toLowerCase() === id) ??
    DEMO_POIS.find((p) => p.name.toLowerCase() === text.toLowerCase()) ??
    null
  );
}

export function AugmentedRealityPage({ onBack, onSelectPlace }: Props) {
  const [tab, setTab] = useState<Tab>('scan');

  return (
    <div className="absolute inset-0 z-[1050] flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-4">
        <button
          onClick={onBack}
          className="rounded-lg p-1.5 text-foreground hover:bg-muted"
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="font-heading text-xl font-bold text-foreground">Escáner y Traductor</h1>
      </header>

      <div className="flex gap-2 border-b border-border bg-card px-3 py-2">
        <TabButton active={tab === 'scan'} icon={QrCode} label="Escanear QR" onClick={() => setTab('scan')} />
        <TabButton
          active={tab === 'translate'}
          icon={Languages}
          label="Traductor"
          onClick={() => setTab('translate')}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'scan' ? <QrScanTab onSelectPlace={onSelectPlace} /> : <TranslateTab />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof QrCode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

// ── Escanear QR ──────────────────────────────────────────────────────────────

type CameraState = 'starting' | 'ready' | 'denied' | 'unavailable';

function QrScanTab({ onSelectPlace }: { onSelectPlace?: (poi: POI) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>('starting');
  const [result, setResult] = useState<POI | null>(null);
  const [showCodes, setShowCodes] = useState(false);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  // Genera los QR de cada lugar: son los que se imprimirían y ubicarían junto
  // al monumento real, y permiten probar el lector apuntando a otra pantalla.
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      LANDMARKS.map(async (poi) => {
        const dataUrl = await QRCode.toDataURL(qrValueForPoi(poi), {
          width: 200,
          margin: 1,
          color: { dark: '#1f2430', light: '#ffffff' },
        });
        return [poi.id, dataUrl] as const;
      }),
    ).then((pairs) => {
      if (!cancelled) setQrImages(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || canvas.width === 0 || canvas.height === 0) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      const poi = matchPoiFromQrText(code.data);
      if (poi) {
        setResult(poi);
        stopCamera();
        toast.success(`📍 ${poi.name} reconocido`);
        return;
      }
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraState('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraState('ready');
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      console.error('No se pudo acceder a la cámara para el escáner QR:', err);
      const name = (err as { name?: string } | null)?.name;
      setCameraState(name === 'NotFoundError' || name === 'OverconstrainedError' ? 'unavailable' : 'denied');
    }
  }, [scanFrame]);

  useEffect(() => {
    if (!result) startCamera();
    return () => stopCamera();
  }, [result, startCamera, stopCamera]);

  function handleRescan() {
    setResult(null);
  }

  function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(url);
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (!code) {
        toast.error('No se detectó ningún código QR en la imagen');
        return;
      }
      const poi = matchPoiFromQrText(code.data);
      if (!poi) {
        toast.error('Código QR no reconocido');
        return;
      }
      setResult(poi);
      toast.success(`📍 ${poi.name} reconocido`);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error('No se pudo leer la imagen');
    };
    img.src = url;
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {!result && (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-zinc-950 shadow-lg" style={{ aspectRatio: '3 / 4' }}>
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-56 w-56">
                <span className="absolute left-0 top-0 h-7 w-7 rounded-tl-lg border-l-2 border-t-2 border-white/90" />
                <span className="absolute right-0 top-0 h-7 w-7 rounded-tr-lg border-r-2 border-t-2 border-white/90" />
                <span className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-lg border-b-2 border-l-2 border-white/90" />
                <span className="absolute bottom-0 right-0 h-7 w-7 rounded-br-lg border-b-2 border-r-2 border-white/90" />
              </div>
            </div>

            {cameraState === 'starting' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm">Activando cámara…</p>
              </div>
            )}
            {cameraState === 'ready' && (
              <p className="absolute inset-x-0 bottom-4 text-center text-sm font-medium text-white drop-shadow">
                Apunta al código QR del lugar
              </p>
            )}
            {(cameraState === 'denied' || cameraState === 'unavailable') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900 p-6 text-center">
                <ImageOff className="h-8 w-8 text-zinc-400" />
                <p className="text-sm text-zinc-300">
                  {cameraState === 'denied'
                    ? 'No se pudo acceder a la cámara. Revisa los permisos del navegador.'
                    : 'Este dispositivo no tiene una cámara disponible.'}
                </p>
                <Button size="sm" onClick={startCamera}>
                  Reintentar
                </Button>
              </div>
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <Upload className="h-4 w-4" /> Subir foto de un código QR
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
        </>
      )}

      {result && <ResultCard poi={result} onRescan={handleRescan} onSelectPlace={onSelectPlace} />}

      {/* Códigos QR de los lugares: los que se ubicarían físicamente en cada sitio */}
      <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
        <button onClick={() => setShowCodes((v) => !v)} className="flex w-full items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <QrCode className="h-4 w-4 text-primary" /> Códigos QR de los lugares
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${showCodes ? 'rotate-180' : ''}`}
          />
        </button>

        {showCodes && (
          <>
            <p className="mt-2 text-xs text-muted-foreground">
              Estos son los códigos que se ubicarían junto a cada monumento. Pruébalos apuntando la cámara a la
              pantalla de otro dispositivo.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {LANDMARKS.map((poi) => (
                <div key={poi.id} className="flex flex-col items-center gap-1.5 rounded-xl bg-muted p-2 text-center">
                  {qrImages[poi.id] ? (
                    <img src={qrImages[poi.id]} alt={`Código QR de ${poi.name}`} className="h-16 w-16 rounded-md bg-white p-1" />
                  ) : (
                    <div className="h-16 w-16 animate-pulse rounded-md bg-border" />
                  )}
                  <span className="line-clamp-2 text-[10px] font-medium text-foreground">{poi.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  poi,
  onRescan,
  onSelectPlace,
}: {
  poi: POI;
  onRescan: () => void;
  onSelectPlace?: (poi: POI) => void;
}) {
  const color = POI_COLORS[poi.category as keyof typeof POI_COLORS] || POI_COLORS.custom;
  return (
    <div className="animate-in fade-in zoom-in-95 overflow-hidden rounded-3xl bg-card shadow-lg ring-1 ring-border duration-300">
      {poi.imageUrl && (
        <div className="h-40 w-full bg-cover bg-center" style={{ backgroundImage: `url(${poi.imageUrl})` }} />
      )}
      <div className="p-4">
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          Código reconocido
        </span>
        <h2 className="mt-2 font-heading text-lg font-bold text-foreground">{poi.name}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{poi.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button onClick={() => onSelectPlace?.(poi)} disabled={!onSelectPlace}>
            <MapPin className="h-4 w-4" /> Ver en el mapa
          </Button>
          <Button variant="outline" onClick={onRescan}>
            <QrCode className="h-4 w-4" /> Escanear otro
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Traductor en tiempo real (Groq) ──────────────────────────────────────────

function TranslateTab() {
  const [sourceLang, setSourceLang] = useState('es');
  const [targetLang, setTargetLang] = useState('en');
  const [sourceText, setSourceText] = useState('');
  const [translated, setTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);

    if (!sourceText.trim()) {
      setTranslated('');
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = window.setTimeout(() => {
      const id = ++requestId.current;
      translateText(sourceText, sourceLang, targetLang)
        .then((result) => {
          if (id === requestId.current) setTranslated(result);
        })
        .catch((err) => {
          if (id !== requestId.current) return;
          const detail = err instanceof Error ? err.message : 'Error desconocido';
          toast.error(`No se pudo traducir: ${detail}`);
        })
        .finally(() => {
          if (id === requestId.current) setLoading(false);
        });
    }, 600);

    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    };
  }, [sourceText, sourceLang, targetLang]);

  function handleSwap() {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translated);
    setTranslated(sourceText);
  }

  function handleCopy() {
    if (!translated) return;
    navigator.clipboard.writeText(translated).then(() => toast.success('Traducción copiada'));
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border">
        <div className="flex items-center justify-between gap-2 border-b border-border p-3">
          <LangSelect value={sourceLang} onChange={setSourceLang} />
          <button
            onClick={handleSwap}
            aria-label="Intercambiar idiomas"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          <LangSelect value={targetLang} onChange={setTargetLang} />
        </div>

        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder="Escribe el texto a traducir…"
          rows={4}
          className="w-full resize-none bg-transparent p-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="min-h-[96px] rounded-2xl bg-primary/5 p-3 ring-1 ring-primary/15">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Traduciendo…
          </div>
        ) : translated ? (
          <div className="flex items-start justify-between gap-2">
            <p className="text-base leading-relaxed text-foreground">{translated}</p>
            <button
              onClick={handleCopy}
              aria-label="Copiar traducción"
              className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">La traducción aparecerá aquí…</p>
        )}
      </div>

      <p className="px-1 text-center text-[11px] text-muted-foreground">
        Traducción potenciada por IA (Groq) · puede contener imprecisiones
      </p>
    </div>
  );
}

function LangSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 rounded-xl bg-muted px-3 py-2 text-sm font-medium text-foreground outline-none"
    >
      {TRANSLATE_LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
