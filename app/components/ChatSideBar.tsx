"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquareText, Plus, Search, Sparkles } from "lucide-react";
import BrandLogo from "./BrandLogo";

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
    <div className="flex h-screen w-full shrink-0 flex-col border-r border-white/10 bg-[#08090c] md:w-[360px]">
      {/* Header */}
      <div className="space-y-4 border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0))] p-5">

        {/* Back button + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="group flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-[#f7f435]/35 hover:bg-[#f7f435]/10"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-[#f7f435]" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <BrandLogo size={44} className="rounded-2xl shadow-[0_16px_36px_rgba(247,244,53,0.16)]" />
            <div className="min-w-0">
              <span className="block truncate font-accent text-xl font-bold leading-tight text-[#f7f435]">
                IntelliFone
              </span>
              <span className="block truncate text-xs text-zinc-500">AI recommendation chat</span>
            </div>
          </div>
        </div>

        {/* New Chat */}
        <button
          className="flex w-full items-center justify-between rounded-2xl border border-[#f7f435]/25 bg-[#f7f435]/10 px-4 py-3.5 text-left text-[#f7f435] shadow-[0_14px_34px_rgba(0,0,0,0.16)] hover:border-[#f7f435]/45 hover:bg-[#f7f435]/16"
          onClick={() => onSelect("")}
        >
          <span className="flex items-center gap-3 font-semibold text-white">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f7f435] text-black">
              <Plus className="h-5 w-5" />
            </span>
            New Chat
          </span>
          <Sparkles className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5 text-zinc-500">
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate text-sm">Recent recommendation chats</span>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            <MessageSquareText className="h-3.5 w-3.5" />
            History
          </p>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-zinc-500">
            {conversations.length}
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-[#f7f435]" />
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] px-5 py-10 text-center">
            <BrandLogo size={48} className="mx-auto mb-4 rounded-2xl opacity-55" />
            <p className="font-medium text-zinc-300">No conversations yet</p>
            <p className="mt-1 text-sm text-zinc-600">Start a new chat to get phone guidance.</p>
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
                className={`group relative cursor-pointer rounded-2xl border px-3.5 py-3.5 transition-all ${
                  isActive
                    ? "border-[#f7f435]/35 bg-[#f7f435]/10 shadow-[0_16px_34px_rgba(247,244,53,0.07)]"
                    : "border-white/[0.055] bg-white/[0.025] hover:border-white/12 hover:bg-white/[0.055]"
                }`}
                onClick={() => onSelect(conv.mongo_conversation_id)}
              >
                {isActive && (
                  <span className="absolute left-0 top-4 h-8 w-1 rounded-r-full bg-[#f7f435]" />
                )}
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl border ${
                      isActive
                        ? "border-[#f7f435]/30 bg-[#f7f435] text-black"
                        : "border-white/8 bg-white/[0.04] text-zinc-500 group-hover:text-[#f7f435]"
                    }`}
                  >
                    <MessageSquareText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm leading-5 ${
                        isActive ? "font-semibold text-white" : "font-medium text-zinc-300 group-hover:text-white"
                      }`}
                    >
                      {label}
                    </p>
                    <p className="truncate text-xs text-zinc-600">Recommendation thread</p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
