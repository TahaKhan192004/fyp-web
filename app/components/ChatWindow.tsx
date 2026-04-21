"use client";
import { useEffect, useState, useRef } from "react";
import MessageInput from "./MessageInput";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatWindow({ conversationId, userId, onNewConversation, onBack }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUp.current = distanceFromBottom > 100;
  };

  const scrollToBottom = (force = false) => {
    if (force || !userScrolledUp.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: force ? "smooth" : "instant" });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

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

        const rawMsgs =
          (data && Array.isArray(data.messages) && data.messages) ||
          (data && Array.isArray(data.history) && data.history) ||
          (Array.isArray(data) && data) ||
          [];

        const normalized = rawMsgs
          .map((m: any) => {
            const role = m?.role ?? m?.sender ?? m?.type ?? m?.message_type;
            const content = m?.content ?? m?.message ?? m?.text ?? m?.value;
            if (!role || content == null) return null;
            return { role: String(role), content: String(content) };
          })
          .filter(Boolean);

        setMessages(normalized as any[]);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
      userScrolledUp.current = false;
      setTimeout(() => scrollToBottom(true), 100);
    }
    fetchMessages();
  }, [conversationId]);

  const sendMessage = async (msg: string) => {
    if (!msg.trim()) return;

    userScrolledUp.current = false;
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setTimeout(() => scrollToBottom(true), 50);

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

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          fullReply += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: fullReply };
            return updated;
          });
        }
      }

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
      setIsStreaming(false);
    } catch (err) {
      console.error(err);
      setIsStreaming(false);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return updated;
      });
    }
  };

  const SUGGESTIONS = [
    "Best phone under Rs. 50,000?",
    "Compare iPhone vs Samsung",
    "Which phone has the best battery?",
    "Top cameras in 2024?",
  ];

  return (
    // height: 100dvh ensures it never exceeds the viewport on mobile too
    <div
      className="flex flex-col bg-[#09090b] text-zinc-100 overflow-hidden w-full"
      style={{ height: "100dvh" }}
    >
      {/* Header — shrink-0 so it never compresses */}
      <div className="shrink-0 h-16 border-b border-zinc-800 flex items-center px-4 md:px-8 bg-[#09090b]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 w-full">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-2 mr-1 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#facc15] to-[#f59e0b] flex items-center justify-center text-black font-bold text-sm shadow-lg">
            AI
          </div>
          <div>
            <p className="font-semibold text-zinc-100 leading-tight">IntelliFone AI</p>
            <p className="text-[11px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Message area
          - flex: "1 1 0" + minHeight: 0 forces flexbox to constrain this div's
            height so overflow-y-auto creates an internal scrollbar instead of
            letting the page/window scroll.
      */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:px-24 space-y-4"
        style={{ flex: "1 1 0", minHeight: 0 }}
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#facc15]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#facc15] to-[#f59e0b] flex items-center justify-center text-2xl font-bold text-black shadow-xl">
              AI
            </div>
            <div>
              <p className="text-lg font-semibold text-zinc-200 mb-1">
                Hello! I&apos;m IntelliFone AI
              </p>
              <p className="text-zinc-500 text-sm max-w-xs">
                Ask me about phone specs, prices, comparisons, or get personalised recommendations.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-2 text-xs rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-[#facc15] hover:text-[#facc15] transition-all"
                >
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
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#facc15] to-[#f59e0b] flex items-center justify-center text-xs font-bold text-black flex-shrink-0 mb-0.5">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isAssistant
                      ? "bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700"
                      : "bg-[#facc15] text-black font-medium rounded-tr-none"
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
                          <code className="bg-zinc-900 text-[#facc15] px-1.5 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-[#facc15] pl-3 text-zinc-400 italic">
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
                    <span className="inline-block w-[2px] h-[1em] bg-[#facc15] ml-0.5 align-middle animate-pulse" />
                  )}
                </div>

                {!isAssistant && (
                  <div className="w-7 h-7 rounded-lg bg-zinc-700 flex items-center justify-center text-xs flex-shrink-0 mb-0.5">
                    U
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar — shrink-0 so it never compresses */}
      <div className="shrink-0 p-4 md:p-6 lg:px-24 bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2 focus-within:border-[#facc15]/50 transition-all shadow-2xl">
          <MessageInput onSend={sendMessage} disabled={isStreaming} />
        </div>
        <p className="text-[10px] text-zinc-600 text-center mt-3 uppercase tracking-tighter">
          Powered by IntelliFone AI Engine
        </p>
      </div>
    </div>
  );
}