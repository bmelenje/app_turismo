import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, ChevronLeft, MapPin, User, Users, BadgeCheck, Route as RouteIcon } from 'lucide-react';
import { ENV } from '@/shared/config/env';
import { askGuia, type ChatTurn } from '@/shared/api/groq';
import { useUserStore } from '@/features/auth';
import { AVATAR_IMAGE, AVATAR_NAME } from './types';

type Props = {
  onBack: () => void;
  /** Pide al mapa dibujar una ruta por estos POIs (en orden). */
  onDrawRoute?: (ids: string[]) => void;
};

type ChatMode = 'ia' | 'local';
type Msg = { id: string; role: 'user' | 'assistant'; text: string };

// Flujo del "Modo local": primero se piden preferencias, luego se "conecta"
// con un guía que las cumpla y recién ahí aparece su nombre y foto.
type LocalPhase = 'preference' | 'connecting' | 'connected';
type GenderPref = 'hombre' | 'mujer' | 'indiferente';

type LocalGuide = {
  name: string;
  role: string;
  emoji: string;
  /** Foto opcional; si no hay, se muestra el emoji en un círculo de color. */
  image?: string;
};

// Asistente genérico que recibe al turista ANTES de asignar un guía real.
const LOCAL_ASSISTANT = {
  title: 'Guía Local',
  subtitle: 'Asistente de guías locales',
};

// Pool de guías locales (simulado, solo front). Se asigna uno según la
// preferencia del turista. La guía mujer usa la foto real disponible;
// el resto cae a un avatar con emoji.
const GUIDES: Record<'hombre' | 'mujer', LocalGuide[]> = {
  mujer: [
    { name: 'María Fernanda', role: 'Payanesa · Local verificada', emoji: '👩🏽', image: '/images/avatar-maria.png' },
    { name: 'Valentina Ruiz', role: 'Payanesa · Local verificada', emoji: '👩🏻' },
  ],
  hombre: [
    { name: 'Carlos Andrés', role: 'Payanés · Local verificado', emoji: '🧉' },
    { name: 'Andrés Felipe', role: 'Payanés · Local verificado', emoji: '🧔🏽' },
  ],
};

// Pregunta inicial del asistente genérico.
const PREFERENCE_PROMPT =
  '¡Hola! Soy tu asistente de guías locales 🙌 Antes de conectarte con un payanés de verdad, cuéntame: ¿prefieres que tu guía sea hombre o mujer?';

const genderOptions: { value: GenderPref; label: string }[] = [
  { value: 'hombre', label: 'Prefiero un hombre' },
  { value: 'mujer', label: 'Prefiero una mujer' },
  { value: 'indiferente', label: 'Me es indiferente' },
];

// Ruta destacada que se puede dibujar en el mapa (todos estos POIs están en el mapa).
const FEATURED_ROUTE = {
  ids: ['catedral', 'museo', 'humilladero', 'lovepopayan'],
  label: 'Catedral → Museo Guillermo León Valencia → Puente del Humilladero → Letrero Popayán',
};

// Detecta si un texto propone la ruta destacada: requiere INTENCIÓN de ruta
// (recorrido a pie, itinerario, visitar varios lugares) Y ≥2 de sus 4 lugares.
// Así el botón NO aparece si solo preguntan por comida, precios u horarios.
function offersFeaturedRoute(text: string): boolean {
  const t = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  const hasRouteIntent =
    /\b(ruta|recorrido|recorrer|itinerario|caminata|caminar|a pie|tour|visitar)\b/.test(t);
  if (!hasRouteIntent) return false;

  const matchers = [
    (s: string) => s.includes('catedral'),
    (s: string) => s.includes('museo') || s.includes('guillermo'),
    (s: string) => s.includes('humilladero'),
    (s: string) => s.includes('letrero'),
  ];
  return matchers.filter((m) => m(t)).length >= 2;
}

const iaSuggestions = [
  '¿Qué lugares debo visitar en un día?',
  'Cuéntame sobre la Semana Santa',
  '¿Dónde comer comida típica?',
  'Arma una ruta por el centro histórico',
];

// Respuestas humanas simuladas del local (modo conectado).
// El primer mensaje, apenas el turista escribe, lo cita en el punto de
// atención al turista del Parque Caldas para guiarlo en persona.
const localReplies = [
  '¡Qué chévere que quieras un recorrido en persona! 🙌 Mira, para guiarte bien nos vemos en el Punto de Atención al Turista, que queda ahí mismo en el Parque Caldas, frente a la Torre del Reloj. Yo te espero ahí y arrancamos. ¿Te queda fácil llegar?',
  'De una, nos encontramos en el Punto de Atención al Turista del Parque Caldas y desde ahí te llevo. ¿A qué hora te acomoda?',
  'Listo, cuando llegues al Parque Caldas pregunta por el Punto de Atención al Turista, ahí estaré yo para acompañarte. Si te pierdes, me escribes.',
  'Tranqui, nos vemos en el Parque Caldas y yo me encargo del resto. ¡Te va a encantar la Ciudad Blanca! 😄',
];

