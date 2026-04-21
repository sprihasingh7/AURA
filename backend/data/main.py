from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil

from ingest import ingest_pdf, ingest_text
from agent import run_agent
from chat import get_history
from memory import get_all_sources
from tasks import get_tasks

app = FastAPI(title="AURA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class NoteRequest(BaseModel):
    text: str
    label: str

@app.get("/")
def root():
    return {"status": "AURA is running"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    save_path = f"data/files/{file.filename}"
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    result = ingest_pdf(save_path)
    return {"status": "ingested", "detail": result}

@app.post("/note")
def add_note(req: NoteRequest):
    return ingest_text(req.text, req.label)

@app.post("/chat")
def chat(req: ChatRequest):
    return run_agent(req.message)

@app.get("/history")
def history():
    return get_history()

@app.get("/sources")
def sources():
    return get_all_sources()

@app.get("/tasks")
def tasks():
    return get_tasks()