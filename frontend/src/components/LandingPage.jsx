import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Layers,
  Sliders,
  ShieldCheck,
  Zap,
  Users,
  LayoutDashboard,
  Menu,
  X,
  Radio,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Target,
  Compass
} from 'lucide-react';
import { BLOG_ARTICLES } from './BlogHub';
import { GALLERY_ARTIFACTS } from './ArtifactsGallery';

const LANDING_FEATURES = [
  {
    icon: ShieldCheck,
    accent: '#8789FF',
    accentSoft: '#EEEEFF',
    title: '100% Transcript Grounded',
    body: 'Zero hallucination. Every metric, heuristic, and framework is indexed directly from 303 episodes and 15,000+ chunks with timestamped video citations.'
  },
  {
    icon: Sliders,
    accent: '#82FFCF',
    accentSoft: '#EAFFF6',
    title: 'Executable Growth Artifacts',
    body: 'Interactive calculators, PLG simulators, and PMF engines that render natively side-by-side with your chat. Isolated inside enterprise sandboxes.'
  },
  {
    icon: BookOpen,
    accent: '#FF99E7',
    accentSoft: '#FFEEFA',
    title: 'Ship 30 Atomic Essays',
    body: 'Distill multi-hour founder interviews into sharp, publication-ready executive frameworks with viral hooks, actionable principles, and tactical takeaways.'
  }
];

const CURATED_PROMPTS = [
  {
    tag: 'Product-Led Growth',
    query: 'How does Elena Verna define Product-Led Sales and the threshold for introducing sales reps?',
    guest: 'Elena Verna'
  },
  {
    tag: 'Founder Mode',
    query: 'What is Brian Chesky\'s Founder Mode management system and how does Airbnb run reviews?',
    guest: 'Brian Chesky'
  },
  {
    tag: 'Product-Market Fit',
    query: 'How does Rahul Vohra measure PMF with the Superhuman 40% rule and roadmap balancing?',
    guest: 'Rahul Vohra'
  },
  {
    tag: 'Operating Heuristics',
    query: 'What are Shreyas Doshi\'s key frameworks for high-agency operating and product death cycles?',
    guest: 'Shreyas Doshi'
  }
];

