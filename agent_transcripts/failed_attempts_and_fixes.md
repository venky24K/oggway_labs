# Agent Development Post-Mortem: Failed Attempts & Corrections
## The Lenny Growth Assistant

As part of the Forward Deployed Engineer (FDE) engagement, this document provides complete visibility into technical hurdles, failed attempts, and the architectural corrections implemented during AI-assisted development.

---

### Incident 1: SQLAlchemy Async Relationship Serialization (`MissingGreenlet`)

#### The Symptom
During initial automated test execution (`pytest backend/tests -v`), session creation and persistence tests failed with the following traceback:
```
fastapi.exceptions.ResponseValidationError: 2 validation errors:
{'type': 'get_attribute_error', 'loc': ('response', 'messages'),
 'msg': "Error extracting attribute: MissingGreenlet: greenlet_spawn has not been called; can't call await_only() here. Was IO attempted in an unexpected place?"}
```

#### Root Cause Analysis
In SQLAlchemy 2.0 async mode, relationship attributes (`session.messages` and `session.artifacts`) default to lazy-loading (`lazy="select"`). When FastAPI's response serializer attempts to read these attributes synchronously while transforming the ORM object into a Pydantic `SessionResponse`, it triggers synchronous I/O on an async engine, triggering `MissingGreenlet`.

#### The Fix
1. Updated `backend/app/models.py` to specify `lazy="selectin"` on both relationships:
   ```python
   messages = relationship("MessageModel", back_populates="session", cascade="all, delete-orphan", lazy="selectin", order_by="MessageModel.created_at")
   artifacts = relationship("ArtifactModel", back_populates="session", cascade="all, delete-orphan", lazy="selectin", order_by="ArtifactModel.created_at")
   ```
2. In `create_session` in `backend/app/main.py`, explicitly reloaded the newly committed session object using `selectinload`:
   ```python
   result = await db.execute(
       select(SessionModel)
       .options(selectinload(SessionModel.messages), selectinload(SessionModel.artifacts))
       .where(SessionModel.id == session_obj.id)
   )
   return result.scalars().first()
   ```
3. Re-ran `pytest`: 12 out of 12 tests passed immediately.

---

### Incident 2: Handling Uninstalled or Offline Ollama Environments

#### The Symptom
The target machine did not have Ollama installed or running (`The term 'ollama' is not recognized`). In a naive implementation, attempting to connect to `http://localhost:11434` would throw `httpx.ConnectError: [Errno 111] Connection refused`, crashing the application or returning blank screens to the evaluator.

#### Root Cause Analysis
Client machines and evaluation environments vary widely. Relying on an external daemon without a resilient degradation strategy violates core Forward Deployed Engineering principles.

#### The Fix: Multi-Tier Resilient Provider Architecture
We implemented an intelligent **Grounded Fallback Engine** (`backend/app/agent/providers.py`):
1. **Health Probing:** The agent router performs a fast 2-second timeout probe to `http://localhost:11434/api/tags`.
2. **Graceful Fallback:** If Ollama is offline or uninstalled, the system automatically routes the query to `GroundedFallbackProvider`.
3. **Grounding Preservation:** The fallback engine still runs the full hybrid RAG retriever over 15,194 chunks, generates accurate guest citations, deep-links to YouTube timestamps, constructs full ~1,250-word Ship 30 for 30 essays, and renders interactive HTML artifacts.
4. **UI Transparency:** The status pill in the UI clearly informs the user: *"Ollama Offline (Fallback Ready)"* and provides a one-click Settings modal where users can configure cloud keys (Anthropic / OpenAI) or connect Ollama when ready.

---

### Incident 3: Browser Subagent Playwright Network Isolation

#### The Symptom
When attempting to execute visual verification via `browser_subagent`, the Playwright manager failed to download the browser driver:
```
failed to install playwright: could not install driver: error: got non 200 status code: 404 (404 Not Found) from https://playwright.azureedge.net/builds/driver/playwright-1.57.0-win32_x64.zip
```

#### Root Cause Analysis
Corporate networks and certain sandboxed container environments block direct binary downloads or return CDN 404s for specific binary versions.

#### The Fix
Rather than being blocked, we established an automated live verification test script (`backend/verify_live.py`) using `httpx` that programmatically asserts:
- Backend health endpoint (`200 OK`, reporting 303 episodes and 15,194 chunks).
- Grounded RAG chat execution with Elena Verna citations and YouTube links.
- Ship 30 for 30 essay generation (> 800 words, structured hook and headings).
- Interactive Artifact generation with secure sandboxing checks.
- Frontend static asset delivery (`200 OK` on `http://localhost:5173/`).
All checks passed synchronously in under 4 seconds.

---

### Incident 4: Windows CP1252 Console Character Encoding

#### The Symptom
During live CLI testing on Windows, the verification script crashed with:
```
UnicodeEncodeError: 'charmap' codec can't encode character '\u2705' in position 2: character maps to <undefined>
```

#### Root Cause Analysis
Windows PowerShell and command prompts default to Windows-1252 code page (`cp1252`), which cannot encode certain multi-byte Unicode emojis without explicit UTF-8 reconfiguration.

#### The Fix
Replaced raw Unicode emoji console output with robust ASCII formatting (`[SUCCESS] ALL LIVE VERIFICATION CHECKS PASSED SUCCESSFULLY!`), ensuring deterministic execution across any terminal on Windows, Linux, or macOS.

---

### Incident 5: Pydantic v2 Migration Deprecation Warnings

#### The Symptom
Console warnings appeared:
- `Support for class-based config is deprecated, use ConfigDict instead.`
- `The dict method is deprecated; use model_dump instead.`
- `from_orm is deprecated; use model_validate instead.`

#### The Fix
Refactored all schemas in `backend/app/schemas.py` and routers in `backend/app/agent/router.py` to modern Pydantic v2 conventions:
- `model_config = ConfigDict(from_attributes=True)`
- `artifact.model_dump()`
- `ArtifactResponse.model_validate(artifact_model)`
Result: Zero deprecation warnings in test outputs.
