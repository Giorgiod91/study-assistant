# Study Assistant — RAG mit Claude AI

Chat mit deinen Vorlesungs-PDFs powered by Claude Sonnet + ChromaDB.

## Tech Stack

| Layer | Technologie |
|-------|------------|
| Backend | Python, FastAPI |
| RAG / Embeddings | sentence-transformers (lokal, kostenlos) |
| Vector DB | ChromaDB (persistent, lokal) |
| LLM | Claude claude-sonnet-4-6 (Anthropic) |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

cp .env.example .env
# .env editieren: ANTHROPIC_API_KEY=sk-ant-...

uvicorn main:app --reload
```

Backend läuft auf http://localhost:8000

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend läuft auf http://localhost:3000

## Features

- PDF hochladen → wird in Chunks zerlegt + als Vektoren gespeichert
- Fragen stellen → relevante Passagen werden gefunden + Claude antwortet
- Mehrere Dokumente verwaltbar
- Dark-Mode UI
