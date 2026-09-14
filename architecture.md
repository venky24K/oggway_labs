# Technical Architecture & System Specification
## The Lenny Growth Assistant

**Document Status:** Complete & Verified  
**Target Platform:** Linux/macOS/Windows, Docker, Supabase, Local & Cloud LLMs  

---

## 1. High-Level Architecture Diagram

```
+--------------------------------------------------------------------------------------------------+
|                                        Client Tier (SPA)                                         |
|                                                                                                  |
|   +-----------------------+     +-------------------------------+     +----------------------+   |
|   |   Sidebar & Sessions  |     |   Chat Area & Citations       |     |   Artifact Viewer    |   |
|   |   - History & Search  |     |   - Grounded Response stream  |     |   - Sandboxed Iframe |   |
|   |   - Playbook Chips    |     |   - Clickable YouTube badges  |     |   - Preview / Code   |   |
|   +-----------------------+     +-------------------------------+     +----------------------+   |
+-------------------------------------------------+------------------------------------------------+
                                                  | HTTP / REST API (Port 5173 -> 8000)
                                                  v
+--------------------------------------------------------------------------------------------------+
|                                      Backend Service (FastAPI)                                   |
|                                                                                                  |
|   +------------------------------------+     +-----------------------------------------------+   |
|   |       API & Middleware Layer       |     |             Agent & Skills Router             |   |
|   |   - /api/health                    |     |   - Intent Classifier & Session Manager       |   |
|   |   - /api/sessions, /api/chat       |     |   - Ship 30 for 30 Essay Skill (~1,250 words) |   |
|   |   - CORS & Request Validation      |     |   - Artifact Generator (HTML/CSS & Markdown)  |   |
|   +------------------------------------+     +-----------------------------------------------+   |
|                     |                                                |                           |
|                     v                                                v                           |
|   +------------------------------------+     +-----------------------------------------------+   |
|   |    Persistence Layer (SQLAlchemy)  |     |        Hybrid RAG Knowledge Engine            |   |
|   |   - Supabase PostgreSQL (Primary)  |     |   - BM25Okapi Lexical Ranker                  |   |
|   |   - aiosqlite Async (Fallback)     |     |   - Guest & Title Entity Booster              |   |
|   |   - Eager selectinload loading     |     |   - Reciprocal Rank Fusion (RRF)              |   |
|   +------------------------------------+     +-----------------------------------------------+   |
|                                                                      |                           |
|                                                                      v                           |
|   +------------------------------------------------------------------------------------------+   |
|   |                                Flexible LLM Routing Layer                                |   |
|   |   [Ollama (Local /:11434)]  <-->  [Anthropic Claude]  <-->  [OpenAI]  <--> [Fallback Engine] |   |
|   +------------------------------------------------------------------------------------------+   |
+--------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
                                     Data Store & Knowledge Base
                           (303 Episodes, 15,194 Timestamped Chunks)
```

---

## 2. Database Schema & Persistence Design

The persistence engine uses **SQLAlchemy 2.0 Async** with full PostgreSQL support (compatible with Supabase, Railway, Neon, or local Docker PG) paired with an automatic, zero-configuration **SQLite fallback** (`aiosqlite`).

### 2.1 Entity Relationship Diagram (ERD)
```
  +--------------------------------+
  |            sessions            |
  +--------------------------------+
  | PK  id             VARCHAR(36) |
  |     title          VARCHAR(255)|
  |     created_at     TIMESTAMP   |
  |     updated_at     TIMESTAMP   |
  |     metadata_json  JSON        |
  +--------------------------------+
             |             |
      1:N    |             | 1:N
             v             v
  +--------------------+  +----------------------+
  |      messages      |  |      artifacts       |
  +--------------------+  +----------------------+
  | PK  id VARCHAR(36) |  | PK  id   VARCHAR(36) |
  | FK  session_id     |  | FK  session_id       |
  |     role           |  |     message_id       |
  |     content        |  |     title            |
  |     citations_json |  |     artifact_type    |
  |     model_used     |  |     content          |
  |     created_at     |  |     created_at       |
  +--------------------+  +----------------------+
```

### 2.2 SQL DDL (PostgreSQL & SQLite)
```sql
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT 'New Growth Conversation',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata_json JSON DEFAULT '{}'::json
);

CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    citations_json JSON DEFAULT '[]'::json,
    model_used VARCHAR(100) DEFAULT 'ollama',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_messages_session ON messages(session_id, created_at);

CREATE TABLE artifacts (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    message_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    artifact_type VARCHAR(50) NOT NULL DEFAULT 'html',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_artifacts_session ON artifacts(session_id);
```

---

## 3. Ingestion & Retrieval Pipeline (RAG)

### 3.1 Ingestion Flow
1. **Frontmatter Parsing:** Extracts structured YAML (`guest`, `title`, `youtube_url`, `video_id`, `publish_date`, `keywords`).
2. **Turn-Aware Chunking:** Parses timestamped dialogue lines (e.g. `Lenny (00:15:30): ...`). Chunks preserve conversational context (~350 words) with 60-word overlap to prevent semantic fragmentation.
3. **Deep Link Resolution:** Calculates absolute seconds from timestamp strings to format deterministic YouTube deep-links: `https://www.youtube.com/watch?v={video_id}&t={seconds}s`.
4. **Offline Cache Compilation:** All 303 episodes are pre-indexed into `data/transcripts_index.json` (42 MB), providing sub-second cold-start on any evaluation machine.

