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

const MUSEOS_LISTA = [
  { id: 'mosquera', nombre: 'Casa Museo Mosquera', reto: 'Retrato al óleo del Sabio Caldas', requierePhoto: true },
  { id: 'negret', nombre: 'Museo Negret', reto: 'Escultura geométrica', requierePhoto: false },
  { id: 'valencia', nombre: 'Museo Guillermo Valencia', reto: 'Silla del Poeta', requierePhoto: false },
  { id: 'natural', nombre: 'Museo de Historia Natural', reto: 'Esqueleto prehistórico', requierePhoto: false },
  { id: 'mampo', nombre: 'MAMPO - Arte Moderno', reto: 'Obra contemporánea', requierePhoto: false },
  { id: 'arquidiocesano', nombre: 'Museo Arquidiocesano', reto: 'Cáliz colonial', requierePhoto: false }
];

const IGLESIAS_LISTA = [
  { id: 'sanfrancisco', nombre: 'Templo de San Francisco', reto: 'Fachada principal o campanario', requierePhoto: true },
  { id: 'catedral', nombre: 'Catedral Basílica', reto: 'Cúpula central', requierePhoto: false },
  { id: 'santodomingo', nombre: 'Iglesia de Santo Domingo', reto: 'Altar mayor', requierePhoto: false },
  { id: 'sanagustin', nombre: 'Iglesia de San Agustín', reto: 'Pinturas coloniales', requierePhoto: false },
  { id: 'ermita', nombre: 'La Ermita', reto: 'Arquitectura colonial', requierePhoto: false },
  { id: 'belen', nombre: 'Capilla de Belén', reto: 'Mirador panorámico', requierePhoto: false }
];

