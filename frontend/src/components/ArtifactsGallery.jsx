import React from 'react';
import {
  Code2,
  Sliders,
  Layers,
  MessageSquare,
  ShieldCheck,
  Inbox,
  Loader2,
  Clock,
  ArrowLeft
} from 'lucide-react';

// Prompts to help a user get started — these are suggestions, not artifacts that
// already exist. Nothing here claims a capability until the assistant actually
// generates it; the real gallery below is driven entirely by the `artifacts` prop.
export const STARTER_PROMPTS = [
  {
    id: 'plg-simulator',
    guest: 'Elena Verna',
    category: 'Product-Led Growth',
    label: 'PLG & retention funnel simulator',
    prompt: "Generate an interactive Growth & Retention Model calculator HTML widget based on Elena Verna's framework"
  },
  {
    id: 'pmf-scorecard',
    guest: 'Rahul Vohra',
    category: 'Product-Market Fit',
    label: 'Superhuman 40% PMF scorecard',
    prompt: "Generate an interactive Product-Market Fit Engine scorecard calculator based on Rahul Vohra's Superhuman framework"
  },
  {
    id: 'founder-mode-canvas',
    guest: 'Brian Chesky',
    category: 'Leadership & Org Design',
    label: 'Founder Mode product review canvas',
    prompt: "Generate a Founder Mode Product Review Canvas template inspired by Brian Chesky's Airbnb playbook"
  },
  {
    id: 'growth-accounting',
    guest: 'Hila Qu',
    category: 'Growth Loops & Metrics',
    label: 'Growth accounting & churn decomposition tool',
    prompt: "Generate an interactive Growth Accounting & Cohort Churn Analyzer calculator based on Hila Qu's growth framework"
  }
];

// Backwards-compatible alias for any legacy imports
export const GALLERY_ARTIFACTS = STARTER_PROMPTS;

function formatArtifactType(type) {
  if (type === 'html') return 'HTML/JS Widget';
  if (type === 'markdown') return 'Markdown Document';
  return type ? `${type.toUpperCase()} Artifact` : 'Artifact';
}

function formatTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

/**
 * `artifacts` contains real, persisted artifacts for the current user/session.
 * Renders live artifacts and starter prompts with search filtering and robust accessibility.
 */
