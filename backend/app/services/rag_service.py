import os
import logging
import asyncio
from typing import Optional
from pathlib import Path
logger = logging.getLogger(__name__)
_vector_store = None
_embeddings = None
FAISS_INDEX_PATH = Path("data/faiss_index")
RAG_AVAILABLE = False

def _load_embeddings():
    global _embeddings, RAG_AVAILABLE
    if _embeddings is None:
        try:
            from langchain_community.embeddings import HuggingFaceEmbeddings
            _embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2",
                model_kwargs={"device": "cpu"},
            )
            RAG_AVAILABLE = True
        except Exception as e:
            logger.warning(f"⚠️ Local sentence_transformers unavailable: {e}. RAG disabled.")
            return None
    return _embeddings

def _get_vector_store():
    global _vector_store
    if _vector_store is not None:
        return _vector_store
    embeddings = _load_embeddings()
    if embeddings is None:
        return None
    try:
        from langchain_community.vectorstores import FAISS
        from langchain.schema import Document
        if FAISS_INDEX_PATH.exists():
            logger.info(f"Loading FAISS index from {FAISS_INDEX_PATH}")
            _vector_store = FAISS.load_local(
                str(FAISS_INDEX_PATH),
                embeddings,
                allow_dangerous_deserialization=True,
            )
            return _vector_store
        logger.info("No FAISS index found. Creating empty index...")
        placeholder = Document(
            page_content="OMS Intelligence initialized. Waiting for Shopify orders.",
            metadata={"order_id": "init"}
        )
        _vector_store = FAISS.from_documents([placeholder], embeddings)
        FAISS_INDEX_PATH.mkdir(parents=True, exist_ok=True)
        _vector_store.save_local(str(FAISS_INDEX_PATH))
        return _vector_store
    except Exception as e:
        logger.error(f"Vector store error: {e}")
        return None

async def get_rag_context(query: str, k: int = 5) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _retrieve_sync, query, k)

def _retrieve_sync(query: str, k: int) -> str:
    store = _get_vector_store()
    if store is None:
        return ""
    try:
        docs = store.similarity_search(query, k=k)
        if not docs:
            return ""
        return "\n".join(f"- {doc.page_content}" for doc in docs)
    except Exception as e:
        logger.error(f"RAG retrieval error: {e}")
        return ""

async def add_to_index(order_text: str, order_id: str):
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _add_sync, order_text, order_id)

def _add_sync(order_text: str, order_id: str):
    store = _get_vector_store()
    if store is None:
        return
    try:
        from langchain.schema import Document
        doc = Document(page_content=order_text, metadata={"order_id": order_id})
        store.add_documents([doc])
        store.save_local(str(FAISS_INDEX_PATH))
        logger.info(f"✅ Order {order_id} added to FAISS index.")
    except Exception as e:
        logger.error(f"Add to index error: {e}")