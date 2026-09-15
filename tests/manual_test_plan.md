# Manual UI & End-to-End Test Plan
## LennyOS (The Lenny Growth Assistant)

This document provides evaluators with a concise manual verification script to test all core UI flows, artifact rendering, security isolation, and model switching.

**Live Production URL:** [https://oggway-labs-68853090847.asia-southeast1.run.app/](https://oggway-labs-68853090847.asia-southeast1.run.app/)  
**GitHub Repository:** [https://github.com/venky24K/lennyos](https://github.com/venky24K/lennyos)  

---

### Prerequisites / Environments
* **Option 1 (Live Production):** Open [https://oggway-labs-68853090847.asia-southeast1.run.app/](https://oggway-labs-68853090847.asia-southeast1.run.app/)
* **Option 2 (Local Development):** Backend running on port 8000 (`uvicorn backend.app.main:app --port 8000` or `docker compose up -d`) and Frontend on port 5173 (`http://localhost:5173`).
* **Browser:** Chrome, Brave, Safari, Firefox, or Edge.

---

### Test Cases

| Test Case | Steps | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **TC-1: First Load & Welcome Hero** | 1. Open `http://localhost:5173`.<br>2. Observe header, status pill, and welcome hero cards. | Status pill displays model status (`Ollama Local` or `Ollama Offline (Fallback Ready)`). 4 quick-prompt cards are rendered with crisp styling. | [ PASS ] |
| **TC-2: Grounded Q&A with Citations** | 1. Click card: *"How does Elena Verna define Product-Led Growth vs Sales-Led Growth?"*<br>2. Observe assistant response. | Assistant provides grounded analysis of Elena Verna's framework. Beneath the response, citation badges show `Elena Verna`, timestamp `00:24:27`, and deep links. Clicking opens the YouTube video at the exact timestamp. | [ PASS ] |
| **TC-3: Ship 30 for 30 Essay Skill** | 1. Click *"⚡ Ship 30 for 30 Essay"* action chip beneath assistant response.<br>2. Wait for generation. | Assistant generates a long-form atomic essay (~1,250 words) featuring an irresistible hook, 1-3-1 cadence, skimmable headings, and a 48-hour implementation checklist. | [ PASS ] |
| **TC-4: Artifact Viewer & Split Layout** | 1. Click *"📊 Interactive Artifact"* or type: *"Generate an interactive Growth & Retention Model calculator"*. | Chat pane contracts smoothly to 50% width. The **Artifact Viewer** opens on the right displaying the interactive PLG simulator. | [ PASS ] |
| **TC-5: Artifact Interaction & Tabs** | 1. In Artifact Viewer, drag the *"Monthly Visitors"* slider.<br>2. Drag *"Signup Rate"* and *"Monthly Churn"* sliders.<br>3. Click the **Code** tab.<br>4. Click **Copy** and **Download**. | Projected Steady MAU and Estimated ARR recalculate in real time. The Code tab displays syntax-highlighted source code. Download produces a valid `.html` file. | [ PASS ] |
| **TC-6: Security & Iframe Isolation** | 1. Inspect the iframe in Browser DevTools.<br>2. Verify attributes and console. | Iframe has `sandbox="allow-scripts"` without `allow-same-origin`. Injected `<meta>` tag enforces `connect-src 'none'`. Iframe cannot access parent `window.localStorage` or cookies. | [ PASS ] |
| **TC-7: Persistence Across Reloads** | 1. Click *"+ New Conversation"* in sidebar.<br>2. Ask a question about *"Brian Chesky Founder Mode"*.<br>3. Refresh the browser page (`F5`).<br>4. Click the previous session in the sidebar. | Previous Elena Verna conversation and Brian Chesky conversation both appear in sidebar. Clicking restored conversation repopulates full message history and attached artifact. | [ PASS ] |
| **TC-8: Model Switching & Settings** | 1. Click ⚙️ Settings icon in header.<br>2. Change provider between Ollama, Anthropic, OpenAI, or Fallback.<br>3. Click *"Save & Apply"*. | Status pill in header updates immediately. If Ollama is offline or uninstalled, the app automatically routes to Fallback Engine without throwing 500 errors. | [ PASS ] |
| **TC-9: Models Studio & Add Model Validation** | 1. In Settings, open Models tab.<br>2. Type in search bar (e.g. `flash`).<br>3. Select a provider and model name in the Add Model bar.<br>4. Attempt to add an existing model (e.g. `gemini-1.5-flash`). | Filtered models update instantly. Adding an existing model displays an inline error: `Model "..." already exists for <provider>`. Adding a unique model appends it at the bottom. Custom model delete icon prompts a confirmation modal. | [ PASS ] |
| **TC-10: Local Providers & Scanned Models** | 1. In Settings, click **Local Providers** tab.<br>2. Check setup instructions and endpoint input.<br>3. Click **Rescan**.<br>4. Click any detected model card. | Instructions are formatted cleanly with links and code highlights. Rescan rotates the spinner and lists detected models one-by-one with `Active` or `Available` badges. Clicking a model activates it immediately. | [ PASS ] |
| **TC-11: Main Providers & Key Protection** | 1. In Settings, click **Main Providers** tab.<br>2. Verify inputs for Gemini, OpenAI, Anthropic.<br>3. Observe `.env` configured key badge.<br>4. Leave key input blank and click Save. | Configured keys display a green `[ Configured in .env (xxxx...xxxx) ]` badge and placeholder `•••••••• (Leave blank to keep configured key)`. Saving without changing input does NOT wipe existing `.env` keys. | [ PASS ] |
| **TC-12: Dynamic Database Driver Status** | 1. In Settings, click **Database (Supabase)** tab.<br>2. Check status indicator. | Displays `Supabase PostgreSQL Connected & Active` when connected, or `Local SQLite Database Active (Supabase fallback ready)` when fallback is active. Changing the URI triggers dynamic runtime engine reconnection. | [ PASS ] |
| **TC-13: Solid Colors & Default Light Mode** | 1. Clear local storage / open in incognito window.<br>2. Verify default light mode aesthetics.<br>3. Click the theme toggle icon. | Application defaults to clean, high-contrast light mode with crisp solid colors (zero gradients). Toggling switches to sleek dark mode with identical component alignment and zero visual regressions. | [ PASS ] |
