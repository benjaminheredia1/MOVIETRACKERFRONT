import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { sendChatMessage } from "@/services/api";
import { generateSessionId } from "@/lib/helpers";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "¿Qué películas tengo pendientes?",
  "Recomiéndame algo basado en lo que he visto",
  "¿Cuáles son mis películas mejor calificadas?",
  "¿Qué series debería ver a continuación?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: Message = {
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage({
        session_id: sessionId,
        role: "user",
        content,
      });

      const botMsg: Message = {
        role: "assistant",
        content: res.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al enviar mensaje");
      const errorMsg: Message = {
        role: "assistant",
        content: "Lo siento, ocurrió un error al procesar tu mensaje. Intenta de nuevo.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    window.location.reload();
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" />
            Chat IA
          </h1>
          <p className="mt-1 text-muted-foreground">
            Pregunta sobre tu watchlist, obtén recomendaciones personalizadas
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleNewChat} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Nueva conversación
        </Button>
      </div>

      {/* Chat Area */}
      <Card className="flex flex-1 flex-col overflow-hidden border-0 bg-card shadow-sm">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Asistente de MovieTracker</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md text-center">
                Puedo ayudarte con información sobre tu watchlist, darte recomendaciones
                basadas en tus gustos, y más.
              </p>

              {/* Suggestions */}
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="rounded-lg border border-border/50 bg-background px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <MessageCircle className="mb-1 h-4 w-4 text-primary" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h1]:font-bold [&>h1]:my-2 [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:my-1.5 [&>h3]:text-sm [&>h3]:font-medium [&>h3]:my-1 [&>pre]:bg-background/50 [&>pre]:rounded-lg [&>pre]:p-2 [&>pre]:my-1 [&>code]:bg-background/50 [&>code]:px-1 [&>code]:rounded [&>blockquote]:border-l-2 [&>blockquote]:border-primary/50 [&>blockquote]:pl-3 [&>blockquote]:my-1 [&>blockquote]:italic [&_li]:my-0.5 [&_a]:text-primary [&_a]:underline">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                    <span
                      className={`mt-1 block text-[10px] ${
                        msg.role === "user"
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-secondary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Pensando...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border/50 p-4">
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
              disabled={loading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              size="icon"
              className="h-11 w-11 flex-shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground text-center">
            El agente usa IA con function calling para consultar tu watchlist en tiempo real
          </p>
        </div>
      </Card>
    </div>
  );
}
