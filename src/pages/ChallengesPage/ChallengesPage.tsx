import { useState } from 'react';
import { 
  ChevronLeft, Trophy, MapPin, Camera, 
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
  const [cafePhotoTaken, setCafePhotoTaken] = useState(false);

  // Inicialización segura de estados para evitar excepciones de renderizado
  const [museumStep, setMuseumStep] = useState<Record<string, { geo: boolean; photo: boolean }>>(() => 
    MUSEOS_LISTA.reduce((acc, m) => ({ ...acc, [m.id]: { geo: false, photo: false } }), {})
  );
  
  const [churchStep, setChurchStep] = useState<Record<string, { geo: boolean; photo: boolean }>>(() => 
    IGLESIAS_LISTA.reduce((acc, i) => ({ ...acc, [i.id]: { geo: false, photo: false } }), {})
  );

  const handleCafeChallenge = () => {
    setCafePhotoTaken(true);
    setUserPoints(prev => prev + 250);
    toast.success('¡Foto validada en Juan Valdez! +250 Puntos Patojos ☕', { id: 'cafe-success' });
  };

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
    if (!museumStep[museoId]?.geo) {
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
    if (!churchStep[iglesiaId]?.geo) {
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
    <div className="w-full flex flex-col bg-background text-foreground min-h-screen pb-24 font-sans">      
      {/* HEADER DE LA PÁGINA */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-card px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={view === 'menu' ? onBack : () => setView('menu')} 
            className="flex h-8 w-8 items-center justify-center border border-border text-foreground bg-background transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-foreground">
              {view === 'menu' && 'Central de Retos'}
              {view === 'cafe' && 'Desafío Juan Valdez'}
              {view === 'museos' && 'Ruta de los Museos'}
              {view === 'iglesias' && 'Ruta del Arte Sacro'}
            </h1>
            <p className="text-xs text-muted-foreground">Popayán Smart City</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border border-red-500/20 bg-red-500/5 px-3 py-1 rounded-sm">
          <Trophy className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs font-semibold text-red-500">{userPoints} PTS</span>
        </div>
      </header>

      {/* VISTA 1: MENÚ PRINCIPAL */}
      {view === 'menu' && (
        <div className="p-4 flex-1 flex flex-col gap-6">
          
          {/* TARJETA DE BIENVENIDA */}
          <div className="border border-red-500/20 bg-card relative overflow-hidden p-4">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-500 uppercase tracking-wider mb-2">
              <Flame className="h-4 w-4 text-red-500 fill-red-500/10" /> Racha de 3 días
            </div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Explora, compite e interactúa
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Completa misiones en el centro histórico para desbloquear beneficios fijos y recompensas en los principales puntos gastronómicos y culturales de la ciudad.
            </p>
          </div>

          {/* RETOS DISPONIBLES */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-0.5">
              <Star className="h-3.5 w-3.5 text-red-500" /> Misiones Disponibles
            </h3>
            
            {/* Reto 1: Juan Valdez */}
            <button onClick={() => setView('cafe')} className="group flex items-center justify-between p-3 bg-card border border-border transition-colors hover:border-red-500/30 text-left">
              <div className="flex gap-3 items-center">
                <div className={`h-8 w-8 flex items-center justify-center border ${cafePhotoTaken ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-background border-border group-hover:border-red-500/40'}`}>
                  {cafePhotoTaken ? <CheckCircle2 className="h-4 w-4" /> : <Camera className="h-4 w-4 text-red-500" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                    Momento Juan Valdez 
                    {cafePhotoTaken && <span className="text-xs text-emerald-500 font-normal lowercase">(completado)</span>}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Captura una foto con tu consumo y acumula experiencia.</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-red-500" />
            </button>

            {/* Reto 2: Ruta de los Museos */}
            <button onClick={() => setView('museos')} className="group flex items-center justify-between p-3 bg-card border border-border transition-colors hover:border-red-500/30 text-left">
              <div className="flex gap-3 items-center">
                <div className={`h-8 w-8 flex items-center justify-center border ${museumCompleted ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-background border-border group-hover:border-red-500/40'}`}>
                  {museumCompleted ? <CheckCircle2 className="h-4 w-4" /> : <MapPin className="h-4 w-4 text-red-500" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                    Ruta de los Museos 
                    {museumCompleted && <span className="text-xs text-emerald-500 font-normal lowercase">(completada)</span>}
                    {!museumCompleted && museumProgress > 0 && (
                      <span className="text-xs text-red-500 font-medium">({museumProgress}/{MUSEOS_LISTA.length})</span>
                    )}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Visita museos con geolocalización y misiones especiales.</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-red-500" />
            </button>

            {/* Reto 3: Ruta de las Iglesias */}
            <button onClick={() => setView('iglesias')} className="group flex items-center justify-between p-3 bg-card border border-border transition-colors hover:border-red-500/30 text-left">
              <div className="flex gap-3 items-center">
                <div className={`h-8 w-8 flex items-center justify-center border ${churchCompleted ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-background border-border group-hover:border-red-500/40'}`}>
                  {churchCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-red-500" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                    Ruta del Arte Sacro 
                    {churchCompleted && <span className="text-xs text-emerald-500 font-normal lowercase">(completada)</span>}
                    {!churchCompleted && churchProgress > 0 && (
                      <span className="text-xs text-red-500 font-medium">({churchProgress}/{IGLESIAS_LISTA.length})</span>
                    )}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Explora templos de la Ciudad Blanca con desafíos fotográficos.</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-red-500" />
            </button>
          </div>

          {/* RECOMPENSAS */}
          <div className="flex flex-col gap-2 mt-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-0.5">
              <Ticket className="h-3.5 w-3.5 text-red-500" /> Canjes Disponibles
            </h3>
            <div className="flex flex-col gap-2">
              {MOCK_REWARDS.map(r => {
                const canAfford = userPoints >= r.cost;
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted border border-border flex items-center justify-center text-base">
                        {r.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground leading-tight tracking-tight">{r.place}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{r.reward}</p>
                      </div>
                    </div>
                    <button 
                      disabled={!canAfford}
                      onClick={() => {
                        setUserPoints(p => p - r.cost);
                        toast.success(`¡Cupón para ${r.place} reclamado!`);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors border ${
                        canAfford 
                          ? 'bg-red-600 border-red-600 text-white hover:bg-red-700' 
                          : 'bg-muted text-muted-foreground/60 border-border cursor-not-allowed'
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
        <div className="p-4 flex-1 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="border border-border bg-card p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <span className="text-[10px] font-medium text-red-500 tracking-wider block mb-1 uppercase">Misión Fotográfica</span>
              <h3 className="text-base font-semibold text-foreground">Café con Historia</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Ubíquese en el establecimiento del Sector Histórico, interactúe con el entorno capturando una selfie para validar la experiencia.
              </p>
            </div>

            <div className="border border-border p-6 flex flex-col items-center justify-center text-center bg-card">
              {cafePhotoTaken ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground uppercase">Fotografía cargada exitosamente</p>
                  <p className="text-xs text-muted-foreground font-medium">+250 PTS Agregados</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Camera className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Interfaz de Cámara</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Capture el registro visual de la visita</p>
                  </div>
                  <button 
                    onClick={handleCafeChallenge}
                    className="mt-2 px-4 py-2 bg-red-600 text-white text-xs font-medium border border-red-600 hover:bg-red-700 transition-colors"
                  >
                    Simular Captura
                  </button>
                </div>
              )}
            </div>
          </div>

          <button onClick={() => setView('menu')} className="w-full py-2.5 bg-muted border border-border text-foreground text-xs font-medium uppercase tracking-wider">
            Volver al Panel
          </button>
        </div>
      )}

      {/* VISTA 3: RUTA DE LOS MUSEOS */}
      {view === 'museos' && (
        <div className="p-4 flex-1 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="border border-border bg-card p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <span className="text-[10px] font-medium text-red-500 tracking-wider block mb-1 uppercase">Módulo Geoposicionado</span>
              <h3 className="text-base font-semibold text-foreground">Ruta del Conocimiento</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Visite los museos del sector. Requiere la validación del sensor GPS del dispositivo. Los retos específicos otorgan puntajes adicionales.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted border border-border overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${(museumProgress / MUSEOS_LISTA.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-red-500 font-semibold">
                  {museumProgress}/{MUSEOS_LISTA.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {MUSEOS_LISTA.map((museo) => {
                const estado = museumStep[museo.id] || { geo: false, photo: false };
                const completado = museo.requierePhoto ? estado.photo : estado.geo;
                
                return (
                  <div 
                    key={museo.id} 
                    className={`border p-3 transition-colors ${
                      completado ? 'bg-emerald-500/[0.02] border-emerald-500/30' : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1.5 flex-wrap">
                          {museo.nombre}
                          {completado && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                          {museo.requierePhoto && (
                            <span className="text-[9px] font-semibold border border-red-500/20 bg-red-500/5 text-red-500 px-1.5 py-0.5 rounded-sm">
                              Especial
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {museo.requierePhoto ? `Reto: ${museo.reto}` : '📍 Registro por geoposición'}
                        </p>
                      </div>
                    </div>

                    {museo.requierePhoto ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMuseumGeo(museo.id, museo.nombre, museo.requierePhoto)}
                          disabled={estado.geo}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border text-xs font-medium transition-colors ${
                            estado.geo 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default' 
                              : 'bg-background border-border text-foreground hover:bg-muted hover:border-red-500/30'
                          }`}
                        >
                          <MapPin className={`h-3 w-3 ${!estado.geo && 'text-red-500'}`} />
                          {estado.geo ? 'GPS OK' : 'Validar GPS'}
                        </button>

                        <button
                          onClick={() => handleMuseumPhoto(museo.id, museo.reto)}
                          disabled={!estado.geo || estado.photo}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border text-xs font-medium transition-colors ${
                            estado.photo 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default' 
                              : !estado.geo
                                ? 'bg-muted text-muted-foreground/40 border-border cursor-not-allowed'
                                : 'bg-red-600 border-red-600 text-white hover:bg-red-700'
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
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border text-xs font-medium transition-colors ${
                          estado.geo 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default' 
                            : 'bg-background border-border text-foreground hover:bg-muted hover:border-red-500/30'
                        }`}
                      >
                        <MapPin className={`h-3 w-3 ${!estado.geo && 'text-red-500'}`} />
                        {estado.geo ? 'Check-in completo (+200 PTS)' : 'Validar ubicación (+200 PTS)'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => setView('menu')} className="w-full py-2.5 bg-muted border border-border text-foreground text-xs font-medium uppercase tracking-wider mt-4">
            Volver al Panel
          </button>
        </div>
      )}

      {/* VISTA 4: RUTA DE LAS IGLESIAS */}
      {view === 'iglesias' && (
        <div className="p-4 flex-1 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-4">
            <div className="border border-border bg-card p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <span className="text-[10px] font-medium text-red-500 tracking-wider block mb-1 uppercase">Patrimonio Religioso</span>
              <h3 className="text-base font-semibold text-foreground">Ruta del Arte Sacro</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Explore la arquitectura e historia de los templos locales. Cada punto dispone de un método de comprobación específico.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted border border-border overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${(churchProgress / IGLESIAS_LISTA.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-red-500 font-semibold">
                  {churchProgress}/{IGLESIAS_LISTA.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {IGLESIAS_LISTA.map((iglesia) => {
                const estado = churchStep[iglesia.id] || { geo: false, photo: false };
                const completado = iglesia.requierePhoto ? estado.photo : estado.geo;
                
                return (
                  <div 
                    key={iglesia.id} 
                    className={`border p-3 transition-colors ${
                      completado ? 'bg-emerald-500/[0.02] border-emerald-500/30' : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1.5 flex-wrap">
                          {iglesia.nombre}
                          {completado && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                          {iglesia.requierePhoto && (
                            <span className="text-[9px] font-semibold border border-red-500/20 bg-red-500/5 text-red-500 px-1.5 py-0.5 rounded-sm">
                              Especial
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {iglesia.requierePhoto ? `Reto: ${iglesia.reto}` : '📍 Registro por geoposición'}
                        </p>
                      </div>
                    </div>

                    {iglesia.requierePhoto ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleChurchGeo(iglesia.id, iglesia.nombre, iglesia.requierePhoto)}
                          disabled={estado.geo}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border text-xs font-medium transition-colors ${
                            estado.geo 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default' 
                              : 'bg-background border-border text-foreground hover:bg-muted hover:border-red-500/30'
                          }`}
                        >
                          <MapPin className={`h-3 w-3 ${!estado.geo && 'text-red-500'}`} />
                          {estado.geo ? 'GPS OK' : 'Check-in GPS'}
                        </button>

                        <button
                          onClick={() => handleChurchPhoto(iglesia.id, iglesia.reto)}
                          disabled={!estado.geo || estado.photo}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border text-xs font-medium transition-colors ${
                            estado.photo 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default' 
                              : !estado.geo
                                ? 'bg-muted text-muted-foreground/40 border-border cursor-not-allowed'
                                : 'bg-red-600 border-red-600 text-white hover:bg-red-700'
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
                        className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 border text-xs font-medium transition-colors ${
                          estado.geo 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default' 
                            : 'bg-background border-border text-foreground hover:bg-muted hover:border-red-500/30'
                        }`}
                      >
                        <MapPin className={`h-3 w-3 ${!estado.geo && 'text-red-500'}`} />
                        {estado.geo ? 'Check-in completo (+200 PTS)' : 'Hacer Check-in (+200 PTS)'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => setView('menu')} className="w-full py-2.5 bg-muted border border-border text-foreground text-xs font-medium uppercase tracking-wider mt-4">
            Volver al Panel
          </button>
        </div>
      )}
    </div>
  );
}