### 3.2 Hybrid Retrieval Algorithm
* **Step 1: BM25 Lexical Matching:** Tokenizes query against chunks using `rank_bm25` (BM25Okapi).
* **Step 2: Guest & Keyword Entity Boosting:** If the query names a known guest (e.g. "Elena Verna", "Brian Chesky") or matches episode keywords, their score is scaled up by **2.5x - 3.0x**.
* **Step 3: Reciprocal Rank Fusion (RRF):** Combines lexical score with title match bonus.
* **Step 4: Citation Formatting:** Returns Top-K chunks with guest attribution, episode title, snippet, and YouTube link.

---

## 4. Agent Routing & Skills Layer

### 4.1 Ship 30 for 30 Writing Skill
* Implements the Nicolas Cole & Dickie Bush framework:
  1. Irresistible Hook & 1-Sentence Opener.
  2. 1-3-1 Cadence (1 sentence line, 3 sentence explanation, 1 punchline).
  3. Skimmable Subheadings communicating full thoughts.
  4. Grounded Real-World Cases citing Lenny's guests.
  5. 48-Hour Implementation Checklist (~1,250 words target).

### 4.2 Artifact Maker Skill
* Identifies requests for tools, calculators, canvases, or playbooks.
* Emits clean, self-contained HTML5/CSS3/JS code blocks.
* Tested against interactive models (e.g., PLG Funnel Simulator with real-time slider updates).

### 4.3 Flexible Provider Fallback Chain
```
[User Request]
       │
       ▼
[Check Requested Provider]
       ├── "ollama" ───► Ollama HTTP Check (127.0.0.1:11434) ──[Healthy]──► Run Local Model (llama3.2)
       │                                                     ──[Offline]─► Grounded Fallback Engine
       ├── "anthropic" ► Check ANTHROPIC_API_KEY              ──[Valid]───► Run Claude 3.5 Sonnet
       │                                                     ──[Missing]─► Grounded Fallback Engine
       ├── "openai" ───► Check OPENAI_API_KEY                 ──[Valid]───► Run GPT-4o
       │                                                     ──[Missing]─► Grounded Fallback Engine
       └── "fallback" ─► Grounded Fallback Engine (Zero-dependency RAG synthesizer)
```

---

## 5. Security & Isolation Architecture

* **Untrusted Artifact Rendering:**
  * Rendered exclusively inside an `<iframe>` with `sandbox="allow-scripts"`.
  * `allow-same-origin` is **omitted**: The iframe runs in a null origin, completely blocked from reading `document.cookie`, `localStorage`, `sessionStorage`, or parent window DOM.
  * `allow-top-navigation` is **omitted**: Prevents malicious link redirects.
  * Injected Content Security Policy (CSP):
    `default-src 'self' 'unsafe-inline' data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; object-src 'none'; base-uri 'none';`
  * `connect-src 'none'` locks down outbound HTTP requests, preventing data exfiltration.

---

## 6. API Endpoints Specification

| Method | Endpoint | Description | Sample Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health, DB connection, Ollama status, indexed chunk counts. | `{"status": "healthy", "database_connected": true, "indexed_chunks": 15194}` |
| `GET` | `/api/models` | List active provider, available models, and provider capabilities. | `{"current_provider": "ollama", "available_providers": ["ollama", "fallback"]}` |
| `GET` | `/api/sessions` | List all conversation sessions sorted by `updated_at`. | `[{"id": "...", "title": "Elena Verna PLG", "messages": [...]}]` |
| `POST` | `/api/sessions` | Create a new session. | `{"id": "uuid", "title": "New Growth Conversation"}` |
| `GET` | `/api/sessions/{id}` | Retrieve full conversation history and attached artifacts. | `{"id": "uuid", "messages": [...], "artifacts": [...]}` |
| `DELETE` | `/api/sessions/{id}` | Delete session and cascade delete all messages and artifacts. | `{"message": "Session deleted successfully"}` |
| `POST` | `/api/chat` | Main conversational endpoint. Supports RAG, Ship 30, and Artifacts. | `{"session_id": "...", "message": "...", "citations": [...], "artifact": {...}}` |
| `GET` | `/api/artifacts/{id}` | Retrieve individual artifact code and metadata. | `{"id": "...", "title": "Growth Funnel", "artifact_type": "html"}` |

---

## 7. Deployment Topologies

1. **Local Development (Fast & Zero Dependency):**
   * Backend: `uvicorn backend.app.main:app --port 8000` (uses SQLite fallback if no PG set)
   * Frontend: `npm run dev` (Vite on port 5173 with API proxy)
2. **One-Command Docker Compose:**
   * `docker compose up -d`
   * Spins up Postgres 16, FastAPI Backend, and Nginx Frontend.
3. **Cloud Deployment (Supabase + Railway):**
   * Connect `DATABASE_URL=postgresql+asyncpg://...supabase.co:5432/postgres`.
   * Deploy backend to Railway or Render with Dockerfile.backend.
