import { useState } from 'react';
import { ArrowLeft, Lock, Unlock, QrCode, History, CreditCard, Copy, Building2, ChevronRight, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

export function CardPage({ onBack }: { onBack: () => void }) {
  const [isLocked, setIsLocked] = useState(false);

  return (
    <div className="flex h-dvh flex-col bg-[#c8232c] text-white">
      {/* Header */}
      <header className="flex items-center gap-4 p-6 pt-12">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="text-xl font-semibold tracking-tight">CaldasPass Virtual</h1>
      </header>

      {/* User Status */}
      <div className="px-6 pb-8">
        <h2 className="text-2xl font-bold">esteban_z</h2>
        <div className="flex items-center gap-2 mt-1 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-medium">
          <Trophy className="h-3 w-3" /> Nivel 4 · Turista Experto
        </div>
      </div>

      {/* Main Content Card */}
      <div className="flex-1 overflow-y-auto rounded-t-[40px] bg-white p-6 text-slate-900 shadow-2xl">
        
        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 -mt-12 mb-8">
          <button onClick={() => setIsLocked(!isLocked)} className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm hover:bg-slate-100 transition-all">
            {isLocked ? <Unlock className="h-6 w-6 text-green-600 mb-1" /> : <Lock className="h-6 w-6 text-[#c8232c] mb-1" />}
            <span className="text-[10px] font-bold uppercase tracking-wider">{isLocked ? 'Desbloquear' : 'Bloquear'}</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm hover:bg-slate-100 transition-all">
            <QrCode className="h-6 w-6 text-[#c8232c] mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Pagar</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm hover:bg-slate-100 transition-all">
            <History className="h-6 w-6 text-[#c8232c] mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Historial</span>
          </button>
        </div>

        {/* Card Data Section */}
        <div className="bg-[#c8232c] text-white p-6 rounded-3xl shadow-lg shadow-red-200">
            <div className="flex justify-between items-start mb-6">
                <CreditCard className="h-8 w-8 opacity-80" />
                <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">VIRTUAL</span>
            </div>
            <p className="font-mono text-xl tracking-[0.2em] mb-4">5288 9238 1859 0544</p>
            <div className="flex justify-between text-xs opacity-80 uppercase tracking-widest">
                <span>Expira: 01/33</span>
                <span>CVC: 633</span>
            </div>
        </div>

        {/* Aliados */}
        <h3 className="mt-8 mb-4 font-bold text-sm text-slate-400 uppercase tracking-widest">Aliados Turísticos</h3>
        <div className="space-y-3 pb-10">
          {[ 'Museo Negret', 'Parque Caldas Coffee' ].map((name) => (
            <div key={name} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-[#c8232c]/20 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-[#c8232c]"><Building2 className="h-5 w-5" /></div>
                <span className="font-semibold text-slate-700">{name}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}