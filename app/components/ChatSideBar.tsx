"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, MessageSquareText, Plus, Sparkles } from "lucide-react";

interface Conversation {
  id: string;
  mongo_conversation_id: string;
  title?: string;
}

interface ChatSidebarProps {
  onSelect: (conversationId: string) => void;
  userId: string;
  conversations: Conversation[];
  loading?: boolean;
  selectedConversationId?: string;
}

export default function ChatSidebar({
  onSelect,
  conversations,
  loading = false,
  selectedConversationId = "",
}: ChatSidebarProps) {
  const router = useRouter();

  return (
    <div className="flex h-screen w-full shrink-0 flex-col border-r border-white/10 bg-[#090a0d] md:w-80">
      {/* Header */}
      <div className="space-y-5 border-b border-white/10 p-4">

        {/* Back button + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="group flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] hover:border-[#f7f435]/35 hover:bg-[#f7f435]/10"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-[#f7f435]" />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f7f435] text-black">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <span className="block font-accent text-lg font-bold text-[#f7f435]">
                IntelliFone
              </span>
              <span className="block text-[11px] text-zinc-500">AI recommendation chat</span>
            </div>
          </div>
        </div>

        {/* New Chat */}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f7f435] px-4 py-3 font-bold text-black shadow-[0_16px_35px_rgba(247,244,53,0.14)] hover:bg-[#fffb4a]"
          onClick={() => onSelect("")}
        >
          <Plus className="h-5 w-5" /> New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        <div className="mb-2 flex items-center justify-between px-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <MessageSquareText className="h-3.5 w-3.5" />
            History
          </p>
          <Sparkles className="h-4 w-4 text-[#f7f435]/70" />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-[#f7f435]" />
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-center">
            <Bot className="mx-auto mb-3 h-7 w-7 text-zinc-600" />
            <p className="text-sm text-zinc-500">No conversations yet</p>
          </div>
        )}

        {!loading &&
          conversations.map((conv) => {
            const isActive = conv.mongo_conversation_id === selectedConversationId;
            const label =
              conv.title ||
              `Chat ${String(conv.mongo_conversation_id || conv.id).slice(0, 8)}`;

            return (
              <div
                key={conv.id}
                className={`group cursor-pointer rounded-xl border p-3 transition-all ${
                  isActive
                    ? "border-[#f7f435]/35 bg-[#f7f435]/10"
                    : "border-transparent bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.05]"
                }`}
                onClick={() => onSelect(conv.mongo_conversation_id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg ${
                      isActive ? "bg-[#f7f435] text-black" : "bg-white/5 text-zinc-500 group-hover:text-[#f7f435]"
                    }`}
                  >
                    <MessageSquareText className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-sm truncate ${
                      isActive ? "text-white font-semibold" : "text-zinc-300 group-hover:text-white"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
