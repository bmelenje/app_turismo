import { useState } from 'react';
import {
  ArrowLeft,
  Lock,
  Unlock,
  QrCode,
  History,
  Copy,
  Building2,
  ChevronRight,
  Trophy,
  Eye,
  EyeOff,
  Wifi,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CARD_NUMBER = '5288 9238 1859 0544';
const CARD_LAST4 = CARD_NUMBER.slice(-4);
const MASKED_NUMBER = `•••• •••• •••• ${CARD_LAST4}`;

const ALIADOS = [
  { name: 'Museo Negret', perk: '15% dcto. en entrada', icon: Building2 },
  { name: 'Parque Caldas Coffee', perk: '2x1 en bebida caliente', icon: Building2 },
];

export function CardPage({ onBack }: { onBack: () => void }) {
  const [isLocked, setIsLocked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  function handleCopyCard() {
    navigator.clipboard
      .writeText(CARD_NUMBER.replace(/\s/g, ''))
      .then(() => toast.success('Número de tarjeta copiado'))
      .catch(() => toast.error('No se pudo copiar el número'));
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#7a1620] text-white">
      <style>{`
        @keyframes gopopayan-sheen {
          0% { transform: translateX(-130%) translateY(-130%) rotate(20deg); opacity: 0; }
          12% { opacity: 1; }
          55% { opacity: 0.55; }
          100% { transform: translateX(130%) translateY(130%) rotate(20deg); opacity: 0; }
        }
        @keyframes gopopayan-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gopopayan-card-sheen::after {
          content: '';
          position: absolute;
          inset: -60% -10%;
          background: linear-gradient(75deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%);
          animation: gopopayan-sheen 2.6s ease-in-out 0.3s 1;
          pointer-events: none;
        }
        .gopopayan-rise { animation: gopopayan-rise 0.5s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Fondo: degradado bandera de Popayán + textura sutil de líneas diagonales */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 90% at 15% -10%, oklch(0.6 0.2 27) 0%, transparent 55%), linear-gradient(165deg, oklch(0.54 0.19 27) 0%, #7a1620 55%, #4a0f17 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, #fff 0px, #fff 1px, transparent 1px, transparent 26px)',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 px-6 pt-12">
        <button
          onClick={onBack}
          className="rounded-full bg-white/10 p-2.5 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
            CaldasPass Virtual · Ciudad Blanca
          </p>
          <h1 className="font-heading text-xl font-bold tracking-tight">Tarjeta GO Popayán</h1>
        </div>
      </header>

      {/* User Status */}
      <div className="relative z-10 px-6 pb-9 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(0.78_0.15_82)] to-[oklch(0.62_0.13_45)] font-heading text-sm font-bold text-[#4a0f17] shadow-lg ring-2 ring-white/20">
            EZ
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold leading-tight">Maria</h2>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-[oklch(0.78_0.15_82)]/40">
              <Trophy className="h-3 w-3 text-[oklch(0.78_0.15_82)]" /> Nivel 4 · Turista Experto
            </div>
          </div>
        </div>

        {/* Progreso hacia el siguiente nivel */}
        <div className="mt-3.5 max-w-[220px]">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[oklch(0.78_0.15_82)] to-[oklch(0.62_0.13_45)]"
              style={{ width: '68%' }}
            />
          </div>
          <p className="mt-1 text-[10px] font-medium text-white/55">320 pts para Nivel 5 · Embajador</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 flex-1 overflow-y-auto rounded-t-[36px] bg-white px-6 pb-10 pt-3 text-slate-900 shadow-[0_-20px_50px_rgba(0,0,0,0.35)]">
        <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-slate-200" />

        {/* Tarjeta física (mockup) */}
        <div
          className="gopopayan-rise gopopayan-card-sheen relative -mt-1 mb-7 overflow-hidden rounded-3xl p-6 text-white shadow-xl"
          style={{
            background:
              'linear-gradient(135deg, oklch(0.58 0.19 27) 0%, oklch(0.5 0.18 27) 45%, #4a0f17 100%)',
            boxShadow: '0 18px 40px -10px rgba(122, 22, 32, 0.55)',
          }}
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-25"
            style={{ background: 'radial-gradient(circle, oklch(0.78 0.15 82) 0%, transparent 70%)' }}
          />

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-2">
              {/* Chip */}
              <div className="h-7 w-9 rounded-md bg-gradient-to-br from-[oklch(0.85_0.13_82)] to-[oklch(0.68_0.13_70)] shadow-inner ring-1 ring-black/10" />
              <Wifi className="h-4 w-4 rotate-90 text-white/70" />
            </div>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ring-1 ring-white/20">
              Virtual
            </span>
          </div>

          <div className="relative mt-7 flex items-center justify-between gap-3">
            <p className="font-mono text-lg tracking-[0.18em] sm:text-xl">
              {revealed ? CARD_NUMBER : MASKED_NUMBER}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => setRevealed((v) => !v)}
                aria-label={revealed ? 'Ocultar número' : 'Mostrar número'}
                className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white active:scale-90"
              >
                {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={handleCopyCard}
                aria-label="Copiar número de tarjeta"
                className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white active:scale-90"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative mt-5 flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/50">Titular</p>
              <p className="text-xs font-semibold uppercase tracking-wide">Maria</p>
            </div>
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/50">Expira</p>
                <p className="text-xs font-semibold">01/33</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/50">CVC</p>
                <p className="text-xs font-semibold">{revealed ? '633' : '•••'}</p>
              </div>
            </div>
          </div>

          <p className="relative mt-5 text-right font-heading text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
            Go Popayán
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <button
            onClick={() => {
              setIsLocked((v) => !v);
              toast(isLocked ? '🔓 Tarjeta desbloqueada' : '🔒 Tarjeta bloqueada');
            }}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-3xl border p-4 shadow-sm transition-all active:scale-95 ${
              isLocked
                ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            {isLocked ? (
              <Unlock className="h-5 w-5 text-emerald-600" />
            ) : (
              <Lock className="h-5 w-5 text-[#c8232c]" />
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {isLocked ? 'Desbloquear' : 'Bloquear'}
            </span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1.5 rounded-3xl border border-slate-100 bg-slate-50 p-4 shadow-sm transition-all hover:bg-slate-100 active:scale-95">
            <QrCode className="h-5 w-5 text-[#c8232c]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Pagar</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1.5 rounded-3xl border border-slate-100 bg-slate-50 p-4 shadow-sm transition-all hover:bg-slate-100 active:scale-95">
            <History className="h-5 w-5 text-[#c8232c]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Historial</span>
          </button>
        </div>

        {/* Aliados */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold uppercase tracking-widest text-slate-400">
            Aliados Turísticos
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#c8232c]">
            <Sparkles className="h-3 w-3" /> {ALIADOS.length} activos
          </span>
        </div>
        <div className="space-y-3 pb-2">
          {ALIADOS.map(({ name, perk, icon: Icon }) => (
            <div
              key={name}
              className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:-translate-y-0.5 hover:border-[#c8232c]/25 hover:shadow-md hover:shadow-red-100"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-white p-3 text-[#c8232c] shadow-sm ring-1 ring-slate-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">{name}</p>
                  <p className="text-xs text-slate-400">{perk}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#c8232c]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
