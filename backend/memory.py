import os, uuid
from dotenv import load_dotenv
from chromadb import PersistentClient
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
load_dotenv()

VECTOR_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "vectors2")
os.makedirs(VECTOR_DIR, exist_ok=True)

ef = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
client = PersistentClient(path=VECTOR_DIR)
collection = client.get_or_create_collection("aura_memory", embedding_function=ef)

def store_memory(text, metadata):
    collection.add(
        documents=[text],
        metadatas=[metadata],
        ids=[str(uuid.uuid4())]
    )
    print(f"[MEMORY] Stored: {metadata.get('source')} | total: {collection.count()}")

def search_memory(query, k=5):
    count = collection.count()
    if count == 0:
        return []
    results = collection.query(query_texts=[query], n_results=min(k, count))
    docs = []
    for i, doc in enumerate(results["documents"][0]):
        meta = results["metadatas"][0][i]
        docs.append(type("Doc", (), {"page_content": doc, "metadata": meta})())
    return docs

def get_all_sources():
    data = collection.get()
    sources = set()
    for meta in data["metadatas"]:
        if meta and "source" in meta:
            sources.add(meta["source"])
    return list(sources)