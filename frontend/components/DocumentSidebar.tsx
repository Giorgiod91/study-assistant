"use client";

import { useRef, useState } from "react";
import { Document, uploadDocument, deleteDocument } from "@/lib/api";

interface Props {
  documents: Document[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
}

export default function DocumentSidebar({ documents, selectedId, onSelect, onRefresh }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await uploadDocument(file);
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    await deleteDocument(id);
    onRefresh();
  }

  return (
    <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
          Dokumente
        </h2>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
        >
          {uploading ? (
            <>
              <span className="animate-spin">⟳</span> Verarbeite...
            </>
          ) : (
            <>
              <span>+</span> PDF hochladen
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.docx" className="hidden" onChange={handleUpload} />
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {documents.length === 0 ? (
          <p className="text-gray-500 text-xs text-center mt-8 px-4">
            Noch keine Dokumente. Lade eine PDF-Datei hoch.
          </p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer mb-1 transition-colors ${
                selectedId === doc.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg">📄</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doc.filename}</p>
                  <p className="text-xs opacity-60">{doc.chunks} Abschnitte</p>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(doc.id, e)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs ml-2 flex-shrink-0"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
