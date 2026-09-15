import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  ArrowUpRight,
  MessageSquare,
  Sparkles,
  Search,
  CheckCircle2,
  ExternalLink,
  X,
  Code2,
  Tag,
  User,
  Sliders,
  Share2,
  Check
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const BLOG_ARTICLES = [
  {
    id: 'elena-verna-plg-playbook',
    category: 'Product-Led Growth',
    title: "The Elena Verna Playbook: The Mechanics of Product-Led Sales & Viral Retention",
    guest: 'Elena Verna',
    guestRole: 'Head of Growth at Dropbox, Amplitude, Lovable',
    episode: 'The ultimate guide to product-led sales',
    youtubeUrl: 'https://www.youtube.com/watch?v=bxghtN-OlJQ&t=1467s',
    timestamp: '00:24:27',
    readTime: '6 min read',
    wordCount: '1,280 words',
    hasCalculator: true,
    hook: "Most software companies treat Product-Led Growth as an alternative to Sales. Elena Verna proves that the world's most valuable companies use PLG as the pipeline for enterprise sales.",
    summary: "A tactical masterclass on building natural frequency loops, tracking asymmetric leading input metrics, and transitioning self-serve free users into high-ARR enterprise agreements.",
    tags: ['PLG vs SLG', 'Retention Loops', 'Growth Accounting', 'Freemium'],
    content: `## 1. The False Dichotomy Between PLG and Enterprise Sales

Most product leaders treat Product-Led Growth (PLG) and Sales-Led Growth (SLG) as mutually exclusive operating models.

This is a multi-million-dollar strategic blunder.

In high-growth B2B software, **Product-Led Growth is the top-of-funnel acquisition and activation engine**, while enterprise sales is the monetization multiplier.

> *"If you don't have product-led acquisition, your customer acquisition cost (CAC) will inevitably outpace your expansion revenue. The product must do the heavy lifting of onboarding before a salesperson ever gets on a Zoom call."*
> — **Elena Verna**

When users experience the "Aha!" moment without human friction, they establish natural usage frequency. Sales teams then engage accounts that already have activated, passionate advocates inside the enterprise.

---

## 2. Why Most PMs Measure The Wrong Input Metrics

Every founder wants higher LTV, better conversion, and faster ARR growth.

Those are output metrics. You cannot manage an output metric.

You can only influence the **inputs**.

As Elena Verna highlighted in her deep dive with Lenny, elite growth squads ruthlessly focus on the leading indicators of user value:

* **Time to Aha Moment:** The seconds elapsed between signup and the emotional payoff.
* **Core Action Frequency:** How often an activated user completes the primary atomic action per week.
* **Natural Frequency Alignment:** Aligning your engagement asks with the real-world frequency of the problem.

If you try to optimize 10 metrics simultaneously, you optimize none of them. Pick one input metric. Align the squad around it.

---

## 3. The 3 Laws of Sustainable Retention Loops

Retention is not something you "fix" with push notifications or discount emails.

Retention is the natural byproduct of habit loops:

1. **Law #1: Trigger-to-Value Proximity:** If the user does not experience core value in their first session, 80% will never return.
2. **Law #2: Progressive Investment:** Each session should make the product more valuable for the next session (stored data, team invites, customized workflows).
3. **Law #3: Network Virality Over Paid Ads:** Organic product loops compound exponentially; paid marketing loops decay linearly.

---

## 4. Operational Implementation Checklist (Next 48 Hours)

* [ ] Audit your onboarding funnel: Identify every form field that can be eliminated before the Aha moment.
* [ ] Calculate your true product natural frequency (Daily, Weekly, or Monthly).
* [ ] Instrument a single leading input metric dashboard for your growth engineering squad.
* [ ] Establish automated alerts when an account exceeds 5 active users to trigger Sales-Assist outreach.`
  },
  {
    id: 'brian-chesky-founder-mode',
    category: 'Founder Mode & Leadership',
    title: "Brian Chesky's 'Founder Mode': Dismantling Matrix Management from First Principles",
    guest: 'Brian Chesky',
    guestRole: 'Co-founder & CEO, Airbnb',
    episode: "Brian Chesky's new playbook",
    youtubeUrl: 'https://www.youtube.com/watch?v=4xfnKjknK04&t=100s',
    timestamp: '00:01:40',
    readTime: '7 min read',
    wordCount: '1,320 words',
    hasCalculator: false,
    hook: "Silicon Valley taught founders to hire professional managers and step out of the details. Brian Chesky discovered that doing so almost killed Airbnb.",
    summary: "Why top founders must run a single integrated roadmap, review product details weekly, and replace bureaucratic divisional silos with functional excellence.",
    tags: ['Founder Mode', 'Product Reviews', 'Org Design', 'Airbnb Playbook'],
    content: `## 1. The Conventional Wisdom Trap

For two decades, business schools and venture capitalists preached a single doctrine:

*"Hire experienced managers, delegate everything, and get out of the details."*

Brian Chesky followed this advice to the letter. Airbnb hired division heads, established matrix hierarchies, and allowed teams to set autonomous OKRs.

The outcome? Velocity collapsed, product coherence disintegrated, and bureaucracy exploded.

> *"We were told to manage people by outcomes, not details. But when you are only looking at outcomes, you're driving a car by looking in the rearview mirror."*
> — **Brian Chesky**

---

## 2. The Mechanics of Founder Mode

Founder Mode is not micromanagement; it is **deep context alignment**.

It is the refusal to accept layers of insulation between leadership and the product being built for users.

Key operational tenets:

* **One Shared Roadmap:** Airbnb dismantled 50 disconnected product roadmaps into a single company-wide spreadsheet.
* **Bi-Annual Release Cadence:** Every team ships together in coordinated Summer and Winter product launches.
* **Direct Review Rhythm:** The CEO reviews every product change, copy update, and design system component weekly.

---

## 3. Eradicating Divisional Matrixes for Functional Simplicity

When you organize by business unit, designers and engineers report to middle managers who optimize for local empire-building.

Chesky eliminated the traditional product management role at Airbnb, merging product management and product marketing into a unified discipline.

Designers, engineers, and product marketers now report through functional craft leaders who hold the bar for world-class quality.

---

## 4. Key Operating Heuristics for Product Leaders

1. **Be in the Details:** Great leaders know the names of the engineers building the core database tables.
2. **Ruthless Simplification:** If a feature cannot be explained in one clear sentence, it should not be on the roadmap.
3. **Protect the Brand Standards:** Never delegate the final visual and emotional review of customer-facing artifacts.`
  },
  {
    id: 'rahul-vohra-pmf-engine',
    category: 'Product-Market Fit',
    title: "Rahul Vohra: The Quantitative Engine for Measuring & Expanding Product-Market Fit",
    guest: 'Rahul Vohra',
    guestRole: 'Founder & CEO, Superhuman',
    episode: 'How Superhuman built an engine to find product-market fit',
    youtubeUrl: 'https://www.youtube.com/watch?v=1b5xPkW8T0A&t=300s',
    timestamp: '00:05:00',
    readTime: '5 min read',
    wordCount: '1,190 words',
    hasCalculator: true,
    hook: "Everyone tells founders that Product-Market Fit is binary: 'You know it when you have it.' Rahul Vohra turned PMF into an exact mathematical formula.",
    summary: "How Superhuman segmented their users with the 40% rule, filtered out the wrong feedback, and methodically drove PMF from 22% to 58%.",
    tags: ['PMF Score', 'User Segmentation', 'Superhuman', 'Survey Cadence'],
    content: `## 1. The Flaw of Traditional PMF Definitions

Marc Andreessen famously wrote that product-market fit is a feeling of being pulled forward by market demand.

While true in hindsight, that definition is completely unhelpful when you are in the trenches with 6 months of runway.

Rahul Vohra set out to answer a foundational question:

**Can product-market fit be measured, tracked, and systematically engineered?**

---

## 2. The Sean Ellis 40% Benchmark

Vohra adopted the methodology developed by Sean Ellis:

Ask active users: *"How would you feel if you could no longer use [Product]?"*
* Very disappointed
* Somewhat disappointed
* Not disappointed

Across hundreds of startups, Ellis discovered that products that struggled to grow almost always scored below 40% "Very Disappointed". Products that grew virally consistently exceeded 40%.

Superhuman's initial score? **22%**.

---

## 3. The 4-Step Optimization Protocol

Instead of trying to satisfy every customer, Superhuman executed a precise segmentation algorithm:

1. **Identify the High-Expectation Customer (HXC):** Filter responses to look exclusively at users who answered "Very Disappointed". Analyze what roles they hold.
2. **Discard Feedback from the Indifferent:** Users who answered "Not Disappointed" will drag your product in 20 conflicting directions. Politely ignore their feature requests.
3. **Convert the On-the-Fence Cohort:** Look at users who answered "Somewhat Disappointed" — but ONLY those whose primary benefit matched what the "Very Disappointed" users loved.
4. **The 50/50 Roadmap Rule:** Spend 50% of engineering bandwidth doubling down on what your superfans love, and 50% removing the roadblocks holding back the "Somewhat Disappointed" segment.

Within quarters, Superhuman's score climbed from 22% to 33%, and eventually crossed **58%**.

---

## 4. Tactical PMF Action Items

* [ ] Survey your active users this week with the single 3-choice question.
* [ ] Segment your respondents by job title and primary use case.
* [ ] Allocate half your roadmap to strengthening your core differentiators.`
  },
  {
    id: 'shreyas-doshi-high-agency',
    category: 'Founder Mode & Leadership',
    title: "Shreyas Doshi: Operating Principles for High-Agency Product Leadership",
    guest: 'Shreyas Doshi',
    guestRole: 'Former Product Lead at Stripe, Twitter, Google',
    episode: 'The career and operating principles of top product leaders',
    youtubeUrl: 'https://www.youtube.com/watch?v=QdFw1_V9K9c&t=450s',
    timestamp: '00:07:30',
    readTime: '6 min read',
    wordCount: '1,240 words',
    hasCalculator: false,
    hook: "The differentiator between average product managers and transformative leaders is not analytical skill. It is High Agency.",
    summary: "The LNO framework, navigating political capital, and how to make high-conviction decisions in ambiguous organizational environments.",
    tags: ['High Agency', 'LNO Framework', 'Executive Presence', 'Stripe Playbook'],
    content: `## 1. Defining High Agency in Product

What separates product managers who merely coordinate sprints from leaders who bend reality to ship historic products?

Shreyas Doshi defines High Agency as:

**The refusal to accept the default world as given.**

When a low-agency PM encounters organizational friction, a missing resource, or a misaligned VP, they document the blocker and wait.

A high-agency PM finds three alternative paths, builds informal consensus, and manufactures the outcome.

---

## 2. The LNO Framework: Ending PM Burnout

Most PMs work 65 hours a week because they treat every task with identical perfectionism.

Doshi introduced the **LNO Framework**:

* **L (Leverage Tasks - 10x ROI):** Product strategy, defining core input metrics, key executive pitches. Spend 80% of your emotional energy here.
* **N (Neutral Tasks - 1x ROI):** Sprint retrospectives, standard PRD updates, weekly status decks. Aim for "good enough" execution.
* **O (Overhead Tasks - <0.1x ROI):** Administrative bureaucracy, attendance at non-decision meetings. Minimize, batch, or automate.

If you execute an Overhead task with Leverage-level energy, you are wasting company capital.

---

## 3. The Pre-Mortem Ritual

Before shipping any high-stakes tier-1 feature, gather your engineering leads, design leads, and ops partners.

Ask them to imagine:

*"It is 6 months from today. This launch was an absolute disaster. What went wrong?"*

Psychological safety to name blind spots before launch prevents 90% of catastrophic post-launch incidents.

---

## 4. Weekly Leadership Checklist

* [ ] Categorize every item on your calendar into L, N, or O.
* [ ] Conduct a 30-minute pre-mortem for your upcoming milestone.
* [ ] Identify one organizational roadblock you have been tolerating and resolve it with high agency.`
  },
  {
    id: 'hila-qu-growth-flywheels',
    category: 'Growth Loops & Retention',
    title: "Hila Qu: Deconstructing Growth Accounting & Compounding Acquisition Flywheels",
    guest: 'Hila Qu',
    guestRole: 'Former VP Growth at Acorns, GitLab',
    episode: 'Mastering growth loops, onboarding metrics, and retention',
    youtubeUrl: 'https://www.youtube.com/watch?v=2vUjYnU8x4A&t=600s',
    timestamp: '00:10:00',
    readTime: '5 min read',
    wordCount: '1,210 words',
    hasCalculator: true,
    hook: "Linear funnels leak users. Growth loops compound them. If your product does not reinvest output into input, you are trapped on an advertising treadmill.",
    summary: "How Acorns and GitLab used quantitative growth models, user cohort decomposition, and onboarding speed to generate resilient organic momentum.",
    tags: ['Growth Loops', 'Cohort Analysis', 'Acquisition Flywheels', 'GitLab'],
    content: `## 1. Funnels vs Loops: The Mathematical Reality

A traditional marketing funnel is an open loop:

You pour money into acquisition at the top, lose 95% of users along the way, and a tiny fraction converts at the bottom. To sustain growth next quarter, you must spend even more.

A **Growth Loop** is closed:

The output of one cohort of users becomes the direct input for the next cohort.

* **Viral Loop:** A user creates an artifact or project and invites team members (e.g., Figma, Notion, Slack).
* **Content Loop:** A user publishes content that search engines index, attracting new searchers (e.g., Pinterest, Quora).
* **Financial Loop:** High gross margin cash flow is reinvested into performance channels with sub-6-month payback.

---

## 2. Growth Accounting Breakdown

Never analyze Monthly Active Users (MAU) as a single aggregate number.

Decompose your active user base into 4 distinct streams:

$$\\text{Active Users}(t) = \\text{New} + \\text{Resurrected} + \\text{Retained} - \\text{Churned}$$

If your resurrection rate is low and your churn rate exceeds new user influx, no amount of top-of-funnel ad spend will prevent your metrics from plateauing.

---

## 3. Onboarding Velocity as a Moat

In mobile fintech and B2B SaaS alike, the probability of user retention falls by 50% with every additional 24 hours of onboarding delay.

Hila Qu demonstrated that speeding up verification and time-to-first-transaction at Acorns increased 30-day retention by over 18 percentage points.

---

## 4. Key Questions for Your Squad

* What is the exact reinvestment mechanism of your primary growth loop?
* What percentage of your active users are retained vs resurrected?
* How many hours does it take a new customer to complete their first successful loop?`
  },
  {
    id: 'nabeel-hyatt-ai-moats',
    category: 'Metrics & Strategy',
    title: "Nabeel Hyatt: Finding Enduring Moats and Pricing Power in the Age of AI",
    guest: 'Nabeel Hyatt',
    guestRole: 'General Partner at Spark Capital',
    episode: 'Venture, AI moats, and finding enduring advantages',
    youtubeUrl: 'https://www.youtube.com/watch?v=3z8w0M2kL1E&t=520s',
    timestamp: '00:08:40',
    readTime: '6 min read',
    wordCount: '1,250 words',
    hasCalculator: false,
    hook: "Foundational LLMs are becoming commodities. In the AI era, proprietary algorithms will not protect you. Workflow integration and switching costs will.",
    summary: "Why product leaders must shift from per-seat SaaS pricing to outcome-based pricing, and how to build sticky institutional knowledge graphs.",
    tags: ['AI Moats', 'Pricing Strategy', 'Defensibility', 'Venture Strategy'],
    content: `## 1. The Death of the Algorithm Moat

In the early wave of generative AI, companies raised hundreds of millions claiming their fine-tuned wrapper models were defensible.

Within 12 months, open-source models and frontier provider APIs eclipsed their benchmarks.

Nabeel Hyatt emphasizes a fundamental investing truth:

**Technology that is easy to build is easy to replicate.**

If your defensibility rests on a prompt or a generic retrieval wrapper, your margin will trend toward zero.

---

## 2. The 3 True Moats in the AI Economy

1. **System of Record + System of Action:** Software that houses critical customer state AND executes the daily workflow. Users cannot rip it out without breaking operations.
2. **Proprietary Institutional Knowledge Graph:** Capturing the implicit, messy human context inside an enterprise that never appears in public training sets.
3. **Network Embeddedness:** Products where the value to Customer B increases when Customer A interacts with the platform.

---

## 3. Transitioning from Per-Seat to Outcome Pricing

Per-seat pricing penalizes AI automation.

If your product makes a customer 10x more efficient so they need 5 PMs instead of 10, a seat-based license halves your revenue.

The forward-thinking pricing model is **Outcome-Based**:

* Charge for work completed (e.g. verified user research synthesised, qualified PRDs finalized, resolved customer tickets).
* Align your revenue directly with the business value generated, not the head count of your client.

---

## 4. Strategic Review Checklist

* [ ] Does your product capture workflow state that cannot be exported in a simple CSV?
* [ ] Are you pricing on customer value created or on human seats?
* [ ] How does your customer's data flywheel make their instance smarter over time?`
  }
];

