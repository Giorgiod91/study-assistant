"use client";

import Link from "next/link";

type View = "dashboard" | "chat" | "export" | "deadlines";

interface Props {
  active: View;
  onChange: (v: View) => void;
}

const NAV: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⬛" },
  { id: "chat", label: "Dokumente & Chat", icon: "💬" },
  { id: "export", label: "Word Export", icon: "📝" },
  { id: "deadlines", label: "Abgabetermine", icon: "📅" },
];

export default function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      <div className="px-5 py-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-sm">🎓</div>
          <span className="text-white font-bold text-sm tracking-wide">Study Assistant</span>
        </div>
        <p className="text-gray-500 text-xs mt-1">Powered by Claude AI</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              active === id
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <span className="text-base">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link href="/" className="block text-gray-600 hover:text-gray-400 text-xs transition-colors">← Zurück zur Startseite</Link>
        <p className="text-gray-700 text-xs">v1.0 · Railway + Vercel</p>
      </div>
    </aside>
  );
}
