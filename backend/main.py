from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import Optional

from rag import RAGPipeline

app = FastAPI(title="Study Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

rag = RAGPipeline()


class ChatRequest(BaseModel):
    question: str
    doc_id: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok"}


ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Nur {', '.join(ALLOWED_EXTENSIONS)} erlaubt.")
    content = await file.read()
    doc_id = rag.ingest(content, file.filename)
    return {"doc_id": doc_id, "filename": file.filename, "message": "Dokument erfolgreich verarbeitet."}


@app.post("/chat")
def chat(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Frage darf nicht leer sein.")
    answer = rag.query(request.question, request.doc_id)
    return {"answer": answer}


@app.get("/documents")
def documents():
    return {"documents": rag.list_documents()}


@app.delete("/documents/{doc_id}")
def delete(doc_id: str):
    success = rag.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dokument nicht gefunden.")
    return {"message": "Dokument geloescht."}
