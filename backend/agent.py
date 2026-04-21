from chat import ask
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
        task_list = "\n".join([f"[{t['id']}] {t['title']} - {t['status']} ({t['priority']})" for t in tasks])
        return {"intent": "get_tasks", "response": f"Your tasks:\n{task_list}", "data": tasks}
    elif intent == "complete_task":
        numbers = re.findall(r"\d+", query)
        if numbers:
            result = complete_task(int(numbers[0]))
            return {"intent": "complete_task", "response": f"Task {numbers[0]} done.", "data": result}
        return {"intent": "complete_task", "response": "Please give the task ID.", "data": {}}
    else:
        response = ask(query)
        return {"intent": "chat", "response": response, "data": {}}
