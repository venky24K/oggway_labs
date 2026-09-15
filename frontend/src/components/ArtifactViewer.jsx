import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Eye, Code, Copy, Download, X, Maximize2, Minimize2, ShieldCheck, Check } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function ArtifactViewer({ artifact, onClose, isExpanded, onToggleExpand, theme = 'light' }) {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'code'
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copyTimerRef = useRef(null);

  // Clear copy timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Reset tab and states whenever a different artifact is loaded
  useEffect(() => {
    setActiveTab('preview');
    setCopied(false);
    setCopyError(false);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  }, [artifact?.id, artifact?.title]);

  // Keyboard accessibility: ESC key collapses expanded view or closes viewer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isExpanded) {
          onToggleExpand?.();
        } else {
          onClose?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, onClose, onToggleExpand]);

  if (!artifact) return null;

  const { title = 'Artifact', artifact_type = 'markdown', content = '' } = artifact;

  // Normalize and clean outer markdown code fences if inadvertently included by an LLM
  const cleanContent = useMemo(() => {
    const raw = (content || '').trim();
    return raw.replace(/^```(?:html|markdown|xml|javascript)?\s*\n([\s\S]*?)\n```\s*$/i, '$1');
  }, [content]);

  // Format type for display badge
  const formattedTypeBadge = artifact_type === 'html' ? 'HTML Widget' : artifact_type === 'markdown' ? 'Markdown Document' : (artifact_type || 'Artifact').toUpperCase();

  // Prepare safe isolated srcDoc for HTML artifacts
  const buildIsolatedHtmlDoc = (rawHtml = '') => {
    const isDark = theme === 'dark';
    const bg = isDark ? '#090d16' : '#ffffff';
    const fg = isDark ? '#f8fafc' : '#0f172a';

    // Inject Content Security Policy permitting trusted CDNs for interactive charts & styles.
    // frame-src/form-action are explicitly denied on top of the sandbox attribute below, so a
    // generated artifact can't nest another frame or submit a form even if script-src is abused.
    const cspMeta = `
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" 
            content="default-src 'self' 'unsafe-inline' data:; script-src 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com; style-src 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src https://fonts.gstatic.com data:; img-src * data: blob:; connect-src 'none'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none';">
    `;

    const themeStyle = `
      <style>
        :root { color-scheme: ${isDark ? 'dark' : 'light'}; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${bg}; color: ${fg}; }
      </style>
    `;
    const headInjection = `${cspMeta}${themeStyle}`;

    const hasDoctypeOrHtml = /<!DOCTYPE/i.test(rawHtml) || /<html[\s>]/i.test(rawHtml);

    if (hasDoctypeOrHtml) {
      if (/<head[\s>]/i.test(rawHtml)) {
        return rawHtml.replace(/<head[^>]*>/i, (headTag) => `${headTag}${headInjection}`);
      }
      if (/<html[^>]*>/i.test(rawHtml)) {
        return rawHtml.replace(/<html[^>]*>/i, (htmlTag) => `${htmlTag}<head>${headInjection}</head>`);
      }
      return rawHtml.replace(/<!DOCTYPE[^>]*>/i, (doctype) => `${doctype}<head>${headInjection}</head>`);
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${headInjection}
        </head>
        <body style="padding: 24px;">
          ${rawHtml}
        </body>
      </html>
    `;
  };

  const handleCopy = async () => {
    if (!cleanContent.trim()) return;
    try {
      await navigator.clipboard.writeText(cleanContent);
      setCopyError(false);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
      setCopyError(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopyError(false), 2000);
    }
  };

  const FILE_TYPES = {
    html: { extension: 'html', mime: 'text/html' },
    markdown: { extension: 'md', mime: 'text/markdown' }
  };

  const handleDownload = () => {
    if (!cleanContent.trim()) return;
    const { extension, mime } = FILE_TYPES[artifact_type] || { extension: 'txt', mime: 'text/plain' };
    const blob = new Blob([cleanContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = (title || 'artifact')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'artifact';
    a.download = `${safeTitle}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Safe sanitized markdown with external link security
  const sanitizedMarkdown = useMemo(() => {
    if (artifact_type !== 'markdown' || !cleanContent) return '';
    try {
      const parsed = marked.parse(cleanContent, { gfm: true, breaks: true });
      return DOMPurify.sanitize(parsed, {
        ADD_ATTR: ['target', 'rel']
      });
    } catch {
      return DOMPurify.sanitize(cleanContent);
    }
  }, [cleanContent, artifact_type]);

  return (
    <div className={`artifact-pane ${isExpanded ? 'expanded' : ''}`}>
      <style>{`
        .artifact-empty-state {
          height: 100%;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted, #8b909c);
          font-size: 0.9rem;
        }
      `}</style>

      {/* Header bar */}
      <div className="artifact-header">
        <div className="artifact-title-wrapper">
          <span className="artifact-type-badge">{formattedTypeBadge}</span>
          <h3 className="artifact-title" title={title}>{title}</h3>
        </div>

        {/* View Mode Tabs */}
        <div className="artifact-tabs" role="tablist" aria-label="Artifact view mode">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'preview'}
            className={`artifact-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={12} style={{ display: 'inline', marginRight: 4 }} /> Preview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'code'}
            className={`artifact-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <Code size={12} style={{ display: 'inline', marginRight: 4 }} /> Code
          </button>
        </div>

        {/* Action Controls */}
        <div className="artifact-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={handleCopy}
            disabled={!cleanContent.trim()}
            title={copyError ? 'Copy failed' : 'Copy code'}
            aria-label={copyError ? 'Copy failed' : 'Copy code'}
          >
            {copied ? (
              <Check size={14} color="var(--accent-emerald)" />
            ) : copyError ? (
              <X size={14} color="var(--accent-rose, #dc2626)" />
            ) : (
              <Copy size={14} />
            )}
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={handleDownload}
            disabled={!cleanContent.trim()}
            title="Download file"
            aria-label="Download file"
          >
            <Download size={14} />
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={onToggleExpand}
            title={isExpanded ? 'Collapse' : 'Maximize'}
            aria-label={isExpanded ? 'Collapse artifact viewer' : 'Maximize artifact viewer'}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            title="Close viewer"
            aria-label="Close artifact viewer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Artifact Frame */}
      <div className="artifact-content-frame">
        {!cleanContent.trim() ? (
          <div className="artifact-empty-state">
            <p>This artifact has no content yet.</p>
          </div>
        ) : activeTab === 'preview' ? (
          artifact_type === 'html' ? (
            <iframe
              title={title}
              className="artifact-iframe"
              srcDoc={buildIsolatedHtmlDoc(cleanContent)}
              sandbox="allow-scripts"
            />
          ) : (
            <div className="artifact-markdown-view">
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{ __html: sanitizedMarkdown }}
              />
            </div>
          )
        ) : (
          <pre className="artifact-code-view">
            <code>{cleanContent}</code>
          </pre>
        )}
      </div>

      {/* Security Status Bar */}
      <div className="security-notice">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <strong>Sandboxed Execution:</strong> Isolated origin, no cookies/storage access, safe CSP boundary.
        </span>
        <span style={{ opacity: 0.8 }}>Read-Only Sandbox</span>
      </div>
    </div>
  );
}