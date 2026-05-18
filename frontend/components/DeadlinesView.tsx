"use client";

import { useEffect, useState } from "react";
import { Deadline, getDeadlines, addDeadline, deleteDeadline } from "@/lib/api";

function urgencyBadge(days: number) {
  if (days < 0) return { bg: "bg-red-500/20 text-red-400 border-red-500/30", label: "Überfällig" };
  if (days === 0) return { bg: "bg-red-500/20 text-red-400 border-red-500/30", label: "Heute!" };
  if (days <= 3) return { bg: "bg-orange-500/20 text-orange-400 border-orange-500/30", label: `${days}d` };
  if (days <= 7) return { bg: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", label: `${days}d` };
  return { bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: `${days}d` };
}

function priorityDot(priority: string) {
  return { high: "bg-red-500", medium: "bg-yellow-500", low: "bg-emerald-500" }[priority] ?? "bg-gray-500";
}

export default function DeadlinesView() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [form, setForm] = useState({ title: "", subject: "", due_date: "", priority: "medium" });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    const d = await getDeadlines().catch(() => []);
    setDeadlines(d);
  }

  useEffect(() => { refresh(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.subject || !form.due_date) { setError("Alle Felder ausfüllen."); return; }
    setAdding(true); setError("");
    try {
      await addDeadline(form);
      setForm({ title: "", subject: "", due_date: "", priority: "medium" });
      await refresh();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Fehler"); }
    finally { setAdding(false); }
  }

  async function handleDelete(id: string) {
    await deleteDeadline(id).catch(() => {});
    await refresh();
  }

  const upcoming = deadlines.filter(d => d.days_left >= 0);
  const overdue = deadlines.filter(d => d.days_left < 0);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-950">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Abgabetermine</h1>
          <p className="text-gray-400 text-sm mt-1">Behalte deine Deadlines im Blick.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add form */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Neuen Termin eintragen</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Titel der Abgabe</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="z.B. Hausarbeit Algorithmen" className="w-full bg-gray-800 text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Fach / Modul</label>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="z.B. Informatik 3" className="w-full bg-gray-800 text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Fällig am</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Priorität</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="low">Niedrig</option>
                    <option value="medium">Mittel</option>
                    <option value="high">Hoch</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={adding} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                {adding ? "Speichern..." : "+ Termin hinzufügen"}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="space-y-4">
            {overdue.length > 0 && (
              <div>
                <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">Überfällig</p>
                {overdue.map(d => <DeadlineCard key={d.id} d={d} onDelete={handleDelete} />)}
              </div>
            )}
            {upcoming.length === 0 && overdue.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                <p className="text-5xl mb-3">🎉</p>
                <p className="text-gray-400 text-sm">Keine Termine — trag deine erste Abgabe ein!</p>
              </div>
            ) : (
              <>
                {upcoming.length > 0 && <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Anstehend</p>}
                {upcoming.map(d => <DeadlineCard key={d.id} d={d} onDelete={handleDelete} />)}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeadlineCard({ d, onDelete }: { d: Deadline; onDelete: (id: string) => void }) {
  const badge = urgencyBadge(d.days_left);
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${priorityDot(d.priority)} shrink-0`} />
        <div>
          <p className="text-white text-sm font-medium">{d.title}</p>
          <p className="text-gray-500 text-xs">{d.subject} · {new Date(d.due_date).toLocaleDateString("de-DE")}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badge.bg}`}>{badge.label}</span>
        <button onClick={() => onDelete(d.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity">✕</button>
      </div>
    </div>
  );
}
