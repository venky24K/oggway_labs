# Design System & UI/UX Specification
## LennyOS (The Lenny Growth Assistant)

**Document Status:** Complete & Verified  
**Live Production URL:** [https://oggway-labs-68853090847.asia-southeast1.run.app/](https://oggway-labs-68853090847.asia-southeast1.run.app/)  
**GitHub Repository:** [https://github.com/venky24K/lennyos](https://github.com/venky24K/lennyos)  
**Brand Identity:** LennyOS by Oggway Labs  
**Design Philosophy:** Editorial Authority meets Modern AI Studio  

---

## 1. UI/UX Principles

1. **Grounded Transparency over Black-Box Magic:**
   Every AI claim is directly linked to its source. Rather than hiding behind opaque generation, the UI elevates citations with prominent, clickable YouTube timestamp badges (`▶ 12:24`), allowing users to audit claims in seconds.
2. **Artifact-Centric Workspace (Claude-Style):**
   Valuable PM outputs (checklists, calculators, PRDs) are not trapped in ephemeral chat bubbles. The UI splits into a dedicated side-by-side workspace where artifacts can be inspected, tested, copied, or downloaded.
3. **High-Density, Zero-Clutter Aesthetics:**
   Crafted for senior product practitioners. Clean typography (`Inter` + `JetBrains Mono`), sleek dark glassmorphism, subtle micro-animations, and balanced whitespace.
4. **Resilient Feedback & Graceful States:**
   The interface never freezes or leaves the user wondering. Connection statuses (Ollama, Cloud, Database) are visible in a clean pill badge with actionable settings.

---

## 2. Information Architecture (IA)

```
+----------------------------------------------------------------------------------------------------+
|                                         Top Navigation Bar                                         |
| [🎙️ Lenny Assistant]      [Status Pill: Ollama / Cloud / Fallback]   [Theme Toggle]   [Settings ⚙️]  |
+----------------------+----------------------------------------------+------------------------------+
|       Sidebar        |                  Chat Pane                   |       Artifact Viewer        |
|                      |                                              |                              |
| [+ New Conversation] | [Welcome Hero & Quick Playbook Chips]        | [Badge: HTML / Markdown]     |
|                      |                                              | [Tabs: Preview | Code]       |
| -- Conversations --  | [User Question Bubble]                       | [Actions: Copy, Download, X] |
| • Elena Verna PLG    |                                              |                              |
| • Brian Chesky Mode  | [Assistant Answer with Markdown formatting]  | +--------------------------+ |
| • Pricing Strategy   |                                              | |                          | |
|                      | [Citation Badges: ▶ YouTube Timestamps]      | |  Sandboxed <iframe>      | |
| -- Playbook Quick -- |                                              | |  - Sliders & Inputs      | |
| ⚡ Ship 30 Essay     | [Action Bar: Ship 30 Essay | Artifact Maker] | |  - Real-time Calculations| |
| 📊 Growth Calculator |                                              | |                          | |
|                      | +------------------------------------------+ | +--------------------------+ |
|                      | | Input Box: Prompt text...          [Send] | | [Shield: Sandbox Security] |
+----------------------+----------------------------------------------+------------------------------+
```

---

## 3. Design Tokens & Visual Hierarchy

### Color Palette (Curated Solid Palette — Zero Gradients)
* **Light Mode (Default Theme):**
  * Canvas Primary (`--bg-primary`): `#ffffff` (Crisp editorial canvas)
  * Surface Secondary (`--bg-secondary`): `#f8fafc` (Subtle off-white for sidebars and cards)
  * Surface Tertiary (`--bg-tertiary`): `#f1f5f9` (Light gray for chips and input bars)
  * Border Subtle (`--border-subtle`): `#e2e8f0`
  * Text Primary (`--text-primary`): `#0f172a` (High-contrast slate black)
  * Primary Accent (`--accent-primary`): `#2563eb` (Solid classic royal blue)
  * Primary Accent Hover (`--accent-primary-hover`): `#1d4ed8`
* **Dark Mode:**
  * Canvas Primary (`--bg-primary`): `#090d16` (Deep obsidian)
  * Surface Secondary (`--bg-secondary`): `#0f172a` (Slate surface for sidebar and panels)
  * Surface Tertiary (`--bg-tertiary`): `#1e293b`
  * Border Subtle (`--border-subtle`): `rgba(255, 255, 255, 0.08)`
  * Text Primary (`--text-primary`): `#f8fafc`
  * Primary Accent (`--accent-primary`): `#3b82f6` (Vivid solid blue)
  * Primary Accent Hover (`--accent-primary-hover`): `#2563eb`
* **Status Accents (Solid):**
  * Emerald (`#10b981`): Connected services, healthy citations, verified `.env` keys.
  * Amber (`#f59e0b`): Unset cloud keys warning / local fallback active.
  * Rose (`#ef4444`): Destructive actions (model delete, session delete).

### Typography
* **Primary Sans:** `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
  * Headings: 700 / 800 weight with tight tracking (`-0.02em`)
  * Body: 400 / 500 weight with relaxed line-height (`1.65`) for optimal readability of long-form essays
* **Monospace:** `'JetBrains Mono', monospace`
  * Used for timestamps (`00:24:12`), code snippets, and raw artifact views

---

## 4. Key Interaction States

| State | Visual Behavior | Trigger & User Experience |
| :--- | :--- | :--- |
| **1. Empty / Welcome State** | Hero icon (`🎙️`), headline, and 4 quick-prompt cards (Elena Verna, Brian Chesky, Ship 30 essay, Growth Calculator). | Default when opening a new chat. Users can click any card to launch immediate discovery without typing. |
| **2. Retrieval & Generation Loading** | Shimmer animation on assistant bubble with pulsing icon: *"Searching Lenny's transcripts and synthesizing grounded response..."* | Prevents UI freezing while BM25 search and LLM synthesis are executing. |
| **3. Grounded Answer State** | Clean markdown typography with highlighted guest names, bullet points, and **Podcast Grounding Chips** linking directly to the YouTube timestamp. | Hovering over a chip reveals the exact quote; clicking opens the episode in a new tab. |
| **4. Split-Pane Artifact State** | The chat pane smoothly contracts to 50% width as the **Artifact Viewer** slides in from the right (`animation: slideIn 0.3s cubic-bezier`). | Allows side-by-side comparison: reading the chat rationale on the left while interacting with the live calculator on the right. |
| **5. Provider Toggle / Fallback State** | Header status pill changes color (Green = Live Ollama/Cloud, Amber = Fallback Mode). | Tooltips inform the user of current routing and fallback behavior without interrupting work. |

---

## 5. Security & Isolation Architecture for Artifacts

Untrusted HTML generation poses severe risks if embedded directly into the DOM (e.g. cookie theft, parent DOM tampering, phishing overlays). We enforce a **Defense-in-Depth Sandbox Model**:

1. **`<iframe>` Origin Sandboxing:**
   * Attribute: `sandbox="allow-scripts"`
   * **Explicitly Disallowed:**
     * `allow-same-origin` is omitted: The frame is treated as a foreign, isolated origin. It has zero access to parent cookies (`document.cookie`), `localStorage`, `sessionStorage`, or the host DOM window.
     * `allow-top-navigation` is omitted: Prevents malicious scripts from redirecting the parent page.
     * `allow-forms` is omitted: Prevents rogue form submissions or phishing inputs.
2. **Injected Content Security Policy (CSP):**
   * Every HTML artifact has a strict `<meta>` CSP header injected:
     `default-src 'self' 'unsafe-inline' data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; object-src 'none'; base-uri 'none';`
   * `connect-src 'none'` guarantees that generated scripts cannot make outbound `fetch()` or `XMLHttpRequest` calls, eliminating data exfiltration risks.

---

## 6. Accessibility & Responsive Considerations

* **Keyboard Navigability:** Full tab-order navigation across sidebar sessions, action chips, artifact tabs, and input forms. Enter sends messages; Shift+Enter creates newlines.
* **Contrast Compliance:** All text styles exceed **WCAG 2.1 AA** contrast ratios (minimum 4.5:1 against respective backgrounds).
* **Responsive Layout:**
  * **Desktop (> 1024px):** Side-by-side 50/50 split pane for chat and artifact viewer.
  * **Tablet & Mobile (< 768px):** Collapsible off-canvas drawer for sidebar; Artifact Viewer switches to an overlay drawer with a full-screen maximize button.

---

## 7. Settings & Model Management Studio Specification

The Settings modal is architected as an editorial studio interface with fixed dimensions to prevent layout shifting:
* **Fixed Modal Geometry:** Outer modal container is locked to `max-width: 820px; height: 650px;`, and the inner studio workspace is locked to `height: 520px;`. Content sections scroll internally so navigation tabs remain rock-solid.
* **4-Tab Navigation:**
  1. **Models:** Search filter input, sorted rows (available models on top, API-key disabled models at bottom with clear indicator), custom model addition bar (`[Provider Dropdown] [Model Name] [Add]`), and confirmation deletion modals.
  2. **Local Providers:** Minimalist numbered Ollama setup instructions, direct single-line custom endpoint field with documentation links, and detected local models rendered in a clean card list (`.local-scanned-container`, `.local-scanned-item`) with `Active` or `Available` badges.
  3. **Main Providers:** Clean password inputs for Google Gemini, OpenAI, and Anthropic Claude with official console links, custom OpenAI base URL, and green `Configured in .env (xxxx...xxxx)` badges.
  4. **Database (Supabase):** Live status indicator (`Supabase PostgreSQL Connected & Active` or `Local SQLite Database Active`), connection string input, and knowledge base indexing statistics.
