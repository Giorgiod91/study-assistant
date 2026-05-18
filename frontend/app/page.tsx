"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import CursorGlow from "@/components/CursorGlow";

// ── animation presets ─────────────────────────────────────────────────────────

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: EASE, delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, delay },
});

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── small reusable components ─────────────────────────────────────────────────

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-100">
      {children}
    </span>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: string; title: string; desc: string; delay: number }) {
  return (
    <FadeUp delay={delay}>
      <motion.div
        whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(99,102,241,0.12)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full cursor-default"
      >
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl mb-4">{icon}</div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </motion.div>
    </FadeUp>
  );
}

function PainCard({ emoji, text, delay }: { emoji: string; text: string; delay: number }) {
  return (
    <FadeUp delay={delay}>
      <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
        <span className="text-xl shrink-0">{emoji}</span>
        <p className="text-gray-700 text-sm leading-relaxed">{text}</p>
      </div>
    </FadeUp>
  );
}

function Step({ n, title, desc, delay }: { n: string; title: string; desc: string; delay: number }) {
  return (
    <FadeUp delay={delay} className="flex gap-5">
      <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </FadeUp>
  );
}

// ── mock app screenshot ───────────────────────────────────────────────────────

function AppMockup() {
  return (
    <motion.div
      {...fadeUp(0.45)}
      className="relative bg-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-800">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <div className="flex-1 bg-gray-800 rounded-md h-5 mx-4" />
      </div>
      <div className="flex">
        <div className="w-44 bg-gray-900 border-r border-gray-800 p-3 space-y-1">
          {["⬛ Dashboard", "💬 Chat", "📝 Export", "📅 Termine"].map((item, i) => (
            <div key={i} className={`text-xs px-3 py-2 rounded-lg ${i === 1 ? "bg-indigo-600 text-white" : "text-gray-500"}`}>
              {item}
            </div>
          ))}
        </div>
        <div className="flex-1 p-4 space-y-3">
          <div className="text-xs text-gray-500 bg-gray-800 rounded-lg px-3 py-2">📄 Algorithmen_WS2025.pdf</div>
          <div className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-indigo-600 text-white text-xs rounded-xl rounded-br-sm px-3 py-2 max-w-48">
                Was ist die Zeitkomplexität von Quicksort?
              </div>
            </div>
            <div className="flex">
              <div className="bg-gray-800 text-gray-200 text-xs rounded-xl rounded-bl-sm px-3 py-2 max-w-64 leading-relaxed">
                <span className="text-indigo-400 block mb-1 text-xs">Study Assistant</span>
                Laut deiner Vorlesung (Folie 47) hat Quicksort im Durchschnitt O(n log n)…
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-indigo-600 text-white text-xs rounded-xl rounded-br-sm px-3 py-2 max-w-48">
                Und im worst case?
              </div>
            </div>
            <div className="flex gap-1 pl-2 items-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <CursorGlow />

      {/* NAV */}
      <motion.nav
        {...fadeIn(0)}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">🎓</div>
            Study Assistant
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#how" className="hover:text-gray-900 transition-colors">Wie es funktioniert</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Anmelden</Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/app" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                Kostenlos starten
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50 pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div {...fadeUp(0)}><Badge>✨ Powered by Claude AI · Anthropic</Badge></motion.div>

          <motion.h1 {...fadeUp(0.1)} className="mt-6 text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            Chatte mit deinen{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Vorlesungen.
            </span>
            <br />Nie wieder stundenlang suchen.
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Lade deine PDFs, Skripte und Notizen hoch — und stelle Fragen direkt an dein Lernmaterial.
            KI antwortet basierend auf <strong className="text-gray-700">deiner</strong> Vorlesung, nicht Wikipedia.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/app" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-colors shadow-lg shadow-indigo-200">
                Jetzt kostenlos starten →
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <a href="#how" className="inline-block bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-2xl text-lg border border-gray-200 transition-colors">
                Wie es funktioniert
              </a>
            </motion.div>
          </motion.div>

          <motion.p {...fadeUp(0.35)} className="mt-4 text-sm text-gray-400">
            Kein Account nötig · Läuft lokal · Deine Daten bleiben deine Daten
          </motion.p>

          <div className="mt-16">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "PDF, DOCX, TXT, MD", label: "Unterstützte Formate" },
            { value: "3 Designs", label: "Word Export Templates" },
            { value: "< 1 Sek.", label: "Antwortzeit" },
            { value: "100% lokal", label: "Vektordatenbank" },
          ].map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.08}>
              <div className="text-2xl font-bold text-indigo-600">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Kennst du das?</h2>
            <p className="text-gray-500 mt-3">Das Studium bringt täglich diese Probleme mit sich.</p>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-4">
            <PainCard emoji="😵" delay={0} text="200-seitige Skripte — und du weißt nicht auf welcher Seite die Antwort steht." />
            <PainCard emoji="😰" delay={0.1} text="Abgabetermine in 4 verschiedenen Apps, Zetteln und dem Kopf — und trotzdem vergisst man sie." />
            <PainCard emoji="😩" delay={0.2} text="Mitschriften als unleserliche Textwand — kein Format, keine Struktur, nie auffindbar." />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-12">
            <Badge>Features</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mt-4">Alles was du zum Lernen brauchst</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Vier Tools in einer App — gebaut für Studenten die Zeit sparen wollen.</p>
          </FadeUp>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard delay={0}    icon="💬" title="RAG Chat"         desc="Stelle Fragen an deine eigenen PDFs und Notizen. Die KI antwortet mit Inhalt aus deiner Vorlesung — nicht aus dem Internet." />
            <FeatureCard delay={0.08} icon="📝" title="Word Export"      desc="Notizen in 3 professionellen Designs als .docx herunterladen — Minimal, Akademisch oder Modern." />
            <FeatureCard delay={0.16} icon="📅" title="Abgabetermine"    desc="Deadlines mit Fach, Datum und Priorität eintragen. Countdown zeigt dir wie viel Zeit noch bleibt." />
            <FeatureCard delay={0.24} icon="📊" title="Lerntracker"      desc="Lernstreak, Aktivitätsdiagramm und Statistiken — sieh wie konsequent du wirklich lernst." />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-7">
            <FadeUp>
              <Badge>So einfach</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-8">In 3 Schritten zum Lernassistenten</h2>
            </FadeUp>
            <Step n="1" delay={0}    title="Dokument hochladen"   desc="Lade dein Vorlesungsskript, Mitschriften oder Word-Dokument hoch. PDF, DOCX, TXT und Markdown werden unterstützt." />
            <Step n="2" delay={0.1}  title="Frage stellen"        desc='Tippe deine Frage — "Erkläre mir den Unterschied zwischen Stack und Heap" — und erhalte eine Antwort aus deiner Vorlesung.' />
            <Step n="3" delay={0.2}  title="Exportieren & Tracken" desc="Speichere Notizen als professionelles Word-Dokument und behalte deine Abgabetermine im Dashboard im Blick." />
          </div>

          <FadeUp delay={0.15}>
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl p-8 border border-indigo-100">
              <div className="space-y-4">
                {[
                  { q: "Was ist eine Hashmap?", a: "Laut Vorlesung (Folie 23) ist eine Hashmap eine Datenstruktur die Schlüssel-Wert-Paare speichert…" },
                  { q: "Wann benutzt man Dijkstra?", a: "Dein Skript beschreibt Dijkstra als Algorithmus für kürzeste Pfade in gewichteten Graphen (S. 87)…" },
                ].map((item) => (
                  <div key={item.q} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-indigo-600 text-white text-xs rounded-xl rounded-br-sm px-3 py-2 max-w-xs">{item.q}</div>
                    </div>
                    <div className="flex">
                      <div className="bg-white text-gray-700 text-xs rounded-xl rounded-bl-sm px-3 py-2 max-w-xs shadow-sm border border-gray-100 leading-relaxed">
                        <span className="text-indigo-500 font-medium block mb-1">Study Assistant</span>
                        {item.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <FadeUp className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Häufige Fragen</h2>
          </FadeUp>
          <div className="space-y-4">
            {[
              { q: "Sind meine Dokumente sicher?", a: "Deine Dokumente werden lokal in ChromaDB gespeichert und nicht an Dritte weitergegeben. Nur die Textabschnitte die zur Beantwortung einer Frage benötigt werden, werden an die Claude API gesendet." },
              { q: "Welche Dateiformate werden unterstützt?", a: "PDF, Word (.docx), Markdown (.md) und Textdateien (.txt). Bilder in PDFs werden aktuell nicht ausgelesen." },
              { q: "Wie genau sind die Antworten?", a: "Die KI antwortet ausschließlich basierend auf dem Inhalt deiner hochgeladenen Dokumente. Wenn die Antwort nicht im Dokument steht, sagt sie das ehrlich." },
              { q: "Brauche ich technisches Vorwissen?", a: "Nein — Upload, Fragen stellen, fertig. Für die lokale Selbst-Installation ist ein Python-Grundverständnis hilfreich." },
            ].map((item, i) => (
              <FadeUp key={item.q} delay={i * 0.07}>
                <details className="bg-white border border-gray-200 rounded-2xl group">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-medium text-gray-900 list-none">
                    {item.q}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg">↓</span>
                  </summary>
                  <p className="px-6 pb-4 text-gray-500 text-sm leading-relaxed">{item.a}</p>
                </details>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <FadeUp>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-12 text-center text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <h2 className="relative text-3xl md:text-4xl font-bold mb-4">Bereit schlauer zu lernen?</h2>
            <p className="relative text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
              Lade dein erstes Vorlesungsskript hoch und stell deine erste Frage — in unter 2 Minuten.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="relative inline-block">
              <Link href="/app" className="inline-block bg-white text-indigo-600 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-indigo-50 transition-colors shadow-lg">
                Jetzt kostenlos starten →
              </Link>
            </motion.div>
            <p className="relative text-indigo-300 text-sm mt-4">Kein Account · Keine Kreditkarte · Sofort loslegen</p>
          </div>
        </FadeUp>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs">🎓</div>
            Study Assistant
          </div>
          <p className="text-gray-400 text-sm">
            Gebaut von{" "}
            <a href="https://giorgiodettmar.com" className="text-indigo-600 hover:underline">Giorgio Dettmar</a>
            {" "}· Powered by Claude AI
          </p>
          <div className="flex gap-5 text-sm text-gray-400">
            <a href="https://github.com/Giorgiod91/study-assistant" className="hover:text-gray-700 transition-colors">GitHub</a>
            <a href="https://giorgiodettmar.com" className="hover:text-gray-700 transition-colors">Portfolio</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
