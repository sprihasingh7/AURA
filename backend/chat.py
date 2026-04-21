from dotenv import load_dotenv
from langchain_groq import ChatGroq
from memory import search_memory

load_dotenv()
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)
conversation_history = []

def ask(query):
    memories = search_memory(query)
    context = "\n\n".join([f"[From: {m.metadata.get('source', 'memory')}]\n{m.page_content}" for m in memories])
    history_text = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in conversation_history[-6:]])
    prompt = f"""You are AURA, a personal AI assistant with memory and reasoning capabilities.
Be helpful, concise, and intelligent.

RELEVANT MEMORY CONTEXT:
{context if context else "No specific documents found."}

RECENT CONVERSATION:
{history_text if history_text else "Start of conversation."}

USER: {query}
AURA:"""
    response = llm.invoke(prompt).content
    conversation_history.append({"role": "user", "content": query})
    conversation_history.append({"role": "assistant", "content": response})
    return response

def get_history():
    return conversation_history
