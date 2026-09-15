import React, { useState, useRef, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, Sparkles, BookOpen, BarChart2, X, Check, Layers } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { PLAYBOOK_SHORTCUTS } from '../prompts';

const DELETE_CONFIRM_TIMEOUT_MS = 3000;

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onSelectQuickPrompt,
  isOpen,
  onClose,
  onNavigateLanding,
  onOpenArtifacts
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const deleteTimeoutRef = useRef(null);

  // Clear any pending confirmation timer on unmount so it can't call
  // setState after the sidebar is gone.
  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) clearTimeout(deleteTimeoutRef.current);
    };
  }, []);

  const getIcon = (iconName, color) => {
    if (iconName === 'BookOpen') return <BookOpen size={12} color={color} />;
    if (iconName === 'BarChart2') return <BarChart2 size={12} color={color} />;
    return <Sparkles size={12} color={color} />;
  };

  const handleDeleteClick = async (e, sessionId) => {
    e.stopPropagation();

    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
      deleteTimeoutRef.current = null;
    }

    if (confirmDeleteId === sessionId) {
      setConfirmDeleteId(null);
      try {
        await onDeleteSession(sessionId);
      } catch (err) {
        // Don't fail silently — a delete that appears to succeed but didn't
        // is worse than a visible error.
        console.error('Failed to delete session:', err);
      }
      return;
    }

    setConfirmDeleteId(sessionId);
    deleteTimeoutRef.current = setTimeout(() => {
      setConfirmDeleteId((prev) => (prev === sessionId ? null : prev));
      deleteTimeoutRef.current = null;
    }, DELETE_CONFIRM_TIMEOUT_MS);
  };

  const handleSessionClick = (sessionId) => {
    onSelectSession(sessionId);
    if (onClose) onClose();
  };

  // Guards against the keydown bubbling up from the nested delete button —
  // without this, pressing Enter/Space to confirm a delete would also
  // re-trigger session selection on the row.
  const handleSessionKeyDown = (e, sessionId) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSessionClick(sessionId);
    }
  };

  const handlePromptClick = (query, options) => {
    onSelectQuickPrompt(query, options);
    if (onClose) onClose();
  };

  const handleNewChatClick = () => {
    onNewChat();
    if (onClose) onClose();
  };

  const handleNavigateLanding = () => {
    if (onNavigateLanding) onNavigateLanding();
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Scoped styles for the brand button below — everything else in this
          component relies on your existing external stylesheet. */}
      <style>{`
        .sidebar-brand-btn {
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
        }
      `}</style>

      {/* Header — the brand button and close button are siblings, not
          nested, so a click on one can never bubble into the other. */}
      <div className="sidebar-header">
        <button
          type="button"
          className="sidebar-brand-btn"
          onClick={handleNavigateLanding}
          title="Return to landing page"
          aria-label="Return to landing page"
        >
          <BrandLogo size="medium" />
        </button>

        {isOpen && (
          <button
            type="button"
            className="btn-icon mobile-sidebar-close"
            onClick={onClose}
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div style={{ padding: '0 16px 8px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          type="button"
          className="btn-new-chat"
          style={{ width: '100%', margin: '8px 0 0 0' }}
          onClick={handleNewChatClick}
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
        {onOpenArtifacts && (
          <button
            type="button"
            className="btn-action-chip"
            style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
            onClick={() => {
              onOpenArtifacts();
              if (onClose) onClose();
            }}
          >
            <Layers size={14} color="var(--accent-primary)" />
            <span>Artifacts Gallery</span>
          </button>
        )}
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
            const isActive = s.id === currentSessionId;
            return (
              <div
                key={s.id}
                className={`session-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSessionClick(s.id)}
                role="button"
                tabIndex={0}
                aria-current={isActive ? 'true' : undefined}
                onKeyDown={(e) => handleSessionKeyDown(e, s.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', flex: 1 }}>
                  <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                  <span className="session-title">{s.title || 'Untitled Chat'}</span>
                </div>
                <button
                  type="button"
                  className={`btn-delete-session session-delete-btn ${isConfirming ? 'confirming' : ''}`}
                  title={isConfirming ? 'Click again to confirm delete' : 'Delete session'}
                  aria-label={isConfirming ? 'Click again to confirm delete' : 'Delete session'}
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