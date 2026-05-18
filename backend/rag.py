import os
import uuid
import json
import tempfile
from pathlib import Path
from typing import Optional

import anthropic
import chromadb
from sentence_transformers import SentenceTransformer
import pypdf
import docx

DOCS_REGISTRY = Path("documents.json")
CHROMA_PATH = "./chroma_db"


def load_registry() -> dict:
    if DOCS_REGISTRY.exists():
        return json.loads(DOCS_REGISTRY.read_text())
    return {}


def save_registry(registry: dict):
    DOCS_REGISTRY.write_text(json.dumps(registry, ensure_ascii=False, indent=2))


class RAGPipeline:
    def __init__(self):
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        self.chroma = chromadb.PersistentClient(path=CHROMA_PATH)
        self.claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.registry = load_registry()

    def _extract_text(self, file_bytes: bytes, filename: str) -> str:
        ext = Path(filename).suffix.lower()

        if ext == ".pdf":
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name
            reader = pypdf.PdfReader(tmp_path)
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
            os.unlink(tmp_path)
            return text

        if ext in (".txt", ".md"):
            return file_bytes.decode("utf-8", errors="ignore")

        if ext == ".docx":
            with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
                tmp.write(file_bytes)
                tmp_path = tmp.name
            doc = docx.Document(tmp_path)
            text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
            os.unlink(tmp_path)
            return text

        raise ValueError(f"Nicht unterstütztes Format: {ext}")

    def _chunk_text(self, text: str) -> list[str]:
        chunk_size = 800
        overlap = 150
        chunks = []
        start = 0
        while start < len(text):
            chunks.append(text[start:start + chunk_size])
            start += chunk_size - overlap
        return [c.strip() for c in chunks if len(c.strip()) > 50]

    def ingest(self, file_bytes: bytes, filename: str) -> str:
        doc_id = str(uuid.uuid4())[:8]
        text = self._extract_text(file_bytes, filename)
        chunks = self._chunk_text(text)

        embeddings = self.embedding_model.encode(chunks).tolist()

        collection = self.chroma.get_or_create_collection(f"doc_{doc_id}")
        collection.add(
            ids=[f"{doc_id}_{i}" for i in range(len(chunks))],
            embeddings=embeddings,
            documents=chunks,
            metadatas=[{"filename": filename, "chunk": i} for i in range(len(chunks))],
        )

        self.registry[doc_id] = {"filename": filename, "chunks": len(chunks)}
        save_registry(self.registry)
        return doc_id

    def query(self, question: str, doc_id: Optional[str] = None) -> str:
        if not self.registry:
            return "Bitte lade zuerst ein Dokument hoch."

        target_id = doc_id if doc_id and doc_id in self.registry else list(self.registry.keys())[0]

        collection = self.chroma.get_collection(f"doc_{target_id}")
        question_embedding = self.embedding_model.encode([question]).tolist()
        results = collection.query(query_embeddings=question_embedding, n_results=4)

        context = "\n\n---\n\n".join(results["documents"][0])

        message = self.claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": f"""Du bist ein hilfreicher Lernassistent. Beantworte die Frage ausschliesslich basierend auf dem folgenden Kontext aus dem Studiendokument.

Kontext:
{context}

Frage: {question}

Antworte klar und verstaendlich. Wenn die Antwort nicht im Kontext steht, sage das ehrlich und erklaere was du im Kontext gefunden hast.""",
                }
            ],
        )

        return message.content[0].text

    def list_documents(self) -> list[dict]:
        return [{"id": k, "filename": v["filename"], "chunks": v["chunks"]} for k, v in self.registry.items()]

    def delete_document(self, doc_id: str) -> bool:
        if doc_id not in self.registry:
            return False
        self.chroma.delete_collection(f"doc_{doc_id}")
        del self.registry[doc_id]
        save_registry(self.registry)
        return True