export function ChallengesPage({ onBack }: ChallengesPageProps) {
  const [view, setView] = useState<'menu' | 'cafe' | 'museos' | 'iglesias'>('menu');
  const [userPoints, setUserPoints] = useState(650);
  
  // Estado del reto del café
  const [cafePhotoTaken, setCafePhotoTaken] = useState(false);

  // Estados para museos e iglesias (uno por cada elemento)
  const [museumStep, setMuseumStep] = useState<Record<string, { geo: boolean; photo: boolean }>>(
    MUSEOS_LISTA.reduce((acc, m) => ({ ...acc, [m.id]: { geo: false, photo: false } }), {})
  );
  
  const [churchStep, setChurchStep] = useState<Record<string, { geo: boolean; photo: boolean }>>(
    IGLESIAS_LISTA.reduce((acc, i) => ({ ...acc, [i.id]: { geo: false, photo: false } }), {})
  );

  // 1. Simulación Reto Juan Valdez
  const handleCafeChallenge = () => {
    setCafePhotoTaken(true);
    setUserPoints(prev => prev + 250);
    toast.success('¡Foto validada en Juan Valdez! +250 Puntos Patojos ☕', { id: 'cafe-success' });
  };

  // 2. Simulación Ruta de los Museos
  const handleMuseumGeo = (museoId: string, museoNombre: string, requierePhoto: boolean) => {
    setMuseumStep(prev => ({ 
      ...prev, 
      [museoId]: { ...prev[museoId], geo: true } 
    }));
    
    if (!requierePhoto) {
      setUserPoints(prev => prev + 200);
      toast.success(`📍 ¡Check-in en ${museoNombre}! +200 Puntos Patojos`);
    } else {
      toast.success(`📍 Ubicación confirmada: ${museoNombre}.`);
    }
  };

  const handleMuseumPhoto = (museoId: string, reto: string) => {
    if (!museumStep[museoId].geo) {
      toast.error('Primero debes verificar tu geolocalización en el museo.');
      return;
    }
    setMuseumStep(prev => ({ 
      ...prev, 
      [museoId]: { ...prev[museoId], photo: true } 
    }));
    setUserPoints(prev => prev + 400);
    toast.success(`📸 ¡Foto validada: ${reto}! +400 Puntos Patojos 🖼️`);
  };

  // 3. Simulación Ruta de las Iglesias
  const handleChurchGeo = (iglesiaId: string, iglesiaNombre: string, requierePhoto: boolean) => {
    setChurchStep(prev => ({ 
      ...prev, 
      [iglesiaId]: { ...prev[iglesiaId], geo: true } 
    }));
    
    if (!requierePhoto) {
      setUserPoints(prev => prev + 200);
      toast.success(`📍 ¡Check-in en ${iglesiaNombre}! +200 Puntos Patojos ⛪`);
    } else {
      toast.success(`📍 Ubicación confirmada: ${iglesiaNombre}.`);
    }
  };

  const handleChurchPhoto = (iglesiaId: string, reto: string) => {
    if (!churchStep[iglesiaId].geo) {
      toast.error('Primero debes verificar tu geolocalización en la iglesia.');
      return;
    }
    setChurchStep(prev => ({ 
      ...prev, 
      [iglesiaId]: { ...prev[iglesiaId], photo: true } 
    }));
    setUserPoints(prev => prev + 450);
    toast.success(`📸 ¡Foto aprobada: ${reto}! +450 Puntos Patojos ⛪`);
  };

  // Helpers para calcular progreso
  const museumCompleted = MUSEOS_LISTA.every(m => 
    m.requierePhoto ? museumStep[m.id]?.photo : museumStep[m.id]?.geo
  );
  const museumProgress = MUSEOS_LISTA.filter(m => 
    m.requierePhoto ? museumStep[m.id]?.photo : museumStep[m.id]?.geo
  ).length;

  const churchCompleted = IGLESIAS_LISTA.every(i => 
    i.requierePhoto ? churchStep[i.id]?.photo : churchStep[i.id]?.geo
  );
  const churchProgress = IGLESIAS_LISTA.filter(i => 
    i.requierePhoto ? churchStep[i.id]?.photo : churchStep[i.id]?.geo
  ).length;

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
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${museumCompleted ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-accent/10 text-accent border border-accent/20'}`}>
                  {museumCompleted ? <CheckCircle2 className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    Ruta de los Museos 
                    {museumCompleted && <span className="text-[9px] text-emerald-500 font-mono">(Completada)</span>}
                    {!museumCompleted && museumProgress > 0 && (
                      <span className="text-[9px] text-accent font-mono">({museumProgress}/{MUSEOS_LISTA.length})</span>
                    )}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Visita museos con check-in GPS y retos especiales.</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Reto 3: Ruta de las Iglesias */}
            <button onClick={() => setView('iglesias')} className="group flex items-center justify-between p-3.5 bg-card/60 border border-border/60 rounded-2xl hover:bg-card hover:border-border hover:-translate-y-0.5 active:scale-[0.99] transition-all text-left shadow-xs">
              <div className="flex gap-3 items-center">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${churchCompleted ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                  {churchCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    Ruta del Arte Sacro 
                    {churchCompleted && <span className="text-[9px] text-emerald-500 font-mono">(Completada)</span>}
                    {!churchCompleted && churchProgress > 0 && (
                      <span className="text-[9px] text-accent font-mono">({churchProgress}/{IGLESIAS_LISTA.length})</span>
                    )}
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
                Visita cada museo del centro histórico. La mayoría solo requiere validar tu ubicación. Algunos museos especiales tienen un reto fotográfico con puntos extra.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent transition-all duration-500"
                    style={{ width: `${(museumProgress / MUSEOS_LISTA.length) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {museumProgress}/{MUSEOS_LISTA.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {MUSEOS_LISTA.map((museo) => {
                const estado = museumStep[museo.id];
                const completado = museo.requierePhoto ? estado.photo : estado.geo;
                
                return (
                  <div 
                    key={museo.id} 
                    className={`border rounded-2xl p-3.5 transition-all ${
                      completado 
                        ? 'bg-emerald-500/5 border-emerald-500/30' 
                        : 'bg-card/40 border-border/60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                          {museo.nombre}
                          {completado && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                          {museo.requierePhoto && (
                            <span className="text-[8px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              Reto Premium
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {museo.requierePhoto ? `🎯 ${museo.reto}` : '📍 Visita para ganar puntos'}
                        </p>
                      </div>
                    </div>

                    {museo.requierePhoto ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMuseumGeo(museo.id, museo.nombre, museo.requierePhoto)}
                          disabled={estado.geo}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                            estado.geo 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                              : 'bg-accent text-accent-foreground active:scale-95 hover:bg-accent/90'
                          }`}
                        >
                          <MapPin className="h-3 w-3" />
                          {estado.geo ? 'GPS OK' : 'Validar GPS'}
                        </button>

                        <button
                          onClick={() => handleMuseumPhoto(museo.id, museo.reto)}
                          disabled={!estado.geo || estado.photo}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                            estado.photo 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                              : !estado.geo
                                ? 'bg-muted text-muted-foreground/50 cursor-not-allowed'
                                : 'bg-primary text-primary-foreground active:scale-95 hover:bg-primary/90'
                          }`}
                        >
                          <Camera className="h-3 w-3" />
                          {estado.photo ? '+400 PTS' : 'Tomar Foto'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMuseumGeo(museo.id, museo.nombre, museo.requierePhoto)}
                        disabled={estado.geo}
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                          estado.geo 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                            : 'bg-accent text-accent-foreground active:scale-95 hover:bg-accent/90'
                        }`}
                      >
                        <MapPin className="h-3 w-3" />
                        {estado.geo ? 'CHECK-IN COMPLETO (+200 PTS)' : 'Validar GPS (+200 PTS)'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => setView('menu')} className="w-full py-3 bg-muted text-foreground text-xs font-bold rounded-xl font-mono uppercase tracking-wider mt-4">
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
                Explora la majestuosa arquitectura religiosa de la Ciudad Blanca. Cada iglesia tiene su propio reto de validación.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(churchProgress / IGLESIAS_LISTA.length) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {churchProgress}/{IGLESIAS_LISTA.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {IGLESIAS_LISTA.map((iglesia) => {
                const estado = churchStep[iglesia.id];
                const completado = iglesia.requierePhoto ? estado.photo : estado.geo;
                
                return (
                  <div 
                    key={iglesia.id} 
                    className={`border rounded-2xl p-3.5 transition-all ${
                      completado 
                        ? 'bg-emerald-500/5 border-emerald-500/30' 
                        : 'bg-card/40 border-border/60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                          {iglesia.nombre}
                          {completado && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                          {iglesia.requierePhoto && (
                            <span className="text-[8px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              Reto Premium
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {iglesia.requierePhoto ? `🎯 ${iglesia.reto}` : '📍 Visita para ganar puntos'}
                        </p>
                      </div>
                    </div>

                    {iglesia.requierePhoto ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleChurchGeo(iglesia.id, iglesia.nombre, iglesia.requierePhoto)}
                          disabled={estado.geo}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                            estado.geo 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                              : 'bg-accent text-accent-foreground active:scale-95 hover:bg-accent/90'
                          }`}
                        >
                          <MapPin className="h-3 w-3" />
                          {estado.geo ? 'GPS OK' : 'Check-in GPS'}
                        </button>

                        <button
                          onClick={() => handleChurchPhoto(iglesia.id, iglesia.reto)}
                          disabled={!estado.geo || estado.photo}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                            estado.photo 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                              : !estado.geo
                                ? 'bg-muted text-muted-foreground/50 cursor-not-allowed'
                                : 'bg-primary text-primary-foreground active:scale-95 hover:bg-primary/90'
                          }`}
                        >
                          <Camera className="h-3 w-3" />
                          {estado.photo ? '+450 PTS' : 'Capturar Foto'}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleChurchGeo(iglesia.id, iglesia.nombre, iglesia.requierePhoto)}
                        disabled={estado.geo}
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${
                          estado.geo 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default' 
                            : 'bg-accent text-accent-foreground active:scale-95 hover:bg-accent/90'
                        }`}
                      >
                        <MapPin className="h-3 w-3" />
                        {estado.geo ? 'CHECK-IN COMPLETO (+200 PTS)' : 'Hacer Check-in (+200 PTS)'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => setView('menu')} className="w-full py-3 bg-muted text-foreground text-xs font-bold rounded-xl font-mono uppercase tracking-wider mt-4">
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