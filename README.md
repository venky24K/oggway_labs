# 🎙️ The Lenny Growth Assistant
### Enterprise AI Product & Growth Intelligence Platform
> **Forward Deployed Engineer (FDE) Take-Home Assignment Deliverable**  
> Grounded exclusively in 303 episodes of [Lenny's Podcast Transcripts](https://github.com/ChatPRD/lennys-podcast-transcripts) with over 15,000 indexed segments.

---

## 🌟 Overview & Key Capabilities

The **Lenny Growth Assistant** is a full-stack, AI-powered conversational web application built for product managers, growth leads, and founders. It transforms hundreds of hours of raw podcast transcripts into actionable, grounded frameworks:

1. **Grounded Conversational Intelligence:** Answers PM and growth questions strictly from podcast transcripts, citing exact guests, episode titles, and clickable YouTube timestamp links (`https://www.youtube.com/watch?v=ID&t=Xs`).
2. **Dedicated Ship 30 for 30 Content Skill:** Transforms insights into ~1,250-word atomic essays featuring irresistible hooks, 1-3-1 visual cadence, skimmable headings, and 48-hour implementation checklists (Nicolas Cole & Dickie Bush methodology).
3. **Claude-Style Side-by-Side Artifact Viewer:** Renders interactive deliverables (such as live PLG Funnel Calculators and PRD canvases) beside the chat pane in a split-screen workspace with strict security sandboxing (`sandbox="allow-scripts"`, restricted CSP, isolated origin).
4. **Flexible LLM Configuration & Resilient Fallback:** Seamlessly toggles between **Ollama (Local)**, **Anthropic Claude**, **OpenAI**, **Google Gemini**, and a zero-dependency **Grounded Fallback Engine** that works out-of-the-box on any machine.
5. **Interactive Settings & Model Management Studio:** A 4-tab studio modal featuring model search, dynamic local model scanning, custom model addition with duplicate prevention, confirmation delete modals, live active `.env` key badges, and live database persistence status.
6. **Persistence:** PostgreSQL (Supabase / Railway / Docker) with live dynamic engine reconnection and automatic local SQLite fallback (`aiosqlite`).

---

## 🏛️ System Architecture

```
+--------------------------------------------------------------------------------------------------+
|                                    Frontend SPA (React + Vite)                                   |
|   +-----------------------+     +-------------------------------+     +----------------------+   |
|   |   Sidebar & Sessions  |     |   Chat Area & Citations       |     |   Artifact Viewer    |   |
|   |   - Session History   |     |   - Grounded Response stream  |     |   - Sandboxed Iframe |   |
|   |   - Playbook Chips    |     |   - Clickable YouTube badges  |     |   - Preview / Code   |   |
|   +-----------------------+     +-------------------------------+     +----------------------+   |
+-------------------------------------------------+------------------------------------------------+
                                                  | REST API / Reverse Proxy (:5173 -> :8000)
                                                  v
+--------------------------------------------------------------------------------------------------+
|                                      FastAPI Backend Service                                     |
|   +------------------------------------+     +-----------------------------------------------+   |
|   |   API & Sessions (/api/chat, etc.) |     |             Agent & Skills Router             |   |
|   |   - Supabase PG + SQLite Fallback  |     |   - Ship 30 for 30 Essay Skill (~1,250 words) |   |
|   |   - Pydantic v2 Contracts          |     |   - Interactive Artifact Builder & Parser     |   |
|   +------------------------------------+     +-----------------------------------------------+   |
|                                                              |                                   |
|                                                              v                                   |
|   +------------------------------------------------------------------------------------------+   |
|   |        Hybrid RAG Engine (BM25Okapi + Guest Entity Boosting + RRF Ranking)               |   |
|   +------------------------------------------------------------------------------------------+   |
|                                                              |                                   |
|                                                              v                                   |
|   +------------------------------------------------------------------------------------------+   |
|   |   [Ollama (Local LLM)]  <-->  [Anthropic Claude]  <-->  [OpenAI]  <--> [Fallback Engine] |   |
|   +------------------------------------------------------------------------------------------+   |
+--------------------------------------------------------------------------------------------------+
```

---

## 🚀 Quick Start & Installation

### Option A: One-Command Startup with Docker Compose (Recommended)
```bash
# 1. Clone repository
git clone https://github.com/SRMAP/oggway_labs.git
cd oggway_labs

# 2. Copy environment file
cp .env.example .env

# 3. Start PostgreSQL, Backend, and Frontend containers
docker compose up -d
```
* **Frontend UI:** Open [http://localhost:5173](http://localhost:5173)
* **Backend API Docs:** Open [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Endpoint:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Option B: Local Development Startup (Zero Docker Dependency)

#### 1. Backend Setup (FastAPI & RAG Engine)
```bash
# Create and activate virtual environment (optional)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI backend
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Setup (React SPA)
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## ⚙️ Configuration & LLM Provider Setup

Create a `.env` file from the provided `.env.example`:

```ini
# Application Info
APP_NAME="The Lenny Growth Assistant"
ENVIRONMENT="development"

# Database Persistence: Supabase PostgreSQL (or leave blank for automatic SQLite fallback)
DATABASE_URL=
# Example Supabase:
# DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@[REF].supabase.co:5432/postgres

# Active LLM Engine ("ollama", "anthropic", "openai", "gemini", or "fallback")
DEFAULT_PROVIDER=ollama

# Local LLM (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Cloud LLMs (Optional)
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o
OPENAI_BASE_URL=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

### Running Local LLMs with Ollama
1. Download & install [Ollama](https://ollama.com/).
2. Pull your model of choice:
   ```bash
   ollama pull llama3.2
   # or
   ollama pull qwen3.5:2b
   ```
3. Start Ollama: `ollama serve`. The assistant will automatically detect it via `http://localhost:11434`.

### Zero-Dependency Fallback Mode
If Ollama is not installed or running, **the application will NOT crash**. The assistant auto-detects connectivity and switches to the **Grounded Fallback Engine**, executing full hybrid retrieval over the 15,194 podcast chunks, returning verified YouTube citations, Ship 30 for 30 essays, and interactive artifacts with zero latency.

---

## 🧪 Testing & Verification

### 1. Automated Test Suite (Pytest)
Run the 13 automated unit and integration tests (executes in ~1.5 seconds):
```bash
pytest backend/tests -v
# or
python -m pytest backend/tests -v
```
**Coverage (13/13 Passing):**
* `test_api.py`: Health check, provider listing, live runtime `/api/settings` GET/POST contracts, session CRUD, chat RAG grounding contract.
* `test_rag.py`: BM25 indexing, Brian Chesky search, timestamp metadata, out-of-scope question handling.
* `test_skills.py`: Ship 30 for 30 essay length & visual structure, HTML artifact parsing, sandboxing constraints.
* `test_persistence.py`: Multi-turn session message retention, artifact session linking.

### 2. Live End-to-End System Check
Run the live integration verification script:
```bash
python backend/verify_live.py
```

### 3. Manual UI Verification
Follow the comprehensive test plan in [tests/manual_test_plan.md](tests/manual_test_plan.md).

---

## 🛡️ Artifact Security & Iframe Sandboxing

Treating AI-generated HTML as untrusted is critical. The Lenny Growth Assistant implements an isolated sandbox:
1. **Isolated Origin (`sandbox="allow-scripts"`):**
   * Enables client-side calculator interactivity.
   * Deliberately omits `allow-same-origin`: The iframe cannot read `document.cookie`, `localStorage`, or access parent window objects.
   * Deliberately omits `allow-top-navigation`: The iframe cannot redirect the parent page.
   * Deliberately omits `allow-forms`: Prevents phishing form submissions.
2. **Injected Content Security Policy (CSP):**
   * Enforces `<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' data:; connect-src 'none';">`.
   * `connect-src 'none'` locks down external network calls, preventing unauthorized data exfiltration.

---

## 📂 Deliverables Index

| # | Deliverable | File / Location | Description |
| :--- | :--- | :--- | :--- |
| 1 | **Source Code** | Full Repository | Complete codebase with zero committed secrets and clean structure. |
| 2 | **README.md** | [README.md](README.md) | Evaluator guide, quickstart, architecture, and configuration. |
| 3 | **PRD** | [PRD.md](PRD.md) | Forward Deployment brief, JTBD, success metrics, assumptions, risks. |
| 4 | **Design Spec** | [design.md](design.md) | UI/UX principles, design system tokens, states, accessibility. |
| 5 | **Architecture** | [architecture.md](architecture.md) | DB schema, REST contracts, RAG pipeline, LLM routing, security. |
| 6 | **Agent Transcripts** | [agent_transcripts/](agent_transcripts/) | Engineering transcripts & post-mortem of failed attempts and fixes. |
| 7 | **Tests** | [backend/tests/](backend/tests/) & [tests/manual_test_plan.md](tests/manual_test_plan.md) | 13 automated pytest tests + manual UI verification plan. |
| 8 | **Demo Video Script** | [DEMO_SCRIPT.md](DEMO_SCRIPT.md) | 2–3 minute video presentation script and walkthrough instructions. |

---

## 🤝 Forward Deployment Handoff & Troubleshooting

* **PostgreSQL / Supabase Connection Issues:** If Supabase is unreachable, the system automatically falls back to local SQLite at `data/lenny_assistant.db`. The Settings modal and header status pill dynamically display the active driver (`Supabase PostgreSQL Connected & Active` vs `Local SQLite Database Active`).
* **Dynamic Database Reconnection:** Updating the database URL in the Settings modal dynamically tests and initializes the connection pool at runtime without needing a server restart.
* **Adding New Podcast Transcripts:** Simply drop new markdown files into `data/transcripts/` and run:
  ```bash
  python -m backend.app.rag.ingest data/transcripts data/transcripts_index.json
  ```
* **Switching LLM Providers & Models Live:** Click the ⚙️ Settings icon in the UI header to switch between Ollama, Anthropic Claude, OpenAI, Google Gemini, or Fallback without restarting the application. API keys configured in `.env` are protected from accidental blank overwrites.
