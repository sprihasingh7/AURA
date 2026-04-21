from pypdf import PdfReader
from memory import store_memory
import os

def ingest_pdf(file_path: str):
    reader = PdfReader(file_path)
    filename = os.path.basename(file_path)
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            store_memory(text, {
                "source": filename,
                "page": i + 1,
                "type": "pdf"
            })
    return {"pages_ingested": len(reader.pages), "file": filename}

def ingest_text(text: str, label: str):
    store_memory(text, {"source": label, "type": "note"})
    return {"status": "stored", "label": label}