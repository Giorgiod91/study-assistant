# Study Assistant — AI-gestützter Lernbegleiter

**Das Problem:** Studenten ertrinken in PDFs, Skripten und Word-Dokumenten. Klassische Suche hilft nicht — man weiß oft nicht mal welche Seite man braucht. Abgabetermine gehen vergessen. Lernfortschritt ist unsichtbar.

**Die Lösung:** Upload deiner Vorlesungsunterlagen → Chat direkt mit deinem Material via Claude AI → Abgabetermine tracken → Notizen als professionelle Word-Dokumente exportieren. Alles in einer App.

---

## Features

| Feature | Beschreibung |
|---|---|
| **RAG Chat** | Stelle Fragen zu deinen eigenen PDFs, Word-Dokumenten, Markdown & TXT-Notizen |
| **Word Export** | Notizen in 3 Designs (Minimal, Akademisch, Modern) als `.docx` exportieren |
| **Abgabetermine** | Deadlines eintragen mit Priorität, Fach & Countdown |
| **Progress Dashboard** | Lernstreak, Aktivitätsdiagramm, Dokumentenübersicht |
| **Rate Limiting** | Schutz vor API-Missbrauch (10 Uploads/h, 30 Chats/h) |
| **Multi-Format** | PDF, DOCX, TXT, Markdown werden alle verarbeitet |

---

## Problem — warum dieses Projekt existiert

Ich studiere Informatik (IHK + B.Sc.) und habe täglich das gleiche Problem:

- 200-seitige Vorlesungsskripte die ich nicht durchsuchen kann
- Abgabetermine die ich in 4 verschiedenen Apps tracke
- Mitschriften die irgendwo als Textdatei liegen
- Keine Übersicht ob ich genug lerne

Klassische Tools wie Ctrl+F oder Ctrl+Suche helfen nicht wenn man nicht weiß wonach man sucht. Diese App löst das mit RAG (Retrieval Augmented Generation) — Claude AI antwortet basierend auf **deinem spezifischen Material**, nicht auf allgemeinem Internet-Wissen.

---

## Wie RAG funktioniert

```
PDF hochladen
  → Text in ~800-Zeichen Abschnitte zerlegen
  → Jeden Abschnitt in Zahlenvektor umwandeln (Embedding)
  → In ChromaDB speichern

Frage stellen: "Was ist Polymorphismus?"
  → Frage ebenfalls in Vektor umwandeln
  → Die 4 ähnlichsten Abschnitte aus der DB finden
  → Claude bekommt: Kontext + Frage
  → Antwort basiert auf DEINER Vorlesung, nicht Wikipedia
```

---

## Tech Stack

### Backend
| Tool | Zweck |
|---|---|
| **Python + FastAPI** | REST API, schnell und modern |
| **Claude claude-sonnet-4-6** | LLM für Antworten (Anthropic API) |
| **ChromaDB** | Lokale Vektordatenbank für Embeddings |
| **sentence-transformers** | Kostenlose lokale Embeddings (`all-MiniLM-L6-v2`) |
| **pypdf + python-docx** | PDF & Word Parsing |
| **slowapi** | Rate Limiting (IP-basiert) |

### Frontend
| Tool | Zweck |
|---|---|
| **Next.js 15** | React Framework mit App Router |
| **TypeScript** | Typsicherheit |
| **Tailwind CSS** | Styling |

---

## Deployment

| Service | Verwendung |
|---|---|
| **Vercel** | Frontend (Next.js) — automatisches Deployment aus GitHub |
| **Railway** | Backend (FastAPI + ChromaDB) — Docker-basiert |

### Vercel (Frontend)
```bash
# .env in Vercel Dashboard:
NEXT_PUBLIC_API_URL=https://deine-railway-url.railway.app
```

### Railway (Backend)
```bash
# Umgebungsvariablen in Railway:
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Lokales Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # API Key eintragen
uvicorn main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev                    # → http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Beschreibung | Rate Limit |
|---|---|---|---|
| POST | `/upload` | Dokument hochladen + verarbeiten | 10/h |
| POST | `/chat` | Frage an Dokument stellen | 30/h |
| GET | `/documents` | Alle Dokumente auflisten | 60/h |
| DELETE | `/documents/{id}` | Dokument löschen | 20/h |
| GET | `/export/templates` | Verfügbare Word-Designs | — |
| POST | `/export/docx` | Notizen als .docx exportieren | 20/h |
| POST | `/deadlines` | Abgabetermin eintragen | 30/h |
| GET | `/deadlines` | Alle Termine auflisten | 60/h |
| DELETE | `/deadlines/{id}` | Termin löschen | 20/h |
| GET | `/progress` | Lernstatistiken abrufen | 60/h |

---

## Entwickelt von

**Giorgio Dettmar** — Junior Full-Stack Developer  
[giorgiodettmar.com](https://giorgiodettmar.com) · [GitHub](https://github.com/Giorgiod91)
