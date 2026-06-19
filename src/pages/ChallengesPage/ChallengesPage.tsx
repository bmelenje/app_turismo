import { useState } from 'react';
import { 
  ChevronLeft, Trophy, MapPin, Camera, HelpCircle, Users, 
  ArrowRight, CheckCircle2, Flame, Star, Sparkles, Ticket 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ChallengesPageProps {
  onBack: () => void;
}

const MOCK_REWARDS = [
  { id: 'chepa', place: 'Aplanchados Doña Chepa', reward: 'Paquete x12 + Café gratis', cost: 1200, icon: '🫓' },
  { id: 'mora', place: 'Mora de Castilla', reward: '2x1 en Helado de Paila u Oblea', cost: 800, icon: '🍧' },
  { id: 'carola', place: 'Café Carola (Sector Histórico)', reward: '15% de Descuento en la cuenta total', cost: 1500, icon: '☕' },
];

export function ChallengesPage({ onBack }: ChallengesPageProps) {
  const [view, setView] = useState<'menu' | 'cafe' | 'museos' | 'iglesias'>('menu');
  const [userPoints, setUserPoints] = useState(650);
  
  // Estados para controlar el progreso simulado de las misiones
  const [cafePhotoTaken, setCafePhotoTaken] = useState(false);
  const [museumStep, setMuseumStep] = useState<{ geo: boolean; photo: boolean }>({ geo: false, photo: false });
  const [churchStep, setChurchStep] = useState<{ geo: boolean; photo: boolean }>({ geo: false, photo: false });

  // 1. Simulación Reto Juan Valdez
  const handleCafeChallenge = () => {
    setCafePhotoTaken(true);
    setUserPoints(prev => prev + 250);
    toast.success('¡Foto validada en Juan Valdez! +250 Puntos Patojos ☕', { id: 'cafe-success' });
  };

  // 2. Simulación Ruta de los Museos
  const handleMuseumGeo = () => {
    setMuseumStep(prev => ({ ...prev, geo: true }));
    toast.success('📍 Ubicación confirmada: Casa Museo Mosquera.');
  };

  const handleMuseumPhoto = () => {
    if (!museumStep.geo) {
      toast.error('Primero debes verificar tu geolocalización en el museo.');
      return;
    }
    setMuseumStep(prev => ({ ...prev, photo: true }));
    setUserPoints(prev => prev + 400);
    toast.success('📸 ¡Foto del óleo colonial validada! +400 Puntos Patojos 🖼️');
  };

  // 3. Simulación Ruta de las Iglesias
  const handleChurchGeo = () => {
    setChurchStep(prev => ({ ...prev, geo: true }));
    toast.success('📍 Ubicación confirmada: Templo de San Francisco.');
  };

  const handleChurchPhoto = () => {
    if (!churchStep.geo) {
      toast.error('Primero debes verificar tu geolocalización en la iglesia.');
      return;
    }
    setChurchStep(prev => ({ ...prev, photo: true }));
    setUserPoints(prev => prev + 450);
    toast.success('📸 ¡Foto de la fachada aprobada! +450 Puntos Patojos ⛪');
  };

  return (
        <div className="absolute inset-0 z-[2000] w-full h-full flex flex-col bg-background text-foreground overflow-y-auto">      
      {/* HUD SUPERIOR */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background/80 backdrop-blur-xl px-4 py-3.5 border-b border-border/60">
        <div className="flex items-center gap-3">
          <button 
            onClick={view === 'menu' ? onBack : () => setView('menu')} 
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 border border-border/50 text-foreground active:scale-95 transition-all hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-[11px] font-black tracking-widest text-foreground font-mono uppercase">
              {view === 'menu' && 'CENTRAL_DE_RETOS'}
              {view === 'cafe' && 'DESAFÍO_JUAN_VALDEZ'}
              {view === 'museos' && 'RUTA_DE_LOS_MUSEOS'}
              {view === 'iglesias' && 'RUTA_SACRA'}
            </h1>
            <p className="text-[9px] text-muted-foreground font-mono">Popayán Smart City · v2.6</p>
          </div>
        </div>

        {/* CONTADOR DE PUNTOS GLOBALES */}
        <div className="flex items-center gap-1.5 bg-accent/10 border border-accent/25 px-2.5 py-1 rounded-xl shadow-xs">
          <Trophy className="h-3.5 w-3.5 text-accent animate-pulse" />
          <span className="text-xs font-black text-accent font-mono">{userPoints} PTS</span>
        </div>
      </header>

      {/* VISTA 1: MENÚ PRINCIPAL */}
      {view === 'menu' && (
        <div className="p-4 flex-1 flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          
          {/* BANNER DE BIENVENIDA */}
          <div className="relative rounded-2xl bg-gradient-to-br from-primary to-primary/90 p-5 border border-primary/20 overflow-hidden shadow-lg shadow-primary/5">
            <div className="relative z-10">
              <div className="flex items-center gap-1 bg-black/25 backdrop-blur-xs text-accent text-[9px] font-bold font-mono px-2.5 py-0.5 rounded-full w-max uppercase tracking-wider mb-2.5">
                <Flame className="h-3 w-3 fill-accent mr-0.5" /> Racha de 3 días
              </div>
              <h2 className="text-base font-extrabold tracking-tight text-white leading-tight">
                ¡Explora, compite y gana incentivos!
              </h2>
              <p className="text-xs text-white/85 mt-1.5 leading-relaxed font-normal">
                Completa misiones en el centro histórico para desbloquear bonos en los mejores restaurantes de la ciudad.
              </p>
            </div>
            <div className="absolute right-[-8px] bottom-[-12px] text-7xl opacity-15 pointer-events-none select-none">🦆</div>
          </div>

          {/* SECCIÓN RETOS DISPONIBLES */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 px-1 font-mono">
              <Star className="h-3.5 w-3.5 text-primary" /> Misiones Disponibles
            </h3>
            
            {/* Reto 1: Juan Valdez */}
            <button onClick={() => setView('cafe')} className="group flex items-center justify-between p-3.5 bg-card/60 border border-border/60 rounded-2xl hover:bg-card hover:border-border hover:-translate-y-0.5 active:scale-[0.99] transition-all text-left shadow-xs">
              <div className="flex gap-3 items-center">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${cafePhotoTaken ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                  {cafePhotoTaken ? <CheckCircle2 className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    Momento Juan Valdez 
                    {cafePhotoTaken && <span className="text-[9px] text-emerald-500 font-mono">(Completado)</span>}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Tómate una foto con tu café y acumula puntos.</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Reto 2: Ruta de los Museos */}
            <button onClick={() => setView('museos')} className="group flex items-center justify-between p-3.5 bg-card/60 border border-border/60 rounded-2xl hover:bg-card hover:border-border hover:-translate-y-0.5 active:scale-[0.99] transition-all text-left shadow-xs">
              <div className="flex gap-3 items-center">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${museumStep.photo ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-accent/10 text-accent border border-accent/20'}`}>
                  {museumStep.photo ? <CheckCircle2 className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    Ruta de los Museos 
                    {museumStep.photo && <span className="text-[9px] text-emerald-500 font-mono">(Completada)</span>}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Verificación por geolocalización y foto específica.</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Reto 3: Ruta de las Iglesias */}
            <button onClick={() => setView('iglesias')} className="group flex items-center justify-between p-3.5 bg-card/60 border border-border/60 rounded-2xl hover:bg-card hover:border-border hover:-translate-y-0.5 active:scale-[0.99] transition-all text-left shadow-xs">
              <div className="flex gap-3 items-center">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${churchStep.photo ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                  {churchStep.photo ? <CheckCircle2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    Ruta del Arte Sacro 
                    {churchStep.photo && <span className="text-[9px] text-emerald-500 font-mono">(Completada)</span>}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Explora templos icónicos con misiones fotográficas.</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* SECCIÓN RECOMPENSAS */}
          <div className="flex flex-col gap-2.5 mt-2">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 px-1 font-mono">
              <Ticket className="h-3.5 w-3.5 text-accent" /> Canjes en Popayán
            </h3>
            <div className="flex flex-col gap-2">
              {MOCK_REWARDS.map(r => {
                const canAfford = userPoints >= r.cost;
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-card/40 border border-border/50 rounded-xl shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted/50 border border-border/40 flex items-center justify-center text-xl shadow-inner">
                        {r.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground leading-tight">{r.place}</h4>
                        <p className="text-[11px] text-emerald-500 dark:text-emerald-400 font-medium mt-0.5">{r.reward}</p>
                      </div>
                    </div>
                    <button 
                      disabled={!canAfford}
                      onClick={() => {
                        setUserPoints(p => p - r.cost);
                        toast.success(`¡Cupón para ${r.place} reclamado!`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black font-mono tracking-tight transition-all shadow-sm ${
                        canAfford 
                          ? 'bg-accent hover:bg-accent/90 text-accent-foreground active:scale-95 hover:shadow-md' 
                          : 'bg-muted/80 text-muted-foreground/60 border border-border/40 cursor-not-allowed'
                      }`}
                    >
                      {r.cost} PTS
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: RETO JUAN VALDEZ */}
      {view === 'cafe' && (
        <div className="p-4 flex-1 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="flex flex-col gap-4">
            <div className="border border-border/60 bg-card/40 rounded-2xl p-4 shadow-2xs">
              <span className="text-[9px] font-bold text-primary font-mono tracking-wider block mb-1">MISIÓN_FOTOGRÁFICA</span>
              <h3 className="text-sm font-extrabold text-foreground mb-1">Café con Historia</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dirígete al Juan Valdez del Sector Histórico, ordena tu bebida favorita y tómate una selfie dentro del establecimiento para acumular tus puntos de experiencia.
              </p>
            </div>

            <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-card/10">
              {cafePhotoTaken ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-foreground">¡Fotografía cargada y aprobada correctamente!</p>
                  <p className="text-[11px] text-muted-foreground font-mono">+250 PTS Agregados</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Camera className="h-8 w-8 text-muted-foreground/70" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Cámara del Dispositivo</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Captura tu foto interactiva aquí</p>
                  </div>
                  <button 
                    onClick={handleCafeChallenge}
                    className="mt-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm"
                  >
                    Simular Captura de Foto
                  </button>
                </div>
              )}
            </div>
          </div>

          <button onClick={() => setView('menu')} className="w-full py-3 bg-muted text-foreground text-xs font-bold rounded-xl font-mono uppercase tracking-wider">
            Volver al Panel
          </button>
        </div>
      )}

      {/* VISTA 3: RUTA DE LOS MUSEOS */}
      {view === 'museos' && (
        <div className="p-4 flex-1 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="flex flex-col gap-4">
            <div className="border border-border/60 bg-card/40 rounded-2xl p-4 shadow-2xs">
              <span className="text-[9px] font-bold text-accent font-mono tracking-wider block mb-1">MÓDULO_GEOPOSICIONADO_Y_MULTIMEDIA</span>
              <h3 className="text-sm font-extrabold text-foreground mb-1">Ruta del Conocimiento Colonial</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Esta ruta requiere doble validación: debes estar físicamente en la zona y capturar una obra específica dentro del establecimiento.
              </p>
            </div>

            {/* Paso 1: Geo */}
            <div className={`border p-4 rounded-xl flex items-center justify-between ${museumStep.geo ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-card/40 border-border/60'}`}>
              <div className="flex gap-3 items-center">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${museumStep.geo ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Paso 1: Presencia en el Museo</h4>
                  <p className="text-[11px] text-muted-foreground">Casa Museo Mosquera</p>
                </div>
              </div>
              {!museumStep.geo ? (
                <button onClick={handleMuseumGeo} className="px-2.5 py-1.5 bg-accent text-accent-foreground font-bold text-[10px] rounded-lg">
                  Validar GPS
                </button>
              ) : (
                <span className="text-[10px] text-emerald-500 font-mono font-bold">OK</span>
              )}
            </div>

            {/* Paso 2: Foto */}
            <div className={`border p-4 rounded-xl flex items-center justify-between ${museumStep.photo ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-card/40 border-border/60'} ${!museumStep.geo && 'opacity-50'}`}>
              <div className="flex gap-3 items-center">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${museumStep.photo ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Paso 2: Foto Específica</h4>
                  <p className="text-[11px] text-muted-foreground">Retrato al óleo del Sabio Caldas</p>
                </div>
              </div>
              {!museumStep.photo ? (
                <button onClick={handleMuseumPhoto} className="px-2.5 py-1.5 bg-primary text-primary-foreground font-bold text-[10px] rounded-lg">
                  Tomar Foto
                </button>
              ) : (
                <span className="text-[10px] text-emerald-500 font-mono font-bold">RETO OK (+400 PTS)</span>
              )}
            </div>
          </div>

          <button onClick={() => setView('menu')} className="w-full py-3 bg-muted text-foreground text-xs font-bold rounded-xl font-mono uppercase tracking-wider">
            Volver al Panel
          </button>
        </div>
      )}

      {/* VISTA 4: RUTA DE LAS IGLESIAS */}
      {view === 'iglesias' && (
        <div className="p-4 flex-1 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div className="flex flex-col gap-4">
            <div className="border border-border/60 bg-card/40 rounded-2xl p-4 shadow-2xs">
              <span className="text-[9px] font-bold text-primary font-mono tracking-wider block mb-1">RUTAS_DEL_PATRIMONIO</span>
              <h3 className="text-sm font-extrabold text-foreground mb-1">Ruta del Arte Sacro</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Explora la majestuosa arquitectura religiosa de la Ciudad Blanca. Visita el templo indicado y corrobora tu llegada.
              </p>
            </div>

            {/* Paso 1: Geo */}
            <div className={`border p-4 rounded-xl flex items-center justify-between ${churchStep.geo ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-card/40 border-border/60'}`}>
              <div className="flex gap-3 items-center">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${churchStep.geo ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Paso 1: Arribo al Templo</h4>
                  <p className="text-[11px] text-muted-foreground">Iglesia de San Francisco</p>
                </div>
              </div>
              {!churchStep.geo ? (
                <button onClick={handleChurchGeo} className="px-2.5 py-1.5 bg-accent text-accent-foreground font-bold text-[10px] rounded-lg">
                  Check-in GPS
                </button>
              ) : (
                <span className="text-[10px] text-emerald-500 font-mono font-bold">SITIO CONFIRMADO</span>
              )}
            </div>

            {/* Paso 2: Foto */}
            <div className={`border p-4 rounded-xl flex items-center justify-between ${churchStep.photo ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-card/40 border-border/60'} ${!churchStep.geo && 'opacity-50'}`}>
              <div className="flex gap-3 items-center">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${churchStep.photo ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Paso 2: Foto Arquitectónica</h4>
                  <p className="text-[11px] text-muted-foreground">Fachada principal o campanario</p>
                </div>
              </div>
              {!churchStep.photo ? (
                <button onClick={handleChurchPhoto} className="px-2.5 py-1.5 bg-primary text-primary-foreground font-bold text-[10px] rounded-lg">
                  Capturar Foto
                </button>
              ) : (
                <span className="text-[10px] text-emerald-500 font-mono font-bold">RETO OK (+450 PTS)</span>
              )}
            </div>
          </div>

          <button onClick={() => setView('menu')} className="w-full py-3 bg-muted text-foreground text-xs font-bold rounded-xl font-mono uppercase tracking-wider">
            Volver al Panel
          </button>
        </div>
      )}

      {/* FOOTER INFORMATIVO */}
      <footer className="sticky bottom-0 bg-background/90 border-t border-border/50 p-2.5 text-center text-[9px] text-muted-foreground/50 tracking-widest font-mono">
        SARA_ENGINE // ADAPTIVE GAMIFICATION ARCHITECTURE
      </footer>
    </div>
  );
}