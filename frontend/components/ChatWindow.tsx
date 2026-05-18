"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage, sendMessage } from "@/lib/api";

interface Props {
  docId: string | null;
  docName: string | null;
}

export default function ChatWindow({ docId, docName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const answer = await sendMessage(question, docId ?? undefined);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Fehler beim Laden der Antwort. Ist das Backend erreichbar?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950">
      <div className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-white font-semibold">
          {docName ? `Chat mit: ${docName}` : "Study Assistant"}
        </h1>
        <p className="text-gray-500 text-sm">
          {docName ? "Stelle Fragen zu deinem Dokument" : "Lade zuerst ein PDF-Dokument hoch"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
            <span className="text-5xl mb-4">🎓</span>
            <p className="text-gray-400 text-sm">
              {docName
                ? "Stell eine Frage zu deiner Vorlesung oder deinem Skript."
                : "Lade ein Dokument in der Sidebar hoch."}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-800 text-gray-200 rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" && (
                <p className="text-xs text-indigo-400 mb-1 font-medium">Study Assistant</p>
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-800 px-6 py-4">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={docName ? "Stelle eine Frage..." : "Lade zuerst ein Dokument hoch"}
            disabled={!docName || loading}
            className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!input.trim() || !docName || loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors"
          >
            Senden
          </button>
        </div>
      </form>
    </div>
  );
}
