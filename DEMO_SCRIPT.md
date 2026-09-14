# 2–3 Minute Demo Video Script & Walkthrough Guide
## The Lenny Growth Assistant

**Video Title:** The Lenny Growth Assistant - Forward Deployed Engineer Demo  
**Duration:** 2 minutes 45 seconds  
**Setup:** Screen recording with web camera enabled in top-right corner.  
**Target Audience:** Engineering & Product Leadership  

---

### Timeline & Segment Breakdown

#### [0:00 - 0:35] Problem Framing & Forward Deployment Scenario
* **Camera:** Focused on speaker.
* **Speaker Script:**
  > *"Hi everyone! I’m presenting **The Lenny Growth Assistant**—built for product and growth teams who need tactical, grounded answers from over 300 episodes of Lenny’s Podcast transcripts without drowning in generic AI fluff or getting lost in audio recordings.*
  > *As a Forward Deployed Engineer, my goal was not just to write a RAG prompt, but to deliver an enterprise-grade, resilient product with zero-friction local deployment, transparent YouTube citations, a dedicated Ship 30 for 30 essay skill, and a Claude-style side-by-side Artifact Viewer with strict security sandboxing."*

#### [0:35 - 1:15] Grounded Conversational Discovery & Citations
* **Action:** Share screen showing `http://localhost:5173`. Click the prompt card: *"How does Elena Verna define Product-Led Growth vs Sales-Led Growth?"*
* **Speaker Script:**
  > *"Let’s test a core question. Notice how fast the response loads. The assistant doesn't invent answers—it pulls directly from our pre-indexed 15,194 transcript segments using hybrid BM25 and entity boosting.*
  > *Notice these citation badges right here. If I click this badge for Elena Verna, it opens YouTube directly at 24 minutes and 27 seconds where Elena is talking with Lenny. Everything is verifiable in one click."*

#### [1:15 - 1:50] Ship 30 for 30 Essay Skill
* **Action:** Click the *"⚡ Ship 30 for 30 Essay"* button beneath the response.
* **Speaker Script:**
  > *"Product managers don't just want Q&A; they need to communicate with their teams. I built a dedicated Ship 30 for 30 writing skill based on Nicolas Cole and Dickie Bush’s framework.*
  > *With one click, the assistant transforms Elena’s insights into an ~1,250-word atomic essay with an irresistible hook, the 1-3-1 cadence, skimmable subheadings, and a 48-hour implementation checklist ready to share on Slack or LinkedIn."*

#### [1:50 - 2:25] Claude-Style Artifact Viewer & Interactive Widgets
* **Action:** Click *"📊 Interactive Calculator"* or prompt: *"Generate an interactive Growth & Retention Model calculator HTML artifact"*. The Artifact Viewer slides in from the right.
* **Speaker Script:**
  > *"Now for deliverables. When the user asks for a tool or calculator, our Claude-style Artifact Viewer opens beside the chat in a split-screen workspace.*
  > *Here is an interactive PLG calculator. As I drag these sliders—traffic, signup rate, churn—it recalculates projected steady-state ARR live.*
  > *You can switch to the Code tab, copy the code, or download the HTML file directly."*

#### [2:25 - 2:45] Technical Trade-Off & Resilient Architecture
* **Action:** Click the ⚙️ Settings icon showing Ollama, Claude, OpenAI, and Supabase config.
* **Speaker Script:**
  > *"Let's talk about one critical technical trade-off: **Security vs. Interactivity in Artifact Rendering**.*
  > *Treating generated HTML as untrusted is essential. We render artifacts in an iframe with `sandbox="allow-scripts"` to enable dynamic JS calculators, but deliberately omit `allow-same-origin` and inject a strict Content Security Policy with `connect-src 'none'`. This prevents the artifact from accessing cookies, parent storage, or making exfiltration calls.*
  > *Furthermore, our system features a Graceful Fallback Engine—if an evaluator doesn't have Ollama running locally, the entire application still functions flawlessly with zero external dependencies.*
  > *Thank you for watching!"*

---

### Checklist Before Recording:
* [ ] FastAPI backend running on port 8000 (`uvicorn backend.app.main:app --port 8000`)
* [ ] Frontend running on port 5173 (`npm run dev`)
* [ ] Browser opened in clean dark mode
* [ ] Microphone and webcam checked
* [ ] Video uploaded to YouTube as "Unlisted" or "Public" and URL added to submission form.
