import pytest
from backend.app.rag.retriever import get_retriever

def test_retriever_indexing_and_search():
    retriever = get_retriever()
    assert len(retriever.chunks) > 0
    assert len(retriever.catalog) > 0

    # Test targeted query on Brian Chesky
    results = retriever.search("Brian Chesky founder mode", top_k=3)
    assert len(results) > 0
    assert any("Chesky" in r["guest"] for r in results)
    assert results[0]["youtube_url"].startswith("https://www.youtube.com")

def test_retriever_citations_metadata():
    retriever = get_retriever()
    results = retriever.search("retention cohort onboarding", top_k=2)
    assert len(results) > 0
    first = results[0]
    assert "timestamp" in first
    assert "guest" in first
    assert "title" in first
    assert "snippet" in first
    assert len(first["snippet"]) > 0

def test_retriever_unrelated_query():
    retriever = get_retriever()
    # Unrelated query that shouldn't match podcast content
    results = retriever.search("xyz987quantumastrophysicsdarkmatter", top_k=5)
    # BM25 will return empty or score 0
    assert len(results) == 0
