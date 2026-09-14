import React from 'react';
import { Plus, MessageSquare, Trash2, Radio, Sparkles, BookOpen, BarChart2 } from 'lucide-react';
import { PLAYBOOK_SHORTCUTS } from '../prompts';

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onSelectQuickPrompt,
  isOpen
}) {
  const getIcon = (iconName, color) => {
    if (iconName === 'BookOpen') return <BookOpen size={12} color={color} />;
    if (iconName === 'BarChart2') return <BarChart2 size={12} color={color} />;
    return <Sparkles size={12} color={color} />;
  };

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

        <button
          className="btn-primary"
          style={{ width: '100%', marginTop: '4px' }}
          onClick={onNewChat}
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="sidebar-section-title">Recent Conversations</div>
      <div className="sessions-list">
        {sessions.length === 0 ? (
          <div style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            No conversations yet. Start a new session!
          </div>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className={`session-item ${s.id === currentSessionId ? 'active' : ''}`}
              onClick={() => onSelectSession(s.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                <span className="session-title">{s.title || 'Untitled Chat'}</span>
              </div>
              <button
                className="session-delete-btn"
                title="Delete session"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(s.id);
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
        {PLAYBOOK_SHORTCUTS.map((item) => (
          <button
            key={item.id}
            className="btn-action-chip"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            onClick={() => onSelectQuickPrompt(item.query, item.options)}
          >
            {getIcon(item.icon, item.color)}
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
