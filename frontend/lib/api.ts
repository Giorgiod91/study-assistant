const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export interface Document { id: string; filename: string; chunks: number }
export interface ChatMessage { role: "user" | "assistant"; content: string }
export interface Deadline { id: string; title: string; subject: string; due_date: string; priority: string; days_left: number }
export interface WeekDay { date: string; questions: number }
export interface Stats { total_questions: number; total_uploads: number; documents: number; streak: number; weekly_activity: WeekDay[] }
export interface Template { id: string; label: string }

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Fehler" }));
    throw new Error(err.detail ?? "Anfrage fehlgeschlagen");
  }
  return res.json();
}

export const getDocuments = () => req<{ documents: Document[] }>("/documents").then(r => r.documents);

export async function uploadDocument(file: File): Promise<{ doc_id: string; filename: string }> {
  const form = new FormData();
  form.append("file", file);
  return req("/upload", { method: "POST", body: form });
}

export const deleteDocument = (id: string) => req(`/documents/${id}`, { method: "DELETE" });

export async function sendMessage(question: string, doc_id?: string): Promise<string> {
  const data = await req<{ answer: string }>("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, doc_id }),
  });
  return data.answer;
}

export const getTemplates = () => req<{ templates: Template[] }>("/export/templates").then(r => r.templates);

export async function exportDocx(title: string, content: string, template: string): Promise<void> {
  const res = await fetch(`${BASE}/export/docx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, template }),
  });
  if (!res.ok) throw new Error("Export fehlgeschlagen");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = title.replace(/\s+/g, "_") + ".docx";
  a.click();
  URL.revokeObjectURL(url);
}

export const getDeadlines = () => req<{ deadlines: Deadline[] }>("/deadlines").then(r => r.deadlines);

export const addDeadline = (body: Omit<Deadline, "id" | "days_left">) =>
  req<Deadline>("/deadlines", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export const deleteDeadline = (id: string) => req(`/deadlines/${id}`, { method: "DELETE" });

export const getProgress = () => req<Stats>("/progress");
