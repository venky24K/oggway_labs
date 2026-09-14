# Product Requirements Document (PRD)
## The Lenny Growth Assistant

**Status:** Approved & Implemented  
**Author:** Forward Deployed Engineer (FDE)  
**Date:** September 2026  
**Target Delivery:** Client Evaluation & Handoff  

---

## 1. Forward Deployment Discovery Brief

### 1.1 User & Problem Framing
* **Primary User Persona:** Product Managers (PMs), Heads of Product, Growth Leads, and Founders who need tactical, battle-tested frameworks to solve growth, activation, retention, and pricing challenges.
* **The Job-to-be-Done (JTBD):** *"When I am formulating a growth strategy or preparing a product review, I want grounded, concrete advice and reusable frameworks from world-class operators (Elena Verna, Brian Chesky, Shreyas Doshi, Sean Ellis), so that I can make high-conviction decisions and build stakeholder-ready deliverables without spending 40 hours listening to podcasts or getting generic AI fluff."*
* **The Pain Point Removed:** Generic LLMs hallucinate vague product advice ("focus on the user", "iterate quickly") and lack concrete attribution. Searching through 300+ episodes of 90-minute podcast transcripts manually is impossible during day-to-day sprint cadences. Teams want instant answers, verifiable YouTube timestamp deep-links, reusable written essays, and live interactive calculators.

### 1.2 Measurable Success Metrics
1. **Product Grounding Precision (Product Metric):** **> 95%** of claims in assistant answers must cite an exact guest, episode title, and valid YouTube timestamp link. Zero tolerance for fabricated guest quotations.
2. **Time-to-Deliverable Velocity (Operational Metric):** Reduce time spent drafting growth essays and interactive projection models from **3 hours to < 15 seconds**.
3. **Local Operational Availability (Reliability Metric):** **100%** uptime during evaluation via Graceful Fallback Engine, ensuring zero crashes whether Ollama is local, offline, or switching to cloud APIs.

