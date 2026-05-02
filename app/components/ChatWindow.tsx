"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import MessageInput from "./MessageInput";
import { ArrowLeft, Cpu, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import BrandLogo from "./BrandLogo";

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatWindowProps {
  conversationId: string;
  userId: string;
  onNewConversation?: (conversationId: string) => void;
  onBack?: () => void;
}

function readString(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function normalizeMessage(message: unknown): ChatMessage | null {
  if (!message || typeof message !== "object") return null;

  const record = message as Record<string, unknown>;
  const role = readString(record.role ?? record.sender ?? record.type ?? record.message_type);
  const content = readString(record.content ?? record.message ?? record.text ?? record.value);

  if (!role || !content) return null;
  return { role, content };
}

export default function ChatWindow({
  conversationId,
  userId,
  onNewConversation,
  onBack,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // true  = user is at/near bottom → follow new content
  // false = user scrolled up      → leave them alone
  const isNearBottom = useRef(true);
  // Single pending RAF handle — prevents stacking scroll frames
  const rafRef = useRef<number | null>(null);

  /* ─── Track whether user is near bottom ─── */
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottom.current = dist < 100;
  }, []);

  /* ─── Schedule ONE scroll per animation frame ─── */
  const scheduleScroll = useCallback((force = false) => {
    if (!force && !isNearBottom.current) return; // scrolled up — do nothing
    if (rafRef.current !== null) return;          // already queued — skip
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    });
  }, []);

  /* ─── Auto-scroll whenever messages update (batched by React) ─── */
  useEffect(() => {
    scheduleScroll();
  }, [messages, scheduleScroll]);

  /* ─── Cleanup on unmount ─── */
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ─── Fetch history ─── */
  useEffect(() => {
    async function fetchMessages() {
      if (!conversationId) return setMessages([]);
      setLoading(true);
      try {
        const res = await fetch(`/api/chat?conversation_id=${encodeURIComponent(conversationId)}`);
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          console.error("Failed to fetch chat history:", data);
          setMessages([]);
          return;
        }

        const responseData = data as Record<string, unknown> | unknown[] | null;
        const rawMsgs =
          (!Array.isArray(responseData) &&
            responseData &&
            Array.isArray(responseData.messages) &&
            responseData.messages) ||
          (!Array.isArray(responseData) &&
            responseData &&
            Array.isArray(responseData.history) &&
            responseData.history) ||
          (Array.isArray(data) && data) ||
          [];

        const normalized = rawMsgs.flatMap((message) => {
          const normalizedMessage = normalizeMessage(message);
          return normalizedMessage ? [normalizedMessage] : [];
        });

        setMessages(normalized);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        isNearBottom.current = true;
        setTimeout(() => scheduleScroll(true), 120);
      }
    }
    fetchMessages();
  }, [conversationId, scheduleScroll]);

  /* ─── Send message ─── */
  const sendMessage = async (msg: string) => {
    if (!msg.trim()) return;

    // Force-follow when the user sends
    isNearBottom.current = true;
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setTimeout(() => scheduleScroll(true), 50);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    try {
      const isNewConversation = !conversationId;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          message: msg,
          conversation_id: conversationId || null,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = "";
      let done = false;

      // pendingFlush prevents stacking requestAnimationFrame setState calls
      // Only one flush is queued at a time; the while-loop keeps accumulating
      // into fullReply so no chunks are lost.
      let pendingFlush = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          fullReply += decoder.decode(value, { stream: true });

          if (!pendingFlush) {
            pendingFlush = true;
            requestAnimationFrame(() => {
              pendingFlush = false;
              // Capture fullReply in closure — always gets latest value
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullReply };
                return updated;
              });
              // scheduleScroll is triggered via the useEffect on messages
            });
          }
        }
      }

      // Final flush — ensures the last chunk is never dropped
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: fullReply };
        return updated;
      });

      if (isNewConversation && onNewConversation) {
        try {
          const { supabase } = await import("../lib/supabaseClient");
          const { data } = await supabase
            .from("conversations")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          if (data?.mongo_conversation_id) {
            onNewConversation(data.mongo_conversation_id);
          }
        } catch {
          /* non-fatal */
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const SUGGESTIONS = [
    "Best phone under Rs. 50,000?",
    "Compare iPhone vs Samsung",
    "Which phone has the best battery?",
    "Top cameras in 2024?",
  ];

  return (
    <div className="relative flex w-full flex-col overflow-hidden bg-[#07080b] text-zinc-100" style={{ height: "100dvh" }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(247,244,53,0.10),transparent_32%),radial-gradient(circle_at_88%_16%,rgba(14,165,233,0.10),transparent_28%)]" />
      {/* Header */}
      <div className="relative z-10 flex h-[72px] shrink-0 items-center border-b border-white/10 bg-[#07080b]/82 px-4 shadow-[0_16px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl md:px-8">
        <div className="flex items-center gap-3 w-full">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-2 mr-1 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <BrandLogo size={40} className="rounded-xl shadow-[0_16px_36px_rgba(247,244,53,0.18)]" />
          <div className="min-w-0">
            <p className="font-semibold text-zinc-100 leading-tight">IntelliFone AI</p>
            <p className="text-[11px] text-green-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
              Ready for recommendations
            </p>
          </div>
          <div className="ml-auto hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 sm:flex">
            <Cpu className="h-3.5 w-3.5 text-[#f7f435]" />
            Smart phone guide
          </div>
        </div>
      </div>

      {/* Message area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative z-10 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:px-24 space-y-5"
        style={{ flex: "1 1 0", minHeight: 0 }}
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f7f435]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-6 text-center">
            <BrandLogo size={80} className="rounded-3xl shadow-[0_22px_55px_rgba(247,244,53,0.18)]" />
            <div>
              <p className="mb-2 font-display text-2xl font-bold text-white">
                Hello! I&apos;m IntelliFone AI
              </p>
              <p className="mx-auto max-w-md text-sm leading-6 text-zinc-400">
                Ask me about phone specs, prices, comparisons, or get personalised recommendations.
              </p>
            </div>
            <div className="flex max-w-xl flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300 shadow-sm hover:border-[#f7f435]/45 hover:bg-[#f7f435]/10 hover:text-[#f7f435]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, idx) => {
            const isLastAssistant =
              isStreaming && idx === messages.length - 1 && m.role === "assistant";
            const isAssistant = m.role === "assistant";
            return (
              <div
                key={idx}
                className={`flex items-end gap-2 ${isAssistant ? "justify-start" : "justify-end"}`}
              >
                {isAssistant && (
                  <BrandLogo size={32} className="mb-0.5 rounded-xl" />
                )}

                <div
                  className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed shadow-[0_14px_32px_rgba(0,0,0,0.18)] md:max-w-[72%] ${
                    isAssistant
                      ? "rounded-2xl rounded-tl-md border border-white/10 bg-[#111318]/92 text-zinc-100"
                      : "rounded-2xl rounded-tr-md bg-[#f7f435] text-black font-medium"
                  }`}
                >
                  {isAssistant ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="text-white font-semibold">{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-1 mb-2 text-zinc-300">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-1 mb-2 text-zinc-300">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-zinc-300">{children}</li>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-lg font-bold text-white mb-2">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-base font-bold text-white mb-2">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm font-bold text-white mb-1">{children}</h3>
                        ),
                        code: ({ children }) => (
                          <code className="bg-zinc-950 text-[#f7f435] px-1.5 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-[#f7f435] pl-3 text-zinc-400 italic">
                            {children}
                          </blockquote>
                        ),
                        hr: () => <hr className="border-zinc-700 my-2" />,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    m.content || "\u00a0"
                  )}
                  {isLastAssistant && (
                    <span className="inline-block w-[2px] h-[1em] bg-[#f7f435] ml-0.5 align-middle animate-pulse" />
                  )}
                </div>

                {!isAssistant && (
                  <div className="mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs text-zinc-200">
                    U
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="relative z-10 shrink-0 bg-gradient-to-t from-[#07080b] via-[#07080b]/96 to-transparent p-4 md:p-6 lg:px-24">
        <div className="rounded-2xl border border-white/10 bg-[#101217]/92 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl transition-all focus-within:border-[#f7f435]/55 focus-within:shadow-[0_26px_80px_rgba(247,244,53,0.10)]">
          <MessageInput onSend={sendMessage} disabled={isStreaming} />
        </div>
        <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-zinc-600">
          Powered by IntelliFone AI Engine
        </p>
      </div>
    </div>
  );
}
