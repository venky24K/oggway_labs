import json
import re
import math
import logging
import difflib
from pathlib import Path
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi

logger = logging.getLogger("lenny_assistant.retriever")

class HybridRetriever:
    """
    High-performance Hybrid Retriever combining BM25 lexical scoring,
    guest/keyword entity boosting, and Reciprocal Rank Fusion (RRF).
    """

    def __init__(self, index_path: str = "data/transcripts_index.json"):
        self.index_path = Path(index_path)
        self.chunks: List[Dict[str, Any]] = []
        self.catalog: List[Dict[str, Any]] = []
        self.bm25: Optional[BM25Okapi] = None
        self.guest_names: Dict[str, str] = {}  # lowercase -> normalized guest
        self._is_ready = False
        self.load_index()

    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into lowercase alphanumeric tokens."""
        return re.findall(r"\b[a-zA-Z0-9_\-\$]+\b", text.lower())

    def load_index(self):
        """Loads chunks and initializes the BM25 search index."""
        if not self.index_path.exists():
            logger.warning("Index path %s not found.", self.index_path)
            return

        with open(self.index_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.chunks = data.get("chunks", [])
            self.catalog = data.get("catalog", [])

        # Build guest lookup dictionary for entity boosting
        for item in self.catalog:
            guest = item.get("guest", "")
            if guest:
                self.guest_names[guest.lower()] = guest

        # Build BM25 corpus from chunk text + guest + title + keywords
        corpus = []
        for chunk in self.chunks:
            keywords_str = " ".join(chunk.get("keywords", []))
            full_searchable = f"{chunk.get('guest', '')} {chunk.get('title', '')} {keywords_str} {chunk.get('text', '')}"
            corpus.append(self._tokenize(full_searchable))

        if corpus:
            self.bm25 = BM25Okapi(corpus)
            self._is_ready = True
            logger.info("HybridRetriever initialized with %d chunks across %d episodes.", len(self.chunks), len(self.catalog))

    def search(
        self, 
        query: str, 
        top_k: int = 5, 
        guest_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes hybrid search with BM25 + entity recognition + RRF + fuzzy typo tolerance.
        """
        if not self._is_ready or not self.bm25 or not self.chunks:
            return []

        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        query_lower = query.lower()

        # Check if user mentioned specific guests in query (exact match)
        matched_guests = [
            guest_norm for guest_key, guest_norm in self.guest_names.items()
            if guest_key in query_lower
        ]

        # Fuzzy guest tolerance (handles typos like 'Elana Verna' or 'Brian Cheski')
        if not matched_guests and len(query_tokens) >= 1:
            for n in [2, 3, 1]:
                for i in range(len(query_tokens) - n + 1):
                    phrase = " ".join(query_tokens[i:i+n])
                    if len(phrase) >= 4:
                        close = difflib.get_close_matches(phrase, list(self.guest_names.keys()), n=1, cutoff=0.82)
                        if close:
                            guest_norm = self.guest_names[close[0]]
                            if guest_norm not in matched_guests:
                                matched_guests.append(guest_norm)
                            # Expand query tokens with corrected guest name tokens for BM25
                            for t in self._tokenize(close[0]):
                                if t not in query_tokens:
                                    query_tokens.append(t)

        # 1. Lexical BM25 Scores with query tokens (including fuzzy corrections)
        bm25_scores = self.bm25.get_scores(query_tokens)

        # 3. Combine scores with Entity & Keyword Boost
        scored_candidates = []
        for idx, score in enumerate(bm25_scores):
            chunk = self.chunks[idx]
            final_score = float(score)

            # Guest boost
            chunk_guest = chunk.get("guest", "").lower()
            if matched_guests and any(g.lower() in chunk_guest for g in matched_guests):
                final_score *= 2.5
            elif guest_filter and guest_filter.lower() in chunk_guest:
                final_score *= 3.0

            # Explicit title match boost
            chunk_title_lower = chunk.get("title", "").lower()
            matching_title_tokens = sum(1 for t in query_tokens if t in chunk_title_lower)
            if matching_title_tokens > 0:
                final_score += (matching_title_tokens * 1.5)

            if final_score > 0.01:
                scored_candidates.append((idx, final_score))

        # Sort by final score descending
        scored_candidates.sort(key=lambda x: x[1], reverse=True)

        # 4. Extract Top-K results and format source citation
        results = []
        for rank, (idx, score) in enumerate(scored_candidates[:top_k]):
            chunk = self.chunks[idx]
            
            # Format clean snippet quote
            snippet = chunk.get("text", "")[:350] + "..." if len(chunk.get("text", "")) > 350 else chunk.get("text", "")

            results.append({
                "chunk_id": chunk.get("id"),
                "guest": chunk.get("guest"),
                "title": chunk.get("title"),
                "timestamp": chunk.get("timestamp"),
                "start_seconds": chunk.get("start_seconds", 0),
                "youtube_url": chunk.get("youtube_url"),
                "score": round(score, 4),
                "rank": rank + 1,
                "text": chunk.get("text"),
                "snippet": snippet,
                "keywords": chunk.get("keywords", [])
            })

        return results

    def format_context_for_prompt(self, results: List[Dict[str, Any]]) -> str:
        """
        Formats retrieved chunks into clean grounded context for prompt injection.
        """
        if not results:
            return "NO RELEVANT PODCAST MATERIAL FOUND."

        blocks = []
        for i, res in enumerate(results, 1):
            block = (
                f"--- SOURCE [{i}] ---\n"
                f"Episode: {res['title']}\n"
                f"Guest: {res['guest']}\n"
                f"Timestamp: {res['timestamp']}\n"
                f"YouTube Link: {res['youtube_url']}\n"
                f"Transcript Content:\n{res['text']}\n"
            )
            blocks.append(block)

        return "\n\n".join(blocks)

# Singleton instance
retriever_instance = None

def get_retriever() -> HybridRetriever:
    global retriever_instance
    if retriever_instance is None:
        retriever_instance = HybridRetriever()
    return retriever_instance
