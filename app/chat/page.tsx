"use client";

import { useEffect, useState } from "react";
import ChatSidebar from "../components/ChatSideBar";
import ChatWindow from "../components/ChatWindow";
import { supabase } from "../lib/supabaseClient";

interface Conversation {
  id: string;
  mongo_conversation_id: string;
  title?: string;
}

export default function ChatPage() {
  const [userId, setUserId] = useState<string>("");
  const [selectedConversation, setSelectedConversation] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);

  // Mobile: track which panel is visible
  const [mobileView, setMobileView] = useState<"sidebar" | "chat">("sidebar");

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUserId(data.user.id);
    }
    fetchUser();
  }, []);

  const fetchConversations = async (uid: string) => {
    if (!uid) return;
    setLoadingConvs(true);
    try {
      const res = await fetch(`/api/chat?user_id=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (data.conversations) {
        setConversations(
          data.conversations.map((c: { conversation_id: string; title?: string }) => ({
            id: c.conversation_id,
            mongo_conversation_id: c.conversation_id,
            title: c.title,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    if (userId) fetchConversations(userId);
  }, [userId]);

  // Selecting a conversation OR clicking New Chat both open the chat panel on mobile
  const handleSelectConversation = async (mongoId: string) => {
    setSelectedConversation(mongoId);
    setMobileView("chat"); // always switch to chat on mobile

    if (mongoId) {
      setConversations((prev) => {
        if (prev.some((c) => c.mongo_conversation_id === mongoId)) return prev;
        return [{ id: mongoId, mongo_conversation_id: mongoId }, ...prev];
      });
    }
  };

  const handleNewConversation = async (mongoId: string) => {
    setSelectedConversation(mongoId);
    setMobileView("chat");
    await fetchConversations(userId);
  };

  // Back button in ChatWindow header returns to sidebar on mobile
  const handleBack = () => {
    setMobileView("sidebar");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#07080b] text-white">
      {/* Sidebar */}
      <div
        className={[
          "shrink-0 md:w-72",
          mobileView === "sidebar" ? "w-full block" : "hidden md:block",
        ].join(" ")}
      >
        <ChatSidebar
          onSelect={handleSelectConversation}
          userId={userId}
          conversations={conversations}
          loading={loadingConvs}
          selectedConversationId={selectedConversation}
        />
      </div>

      {/* Chat window */}
      <div
        className={[
          "flex-1 flex flex-col h-full overflow-hidden",
          mobileView === "chat" ? "flex w-full" : "hidden md:flex",
        ].join(" ")}
      >
        <ChatWindow
          userId={userId}
          conversationId={selectedConversation}
          onNewConversation={handleNewConversation}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
