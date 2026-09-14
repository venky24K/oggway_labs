import React, { useState } from 'react';
import { Eye, Code, Copy, Download, X, Maximize2, Minimize2, ShieldCheck, Check } from 'lucide-react';

export default function ArtifactViewer({ artifact, onClose, isExpanded, onToggleExpand }) {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'code'
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

  const { title, artifact_type, content } = artifact;

  // Prepare safe isolated srcDoc for HTML artifacts
  const buildIsolatedHtmlDoc = (rawHtml) => {
    // Inject strict Content Security Policy into the head
    const cspMeta = `
      <meta http-equiv="Content-Security-Policy" 
            content="default-src 'self' 'unsafe-inline' data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; object-src 'none'; base-uri 'none';">
    `;

    // Ensure proper document structure if incomplete
    if (rawHtml.includes('<html') || rawHtml.includes('<!DOCTYPE')) {
      if (rawHtml.includes('<head>')) {
        return rawHtml.replace('<head>', `<head>${cspMeta}`);
      }
      return `${cspMeta}${rawHtml}`;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${cspMeta}
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; background: #090d16; color: #f8fafc; }
          </style>
        </head>
        <body>
          ${rawHtml}
        </body>
      </html>
    `;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extension = artifact_type === 'html' ? 'html' : 'md';
    const blob = new Blob([content], { type: artifact_type === 'html' ? 'text/html' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`artifact-pane ${isExpanded ? 'expanded' : ''}`}>
      {/* Header bar */}
      <div className="artifact-header">
        <div className="artifact-title-wrapper">
          <span className="artifact-type-badge">{artifact_type}</span>
          <h3 className="artifact-title" title={title}>{title}</h3>
        </div>

        {/* View Mode Tabs */}
        <div className="artifact-tabs">
          <button
            className={`artifact-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={12} style={{ display: 'inline', marginRight: 4 }} /> Preview
          </button>
          <button
            className={`artifact-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            <Code size={12} style={{ display: 'inline', marginRight: 4 }} /> Code
          </button>
        </div>

        {/* Action Controls */}
        <div className="artifact-actions">
          <button className="btn-icon" onClick={handleCopy} title="Copy code">
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          </button>
          <button className="btn-icon" onClick={handleDownload} title="Download file">
            <Download size={14} />
          </button>
          <button className="btn-icon" onClick={onToggleExpand} title={isExpanded ? "Collapse" : "Maximize"}>
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button className="btn-icon" onClick={onClose} title="Close viewer">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Artifact Frame */}
      <div className="artifact-content-frame">
        {activeTab === 'preview' ? (
          artifact_type === 'html' ? (
            <iframe
              title={title}
              className="artifact-iframe"
              srcDoc={buildIsolatedHtmlDoc(content)}
              /* Strict Sandbox:
                 - 'allow-scripts' enables interactive calculators and JS widgets.
                 - NO 'allow-same-origin': Blocks access to parent cookies, localStorage, and DOM.
                 - NO 'allow-top-navigation': Blocks malicious redirects.
                 - NO 'allow-forms': Blocks phishing submissions.
              */
              sandbox="allow-scripts"
            />
          ) : (
            <div className="artifact-code-view" style={{ whiteSpace: 'pre-wrap' }}>
              {content}
            </div>
          )
        ) : (
          <pre className="artifact-code-view">
            <code>{content}</code>
          </pre>
        )}
      </div>

      {/* Security Status Bar */}
      <div className="security-notice">
        <span style={{ display: 'flex', alignContent: 'center', gap: 6 }}>
          <ShieldCheck size={14} color="#10b981" />
          <strong>Sandboxed Execution:</strong> Isolated origin, no cookies/storage access, strict CSP network lock.
        </span>
        <span style={{ opacity: 0.8 }}>Read-Only Sandbox</span>
      </div>
    </div>
  );
}