export default function LandingPage({
  onEnterWorkspace,
  onOpenBlog,
  onOpenArtifacts,
  onSelectPrompt
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="landing-page-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');

        .landing-page-root {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: #FFFFFF;
          color: #14161A;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          scroll-behavior: smooth;
        }

        .landing-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid #EFEFF2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 44px;
          z-index: 100;
        }

        .landing-nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .landing-nav-link {
          background: none;
          border: none;
          font-size: 0.90rem;
          font-weight: 500;
          color: #6B7280;
          cursor: pointer;
          transition: color 0.15s ease;
          padding: 6px 0;
        }

        .landing-nav-link:hover {
          color: #14161A;
        }

        .landing-btn-pill {
          background: #14161A;
          color: #FFFFFF;
          border: none;
          padding: 10px 22px;
          border-radius: 24px;
          font-size: 0.90rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
        }

        .landing-btn-pill:hover {
          background: #2D3139;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(20, 22, 26, 0.15);
        }

        .landing-mobile-toggle {
          display: none;
          background: transparent;
          border: none;
          color: #14161A;
          cursor: pointer;
          padding: 6px;
        }

        .landing-hero {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 1080px;
          margin: 0 auto;
          padding: 150px 24px 64px;
        }

        .landing-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 30px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 28px;
          letter-spacing: -0.01em;
        }

        .landing-hero-h1 {
          font-family: 'Fraunces', serif;
          font-size: 4.4rem;
          line-height: 1.08;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: #14161A;
          margin: 0 0 24px;
        }

        .landing-hero-h1 span.editorial {
          font-style: italic;
          font-weight: 400;
          color: #4B5563;
        }

        .landing-hero-p {
          font-size: 1.22rem;
          line-height: 1.6;
          color: #6B7280;
          max-width: 660px;
          margin: 0 0 44px;
        }

        .landing-hero-cta-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 56px;
        }

        .landing-btn-hero-primary {
          background: #14161A;
          color: #FFFFFF;
          border: none;
          padding: 16px 36px;
          border-radius: 32px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
          box-shadow: 0 10px 30px -10px rgba(20, 22, 26, 0.3);
        }

        .landing-btn-hero-primary:hover {
          background: #2D3139;
          transform: translateY(-2px);
          box-shadow: 0 16px 36px -10px rgba(20, 22, 26, 0.4);
        }

        .landing-btn-hero-secondary {
          background: #FFFFFF;
          color: #14161A;
          border: 1px solid #E2E8F0;
          padding: 16px 28px;
          border-radius: 32px;
          font-size: 1.02rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        .landing-btn-hero-secondary:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
          transform: translateY(-1px);
        }

        /* Live Preview Showcase Frame */
        .landing-showcase-section {
          padding: 0 24px 100px;
          display: flex;
          justify-content: center;
        }

        .landing-showcase-frame {
          width: 100%;
          max-width: 1200px;
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid #EFEFF2;
          box-shadow: 0 24px 60px -24px rgba(20, 22, 26, 0.12);
          overflow: hidden;
        }

        .showcase-window-header {
          height: 46px;
          background: #F8FAFC;
          border-bottom: 1px solid #EFEFF2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
        }

        .showcase-window-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .showcase-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .showcase-address-bar {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          padding: 3px 14px;
          font-size: 0.74rem;
          color: #64748B;
          font-family: 'JetBrains Mono', monospace;
        }

        .showcase-window-split {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          min-height: 480px;
          background: #FAFBFD;
        }

        .showcase-pane-chat {
          padding: 28px;
          border-right: 1px solid #EFEFF2;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .showcase-msg-user {
          align-self: flex-end;
          background: #14161A;
          color: #FFFFFF;
          padding: 12px 18px;
          border-radius: 16px 16px 4px 16px;
          font-size: 0.88rem;
          max-width: 82%;
          line-height: 1.5;
        }

        .showcase-msg-assistant {
          align-self: flex-start;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          padding: 20px;
          border-radius: 16px 16px 16px 4px;
          font-size: 0.88rem;
          line-height: 1.6;
          color: #1E293B;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        .showcase-quote-box {
          border-left: 3px solid #3B82F6;
          background: #F1F5F9;
          padding: 10px 14px;
          margin: 12px 0;
          border-radius: 0 8px 8px 0;
          font-size: 0.84rem;
          color: #334155;
        }

        .showcase-citation-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 500;
          background: #EFF6FF;
          color: #1D4ED8;
          border: 1px solid #DBEAFE;
          text-decoration: none;
          margin-top: 8px;
        }

        .showcase-pane-artifact {
          padding: 28px;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .artifact-preview-card {
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 20px;
          background: #F8FAFC;
        }

        .artifact-metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .artifact-slider-mock {
          width: 100%;
          height: 6px;
          background: #CBD5E1;
          border-radius: 3px;
          position: relative;
          margin: 16px 0;
        }

        .artifact-slider-fill {
          width: 68%;
          height: 100%;
          background: #3B82F6;
          border-radius: 3px;
        }

        /* Quick Prompts Ribbon */
        .landing-prompts-ribbon {
          max-width: 1200px;
          margin: -60px auto 100px;
          padding: 0 24px;
          position: relative;
          z-index: 2;
        }

        .prompts-grid-title {
          font-size: 0.82rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748B;
          margin-bottom: 14px;
          text-align: center;
        }

        .prompts-ribbon-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .prompt-ribbon-card {
          background: #FFFFFF;
          border: 1px solid #EFEFF2;
          padding: 16px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(20, 22, 26, 0.04);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .prompt-ribbon-card:hover {
          border-color: #CBD5E1;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(20, 22, 26, 0.08);
        }

        .prompt-ribbon-tag {
          font-size: 0.70rem;
          font-weight: 600;
          color: #3B82F6;
          margin-bottom: 6px;
        }

        .prompt-ribbon-text {
          font-size: 0.82rem;
          color: #1E293B;
          line-height: 1.4;
          font-weight: 500;
        }

        /* Features Section */
        .landing-features-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 140px;
        }

        .section-header-center {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #3B82F6;
          background: #EFF6FF;
          border: 1px solid #DBEAFE;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .section-title {
          font-family: 'Fraunces', serif;
          font-size: 2.8rem;
          line-height: 1.15;
          letter-spacing: -0.02em;
          font-weight: 600;
          color: #14161A;
          margin-bottom: 16px;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: #6B7280;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .features-canvas-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .feature-canvas-card {
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid #EFEFF2;
          padding: 40px;
          box-shadow: 0 10px 40px -18px rgba(20, 22, 26, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .feature-canvas-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 44px -18px rgba(20, 22, 26, 0.12);
        }

        .feature-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .feature-card-title {
          font-family: 'Fraunces', serif;
          font-size: 1.35rem;
          font-weight: 600;
          color: #14161A;
          margin: 0 0 12px;
          letter-spacing: -0.01em;
        }

        .feature-card-body {
          color: #6B7280;
          line-height: 1.6;
          font-size: 0.94rem;
          margin: 0;
        }

        /* Curated Essays Preview Grid */
        .landing-essays-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 140px;
        }

        .essays-preview-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .essay-preview-card {
          background: #FFFFFF;
          border: 1px solid #EFEFF2;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 4px 20px -6px rgba(20, 22, 26, 0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s ease;
        }

        .essay-preview-card:hover {
          border-color: #CBD5E1;
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -10px rgba(20, 22, 26, 0.1);
        }

        .essay-meta-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .essay-category-badge {
          font-size: 0.70rem;
          font-weight: 600;
          color: #1D4ED8;
          background: #EFF6FF;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .essay-read-time {
          font-size: 0.72rem;
          color: #94A3B8;
        }

        .essay-card-h3 {
          font-family: 'Fraunces', serif;
          font-size: 1.2rem;
          line-height: 1.35;
          color: #14161A;
          margin: 0 0 10px;
          font-weight: 600;
        }

        .essay-guest-info {
          font-size: 0.78rem;
          color: #64748B;
          margin-bottom: 14px;
        }

        .essay-card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #F1F5F9;
        }

        .btn-essay-action {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          color: #14161A;
          transition: all 0.15s ease;
        }

        .btn-essay-action:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }

        .btn-essay-action.primary {
          background: #14161A;
          color: #FFFFFF;
          border-color: #14161A;
        }

        .btn-essay-action.primary:hover {
          background: #2D3139;
        }

        /* Stats Strip */
        .landing-stats-strip {
          background: #F8FAFC;
          border-top: 1px solid #EFEFF2;
          border-bottom: 1px solid #EFEFF2;
          padding: 60px 24px;
          margin-bottom: 140px;
        }

        .stats-inner-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          text-align: center;
        }

        .stat-value {
          font-family: 'Fraunces', serif;
          font-size: 3rem;
          font-weight: 700;
          color: #14161A;
          line-height: 1;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-size: 0.86rem;
          color: #64748B;
          font-weight: 500;
        }

        /* Bottom Callout Banner */
        .landing-cta-banner {
          max-width: 1100px;
          margin: 0 auto 120px;
          padding: 0 24px;
        }

        .cta-banner-card {
          background: #14161A;
          color: #FFFFFF;
          border-radius: 28px;
          padding: 64px 48px;
          text-align: center;
          box-shadow: 0 24px 60px -20px rgba(20, 22, 26, 0.4);
        }

        .cta-banner-h2 {
          font-family: 'Fraunces', serif;
          font-size: 2.8rem;
          line-height: 1.15;
          letter-spacing: -0.02em;
          margin: 0 0 16px;
        }

        .cta-banner-p {
          font-size: 1.1rem;
          color: #94A3B8;
          max-width: 560px;
          margin: 0 auto 36px;
          line-height: 1.6;
        }

        .btn-cta-white {
          background: #FFFFFF;
          color: #14161A;
          border: none;
          padding: 16px 36px;
          border-radius: 30px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.2s ease;
        }

        .btn-cta-white:hover {
          background: #F1F5F9;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
        }

        /* Minimal Footer */
        .landing-footer {
          border-top: 1px solid #EFEFF2;
          padding: 40px 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          color: #64748B;
        }

        @media (max-width: 960px) {
          .landing-header {
            padding: 0 20px;
          }

          .landing-nav-links {
            display: none !important;
          }

          .landing-mobile-toggle {
            display: flex !important;
          }

          .landing-hero-h1 {
            font-size: 3rem;
          }

          .features-canvas-grid,
          .essays-preview-grid,
          .prompts-ribbon-grid {
            grid-template-columns: 1fr;
          }

          .stats-inner-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }

          .showcase-window-split {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Sticky Glass Header */}
      <header className="landing-header">
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="LennyOS by Oggway Labs"
        >
          <img
            src="/logo.png"
            alt="LennyOS by Oggway Labs"
            style={{
              height: '42px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 600,
              color: '#475569',
              background: '#F1F5F9',
              padding: '3px 10px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap'
            }}
          >
            by Oggway Labs
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="landing-nav-links">
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => {
              const el = document.getElementById('features-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Capabilities
          </button>
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => onOpenBlog()}
          >
            Growth Essays
          </button>
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => onOpenArtifacts()}
          >
            Artifacts & Calculators
          </button>
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => {
              const el = document.getElementById('stats-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Archive Statistics
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            className="landing-btn-pill"
            onClick={() => onEnterWorkspace()}
          >
            <MessageSquare size={15} />
            <span>Start Chat</span>
          </button>

          <button
            type="button"
            className="landing-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-down Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 72,
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid #EFEFF2',
            padding: '24px 20px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            zIndex: 99,
            boxShadow: '0 12px 32px rgba(20, 22, 26, 0.1)'
          }}
        >
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#14161A',
              fontSize: '1.05rem',
              fontWeight: 600,
              textAlign: 'left',
              cursor: 'pointer',
              padding: '6px 0'
            }}
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenBlog();
            }}
          >
            Growth Essays & Playbooks
          </button>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#14161A',
              fontSize: '1.05rem',
              fontWeight: 600,
              textAlign: 'left',
              cursor: 'pointer',
              padding: '6px 0'
            }}
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenArtifacts();
            }}
          >
            Interactive Artifacts
          </button>
          <button
            type="button"
            className="landing-btn-hero-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
            onClick={() => {
              setMobileMenuOpen(false);
              onEnterWorkspace();
            }}
          >
            <MessageSquare size={16} />
            <span>Start Chat</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <Radio size={13} color="#2563EB" />
          <span>Grounded in 303 Episodes & 15,000+ Transcript Segments</span>
        </div>

        <h1 className="landing-hero-h1">
          Product & growth intelligence <br />
          <span className="editorial">at the speed of thought.</span>
        </h1>

        <p className="landing-hero-p">
          The elite AI advisory system grounded exclusively in Lenny Rachitsky's podcast archives. Generate publication-ready Ship 30 essays, interactive growth models, and executive playbooks in real time.
        </p>

        <div className="landing-hero-cta-group">
          <button
            type="button"
            className="landing-btn-hero-primary"
            onClick={() => onEnterWorkspace()}
          >
            <MessageSquare size={18} />
            <span>Start Chat</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="landing-btn-hero-secondary"
            onClick={() => onOpenBlog()}
          >
            <BookOpen size={16} />
            <span>Explore Growth Essays</span>
          </button>

          <button
            type="button"
            className="landing-btn-hero-secondary"
            onClick={() => onOpenArtifacts()}
          >
            <Sliders size={16} />
            <span>Calculators Gallery</span>
          </button>
        </div>
      </section>

      {/* Product Screenshot & Live Workspace Showcase Frame */}
      <section className="landing-showcase-section">
        <div className="landing-showcase-frame">
          <div className="showcase-window-header">
            <div className="showcase-window-dots">
              <div className="showcase-dot" style={{ background: '#EF4444' }} />
              <div className="showcase-dot" style={{ background: '#F59E0B' }} />
              <div className="showcase-dot" style={{ background: '#10B981' }} />
            </div>
            <div className="showcase-address-bar">
              lennyos.oggwaylabs.internal / chat / elena-verna-plg
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
              <ShieldCheck size={14} />
              <span>Grounded Fallback Engine Active</span>
            </div>
          </div>

          <div className="showcase-window-split">
            {/* Left Pane: Real Grounded Chat */}
            <div className="showcase-pane-chat">
              <div className="showcase-msg-user">
                How does Elena Verna define Product-Led Sales and the exact threshold for introducing sales reps?
              </div>

              <div className="showcase-msg-assistant">
                <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Radio size={14} color="#2563EB" />
                  <span>LennyOS Grounded Synthesis:</span>
                </div>
                <p style={{ margin: '0 0 10px' }}>
                  According to Elena Verna, Product-Led Sales is <strong>not</strong> top-down enterprise outbound disguised with a free trial. It is an expansion layer placed on top of users who have already experienced self-serve product value.
                </p>

                <div className="showcase-quote-box">
                  <em>"Sales should never sell the product—sales sells the enterprise contract. If your product cannot sell itself to the individual user, a sales rep will only mask your retention flaws."</em>
                  <div style={{ marginTop: 4, fontWeight: 600, fontSize: '0.76rem' }}>— Elena Verna (The Ultimate Guide to Product-Led Sales)</div>
                </div>

                <a
                  href="https://www.youtube.com/watch?v=bxghtN-OlJQ&t=1467s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="showcase-citation-pill"
                >
                  <ExternalLink size={11} />
                  <span>Elena Verna 2.0 • 00:24:27 on YouTube</span>
                </a>
              </div>
            </div>

            {/* Right Pane: Live Interactive Artifact Preview */}
            <div className="showcase-pane-artifact">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sliders size={16} color="#3B82F6" />
                  <span>Interactive PLG Funnel Simulator</span>
                </div>
                <span style={{ fontSize: '0.68rem', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  HTML5 Sandboxed
                </span>
              </div>

              <div className="artifact-preview-card">
                <div className="artifact-metric-row">
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Natural Usage Frequency</span>
                  <strong style={{ fontSize: '0.86rem', color: '#0F172A' }}>Daily (Slack, Figma loop)</strong>
                </div>
                <div className="artifact-slider-mock">
                  <div className="artifact-slider-fill" />
                </div>

                <div className="artifact-metric-row" style={{ marginTop: 16 }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Self-Serve to PQL Conversion</span>
                  <strong style={{ fontSize: '0.86rem', color: '#16A34A' }}>4.2% (Healthy)</strong>
                </div>

                <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Recommendation:</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1E293B' }}>Introduce sales-assist at 5+ active domain seats</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-essay-action primary"
                style={{ width: '100%', padding: '12px' }}
                onClick={() => onEnterWorkspace('Generate an interactive Growth & Retention Model calculator HTML widget based on Elena Verna\'s framework')}
              >
                <Zap size={14} />
                <span>Simulate in Chat</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Prompts Ribbon */}
      <section className="landing-prompts-ribbon">
        <div className="prompts-grid-title">Click Any Framework to Launch Directly into LennyOS</div>
        <div className="prompts-ribbon-grid">
          {CURATED_PROMPTS.map((p, idx) => (
            <div
              key={idx}
              className="prompt-ribbon-card"
              onClick={() => onSelectPrompt(p.query)}
            >
              <div>
                <div className="prompt-ribbon-tag">{p.tag} • {p.guest}</div>
                <div className="prompt-ribbon-text">"{p.query}"</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#64748B', marginTop: 12 }}>
                <ArrowRight size={12} color="#3B82F6" />
                <span>Ask LennyOS</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid Section (Canvas Architecture Style) */}
      <section id="features-section" className="landing-features-section">
        <div className="section-header-center">
          <div className="section-badge">Built for Product Leaders</div>
          <h2 className="section-title">Engineered for High-Agency Teams</h2>
          <p className="section-subtitle">
            Most AI assistants guess. LennyOS indexes the exact transcripts of the world's greatest builders to provide concrete, actionable operating blueprints.
          </p>
        </div>

        <div className="features-canvas-grid">
          {LANDING_FEATURES.map(({ icon: Icon, accent, accentSoft, title, body }) => (
            <div key={title} className="feature-canvas-card">
              <div className="feature-icon-box" style={{ background: accentSoft }}>
                <Icon size={22} color={accent === '#82FFCF' ? '#1F6B4F' : accent === '#FF99E7' ? '#B03A8C' : '#4C4DBF'} />
              </div>
              <h3 className="feature-card-title">{title}</h3>
              <p className="feature-card-body">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Growth Essays Preview Grid */}
      <section className="landing-essays-section">
        <div className="section-header-center">
          <div className="section-badge">Ship 30 for 30 Format</div>
          <h2 className="section-title">Curated Executive Essays</h2>
          <p className="section-subtitle">
            Dense podcast discussions distilled into razor-sharp, publication-ready atomic essays with viral hooks.
          </p>
        </div>

        <div className="essays-preview-grid">
          {BLOG_ARTICLES.slice(0, 3).map((art) => (
            <div key={art.id} className="essay-preview-card">
              <div>
                <div className="essay-meta-top">
                  <span className="essay-category-badge">{art.category}</span>
                  <span className="essay-read-time">{art.readTime}</span>
                </div>
                <h3 className="essay-card-h3">{art.title}</h3>
                <div className="essay-guest-info">Framework by <strong>{art.guest}</strong> ({art.guestRole})</div>
                <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  {art.excerpt}
                </p>
              </div>

              <div className="essay-card-actions">
                <button
                  type="button"
                  className="btn-essay-action"
                  onClick={() => onOpenBlog(art.id)}
                >
                  <BookOpen size={13} />
                  <span>Read Essay</span>
                </button>
                <button
                  type="button"
                  className="btn-essay-action primary"
                  onClick={() => onEnterWorkspace(`Write an executive tactical brief based on ${art.guest}'s framework on ${art.title}`)}
                >
                  <MessageSquare size={13} />
                  <span>Discuss in Chat</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics Strip */}
      <section id="stats-section" className="landing-stats-strip">
        <div className="stats-inner-grid">
          <div>
            <div className="stat-value">303+</div>
            <div className="stat-label">Episodes Fully Indexed</div>
          </div>
          <div>
            <div className="stat-value">15,194</div>
            <div className="stat-label">Transcript Segments & Quotes</div>
          </div>
          <div>
            <div className="stat-value">0%</div>
            <div className="stat-label">Hallucination Tolerance</div>
          </div>
          <div>
            <div className="stat-value">100%</div>
            <div className="stat-label">Client Sandboxed Execution</div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-card">
          <h2 className="cta-banner-h2">Accelerate your product roadmap today.</h2>
          <p className="cta-banner-p">
            Skip the endless search. Query 300+ episodes of Lenny's Podcast archives and receive grounded frameworks, calculators, and atomic essays in seconds.
          </p>
          <button
            type="button"
            className="btn-cta-white"
            onClick={() => onEnterWorkspace()}
          >
            <MessageSquare size={16} />
            <span>Start Chat</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="landing-footer">
        <div>
          <strong>LennyOS</strong> by Oggway Labs • Product & Growth Intelligence
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.82rem' }}
            onClick={() => onOpenBlog()}
          >
            Growth Essays
          </button>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.82rem' }}
            onClick={() => onOpenArtifacts()}
          >
            Artifacts Gallery
          </button>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '0.82rem' }}
            onClick={() => onEnterWorkspace()}
          >
            Chat
          </button>
        </div>
      </footer>
    </div>
  );
}
