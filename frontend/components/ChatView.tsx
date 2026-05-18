"use client";

import { useEffect, useRef, useState } from "react";
import { Document, ChatMessage, getDocuments, uploadDocument, deleteDocument, sendMessage } from "@/lib/api";

export default function ChatView() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    const d = await getDocuments().catch(() => []);
    setDocs(d);
    if (d.length > 0 && !selectedId) setSelectedId(d[0].id);
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadError("");
    try { await uploadDocument(file); await refresh(); }
    catch (err: unknown) { setUploadError(err instanceof Error ? err.message : "Fehler"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function handleDelete(id: string) {
    await deleteDocument(id).catch(() => {});
    if (selectedId === id) setSelectedId(null);
    await refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);
    try {
      const a = await sendMessage(q, selectedId ?? undefined);
      setMessages(prev => [...prev, { role: "assistant", content: a }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Fehler beim Laden der Antwort." }]);
    } finally { setLoading(false); }
  }

  const selectedDoc = docs.find(d => d.id === selectedId);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Document sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-800">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Dokumente</p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
          >
            {uploading ? "Verarbeite..." : "+ Hochladen"}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.docx" className="hidden" onChange={handleUpload} />
          {uploadError && <p className="text-red-400 text-xs mt-2">{uploadError}</p>}
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {docs.length === 0 ? (
            <p className="text-gray-600 text-xs text-center mt-6 px-3">Noch keine Dokumente — lade eine PDF, DOCX, TXT oder MD Datei hoch.</p>
          ) : docs.map(doc => (
            <div
              key={doc.id}
              onClick={() => setSelectedId(doc.id)}
              className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer mb-1 transition-colors ${selectedId === doc.id ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-800"}`}
            >
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">📄 {doc.filename}</p>
                <p className="text-xs opacity-50">{doc.chunks} Abschnitte</p>
              </div>
              <button onClick={e => { e.stopPropagation(); handleDelete(doc.id); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs ml-1 shrink-0">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-gray-950">
        <div className="border-b border-gray-800 px-6 py-4">
          <p className="text-white font-semibold text-sm">{selectedDoc ? selectedDoc.filename : "Kein Dokument gewählt"}</p>
          <p className="text-gray-500 text-xs">{selectedDoc ? "Stelle Fragen zu deinem Dokument" : "Wähle ein Dokument aus der linken Sidebar"}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
              <span className="text-5xl mb-3">🎓</span>
              <p className="text-gray-400 text-sm">{selectedDoc ? "Stell eine Frage zu deiner Vorlesung." : "Lade ein Dokument hoch."}</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-sm" : "bg-gray-800 text-gray-200 rounded-bl-sm"}`}>
                {msg.role === "assistant" && <p className="text-xs text-indigo-400 mb-1 font-medium">Study Assistant</p>}
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-800 px-6 py-4">
          <div className="flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder={selectedDoc ? "Stelle eine Frage..." : "Lade zuerst ein Dokument hoch"} disabled={!selectedDoc || loading} className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40" />
            <button type="submit" disabled={!input.trim() || !selectedDoc || loading} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors">Senden</button>
          </div>
        </form>
      </div>
    </div>
  );
}
