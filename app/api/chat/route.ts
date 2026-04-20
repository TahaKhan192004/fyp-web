// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

function requireBaseUrl(envName: string) {
  const value = process.env[envName];
  if (!value || !value.trim()) throw new Error(`Missing ${envName} in environment`);
  return value;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("user_id");
  const conversationId = url.searchParams.get("conversation_id");

  let baseUrl: string;
  try {
    baseUrl = requireBaseUrl("FASTAPI_CHAT_BASE_URL");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Missing FASTAPI_CHAT_BASE_URL in environment" },
      { status: 500 }
    );
  }

  // — Branch 1: fetch all conversations for a user
  if (userId) {
    try {
      const endpoint = new URL(`/conversations/${encodeURIComponent(userId)}`, baseUrl).toString();
      const res = await fetch(endpoint);
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        return NextResponse.json(
          { error: "FastAPI conversations request failed", status: res.status, detail },
          { status: res.status }
        );
      }
      const data = await res.json();
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
    }
  }

  // — Branch 2: fetch messages for a specific conversation
  if (conversationId) {
    try {
      const endpoint = new URL(`/chat/${encodeURIComponent(conversationId)}`, baseUrl).toString();
      const res = await fetch(endpoint);
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        return NextResponse.json(
          { error: "FastAPI history request failed", status: res.status, detail },
          { status: res.status }
        );
      }
      const data = await res.json();
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
    }
  }

  // — Neither param provided
  return NextResponse.json(
    { error: "Provide either user_id or conversation_id as a query parameter" },
    { status: 400 }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const baseUrl = requireBaseUrl("FASTAPI_CHAT_BASE_URL");
    const endpoint = new URL("/chat-stream", baseUrl).toString();

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      throw new Error("FastAPI streaming request failed");
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        ...(res.headers.get("X-Conversation-Id")
          ? { "X-Conversation-Id": res.headers.get("X-Conversation-Id")! }
          : {}),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to chat" },
      { status: 500 }
    );
  }
}
