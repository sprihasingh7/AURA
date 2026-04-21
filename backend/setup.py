files = {}

files["memory.py"] = """import os
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
db = Chroma(persist_directory="data/vectors", embedding_function=embeddings)

def store_memory(text, metadata):
    db.add_texts([text], metadatas=[metadata])

def search_memory(query, k=5):
    return db.similarity_search(query, k=k)

def get_all_sources():
    data = db.get()
    sources = set()
    for meta in data["metadatas"]:
        if meta and "source" in meta:
            sources.add(meta["source"])
    return list(sources)
"""

files["ingest.py"] = """from pypdf import PdfReader
from memory import store_memory
import os

def ingest_pdf(file_path):
    reader = PdfReader(file_path)
    filename = os.path.basename(file_path)
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            store_memory(text, {"source": filename, "page": i+1, "type": "pdf"})
    return {"pages_ingested": len(reader.pages), "file": filename}

def ingest_text(text, label):
    store_memory(text, {"source": label, "type": "note"})
    return {"status": "stored", "label": label}
"""

files["tasks.py"] = """import sqlite3
from datetime import datetime

DB_PATH = "data/logs/tasks.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT "pending",
        priority TEXT DEFAULT "medium",
        created_at TEXT,
        due_date TEXT)''')
    conn.commit()
    conn.close()

def add_task(title, description="", priority="medium", due_date=""):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("INSERT INTO tasks (title,description,status,priority,created_at,due_date) VALUES (?,?,'pending',?,?,?)",
              (title, description, priority, datetime.now().isoformat(), due_date))
    conn.commit()
    conn.close()
    return {"status": "task added", "title": title}

def get_tasks(status=None):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    if status:
        c.execute("SELECT * FROM tasks WHERE status=?", (status,))
    else:
        c.execute("SELECT * FROM tasks ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    return [{"id":r[0],"title":r[1],"description":r[2],"status":r[3],"priority":r[4],"created_at":r[5],"due_date":r[6]} for r in rows]

def complete_task(task_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("UPDATE tasks SET status='done' WHERE id=?", (task_id,))
    conn.commit()
    conn.close()
    return {"status": "completed", "id": task_id}

init_db()
"""

files["chat.py"] = """from dotenv import load_dotenv
from langchain_groq import ChatGroq
from memory import search_memory

load_dotenv()
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)
conversation_history = []

def ask(query):
    memories = search_memory(query)
    context = "\\n\\n".join([f"[From: {m.metadata.get('source', 'memory')}]\\n{m.page_content}" for m in memories])
    history_text = "\\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in conversation_history[-6:]])
    prompt = f\"\"\"You are AURA, a personal AI assistant with memory and reasoning capabilities.
Be helpful, concise, and intelligent.

RELEVANT MEMORY CONTEXT:
{context if context else "No specific documents found."}

RECENT CONVERSATION:
{history_text if history_text else "Start of conversation."}

USER: {query}
AURA:\"\"\"
    response = llm.invoke(prompt).content
    conversation_history.append({"role": "user", "content": query})
    conversation_history.append({"role": "assistant", "content": response})
    return response

def get_history():
    return conversation_history
"""

files["agent.py"] = """from chat import ask
from tasks import add_task, get_tasks, complete_task
import re

def detect_intent(query):
    q = query.lower()
    if any(w in q for w in ["add task", "remind me", "create task", "schedule", "todo"]):
        return "add_task"
    if any(w in q for w in ["my tasks", "show tasks", "pending tasks", "what do i have"]):
        return "get_tasks"
    if any(w in q for w in ["complete task", "done with", "mark done", "finished task"]):
        return "complete_task"
    return "chat"

def run_agent(query):
    intent = detect_intent(query)
    if intent == "add_task":
        response = ask(f"Extract task title and description from: '{query}'. Reply: TITLE: ... | DESCRIPTION: ...")
        title, description = "New Task", ""
        if "TITLE:" in response:
            parts = response.split("|")
            title = parts[0].replace("TITLE:", "").strip()
            description = parts[1].replace("DESCRIPTION:", "").strip() if len(parts) > 1 else ""
        result = add_task(title, description)
        return {"intent": "add_task", "response": f"Task added: {title}", "data": result}
    elif intent == "get_tasks":
        tasks = get_tasks()
        if not tasks:
            return {"intent": "get_tasks", "response": "No tasks yet.", "data": []}
        task_list = "\\n".join([f"[{t['id']}] {t['title']} - {t['status']} ({t['priority']})" for t in tasks])
        return {"intent": "get_tasks", "response": f"Your tasks:\\n{task_list}", "data": tasks}
    elif intent == "complete_task":
        numbers = re.findall(r"\\d+", query)
        if numbers:
            result = complete_task(int(numbers[0]))
            return {"intent": "complete_task", "response": f"Task {numbers[0]} done.", "data": result}
        return {"intent": "complete_task", "response": "Please give the task ID.", "data": {}}
    else:
        response = ask(query)
        return {"intent": "chat", "response": response, "data": {}}
"""

files["main.py"] = """from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil

from ingest import ingest_pdf, ingest_text
from agent import run_agent
from chat import get_history
from memory import get_all_sources
from tasks import get_tasks

app = FastAPI(title="AURA API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])

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
    return {"status": "ingested", "detail": ingest_pdf(save_path)}

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
"""

for filename, content in files.items():
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created {filename}")

print("All files created successfully!")