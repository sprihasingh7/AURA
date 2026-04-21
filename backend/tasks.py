import sqlite3
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
