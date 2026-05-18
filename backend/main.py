from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pathlib import Path
from typing import Optional

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from rag import RAGPipeline

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Study Assistant API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

rag = RAGPipeline()

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}


class ChatRequest(BaseModel):
    question: str
    doc_id: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok"}


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
    return {"doc_id": doc_id, "filename": file.filename, "message": "Dokument erfolgreich verarbeitet."}


@app.post("/chat")
@limiter.limit("30/hour")
def chat(request: Request, body: ChatRequest):
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Frage darf nicht leer sein.")
    answer = rag.query(body.question, body.doc_id)
    return {"answer": answer}


@app.get("/documents")
@limiter.limit("60/hour")
def documents(request: Request):
    return {"documents": rag.list_documents()}


@app.delete("/documents/{doc_id}")
@limiter.limit("20/hour")
def delete(request: Request, doc_id: str):
    success = rag.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden.")
    return {"message": "Dokument geloescht."}
