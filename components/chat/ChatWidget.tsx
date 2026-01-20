"use client";

import React, {useLayoutEffect, useEffect, useMemo, useRef, useState } from "react";

type Role = "user" | "assistant" | "system";
type ChatMsg = {
  id: string;
  role: Role;
  content: string;
  ts: number;
};

type WSIn =
  | { type: "chat:delta"; messageId: string; delta: string }
  | { type: "chat:done"; messageId: string }
  | { type: "chat:status"; status: "idle" | "thinking" }
  | { type: "chat:error"; message: string };

type WSOut =
  | { type: "chat:user"; conversationId: string; messageId: string; text: string; pageUrl?: string }
  | { type: "chat:ping" };

function uid(prefix = "m") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export default function ChatWidget() {
  const WS_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL; // e.g. wss://api.yourdomain.com/ws
  const conversationId = useMemo(() => {
    // stable per tab/session
    if (typeof window === "undefined") return "server";
    const k = "kudoo_conversation_id";
    const existing = window.sessionStorage.getItem(k);
    if (existing) return existing;
    const created = uid("c");
    window.sessionStorage.setItem(k, created);
    return created;
  }, []);

  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState(0);
  const openRef = useRef(open);
  const scrollPosRef = useRef(0);

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: uid("a"),
      role: "assistant",
      content:
        "Hi 👋 I’m your discover Egypt assistant. Ask me anything — I can stream answers in real-time.",
      ts: Date.now(),
    },
  ]);

  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const backoffRef = useRef(250); // ms
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  function scrollToBottom(behavior: ScrollBehavior = "auto") {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
}


  function safeCloseWS() {
    if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = null;

    try {
      wsRef.current?.close();
    } catch {}
    wsRef.current = null;
    setConnected(false);
    setThinking(false);
  }

  function scheduleReconnect() {
    if (!WS_URL) return;
    if (reconnectTimerRef.current) return;

    const delay = Math.min(backoffRef.current, 4000);
    reconnectTimerRef.current = window.setTimeout(() => {
      reconnectTimerRef.current = null;
      connectWS();
      backoffRef.current = Math.min(backoffRef.current * 1.5, 4000);
    }, delay);
  }

  function connectWS() {
    if (!WS_URL) return;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      backoffRef.current = 250;
    };

    ws.onclose = () => {
      setConnected(false);
      setThinking(false);
      // only reconnect if panel is open (you can change this to always reconnect)
      if (open) scheduleReconnect();
    };

    ws.onerror = () => {
      setConnected(false);
      setThinking(false);
      if (open) scheduleReconnect();
    };

    ws.onmessage = (evt) => {
      let data: WSIn | null = null;
      try {
        data = JSON.parse(evt.data);
      } catch {
        return;
      }
      if (!data) return;

      if (data.type === "chat:status") {
        setThinking(data.status === "thinking");
        return;
      }

      if (data.type === "chat:error") {
        setThinking(false);
        setMessages((prev) => [
          ...prev,
          { id: uid("e"), role: "assistant", content: `⚠️ ${data.message}`, ts: Date.now() },
        ]);
        scrollToBottom();
        return;
      }

      if (data.type === "chat:delta") {
        setMessages((prev) => {
          const idx = prev.findIndex((m) => m.id === data!.messageId);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { ...next[idx], content: next[idx].content + data!.delta };
          return next;
        });
        if (openRef.current) scrollToBottom("auto");
        return;
      }

      if (data.type === "chat:done") {
        setThinking(false);

        // only mark unread if chat was CLOSED at the moment the reply finished
        if (!openRef.current) setUnread((u) => u + 1);

        return;
      }

    };
  }

  // useEffect(() => {
  //   if (!open) return;

  //   requestAnimationFrame(() => {
  //     scrollerRef.current?.scrollTo({
  //       top: scrollPosRef.current,
  //       behavior: "auto",
  //     });
  //   });
  // }, [open]);


  // useEffect(() => {
  //   if (!open) return;

  //   requestAnimationFrame(() => {
  //     scrollerRef.current?.scrollTo({
  //       top: scrollPosRef.current,
  //       behavior: "auto",
  //     });
  //   });
  // }, [open]);

  useEffect(() => {
    if (!WS_URL) return;

    connectWS();

    // keepalive ping (helps prevent tunnels from dropping idle ws)
    const t = window.setInterval(() => {
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "chat:ping" }));
      }
    }, 25000);

    return () => {
      window.clearInterval(t);
      safeCloseWS();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [WS_URL]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useLayoutEffect(() => {
  if (!open) return;
  const el = scrollerRef.current;
  if (!el) return;

  // Start at bottom BEFORE paint (no “scrolling down” animation)
  el.scrollTop = el.scrollHeight;
}, [open]);


  // useEffect(() => {
  //   if (open) scrollToBottom();
  // }, [open]);

  function send() {
    const text = input.trim();
    if (!text) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setMessages((prev) => [
        ...prev,
        { id: uid("u"), role: "user", content: text, ts: Date.now() },
        { id: uid("a"), role: "assistant", content: "⚠️ Not connected yet. Try again in a second.", ts: Date.now() },
      ]);
      setInput("");
      scrollToBottom("auto");
      return;
    }

    const userMsg: ChatMsg = { id: uid("u"), role: "user", content: text, ts: Date.now() };
    const assistantMsgId = uid("a"); // this is what server will stream into

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantMsgId, role: "assistant", content: "", ts: Date.now() },
    ]);
    setInput("");
    setThinking(true);
    scrollToBottom();

    const payload: WSOut = {
      type: "chat:user",
      conversationId,
      messageId: assistantMsgId,
      text,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
    };

    ws.send(JSON.stringify(payload));
  }

  // Bubble + Panel sizing (10–20% screen from side, but never too small)
  const panelWidth = "w-[clamp(320px,20vw,440px)]";
  const showPing = unread > 0 && !open;

  return (
    <>
      {/* Floating Bubble (always visible) */}
      {/* Floating Launcher (visible when chat is closed) */}

      
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={[
            "fixed bottom-6 right-6 z-50",
            "flex items-center gap-2",
            "rounded-full shadow-lg",
            "px-4 py-3",
            "bg-[#F7F2A6] hover:brightness-95",
            open ? "hidden" : "flex",
            showPing ? "de-notify-ring" : "",
          ].join(" ")}
        >
        {/* online dot */}
        <span
          className={[
            "h-2.5 w-2.5 rounded-full",
            connected ? "bg-emerald-500" : "bg-slate-400",
          ].join(" ")}
          aria-hidden="true"
        />

        {/* pyramid */}
        <span className="text-[#6D1A6A]" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L2.5 20h19L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 3l4.5 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" opacity="0.55" />
          </svg>
        </span>

        {/* chat */}
        <span className="text-[#6D1A6A] text-xl leading-none" aria-hidden="true">
          💬
        </span>

        <span className="text-sm font-semibold text-[#3B1B3A] whitespace-nowrap hidden sm:inline">
          Talk to a Discover Egypt expert
        </span>
      </button>


      {/* Side Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={[
              panelWidth,
              "h-[75vh] min-h-[520px]",
              "rounded-2xl shadow-2xl overflow-hidden",
              "bg-white border border-slate-200",
              "flex flex-col",
            ].join(" ")}
            role="dialog"
            aria-label="Kudoo chat"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#6D1A6A] text-white">
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full",
                    connected ? "bg-emerald-400" : "bg-white/50",
                  ].join(" ")}
                />
                <div className="font-semibold">Discover Egypt Assist</div>
                <div className="text-xs text-white/80">
                  {connected ? "Online" : "Connecting…"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Minimize */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/15"
                  aria-label="Minimize"
                  title="Minimize"
                >
                  <span className="text-lg leading-none">–</span>
                </button>
                {/* Close (same as minimize; keep separate if you later want “clear chat”) */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/15"
                  aria-label="Close"
                  title="Close"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={[
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-[#1E3A8A] text-white rounded-br-md"
                        : "bg-white text-slate-900 border border-slate-200 rounded-bl-md",
                    ].join(" ")}
                  >
                    {m.content || (m.role === "assistant" ? <TypingDots /> : null)}
                  </div>
                </div>
              ))}

              {/* Thinking row + spinner */}
              {thinking && (
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <Spinner />
                  <span>Thinking…</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                    if (e.key === "Escape") setOpen(false);
                  }}
                  placeholder="Ask me something…"
                  className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#6D1A6A]/30"
                />
                <button
                  type="button"
                  onClick={send}
                  className="h-10 w-10 rounded-full bg-[#6D1A6A] text-white grid place-items-center hover:brightness-95 disabled:opacity-50"
                  disabled={!input.trim()}
                  aria-label="Send"
                >
                  ➤
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setMessages([
                      {
                        id: uid("a"),
                        role: "assistant",
                        content: "Chat cleared. How can I help?",
                        ts: Date.now(),
                      },
                    ]);
                  }}
                  className="underline hover:text-slate-700"
                >
                  Clear
                </button>
                <div className="flex gap-3">
                  <a className="underline hover:text-slate-700" href="/privacy">
                    Privacy Policy
                  </a>
                  <a className="underline hover:text-slate-700" href="/settings">
                    Settings
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Optional: click outside to close (tiny overlay) */}
          <button
            className="fixed inset-0 -z-10 cursor-default"
            aria-label="Close chat overlay"
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin"
      aria-hidden="true"
    />
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
    </span>
  );
}
