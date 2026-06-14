import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, ChevronLeft, MapPin } from 'lucide-react';
import { ENV } from '@/shared/config/env';

type Props = {
  onBack: () => void;
};

type Msg = { id: string; role: 'user' | 'assistant'; text: string };

const suggestions = [
  '¿Qué lugares debo visitar en un día?',
  'Cuéntame sobre la Semana Santa',
  '¿Dónde comer comida típica?',
  'Arma una ruta por el centro histórico',
];

export default function GuiaIA({ onBack }: Props) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  async function handleSend(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'user', text: value }]);
    setInput('');
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
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', text: reply }]);
    } catch {
      setMessages((m) => [
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
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold leading-tight text-foreground">Guía IA</h1>
          <p className="text-xs text-muted-foreground">Tu asistente de {ENV.APP_CITY}</p>
        </div>
      </header>

      {/* Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-foreground">
                ¡Hola! Soy tu Guía IA
              </p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                Pregúntame sobre lugares, rutas, historia o gastronomía de la Ciudad Blanca.
              </p>
            </div>
            <div className="mt-2 flex w-full flex-col gap-2">
              {suggestions.map((s) => (
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
            {busy && (
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
          placeholder="Escribe tu pregunta..."
          className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={!input.trim() || busy}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
