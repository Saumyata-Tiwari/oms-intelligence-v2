import os
import logging
import asyncio
from typing import Optional
from pathlib import Path

logger = logging.getLogger(__name__)

_vector_store = None
_embeddings = None

FAISS_INDEX_PATH = Path("data/faiss_index")
OLIST_CSV_PATH = Path("data/olist_orders.csv")


def _load_embeddings():
    global _embeddings
    if _embeddings is None:
        from langchain_community.embeddings import HuggingFaceEmbeddings
        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
        )
    return _embeddings


def _get_vector_store():
    global _vector_store
    if _vector_store is not None:
        return _vector_store

    from langchain_community.vectorstores import FAISS
    embeddings = _load_embeddings()

    if FAISS_INDEX_PATH.exists():
        logger.info(f"Loading FAISS index from {FAISS_INDEX_PATH}")
        _vector_store = FAISS.load_local(
            str(FAISS_INDEX_PATH),
            embeddings,
            allow_dangerous_deserialization=True,
        )
        return _vector_store

    if OLIST_CSV_PATH.exists():
        logger.info("Building FAISS index from Olist CSV...")
        _vector_store = _build_from_csv(embeddings)
        return _vector_store

    logger.warning("No FAISS index or CSV found. RAG will return empty context.")
    return None


def _build_from_csv(embeddings) -> Optional[object]:
    import pandas as pd
    from langchain_community.vectorstores import FAISS
    from langchain.schema import Document

    try:
        df = pd.read_csv(OLIST_CSV_PATH, nrows=99441)
        documents = []
        for _, row in df.iterrows():
            text = (
                f"Order {row.get('order_id', 'N/A')} | "
                f"Status: {row.get('order_status', 'N/A')} | "
                f"Purchase: {row.get('order_purchase_timestamp', 'N/A')} | "
                f"Estimated delivery: {row.get('order_estimated_delivery_date', 'N/A')} | "
                f"Customer: {row.get('customer_city', 'N/A')}, {row.get('customer_state', 'N/A')}"
            )
            documents.append(
                Document(page_content=text, metadata={"order_id": str(row.get("order_id", ""))})
            )
        store = FAISS.from_documents(documents, embeddings)
        FAISS_INDEX_PATH.mkdir(parents=True, exist_ok=True)
        store.save_local(str(FAISS_INDEX_PATH))
        logger.info(f"✅ FAISS index built with {len(documents)} documents.")
        return store
    except Exception as e:
        logger.error(f"Failed to build FAISS index: {e}")
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
    from langchain.schema import Document
    store = _get_vector_store()
    if store is None:
        return
    doc = Document(page_content=order_text, metadata={"order_id": order_id})
    store.add_documents([doc])
    store.save_local(str(FAISS_INDEX_PATH))