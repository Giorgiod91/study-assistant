"use client";

import { useEffect, useState } from "react";
import DocumentSidebar from "@/components/DocumentSidebar";
import ChatWindow from "@/components/ChatWindow";
import { Document, getDocuments } from "@/lib/api";

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function refresh() {
    const docs = await getDocuments();
    setDocuments(docs);
    if (docs.length > 0 && !selectedId) {
      setSelectedId(docs[0].id);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const selectedDoc = documents.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="flex h-screen bg-gray-950">
      <DocumentSidebar
        documents={documents}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRefresh={refresh}
      />
      <ChatWindow docId={selectedId} docName={selectedDoc?.filename ?? null} />
    </div>
  );
}
