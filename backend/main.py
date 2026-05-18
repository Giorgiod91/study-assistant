from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pathlib import Path
from typing import Optional
import io

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from rag import RAGPipeline
from export import export_to_docx, TEMPLATES
from deadlines import add_deadline, get_deadlines, delete_deadline
from progress import record_question, record_upload, get_stats

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Study Assistant API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

rag = RAGPipeline()
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}


# ── Models ────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str
    doc_id: Optional[str] = None

class ExportRequest(BaseModel):
    title: str
    content: str
    template: str = "minimal"

class DeadlineRequest(BaseModel):
    title: str
    subject: str
    due_date: str
    priority: str = "medium"


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


# ── Documents ─────────────────────────────────────────────────────────────────

@app.post("/upload")
@limiter.limit("10/hour")
async def upload(request: Request, file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Nur {', '.join(ALLOWED_EXTENSIONS)} erlaubt.")
    content = await file.read()
    try:
        doc_id = rag.ingest(content, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    record_upload()
    return {"doc_id": doc_id, "filename": file.filename, "message": "Dokument erfolgreich verarbeitet."}


@app.post("/chat")
@limiter.limit("30/hour")
def chat(request: Request, body: ChatRequest):
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Frage darf nicht leer sein.")
    answer = rag.query(body.question, body.doc_id)
    record_question()
    return {"answer": answer}


@app.get("/documents")
@limiter.limit("60/hour")
def documents(request: Request):
    return {"documents": rag.list_documents()}


@app.delete("/documents/{doc_id}")
@limiter.limit("20/hour")
def delete_doc(request: Request, doc_id: str):
    success = rag.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden.")
    return {"message": "Dokument gelöscht."}


# ── Export ────────────────────────────────────────────────────────────────────

@app.get("/export/templates")
def list_templates():
    return {"templates": [{"id": k, "label": v} for k, v in TEMPLATES.items()]}


@app.post("/export/docx")
@limiter.limit("20/hour")
def export_docx(request: Request, body: ExportRequest):
    if not body.title.strip() or not body.content.strip():
        raise HTTPException(status_code=400, detail="Titel und Inhalt dürfen nicht leer sein.")
    docx_bytes = export_to_docx(body.title, body.content, body.template)
    filename = body.title.replace(" ", "_")[:40] + ".docx"
    return StreamingResponse(
        io.BytesIO(docx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ── Deadlines ─────────────────────────────────────────────────────────────────

@app.post("/deadlines")
@limiter.limit("30/hour")
def create_deadline(request: Request, body: DeadlineRequest):
    item = add_deadline(body.title, body.subject, body.due_date, body.priority)
    return item


@app.get("/deadlines")
@limiter.limit("60/hour")
def list_deadlines(request: Request):
    return {"deadlines": get_deadlines()}


@app.delete("/deadlines/{deadline_id}")
@limiter.limit("20/hour")
def remove_deadline(request: Request, deadline_id: str):
    success = delete_deadline(deadline_id)
    if not success:
        raise HTTPException(status_code=404, detail="Termin nicht gefunden.")
    return {"message": "Termin gelöscht."}


# ── Progress ──────────────────────────────────────────────────────────────────

@app.get("/progress")
@limiter.limit("60/hour")
def progress(request: Request):
    doc_count = len(rag.list_documents())
    return get_stats(doc_count)
