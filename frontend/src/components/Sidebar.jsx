import React from 'react';
import { Plus, MessageSquare, Trash2, Radio, Sparkles, BookOpen, BarChart2 } from 'lucide-react';

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onSelectQuickPrompt,
  isOpen
}) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo-badge">
          <div className="logo-icon">🎙️</div>
          <div>
            <div>Lenny Assistant</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              Growth & Product Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <button className="btn-new-chat" onClick={onNewChat}>
        <Plus size={16} />
        <span>New Conversation</span>
      </button>

      {/* Session History Section */}
      <div className="sidebar-section-title">Conversations</div>
      <div className="sessions-list">
        {sessions.length === 0 ? (
          <div style={{ padding: '16px 8px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            No saved conversations yet.
          </div>
        ) : (
          sessions.map((sess) => (
            <div
              key={sess.id}
              className={`session-item ${sess.id === currentSessionId ? 'active' : ''}`}
              onClick={() => onSelectSession(sess.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                <span className="session-title" title={sess.title}>
                  {sess.title || 'Untitled Session'}
                </span>
              </div>
              <button
                className="btn-delete-session"
                title="Delete session"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(sess.id);
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Quick Prompts Library */}
      <div className="sidebar-section-title">Playbook Shortcuts</div>
      <div style={{ padding: '4px 12px 16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          className="btn-action-chip"
          style={{ width: '100%', justifyContent: 'flex-start' }}
          onClick={() => onSelectQuickPrompt("What does Elena Verna say about B2B Product-Led Growth vs Sales-Led?")}
        >
          <Sparkles size={12} color="var(--accent-primary)" />
          <span>Elena Verna: PLG vs SLG</span>
        </button>

        <button
          className="btn-action-chip"
          style={{ width: '100%', justifyContent: 'flex-start' }}
          onClick={() => onSelectQuickPrompt("What are Brian Chesky's key lessons on Founder Mode and product playbooks?")}
        >
          <Sparkles size={12} color="var(--accent-secondary)" />
          <span>Brian Chesky: Founder Mode</span>
        </button>

        <button
          className="btn-action-chip"
          style={{ width: '100%', justifyContent: 'flex-start' }}
          onClick={() => onSelectQuickPrompt("Write a Ship 30 for 30 essay on finding Product-Market Fit based on Lenny's Podcast")}
        >
          <BookOpen size={12} color="var(--accent-amber)" />
          <span>Ship 30 for 30 Essay</span>
        </button>

        <button
          className="btn-action-chip"
          style={{ width: '100%', justifyContent: 'flex-start' }}
          onClick={() => onSelectQuickPrompt("Generate an interactive Growth & Retention Model calculator HTML artifact")}
        >
          <BarChart2 size={12} color="var(--accent-emerald)" />
          <span>Interactive Calculator</span>
        </button>
      </div>
    </aside>
  );
}
