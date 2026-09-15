import React from 'react';
import {
  Code2,
  Sliders,
  Layers,
  Sparkles,
  ArrowUpRight,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

export const GALLERY_ARTIFACTS = [
  {
    id: 'elena-plg-simulator',
    title: 'PLG & Retention Funnel Simulator',
    guest: 'Elena Verna',
    type: 'Interactive HTML/JS Widget',
    category: 'Product-Led Growth',
    desc: 'Simulate user acquisition, onboarding conversion, natural habit frequency, and viral loops with live sliders and dynamic retention projection charts.',
    features: ['Dynamic conversion sliders', 'Real-time cohort retention curve', 'Sales-assist threshold indicator'],
    prompt: 'Generate an interactive Growth & Retention Model calculator HTML widget based on Elena Verna\'s framework'
  },
  {
    id: 'superhuman-pmf-scorecard',
    title: 'Superhuman 40% PMF Engine Scorecard',
    guest: 'Rahul Vohra',
    type: 'Interactive HTML/JS Widget',
    category: 'Product-Market Fit',
    desc: 'Calculate your product-market fit score based on the Sean Ellis protocol. Segments high-expectation customers and computes 50/50 roadmap resource allocation.',
    features: ['40% benchmark scoring', 'HXC user segment filter', 'Roadmap allocation balancer'],
    prompt: 'Generate an interactive Product-Market Fit Engine scorecard calculator based on Rahul Vohra\'s Superhuman framework'
  },
  {
    id: 'founder-mode-prd-canvas',
    title: 'Founder Mode Product Review Canvas',
    guest: 'Brian Chesky',
    type: 'Markdown & HTML Blueprint',
    category: 'Leadership & Org Design',
    desc: 'A unified single-roadmap review canvas eliminating divisional silos. Structured for executive weekly reviews and bi-annual launch synchronization.',
    features: ['Integrated single-roadmap structure', 'Craft review rubric (PM + PMM + Design)', 'Release readiness checklist'],
    prompt: 'Generate a comprehensive Founder Mode Product Review Canvas template inspired by Brian Chesky\'s Airbnb playbook'
  },
  {
    id: 'growth-accounting-analyzer',
    title: 'Growth Accounting & Churn Decomposition Tool',
    guest: 'Hila Qu',
    type: 'Interactive HTML/JS Widget',
    category: 'Growth Loops & Metrics',
    desc: 'Decompose active users into New, Retained, Resurrected, and Churned cohorts to detect hidden retention leaks before top-of-funnel spend is wasted.',
    features: ['MAU decomposition algorithm', 'Quick-ratio health gauge', 'Resurrection flywheel visualizer'],
    prompt: 'Generate an interactive Growth Accounting & Cohort Churn Analyzer calculator based on Hila Qu\'s growth framework'
  }
];

export default function ArtifactsGallery({ onLaunchArtifact, onDiscussInChat }) {
  return (
    <div className="gallery-container">
      <div className="gallery-hero">
        <div className="gallery-hero-badge">
          <Layers size={13} />
          <span>Claude-Style Sandboxed Artifacts</span>
        </div>
        <h1 className="gallery-title">Interactive Artifacts & Calculators</h1>
        <p className="gallery-desc">
          Live, executable tools and frameworks that render natively beside your chat. Sandboxed in isolated origins with zero third-party tracking.
        </p>
      </div>

      <div className="gallery-grid">
        {GALLERY_ARTIFACTS.map((art) => (
          <div key={art.id} className="gallery-card">
            <div className="gallery-card-top">
              <div className="gallery-card-icon">
                <Code2 size={18} />
              </div>
              <div className="gallery-card-type-badge">{art.type}</div>
            </div>

            <h3 className="gallery-card-title">{art.title}</h3>
            <div className="gallery-card-guest">Framework by {art.guest}</div>
            <p className="gallery-card-desc">{art.desc}</p>

            <div className="gallery-card-features">
              {art.features.map((feat, i) => (
                <div key={i} className="gallery-feature-item">
                  <CheckCircle2 size={12} className="feat-check" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="gallery-card-actions">
              <button
                type="button"
                className="btn-gallery-launch"
                onClick={() => onLaunchArtifact(art.prompt)}
              >
                <Sliders size={13} />
                <span>Launch in Workspace</span>
              </button>
              <button
                type="button"
                className="btn-gallery-discuss"
                onClick={() => onDiscussInChat(`Explain the mathematical methodology behind ${art.guest}'s ${art.title}`)}
                title="Discuss methodology with Assistant"
              >
                <MessageSquare size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Security Architecture Badge */}
      <div className="gallery-security-banner">
        <ShieldCheck size={16} color="var(--accent-emerald)" />
        <div className="gallery-security-text">
          <strong>Enterprise Sandboxing:</strong> All rendered HTML/JS artifacts run inside isolated iframes with <code>sandbox="allow-scripts"</code>, blocking parent DOM access, cookies, and top-level navigation.
        </div>
      </div>
    </div>
  );
}
