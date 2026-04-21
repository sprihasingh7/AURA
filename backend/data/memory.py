import os
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

load_dotenv()

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

db = Chroma(
    persist_directory="data/vectors",
    embedding_function=embeddings
)

def store_memory(text: str, metadata: dict):
    db.add_texts([text], metadatas=[metadata])

def search_memory(query: str, k: int = 5):
    return db.similarity_search(query, k=k)

def get_all_sources():
    data = db.get()
    sources = set()
    for meta in data['metadatas']:
        if meta and 'source' in meta:
            sources.add(meta['source'])
    return list(sources)