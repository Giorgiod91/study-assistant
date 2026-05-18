"use client";

import { useEffect, useState } from "react";
import { Template, getTemplates, exportDocx } from "@/lib/api";

const PREVIEW_STYLES: Record<string, { bg: string; titleColor: string; accent: string; label: string }> = {
  minimal: { bg: "bg-white", titleColor: "text-gray-900", accent: "border-gray-200", label: "Minimal" },
  academic: { bg: "bg-white", titleColor: "text-gray-800", accent: "border-gray-400", label: "Akademisch" },
  modern: { bg: "bg-indigo-600", titleColor: "text-white", accent: "border-indigo-400", label: "Modern" },
};

function DocPreview({ template, title, content }: { template: string; title: string; content: string }) {
  const s = PREVIEW_STYLES[template] ?? PREVIEW_STYLES.minimal;
  const lines = content.split("\n").filter(Boolean).slice(0, 6);

  return (
    <div className={`${s.bg} rounded-xl p-5 shadow-lg min-h-48 border ${s.accent}`}>
      <div className={`font-bold text-base mb-1 ${s.titleColor}`}>{title || "Titel"}</div>
      <div className={`text-xs mb-3 ${template === "modern" ? "text-indigo-200" : "text-gray-400"}`}>
        {new Date().toLocaleDateString("de-DE")} · Study Assistant
      </div>
      <div className={`border-t ${s.accent} mb-3`} />
      <div className="space-y-1.5">
        {lines.map((line, i) => (
          <div key={i} className={`text-xs rounded ${line.startsWith("# ") ? `font-bold ${template === "modern" ? "text-indigo-200" : "text-gray-700"}` : template === "modern" ? "text-indigo-100" : "text-gray-500"}`}>
            {line.replace(/^#{1,2} /, "")}
          </div>
        ))}
        {!content && <div className="text-xs text-gray-400 italic">Dein Inhalt erscheint hier...</div>}
      </div>
    </div>
  );
}

export default function ExportView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => { getTemplates().then(setTemplates).catch(() => {}); }, []);

  async function handleExport() {
    if (!title.trim() || !content.trim()) { setError("Bitte Titel und Inhalt eingeben."); return; }
    setExporting(true); setError(""); setSuccess(false);
    try {
      await exportDocx(title, content, selectedTemplate);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Export fehlgeschlagen");
    } finally { setExporting(false); }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-950">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Word Export</h1>
          <p className="text-gray-400 text-sm mt-1">Erstelle eine .docx Datei aus deinen Notizen — in 3 verschiedenen Designs.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Titel des Dokuments</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="z.B. Zusammenfassung Algorithmen" className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Design wählen</label>
              <div className="grid grid-cols-3 gap-3">
                {(templates.length ? templates : Object.entries(PREVIEW_STYLES).map(([id, v]) => ({ id, label: v.label }))).map(t => (
                  <button key={t.id} onClick={() => setSelectedTemplate(t.id)} className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${selectedTemplate === t.id ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-800 border-gray-700 text-gray-300 hover:border-indigo-600"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Inhalt / Notizen</label>
              <p className="text-gray-500 text-xs mb-2">Markdown wird unterstützt: <code className="text-indigo-400"># Überschrift</code>, <code className="text-indigo-400">## Unterüberschrift</code></p>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={12}
                placeholder={"# Meine Zusammenfassung\n\n## Kapitel 1\n\nHier kommen meine Notizen..."}
                className="w-full bg-gray-800 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-emerald-400 text-sm">✓ Dokument wurde heruntergeladen!</p>}

            <button onClick={handleExport} disabled={exporting} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {exporting ? "Erstelle Dokument..." : "📥 Als Word herunterladen"}
            </button>
          </div>

          {/* Live Preview */}
          <div>
            <p className="text-gray-300 text-sm font-medium mb-3">Vorschau</p>
            <DocPreview template={selectedTemplate} title={title} content={content} />
            <p className="text-gray-600 text-xs mt-3 text-center">Stilisierte Vorschau — das echte .docx öffne in Word</p>
          </div>
        </div>
      </div>
    </div>
  );
}
