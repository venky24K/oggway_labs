# Manual UI & End-to-End Test Plan
## The Lenny Growth Assistant

This document provides evaluators with a concise manual verification script to test all core UI flows, artifact rendering, security isolation, and model switching.

---

### Prerequisites
1. Backend running: `uvicorn backend.app.main:app --port 8000` (or `docker compose up -d`)
2. Frontend running: `http://localhost:5173`
3. Browser: Chrome, Brave, Firefox, or Edge

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
