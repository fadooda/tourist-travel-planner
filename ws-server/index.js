import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 8080;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";

const wss = new WebSocketServer({ port: PORT, path: "/ws" });

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "chat:status", status: "idle" }));

  socket.on("message", async (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }

    if (msg.type !== "chat:user") return;

    const { messageId, text } = msg;
    socket.send(JSON.stringify({ type: "chat:status", status: "thinking" }));

    try {
      const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          stream: true,
          think: false,
          keep_alive: "10m",
          messages: [
            { role: "system", content: "You are Kudoo Assist. Be concise, helpful, and friendly." },
            { role: "user", content: text },
          ],
        }),
      });

      if (!res.ok || !res.body) {
        socket.send(JSON.stringify({ type: "chat:error", message: `Ollama error: ${res.status}` }));
        socket.send(JSON.stringify({ type: "chat:status", status: "idle" }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Ollama streams JSON lines separated by \n
        let nl;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;

          let chunk;
          try { chunk = JSON.parse(line); } catch { continue; }

          const delta = chunk?.message?.content ?? "";
          if (delta) {
            socket.send(JSON.stringify({ type: "chat:delta", messageId, delta }));
          }

          if (chunk?.done) {
            socket.send(JSON.stringify({ type: "chat:done", messageId }));
            socket.send(JSON.stringify({ type: "chat:status", status: "idle" }));
          }
        }
      }
    } catch (e) {
      socket.send(JSON.stringify({ type: "chat:error", message: e?.message || "Server error" }));
      socket.send(JSON.stringify({ type: "chat:status", status: "idle" }));
    }
  });
});

console.log(`WS listening on ws://localhost:${PORT}/ws (proxying Ollama model=${MODEL})`);
