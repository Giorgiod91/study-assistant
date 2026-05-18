const BASE_URL = "http://localhost:8000";

export interface Document {
  id: string;
  filename: string;
  chunks: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function uploadDocument(file: File): Promise<{ doc_id: string; filename: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Upload fehlgeschlagen");
  }
  return res.json();
}

export async function getDocuments(): Promise<Document[]> {
  const res = await fetch(`${BASE_URL}/documents`);
  const data = await res.json();
  return data.documents;
}

export async function sendMessage(question: string, doc_id?: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, doc_id }),
  });
  if (!res.ok) throw new Error("Antwort konnte nicht geladen werden");
  const data = await res.json();
  return data.answer;
}

export async function deleteDocument(doc_id: string): Promise<void> {
  await fetch(`${BASE_URL}/documents/${doc_id}`, { method: "DELETE" });
}
