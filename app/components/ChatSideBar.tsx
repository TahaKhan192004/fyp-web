"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
    <div className="w-full md:w-72 border-r border-zinc-800 bg-[#0f0f10] flex flex-col h-screen shrink-0">
      {/* Header */}
      <div className="p-4 space-y-4">

        {/* Back button + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 transition-all"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          </button>
          <span className="text-[#facc15] font-accent text-lg font-bold tracking-tight">
            IntelliFone
          </span>
        </div>

        {/* New Chat */}
        <button
          className="w-full bg-[#facc15] hover:bg-[#eab308] text-black font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10"
          onClick={() => onSelect("")}
        >
          <span className="text-xl">+</span> New Chat
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest px-3 mb-2">
          History
        </p>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-zinc-600 border-t-[#facc15] rounded-full animate-spin" />
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <p className="text-zinc-600 text-sm text-center py-8">No conversations yet</p>
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
                className={`group p-3 rounded-xl cursor-pointer transition-all border ${
                  isActive
                    ? "bg-zinc-800 border-zinc-600"
                    : "border-transparent hover:bg-zinc-800/50 hover:border-zinc-700"
                }`}
                onClick={() => onSelect(conv.mongo_conversation_id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isActive ? "bg-[#facc15]" : "bg-zinc-600 group-hover:bg-[#facc15]"
                    }`}
                  />
                  <span
                    className={`text-sm truncate ${
                      isActive ? "text-white font-medium" : "text-zinc-300 group-hover:text-white"
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