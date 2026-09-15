import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Sparkles, BookOpen, BarChart2, X, Check } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { PLAYBOOK_SHORTCUTS } from '../prompts';

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onSelectQuickPrompt,
  isOpen,
  onClose,
  onNavigateLanding
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const getIcon = (iconName, color) => {
    if (iconName === 'BookOpen') return <BookOpen size={12} color={color} />;
    if (iconName === 'BarChart2') return <BarChart2 size={12} color={color} />;
    return <Sparkles size={12} color={color} />;
  };

  const handleDeleteClick = (e, sessionId) => {
    e.stopPropagation();
    if (confirmDeleteId === sessionId) {
      onDeleteSession(sessionId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(sessionId);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === sessionId ? null : prev));
      }, 3000);
    }
  };

  const handleSessionClick = (sessionId) => {
    onSelectSession(sessionId);
    if (onClose) onClose();
  };

  const handlePromptClick = (query, options) => {
    onSelectQuickPrompt(query, options);
    if (onClose) onClose();
  };

  const handleNewChatClick = () => {
    onNewChat();
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div
        className="sidebar-header"
        onClick={() => {
          if (onNavigateLanding) onNavigateLanding();
          if (onClose) onClose();
        }}
        style={{ cursor: 'pointer' }}
        title="Return to Landing Page Overview"
      >
        <BrandLogo size="medium" />

        {/* Mobile close button */}
        {isOpen && (
          <button
            type="button"
            className="btn-icon mobile-sidebar-close"
            onClick={onClose}
            title="Close sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ padding: '0 16px 8px 16px' }}>
        <button
          type="button"
          className="btn-new-chat"
          style={{ width: '100%', margin: '8px 0 0 0' }}
          onClick={handleNewChatClick}
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
          sessions.map((s) => {
            const isConfirming = confirmDeleteId === s.id;
            return (
              <div
                key={s.id}
                className={`session-item ${s.id === currentSessionId ? 'active' : ''}`}
                onClick={() => handleSessionClick(s.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', flex: 1 }}>
                  <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                  <span className="session-title">{s.title || 'Untitled Chat'}</span>
                </div>
                <button
                  type="button"
                  className={`btn-delete-session session-delete-btn ${isConfirming ? 'confirming' : ''}`}
                  title={isConfirming ? "Click again to confirm delete" : "Delete session"}
                  onClick={(e) => handleDeleteClick(e, s.id)}
                >
                  {isConfirming ? (
                    <span className="delete-confirm-label">
                      <Check size={12} style={{ pointerEvents: 'none' }} /> Delete?
                    </span>
                  ) : (
                    <Trash2 size={13} style={{ pointerEvents: 'none' }} />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Prompts Library */}
      <div className="sidebar-section-title">Playbook Shortcuts</div>
      <div style={{ padding: '4px 12px 16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {PLAYBOOK_SHORTCUTS.map((item) => (
          <button
            type="button"
            key={item.id}
            className="btn-action-chip"
            style={{ width: '100%', justifyContent: 'flex-start' }}
            onClick={() => handlePromptClick(item.query, item.options)}
          >
            {getIcon(item.icon, item.color)}
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