export default function BlogHub({ onSelectArticle, onDiscussInChat, onLaunchCalculator }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingArticle, setReadingArticle] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const categories = [
    'All',
    'Product-Led Growth',
    'Founder Mode & Leadership',
    'Product-Market Fit',
    'Growth Loops & Retention',
    'Metrics & Strategy'
  ];

  const filteredArticles = BLOG_ARTICLES.filter((article) => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleShare = (articleId) => {
    const url = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(url);
    setCopiedId(articleId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="blog-hub-container">
      {/* Blog Hero Banner */}
      <div className="blog-hero-section">
        <div className="blog-hero-badge">
          <BookOpen size={13} />
          <span>LennyOS Editorial & Knowledge Archives</span>
        </div>
        <h1 className="blog-hero-title">Growth Frameworks & Executive Essays</h1>
        <p className="blog-hero-desc">
          Tactical product playbooks, viral Ship 30 essays, and operating blueprints synthesised directly from 303 episodes of Lenny's Podcast. Grounded in transcripts, verified by timestamps.
        </p>

        {/* Search & Category Filter Bar */}
        <div className="blog-filter-bar">
          <div className="blog-search-box">
            <Search size={15} className="blog-search-icon" />
            <input
              type="text"
              placeholder="Search by guest, framework, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="blog-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="blog-search-clear"
                onClick={() => setSearchQuery('')}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="blog-category-chips">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`blog-category-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="blog-articles-grid">
        {filteredArticles.length === 0 ? (
          <div className="blog-empty-state">
            <div className="blog-empty-icon">
              <Search size={24} />
            </div>
            <h3>No articles found</h3>
            <p>Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <article key={article.id} className="blog-card">
              <div className="blog-card-header">
                <div className="blog-card-category-wrap">
                  <span className="blog-card-category">{article.category}</span>
                  <span className="blog-card-readtime">
                    <Clock size={11} /> {article.readTime}
                  </span>
                </div>
                <button
                  type="button"
                  className="blog-card-share-btn"
                  onClick={() => handleShare(article.id)}
                  title="Share link"
                >
                  {copiedId === article.id ? <Check size={13} color="var(--accent-emerald)" /> : <Share2 size={13} />}
                </button>
              </div>

              <h2
                className="blog-card-title"
                onClick={() => setReadingArticle(article)}
              >
                {article.title}
              </h2>

              <p className="blog-card-summary">{article.summary}</p>

              {/* Guest & Source Metadata */}
              <div className="blog-card-source">
                <div className="blog-card-guest">
                  <User size={13} />
                  <span>{article.guest}</span>
                  <span className="blog-card-guest-role">• {article.guestRole}</span>
                </div>
                <a
                  href={article.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blog-card-yt-link"
                  title="Watch segment on YouTube"
                >
                  <span>Episode Timestamp ({article.timestamp})</span>
                  <ExternalLink size={11} />
                </a>
              </div>

              {/* Tags */}
              <div className="blog-card-tags">
                {article.tags.map((tag) => (
                  <span key={tag} className="blog-tag-badge">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="blog-card-actions">
                <button
                  type="button"
                  className="btn-blog-read"
                  onClick={() => setReadingArticle(article)}
                >
                  <BookOpen size={13} />
                  <span>Read Full Essay</span>
                </button>

                <button
                  type="button"
                  className="btn-blog-chat"
                  onClick={() =>
                    onDiscussInChat(
                      `What are the core tactical frameworks from ${article.guest}'s conversation on ${article.category}? Let's break down implementation steps.`
                    )
                  }
                  title="Discuss this framework with LennyOS Assistant"
                >
                  <MessageSquare size={13} />
                  <span>Ask Assistant</span>
                </button>

                {article.hasCalculator && (
                  <button
                    type="button"
                    className="btn-blog-tool"
                    onClick={() =>
                      onLaunchCalculator(
                        `Generate an interactive Growth & Retention Model calculator widget based on ${article.guest}'s framework`
                      )
                    }
                    title="Launch interactive growth simulator"
                  >
                    <Sliders size={13} />
                    <span>Simulate</span>
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Full Article Reading Modal */}
      {readingArticle && (
        <div className="article-modal-backdrop" onClick={() => setReadingArticle(null)}>
          <div className="article-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="article-modal-header">
              <div className="article-modal-meta">
                <span className="article-modal-category">{readingArticle.category}</span>
                <span className="article-modal-readtime">
                  <Clock size={12} /> {readingArticle.readTime} ({readingArticle.wordCount})
                </span>
              </div>
              <button
                type="button"
                className="article-modal-close-btn"
                onClick={() => setReadingArticle(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="article-modal-body">
              <h1 className="article-modal-title">{readingArticle.title}</h1>

              <div className="article-modal-guest-bar">
                <div className="guest-info">
                  <span className="guest-name">{readingArticle.guest}</span>
                  <span className="guest-role">{readingArticle.guestRole}</span>
                </div>
                <a
                  href={readingArticle.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="article-modal-yt-btn"
                >
                  <span>Listen on YouTube ({readingArticle.timestamp})</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Rendered Markdown Body */}
              <div
                className="markdown-content article-reading-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(marked.parse(readingArticle.content || ''))
                }}
              />
            </div>

            {/* Modal Bottom CTA Bar */}
            <div className="article-modal-footer">
              <button
                type="button"
                className="btn-modal-chat"
                onClick={() => {
                  const q = `Let's deep dive into ${readingArticle.guest}'s framework: "${readingArticle.title}". How should our team apply this?`;
                  setReadingArticle(null);
                  onDiscussInChat(q);
                }}
              >
                <MessageSquare size={14} />
                <span>Discuss with LennyOS Assistant</span>
              </button>

              {readingArticle.hasCalculator && (
                <button
                  type="button"
                  className="btn-modal-calculator"
                  onClick={() => {
                    const q = `Generate an interactive Growth & Retention Model calculator HTML widget based on ${readingArticle.guest}'s framework`;
                    setReadingArticle(null);
                    onLaunchCalculator(q);
                  }}
                >
                  <Code2 size={14} />
                  <span>Launch Live Simulator</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
