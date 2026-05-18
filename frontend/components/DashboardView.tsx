"use client";

import { useEffect, useState } from "react";
import { getProgress, getDeadlines, Stats, Deadline } from "@/lib/api";

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-5`}>
      <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function ActivityBar({ day }: { day: { date: string; questions: number } }) {
  const max = 20;
  const height = Math.max(4, (day.questions / max) * 64);
  const label = new Date(day.date).toLocaleDateString("de-DE", { weekday: "short" });
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-16 flex items-end">
        <div
          className="w-8 rounded-t-md bg-indigo-600 opacity-80 hover:opacity-100 transition-all"
          style={{ height }}
          title={`${day.questions} Fragen`}
        />
      </div>
      <span className="text-gray-500 text-xs">{label}</span>
      <span className="text-gray-400 text-xs font-medium">{day.questions}</span>
    </div>
  );
}

function urgencyColor(days: number) {
  if (days < 0) return "text-red-500";
  if (days <= 3) return "text-red-400";
  if (days <= 7) return "text-yellow-400";
  return "text-emerald-400";
}

function urgencyLabel(days: number) {
  if (days < 0) return "Überfällig";
  if (days === 0) return "Heute!";
  if (days === 1) return "Morgen";
  return `${days} Tage`;
}

export default function DashboardView() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);

  useEffect(() => {
    getProgress().then(setStats).catch(() => {});
    getDeadlines().then(setDeadlines).catch(() => {});
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-950">
      <div className="max-w-5xl mx-auto space-y-8">

        <div>
          <h1 className="text-white text-2xl font-bold">Guten Tag 👋</h1>
          <p className="text-gray-400 text-sm mt-1">Hier ist dein Lernüberblick.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Dokumente" value={stats?.documents ?? "—"} sub="hochgeladen" color="text-indigo-400" />
          <StatCard label="Fragen gestellt" value={stats?.total_questions ?? "—"} sub="insgesamt" color="text-violet-400" />
          <StatCard label="Uploads" value={stats?.total_uploads ?? "—"} sub="verarbeitet" color="text-blue-400" />
          <StatCard
            label="Streak"
            value={stats ? `${stats.streak}d` : "—"}
            sub={stats?.streak === 0 ? "Noch kein Start" : "aktive Lerntage"}
            color="text-emerald-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Aktivität — letzte 7 Tage</h2>
            {stats ? (
              <div className="flex gap-3 items-end justify-around">
                {stats.weekly_activity.map((d) => <ActivityBar key={d.date} day={d} />)}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-gray-600 text-sm">Laden...</div>
            )}
          </div>

          {/* Upcoming deadlines */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Nächste Abgaben</h2>
            {deadlines.length === 0 ? (
              <p className="text-gray-500 text-sm">Keine Termine eingetragen.</p>
            ) : (
              <div className="space-y-3">
                {deadlines.slice(0, 4).map((d) => (
                  <div key={d.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{d.title}</p>
                      <p className="text-gray-500 text-xs">{d.subject}</p>
                    </div>
                    <span className={`text-sm font-bold ${urgencyColor(d.days_left)}`}>
                      {urgencyLabel(d.days_left)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick tips */}
        <div className="bg-indigo-950 border border-indigo-900 rounded-2xl p-6">
          <h2 className="text-indigo-300 font-semibold mb-3">Tipp des Tages</h2>
          <p className="text-indigo-200 text-sm">
            Lade deine Vorlesungsfolien hoch und frag den Assistenten: <span className="font-medium">"Erkläre mir [Thema] in 3 Sätzen"</span> — ideal zum Prüfen ob du ein Thema wirklich verstanden hast.
          </p>
        </div>

      </div>
    </div>
  );
}
