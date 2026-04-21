import os, uuid
from dotenv import load_dotenv
from chromadb import PersistentClient
load_dotenv()

VECTOR_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "vectors2")
os.makedirs(VECTOR_DIR, exist_ok=True)

_ef = None
_client = None
_collection = None

def get_collection():
    global _ef, _client, _collection
    if _collection is None:
        from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
        _ef = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
        _client = PersistentClient(path=VECTOR_DIR)
        _collection = _client.get_or_create_collection("aura_memory", embedding_function=_ef)
    return _collection

def store_memory(text, metadata):
    col = get_collection()
    col.add(documents=[text], metadatas=[metadata], ids=[str(uuid.uuid4())])

def search_memory(query, k=5):
    col = get_collection()
    if col.count() == 0:
        return []
    results = col.query(query_texts=[query], n_results=min(k, col.count()))
    docs = []
    for i, doc in enumerate(results["documents"][0]):
        meta = results["metadatas"][0][i]
        docs.append(type("Doc", (), {"page_content": doc, "metadata": meta})())
    return docs

def get_all_sources():
    col = get_collection()
    data = col.get()
    sources = set()
    for meta in data["metadatas"]:
        if meta and "source" in meta:
            sources.add(meta["source"])
    return list(sources)