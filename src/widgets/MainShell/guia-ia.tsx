import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, ChevronLeft, MapPin, User, BadgeCheck } from 'lucide-react';
import { ENV } from '@/shared/config/env';
import { useUserStore } from '@/features/auth';
import { AVATAR_IMAGE, AVATAR_NAME } from './types';

type Props = {
  onBack: () => void;
};

type ChatMode = 'ia' | 'local';
type Msg = { id: string; role: 'user' | 'assistant'; text: string };

// Local verificado con el que se conecta el "Modo local" (simulado, solo front).
const LOCAL_GUIDE = {
  name: 'Carlos Andrés',
  role: 'Payanés · Local verificado',
  emoji: '🧉',
};

const iaSuggestions = [
  '¿Qué lugares debo visitar en un día?',
  'Cuéntame sobre la Semana Santa',
  '¿Dónde comer comida típica?',
  'Arma una ruta por el centro histórico',
];

const localSuggestions = [
  '¿Dónde almuerzan los locales?',
  '¿Algún plan para esta noche?',
  '¿Me recomiendas un café tranquilo?',
  '¿Qué evita un turista por aquí?',
];

// Respuestas humanas simuladas del local
const localReplies = [
  '¡Hola! Claro que sí 😄 Te cuento desde la experiencia, no como un robot jaja.',
  'Uy, buena pregunta. Yo te llevaría primero por el Puente del Humilladero, es lo más bonito al atardecer.',
  'Si quieres comer rico y barato, vete a las empanadas de pipián cerca del parque, los turistas casi no las conocen.',
  'Tranqui, cualquier cosa me escribes y te voy guiando. ¿En qué zona estás ahorita?',
];

export default function GuiaIA({ onBack }: Props) {
  // El avatar elegido es la cara de la Guía IA con la que se chatea.
  const avatar = useUserStore((s) => s.avatar);
  const iaImage = (avatar && AVATAR_IMAGE[avatar]) || null;
  const iaName = (avatar && AVATAR_NAME[avatar]) || 'Guía IA';

  const [mode, setMode] = useState<ChatMode>('ia');
  const [input, setInput] = useState('');
  const [iaMessages, setIaMessages] = useState<Msg[]>([]);
  const [localMessages, setLocalMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const localReplyIdx = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = mode === 'ia' ? iaMessages : localMessages;
  const setMessages = mode === 'ia' ? setIaMessages : setLocalMessages;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, connecting]);

  // Al entrar a "Modo local" por primera vez: simula la conexión con la persona.
  useEffect(() => {
    if (mode !== 'local' || localMessages.length > 0 || connecting) return;
    setConnecting(true);
    const t = setTimeout(() => {
      setLocalMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: `¡Hola! Soy ${LOCAL_GUIDE.name}, vivo en Popayán. Pregúntame lo que quieras, te respondo yo en persona 🙌`,
        },
      ]);
      setConnecting(false);
    }, 1800);
    return () => clearTimeout(t);
  }, [mode, localMessages.length, connecting]);

  async function sendToIA(value: string) {
    setBusy(true);
    try {
      const res = await fetch(`${ENV.API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: value }),
      });
      if (!res.ok) throw new Error('sin backend');
      const data = await res.json();
      const reply = data.reply ?? data.text ?? 'No recibí respuesta.';
      setIaMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', text: reply }]);
    } catch {
      setIaMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: 'La Guía IA aún no tiene un backend conectado. Configura VITE_API_URL con un endpoint /api/chat para activar las respuestas reales.',
        },
      ]);
    } finally {
      setBusy(false);
    }
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
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'user', text: value }]);
    setInput('');
    if (mode === 'ia') sendToIA(value);
    else sendToLocal(value);
  }

  const isLocal = mode === 'local';
  const suggestions = isLocal ? localSuggestions : iaSuggestions;

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
          <>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-lg">
              {LOCAL_GUIDE.emoji}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <h1 className="flex items-center gap-1 font-heading text-lg font-bold leading-tight text-foreground">
                {LOCAL_GUIDE.name}
                <BadgeCheck className="h-4 w-4 text-secondary" />
              </h1>
              <p className="truncate text-xs text-emerald-600">
                {connecting ? 'Conectando…' : 'En línea · responde en persona'}
              </p>
            </div>
          </>
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
        {messages.length === 0 && !connecting ? (
          <div className="flex flex-col items-center gap-4 pt-6 text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
                isLocal ? 'bg-secondary/10' : 'bg-primary/10'
              }`}
            >
              {isLocal ? (
                LOCAL_GUIDE.emoji
              ) : iaImage ? (
                <img src={iaImage} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                <Sparkles className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">
                {isLocal ? `Habla con ${LOCAL_GUIDE.name}` : `¡Hola! Soy ${iaName}, tu guía IA`}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                {isLocal
                  ? 'Un payanés de verdad te resuelve dudas y te da recomendaciones desde la experiencia.'
                  : 'Pregúntame sobre lugares, rutas, historia o gastronomía de la Ciudad Blanca.'}
              </p>
            </div>
            <div className="mt-2 flex w-full flex-col gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className={`flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted ${
                    isLocal ? 'hover:border-secondary' : 'hover:border-primary'
                  }`}
                >
                  {isLocal ? (
                    <User className="h-4 w-4 shrink-0 text-secondary" />
                  ) : (
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  )}
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Aviso de conexión en modo local */}
            {isLocal && (
              <div className="mx-auto rounded-full bg-muted px-3 py-1 text-center text-[11px] font-medium text-muted-foreground">
                Estás chateando con una persona real, no con IA
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      isUser
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm bg-card text-card-foreground ring-1 ring-border'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

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
          placeholder={
            connecting
              ? `Conectando con ${LOCAL_GUIDE.name}…`
              : isLocal
                ? `Escríbele a ${LOCAL_GUIDE.name}…`
                : 'Escribe tu pregunta...'
          }
          disabled={connecting}
          className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy || connecting}
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