export default function GuiaIA({ onBack, onDrawRoute }: Props) {
  // El avatar elegido es la cara de la Guía IA con la que se chatea.
  const avatar = useUserStore((s) => s.avatar);
  const iaImage = (avatar && AVATAR_IMAGE[avatar]) || null;
  const iaName = (avatar && AVATAR_NAME[avatar]) || 'Guía IA';

  const [mode, setMode] = useState<ChatMode>('ia');
  const [input, setInput] = useState('');
  const [iaMessages, setIaMessages] = useState<Msg[]>([]);
  const [localMessages, setLocalMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);

  // Estado del flujo de "Modo local".
  const [localPhase, setLocalPhase] = useState<LocalPhase>('preference');
  const [localGuide, setLocalGuide] = useState<LocalGuide | null>(null);

  const localReplyIdx = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = mode === 'ia' ? iaMessages : localMessages;
  const setMessages = mode === 'ia' ? setIaMessages : setLocalMessages;

  const isLocal = mode === 'local';
  const connecting = isLocal && localPhase === 'connecting';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, connecting]);

  // Al entrar a "Modo local" por primera vez: el asistente genérico saluda y
  // pregunta las preferencias (aún sin asignar un guía con nombre).
  useEffect(() => {
    if (mode !== 'local' || localMessages.length > 0) return;
    setLocalMessages([{ id: crypto.randomUUID(), role: 'assistant', text: PREFERENCE_PROMPT }]);
  }, [mode, localMessages.length]);

  async function sendToIA(value: string) {
    setBusy(true);
    try {
      // Historial completo (incluye el turno actual del usuario) para dar contexto.
      const history: ChatTurn[] = [
        ...iaMessages.map((m): ChatTurn => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          text: m.text,
        })),
        { role: 'user', text: value },
      ];
      const reply = await askGuia(history);
      setIaMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', text: reply }]);
    } catch (err) {
      const detail = err instanceof Error ? err.message : 'Error desconocido';
      setIaMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: `Ups, no pude conectarme con la IA en este momento. (${detail})`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  // El turista elige el género preferido del guía → el sistema "conecta" y
  // recién ahí revela el nombre y la foto del guía asignado, con un saludo.
  function choosePreference(pref: GenderPref) {
    if (localPhase !== 'preference' || busy || connecting) return;

    const userLabel =
      pref === 'hombre'
        ? 'Prefiero un guía hombre'
        : pref === 'mujer'
          ? 'Prefiero una guía mujer'
          : 'Me es indiferente';

    setLocalMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: 'user', text: userLabel },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: 'Perfecto, te voy a conectar con un guía local que se adapte a tus preferencias. Dame un segundo… 🔄',
      },
    ]);
    setLocalPhase('connecting');

    setTimeout(() => {
      const pool = pref === 'indiferente' ? [...GUIDES.hombre, ...GUIDES.mujer] : GUIDES[pref];
      const guide = pool[Math.floor(Math.random() * pool.length)];
      setLocalGuide(guide);
      setLocalPhase('connected');
      setLocalMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: `¡Hola! Soy ${guide.name} 🙌 Nací y crecí aquí en Popayán, así que conozco cada rincón de la Ciudad Blanca. Será un gusto enseñarte mi tierra. Cuéntame, ¿qué te gustaría conocer?`,
        },
      ]);
    }, 2200);
  }

  // Conversación con la persona local (simulada: responde con un pequeño delay humano).
  function sendToLocal(_value: string) {
    setBusy(true);
    const reply = localReplies[localReplyIdx.current % localReplies.length];
    localReplyIdx.current += 1;
    setTimeout(() => {
      setLocalMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', text: reply }]);
      setBusy(false);
    }, 1400);
  }

  function handleSend(text: string) {
    const value = text.trim();
    if (!value || busy || connecting) return;
    // En modo local solo se puede escribir cuando ya hay un guía conectado.
    if (isLocal && localPhase !== 'connected') return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'user', text: value }]);
    setInput('');
    if (mode === 'ia') sendToIA(value);
    else sendToLocal(value);
  }

  // ¿Mostrar la cabecera/identidad del guía real? Solo cuando ya está conectado.
  const showAssignedGuide = isLocal && localPhase === 'connected' && localGuide;

  const inputDisabled = connecting || (isLocal && localPhase !== 'connected');
  const inputPlaceholder = connecting
    ? 'Conectando con tu guía…'
    : isLocal
      ? localPhase === 'preference'
        ? 'Elige una opción de arriba…'
        : `Escríbele a ${localGuide?.name ?? 'tu guía'}…`
      : 'Escribe tu pregunta...';

  return (
    <div className="absolute inset-0 z-[1000] flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button
          onClick={onBack}
          className="rounded-lg p-1.5 text-foreground hover:bg-muted"
          aria-label="Volver al mapa"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {isLocal ? (
          showAssignedGuide ? (
            <>
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-secondary text-lg">
                {localGuide!.image ? (
                  <img src={localGuide!.image} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  localGuide!.emoji
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
              </div>
              <div className="min-w-0">
                <h1 className="flex items-center gap-1 font-heading text-lg font-bold leading-tight text-foreground">
                  {localGuide!.name}
                  <BadgeCheck className="h-4 w-4 text-secondary" />
                </h1>
                <p className="truncate text-xs text-emerald-600">En línea · responde en persona</p>
              </div>
            </>
          ) : (
            <>
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-heading text-lg font-bold leading-tight text-foreground">
                  {LOCAL_ASSISTANT.title}
                </h1>
                <p className="truncate text-xs text-muted-foreground">
                  {connecting ? 'Conectando con tu guía…' : LOCAL_ASSISTANT.subtitle}
                </p>
              </div>
            </>
          )
        ) : (
          <>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg">
              {iaImage ? (
                <img src={iaImage} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              )}
              {iaImage && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card bg-accent">
                  <Sparkles className="h-2.5 w-2.5 text-accent-foreground" />
                </span>
              )}
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold leading-tight text-foreground">
                {iaName}
              </h1>
              <p className="text-xs text-muted-foreground">Tu guía IA de {ENV.APP_CITY}</p>
            </div>
          </>
        )}

        {/* Selector de modo (esquina superior derecha) */}
        <div className="ml-auto flex shrink-0 rounded-full bg-muted p-0.5 text-xs font-semibold">
          <button
            onClick={() => setMode('ia')}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 transition-colors ${
              !isLocal ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
            }`}
            aria-pressed={!isLocal}
          >
            <Sparkles className="h-3.5 w-3.5" />
            IA
          </button>
          <button
            onClick={() => setMode('local')}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 transition-colors ${
              isLocal ? 'bg-secondary text-secondary-foreground shadow-sm' : 'text-muted-foreground'
            }`}
            aria-pressed={isLocal}
          >
            <User className="h-3.5 w-3.5" />
            Local
          </button>
        </div>
      </header>

      {/* Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {!isLocal && messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
              {iaImage ? (
                <img src={iaImage} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <Sparkles className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">
                ¡Hola! Soy {iaName}, tu guía IA
              </p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                Pregúntame sobre lugares, rutas, historia o gastronomía de la Ciudad Blanca.
              </p>
            </div>
            <div className="mt-2 flex w-full flex-col gap-2">
              {iaSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary hover:bg-muted"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Aviso de conexión en modo local: solo cuando ya hay guía real */}
            {showAssignedGuide && (
              <div className="mx-auto rounded-full bg-muted px-3 py-1 text-center text-[11px] font-medium text-muted-foreground">
                Estás chateando con una persona real, no con IA
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.role === 'user';
              // En modo IA, si la respuesta habla de la ruta destacada, ofrecemos dibujarla.
              const showRouteCta =
                !isUser && !isLocal && onDrawRoute && offersFeaturedRoute(m.text);
              return (
                <div
                  key={m.id}
                  className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      isUser
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm bg-card text-card-foreground ring-1 ring-border'
                    }`}
                  >
                    {m.text}
                  </div>

                  {showRouteCta && (
                    <button
                      onClick={() => onDrawRoute!(FEATURED_ROUTE.ids)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      <RouteIcon className="h-4 w-4" />
                      Ver esta ruta en el mapa
                    </button>
                  )}
                </div>
              );
            })}

            {/* Botonera de preferencias (solo modo local, fase inicial) */}
            {isLocal && localPhase === 'preference' && (
              <div className="mt-1 flex flex-col gap-2">
                {genderOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => choosePreference(opt.value)}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-secondary hover:bg-muted"
                  >
                    <User className="h-4 w-4 shrink-0 text-secondary" />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {(busy || connecting) && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-card px-3.5 py-3 ring-1 ring-border">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="flex items-center gap-2 border-t border-border bg-card px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputPlaceholder}
          disabled={inputDisabled}
          className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy || inputDisabled}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary-foreground transition-opacity disabled:opacity-40 ${
            isLocal ? 'bg-secondary' : 'bg-primary'
          }`}
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
