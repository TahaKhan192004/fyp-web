"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, SendHorizonal, Sparkles } from "lucide-react";

interface MessageInputProps {
  onSend: (msg: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [msg, setMsg] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!msg.trim() || disabled) return;
    onSend(msg);
    setMsg("");
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }, [msg]);

  return (
    <div className="flex items-end gap-3">
      <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#f7f435]/25 bg-[#f7f435]/10 text-[#f7f435]">
        <Sparkles className="h-5 w-5" />
      </div>

      <textarea
        ref={textareaRef}
        rows={1}
        className="min-h-11 max-h-36 flex-1 resize-none bg-transparent px-1 py-3 text-[15px] leading-6 text-white outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask about prices, specs, comparisons..."
        disabled={disabled}
      />

      <button
        onClick={handleSend}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f7f435] text-black shadow-[0_14px_30px_rgba(247,244,53,0.16)] hover:bg-[#fffb4a] disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
        disabled={disabled || !msg.trim()}
        aria-label="Send message"
      >
        {disabled ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
      </button>
    </div>
  );
}