### 1.3 Key Assumptions Made
* **Assumption 1 (Environment Agnostic Evaluation):** Evaluator environments vary widely (some have high-end GPUs with Ollama pre-installed, others run on corporate laptops without Docker or local LLMs). The application must operate out-of-the-box with zero mandatory external dependencies while supporting Ollama, Claude, OpenAI, and Supabase.
* **Assumption 2 (Transcript Completeness):** The [ChatPRD Lenny's Podcast Transcripts](https://github.com/ChatPRD/lennys-podcast-transcripts) repository contains 303 episodes with YAML frontmatter. Transcripts are treated as an immutable golden knowledge base.
* **Assumption 3 (Security Posture for Generated Artifacts):** Evaluators will ask the assistant to generate interactive HTML/JS widgets. Treating generated code as inherently untrusted and enforcing strict `<iframe>` sandboxing is mandatory to prevent cross-site scripting (XSS) or parent DOM tampering.

### 1.4 Scope Choices (Inclusions vs. Intentional Exclusions)
* **What We Included:**
  * Complete offline index across 303 episodes and 15,194 semantic chunks.
  * Hybrid BM25 keyword search + entity boosting + Reciprocal Rank Fusion (RRF).
  * Direct YouTube timestamp deep-linking (`https://www.youtube.com/watch?v=ID&t=Xs`).
  * Dedicated **Ship 30 for 30** Content Skill generating structured ~1,250-word atomic essays with irresistible hooks, 1-3-1 cadence, and actionable takeaways.
  * **Claude-Style Side-by-Side Artifact Viewer** with strict iframe sandboxing (`sandbox="allow-scripts"`, restricted CSP, no cookies/storage).
  * Flexible LLM toggle: Ollama (Local), Anthropic Claude, OpenAI, and Grounded Fallback Engine.
  * Multi-session persistence with PostgreSQL (Supabase) + automatic SQLite fallback.
* **What We Intentionally Excluded & Rationale:**
  * *Live Voice Transcription Pipeline:* Excluded to keep local startup instant; all 303 transcripts are pre-parsed.
  * *Multi-Tenant RBAC & Auth:* Excluded from this initial local deployment phase to minimize operational friction for evaluators while maintaining session isolation per user.

---

## 2. Risks & Technical Trade-Offs

| Risk / Trade-Off | Impact | Mitigation Strategy Implemented |
| :--- | :--- | :--- |
| **Hallucination & Generic PM Fluff** | High | Strict RAG prompt injection constraint: The assistant answers *strictly* from retrieved transcript chunks and is instructed to say *"Based strictly on Lenny's Podcast transcripts, this topic is not discussed in the available episodes"* when ungrounded. |
| **Local Model (Ollama) Latency & Availability** | High | Evaluator machine may not have Ollama installed or running. The system auto-detects Ollama health and provides a zero-dependency **Grounded Fallback Engine** that synthesizes grounded citations, essays, and artifacts with 0ms cold-start. |
| **Unsafe Artifact Rendering (XSS / Data Leakage)** | Critical | Render all HTML artifacts inside an isolated `<iframe>` with `sandbox="allow-scripts"` (without `allow-same-origin` or `allow-top-navigation`) and inject a strict Content Security Policy (`connect-src 'none'`). |
| **Context Window Truncation on Long Podcasts** | Medium | Turn-aware semantic chunker (~350 words) preserving speaker metadata and timestamps, preventing memory overflow while retaining conversational nuance. |
| **Database Connection Failures** | Medium | SQLAlchemy async engine dynamically inspects `DATABASE_URL`; if PostgreSQL / Supabase is unreachable, it seamlessly falls back to local SQLite without crashing. |

---

## 3. Detailed User Flows

### Flow 1: Grounded PM & Growth Discovery
1. User enters question (e.g., *"How does Elena Verna define Product-Led Growth vs Sales-Led Growth?"*).
2. Backend runs BM25 + entity-boosted hybrid retrieval over 15,194 chunks.
3. Assistant returns a structured response citing Elena Verna's exact framework, accompanied by clickable citation badges that open the episode at the exact minute/second on YouTube.

### Flow 2: Ship 30 for 30 Content Generation
1. User clicks *"⚡ Turn into Ship 30 for 30 Essay"* or prompts the assistant.
2. The specialized writing skill applies the Nicolas Cole & Dickie Bush principles:
   * Irresistible curiosity hook.
   * 1-3-1 visual cadence and skimmable headings.
   * Specific grounded quotes and frameworks from Lenny's guests.
   * 48-Hour Tactical Implementation Checklist (~1,250 words).

### Flow 3: Interactive Artifact Creation & Split-Screen Inspection
1. User requests a tool (e.g., *"Generate an interactive Growth & Retention Model calculator"*).
2. Assistant streams an explanatory message and generates an isolated HTML/CSS/JS payload.
3. The UI automatically opens the **Claude-Style Artifact Viewer** in a side-by-side split screen.
4. User interacts with live sliders (Traffic, Signup Rate, Churn) and observes real-time projected ARR calculations.
5. User can switch between **Preview** and **Code** tabs, copy the code, or download the `.html` file.

---

## 4. Acceptance Criteria

* **AC-1 (Grounding):** All responses must identify guest name, episode title, and timestamp. If query is out of scope, assistant must acknowledge lack of material.
* **AC-2 (Skills):** Ship 30 for 30 skill must produce structured essays containing hook, visual architecture, grounded quotes, and takeaways.
* **AC-3 (Artifacts):** Artifact Viewer must render beside chat in a split view, supporting Preview and Code tabs, Copy, and Download.
* **AC-4 (Security):** Generated HTML must run within a sandboxed iframe without access to parent storage or cookies.
* **AC-5 (Persistence):** Sessions and messages must persist across reloads in PostgreSQL / SQLite.
* **AC-6 (Resilience):** The app must run smoothly with Ollama, Claude, OpenAI, or in offline fallback mode.