export default function ArtifactsGallery({
  artifacts = [],
  isLoading = false,
  onOpenArtifact,
  onLaunchArtifact,
  onDiscussInChat,
  onBackToChat
}) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredArtifacts = React.useMemo(() => {
    if (!searchQuery.trim()) return artifacts;
    const q = searchQuery.toLowerCase();
    return artifacts.filter((a) =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.artifact_type && a.artifact_type.toLowerCase().includes(q))
    );
  }, [artifacts, searchQuery]);

  return (
    <div className="gallery-container">
      <style>{`
        .gallery-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 64px 24px;
          text-align: center;
          color: var(--text-muted, #8b909c);
        }
        .gallery-empty-state p {
          margin: 0;
          font-weight: 600;
          color: var(--text-secondary, #475569);
        }
        .gallery-empty-state span {
          font-size: 0.86rem;
          max-width: 360px;
          color: var(--text-muted, #64748b);
        }
        .gallery-empty-state .spin {
          animation: gallery-spin 0.8s linear infinite;
        }
        @keyframes gallery-spin {
          to { transform: rotate(360deg); }
        }
        .gallery-section-heading {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary, #0f172a);
          margin: 40px 0 16px;
        }
        .gallery-search-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .gallery-search-input-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--card-bg, #ffffff);
          border: 1px solid var(--border-subtle, #e2e8f0);
          border-radius: 8px;
          padding: 6px 12px;
          width: 260px;
        }
        .gallery-search-input-box input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.84rem;
          color: var(--text-primary, #0f172a);
          width: 100%;
        }
        .starter-prompt-tag {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--accent-primary, #3b82f6);
          margin-bottom: 8px;
        }
        .starter-prompt-text {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary, #0f172a);
          margin: 0 0 16px;
          line-height: 1.45;
        }
      `}</style>

      <div className="gallery-hero">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div className="gallery-hero-badge" style={{ margin: 0 }}>
            <Layers size={13} />
            <span>Sandboxed artifacts</span>
          </div>
          {onBackToChat && (
            <button
              type="button"
              className="btn-action-chip"
              onClick={onBackToChat}
              style={{ padding: '6px 12px', fontSize: '0.82rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <ArrowLeft size={14} />
              <span>Back to Chat</span>
            </button>
          )}
        </div>
        <h1 className="gallery-title">Your artifacts</h1>
        <p className="gallery-desc">
          Markdown and HTML/JS artifacts you've generated in chat, kept here for reference.
          Each one renders in an isolated iframe with no access to cookies or local storage.
        </p>
      </div>

      {isLoading ? (
        <div className="gallery-empty-state">
          <Loader2 size={22} className="spin" />
          <p>Loading your artifacts…</p>
        </div>
      ) : artifacts.length === 0 ? (
        <div className="gallery-empty-state">
          <Inbox size={22} />
          <p>You haven't generated any artifacts yet.</p>
          <span>Ask the assistant for a calculator, canvas, or essay — it'll show up here once it's created.</span>
        </div>
      ) : (
        <>
          {artifacts.length > 2 && (
            <div className="gallery-search-row">
              <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Showing {filteredArtifacts.length} of {artifacts.length} {artifacts.length === 1 ? 'artifact' : 'artifacts'}
              </span>
              <div className="gallery-search-input-box">
                <input
                  type="text"
                  placeholder="Filter artifacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Filter artifacts"
                />
              </div>
            </div>
          )}
          <div className="gallery-grid">
            {filteredArtifacts.map((art, idx) => {
              const timestamp = formatTimestamp(art.created_at);
              const isHtml = art.artifact_type === 'html';
              return (
                <div key={art.id || `${art.title}-${idx}`} className="gallery-card">
                  <div className="gallery-card-top">
                    <div className="gallery-card-icon">
                      {isHtml ? <Sliders size={18} /> : <Code2 size={18} />}
                    </div>
                    <div className="gallery-card-type-badge">{formatArtifactType(art.artifact_type)}</div>
                  </div>

                  <h3 className="gallery-card-title">{art.title || 'Untitled artifact'}</h3>
                  {timestamp && (
                    <div className="gallery-card-guest">
                      <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {timestamp}
                    </div>
                  )}

                  <div className="gallery-card-actions">
                    <button
                      type="button"
                      className="btn-gallery-launch"
                      onClick={() => onOpenArtifact?.(art)}
                    >
                      <Sliders size={13} />
                      <span>Open</span>
                    </button>
                    {onDiscussInChat && (
                      <button
                        type="button"
                        className="btn-gallery-discuss"
                        onClick={() => onDiscussInChat(`Explain how the "${art.title}" artifact works.`)}
                        title="Discuss this artifact with the assistant"
                        aria-label="Discuss this artifact with the assistant"
                      >
                        <MessageSquare size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Suggestions to help a user get started — explicitly not framed as existing artifacts */}
      {onLaunchArtifact && (
        <div>
          <h2 className="gallery-section-heading">Not sure what to ask?</h2>
          <div className="gallery-grid">
            {STARTER_PROMPTS.map((p) => (
              <div key={p.id} className="gallery-card">
                <div className="starter-prompt-tag">{p.category} · {p.guest}</div>
                <p className="starter-prompt-text">{p.label}</p>
                <div className="gallery-card-actions">
                  <button
                    type="button"
                    className="btn-gallery-launch"
                    onClick={() => onLaunchArtifact(p.prompt)}
                  >
                    <Sliders size={13} />
                    <span>Generate this</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Architecture Badge */}
      <div className="gallery-security-banner">
        <ShieldCheck size={16} color="var(--accent-emerald)" />
        <div className="gallery-security-text">
          <strong>Sandboxed rendering:</strong> HTML/JS artifacts run inside isolated iframes with <code>sandbox="allow-scripts"</code>, blocking parent DOM access, cookies, and top-level navigation.
        </div>
      </div>
    </div>
  );
}