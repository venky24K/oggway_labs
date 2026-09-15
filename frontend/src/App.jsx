import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Settings,
  Sun,
  Moon,
  Menu,
  BookOpen,
  Code2,
  Copy,
  Check,
  Layers,
  ChevronDown,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

import Sidebar from './components/Sidebar';
import ArtifactViewer from './components/ArtifactViewer';
import CitationBadge from './components/CitationBadge';
import SettingsModal from './components/SettingsModal';
import { WELCOME_QUICK_CARDS } from './prompts';

const QUICK_MODELS = [
  { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash', provider: 'gemini' },
  { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash', provider: 'gemini' },
  { id: 'gemini-3.1-pro', name: 'gemini-3.1-pro', provider: 'gemini' },
  { id: 'gpt-4o', name: 'gpt-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'gpt-4o-mini', provider: 'openai' },
  { id: 'claude-3-5-sonnet-20241022', name: 'claude-3-5-sonnet', provider: 'anthropic' },
  { id: 'claude-3-5-haiku-20241022', name: 'claude-3-5-haiku', provider: 'anthropic' },
  { id: 'fallback-rag', name: 'Grounded Fallback', provider: 'fallback' }
];

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [isArtifactExpanded, setIsArtifactExpanded] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);
  const [currentProvider, setCurrentProvider] = useState('fallback');
  const [currentModel, setCurrentModel] = useState('fallback-rag');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('models');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('lenny_theme') || 'light';
    } catch {
      return 'light';
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const lastArtifactRef = useRef(null);

  const messagesEndRef = useRef(null);
  const modelDropdownRef = useRef(null);

  const getModelDisplayName = (modelId) => {
    if (!modelId) return 'Select Model';
    if (modelId === 'fallback-rag') return 'Grounded Fallback';
    const found = QUICK_MODELS.find((m) => m.id === modelId);
    return found ? found.name : modelId;
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('lenny_theme', theme);
    } catch {}
  }, [theme]);

  // Load initial model status and sessions
  useEffect(() => {
    fetchModelStatus();
    fetchSessions();
  }, []);

  const isProviderAvailable = (prov) => {
    if (prov === 'fallback') return true;
    if (prov === 'ollama') return Boolean(modelStatus?.ollama_available);
    return Boolean(modelStatus?.available_providers?.includes(prov));
  };

  // Build the list of visible models for the dropdown (6-8 models max, only scanned Ollama + available cloud/fallback models)
  const getDropdownModels = () => {
    let customList = [];
    try {
      const saved = localStorage.getItem('lenny_custom_models');
      if (saved) customList = JSON.parse(saved);
    } catch {}

    const combined = [];

    // 1. Add ONLY detected Ollama models from scan IF Ollama is running
    if (modelStatus?.ollama_available && modelStatus?.ollama_models) {
      modelStatus.ollama_models.forEach((om) => {
        if (!combined.some((m) => m.id === om)) {
          combined.push({ id: om, name: om, provider: 'ollama' });
        }
      });
    }

    // 2. Add Grounded Fallback
    combined.push({ id: 'fallback-rag', name: 'Grounded Fallback', provider: 'fallback' });

    // 3. Add configured Cloud models (only if provider has an API key!)
    QUICK_MODELS.forEach((qm) => {
      if (qm.provider !== 'fallback' && isProviderAvailable(qm.provider)) {
        if (!combined.some((m) => m.id === qm.id)) {
          combined.push(qm);
        }
      }
    });

    // 4. Add custom models if their provider is available
    customList.forEach((cm) => {
      if (isProviderAvailable(cm.provider) && !combined.some((m) => m.id === cm.id)) {
        combined.push({ id: cm.id, name: cm.name, provider: cm.provider });
      }
    });

    return combined.slice(0, 8);
  };

  // Ensure currentProvider & currentModel are available and valid
  useEffect(() => {
    if (modelStatus) {
      const isCurrentAvailable = isProviderAvailable(currentProvider);

      let isCustomOllama = false;
      try {
        const saved = localStorage.getItem('lenny_custom_models');
        if (saved) {
          const list = JSON.parse(saved);
          isCustomOllama = list.some((cm) => cm.id === currentModel && cm.provider === 'ollama');
        }
      } catch {}

      const isCurrentOllamaValid =
        currentProvider !== 'ollama' ||
        (Boolean(modelStatus.ollama_available) && (
          isCustomOllama ||
          (modelStatus.ollama_models && modelStatus.ollama_models.includes(currentModel))
        ));

      if (!isCurrentAvailable || !isCurrentOllamaValid) {
        if (modelStatus.ollama_available && modelStatus.ollama_models?.length) {
          setCurrentProvider('ollama');
          setCurrentModel(modelStatus.ollama_models[0]);
        } else if (
          modelStatus.current_provider &&
          modelStatus.current_provider !== 'ollama' &&
          modelStatus.available_providers?.includes(modelStatus.current_provider)
        ) {
          setCurrentProvider(modelStatus.current_provider);
          setCurrentModel(modelStatus.current_model || 'fallback-rag');
        } else {
          setCurrentProvider('fallback');
          setCurrentModel('fallback-rag');
        }
      }
    }
  }, [modelStatus]);

  const fetchModelStatus = async () => {
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const data = await res.json();
        setModelStatus(data);
        if (data.current_provider && data.available_providers?.includes(data.current_provider)) {
          setCurrentProvider(data.current_provider);
          if (data.current_model) {
            setCurrentModel(data.current_model);
          }
        } else {
          setCurrentProvider('fallback');
          setCurrentModel('fallback-rag');
        }
      }
    } catch (e) {
      console.error('Failed to fetch model status', e);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error('Failed to fetch sessions', e);
    }
  };

  const loadSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.artifacts && data.artifacts.length > 0) {
          const latest = data.artifacts[data.artifacts.length - 1];
          lastArtifactRef.current = latest;
          setActiveArtifact(latest);
        } else {
          lastArtifactRef.current = null;
          setActiveArtifact(null);
        }
      }
    } catch (e) {
      console.error('Failed to load session', e);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setActiveArtifact(null);
    lastArtifactRef.current = null;
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(`Failed to delete session: ${res.status}`);
      }
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async ({
    text = input,
    generate_ship30 = false,
    generate_artifact = false
  } = {}) => {
    const query = text.trim();
    if (!query || loading) return;

    // Optimistically show user message
    const now = new Date().toISOString();
    const userMsg = { role: 'user', content: query, created_at: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: currentSessionId,
          message: query,
          provider: currentProvider,
          model: currentModel,
          generate_ship30,
          generate_artifact
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      if (!currentSessionId) {
        setCurrentSessionId(data.session_id);
      }
      fetchSessions();

      const assistantMsg = {
        id: data.message_id,
        role: 'assistant',
        content: data.message,
        citations_json: data.citations || [],
        model_used: data.model_used,
        artifact: data.artifact,
        feedback: null,
        created_at: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If an artifact was returned, automatically open Artifact Viewer!
      if (data.artifact) {
        lastArtifactRef.current = data.artifact;
        setActiveArtifact(data.artifact);
      }
    } catch (e) {
      console.error('Error sending message:', e);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error connecting to Lenny Growth Assistant: ${e.message}. Please check that the server is running or switch to the Grounded Fallback Engine in Settings.`,
          citations_json: [],
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (idx, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFeedback = async (idx, messageId, type) => {
    const currentFeedback = messages[idx]?.feedback;
    const newFeedback = currentFeedback === type ? null : type;

    setMessages((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, feedback: newFeedback } : m))
    );

    if (messageId) {
      try {
        await fetch(`/api/messages/${messageId}/feedback`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback: newFeedback })
        });
      } catch (e) {
        console.error('Failed to record feedback:', e);
      }
    }
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? ''
        : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={loadSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onSelectQuickPrompt={(prompt, opts) => handleSendMessage({ text: prompt, ...(opts || {}) })}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          title="Close navigation"
        />
      )}

      {/* Main Workspace */}
      <div className="main-workspace">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <button
              type="button"
              className="btn-icon mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Menu"
            >
              <Menu size={18} />
            </button>
            <div className="header-title-wrapper">
              <h2>The Lenny Growth Assistant</h2>
              <p>Grounded in 303 episodes & 15,000+ transcript segments</p>
            </div>
          </div>

          <div className="header-right">
            {/* Model Selector Dropdown (No green dot, just model name + chevron, ellipsis if large) */}
            <div className="model-selector-wrapper" ref={modelDropdownRef}>
              <button
                type="button"
                className="model-selector-btn"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                title={`Active model: ${getModelDisplayName(currentModel)}`}
              >
                <span className="model-name-text">{getModelDisplayName(currentModel)}</span>
                <ChevronDown
                  size={13}
                  className={`dropdown-chevron ${isModelDropdownOpen ? 'open' : ''}`}
                />
              </button>

              {isModelDropdownOpen && (
                <div className="model-dropdown-menu">
                  <div className="model-dropdown-list">
                    {getDropdownModels().map((m) => {
                      const isSelected =
                        currentModel === m.id ||
                        (currentProvider === m.provider && currentModel === m.name);
                      return (
                        <div
                          key={`${m.provider}-${m.id}`}
                          className={`model-dropdown-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setCurrentModel(m.id);
                            setCurrentProvider(m.provider);
                            setIsModelDropdownOpen(false);
                            fetch('/api/settings', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                provider: m.provider,
                                ollama_model: m.provider === 'ollama' ? m.id : undefined,
                                openai_model: m.provider === 'openai' ? m.id : undefined,
                                anthropic_model: m.provider === 'anthropic' ? m.id : undefined,
                                gemini_model: m.provider === 'gemini' ? m.id : undefined
                              })
                            }).catch(() => {});
                          }}
                        >
                          <span className="dropdown-item-name">{m.name}</span>
                          {isSelected && <Check size={14} className="dropdown-item-check" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="model-dropdown-divider" />

                  <button
                    type="button"
                    className="model-dropdown-see-all"
                    onClick={() => {
                      setIsModelDropdownOpen(false);
                      setSettingsInitialTab('models');
                      setIsSettingsOpen(true);
                    }}
                  >
                    see all
                  </button>
                </div>
              )}
            </div>

            {/* Artifact toggle button if artifact exists */}
            {(activeArtifact || lastArtifactRef.current) && (
              <button
                type="button"
                className={`btn-action-chip accent ${activeArtifact ? 'active-panel' : ''}`}
                onClick={() => setActiveArtifact(activeArtifact ? null : lastArtifactRef.current)}
                title={activeArtifact ? "Close artifact sidepanel" : "Open artifact sidepanel"}
              >
                <Layers size={13} />
                <span>{activeArtifact ? "Close Artifact" : "Open Artifact"}</span>
              </button>
            )}

            {/* Dark / Light Mode */}
            <button
              className="btn-icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Settings */}
            <button
              className="btn-icon"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings & Connections"
            >
              <Settings size={16} />
            </button>
          </div>
        </header>

        {/* Workspace Split: Chat Pane + Side-by-side Artifact Viewer */}
        <div className="workspace-split">
          {/* Chat Stream Pane */}
          <div className={`chat-pane ${activeArtifact ? 'with-artifact' : ''}`}>
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="welcome-hero">
                  <div className="hero-icon">🎙️</div>
                  <h1 className="hero-title">Welcome to The Lenny Growth Assistant</h1>
                  <p className="hero-desc">
                    Ask tactical product and growth questions grounded exclusively in Lenny Rachitsky's
                    podcast archives. Generate viral Ship 30 for 30 essays, interactive growth models, and
                    executive playbooks.
                  </p>

                  <div className="quick-prompts-grid">
                    {WELCOME_QUICK_CARDS.map((card) => (
                      <div
                        key={card.id}
                        className="quick-prompt-card"
                        onClick={() =>
                          handleSendMessage({
                            text: card.query,
                            ...(card.options || {})
                          })
                        }
                      >
                        <div className="prompt-tag">{card.tag}</div>
                        <div className="prompt-text">"{card.text}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} className={`message-row ${m.role}`}>
                    {m.role === 'assistant' && (
                      <div className="avatar assistant">🎙️</div>
                    )}

                    <div className={`bubble ${m.role}`}>
                      <div
                        className="markdown-content"
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(marked.parse(m.content || ''))
                        }}
                      />

                      {/* Interactive Artifact Card attached to message */}
                      {m.artifact && (
                        <div
                          className="message-artifact-card"
                          onClick={() => {
                            lastArtifactRef.current = m.artifact;
                            setActiveArtifact(m.artifact);
                          }}
                          role="button"
                          tabIndex={0}
                          title="Click to open artifact in sidepanel"
                        >
                          <div className="message-artifact-card-icon">
                            {m.artifact.artifact_type === 'html' ? (
                              <Code2 size={16} color="var(--accent-emerald)" />
                            ) : (
                              <BookOpen size={16} color="var(--accent-amber)" />
                            )}
                          </div>
                          <div className="message-artifact-card-info">
                            <div className="message-artifact-card-tag">
                              {m.artifact.artifact_type === 'html' ? 'Interactive Web Widget' : 'Growth Framework Essay'}
                            </div>
                            <div className="message-artifact-card-title">{m.artifact.title || 'Untitled Artifact'}</div>
                          </div>
                          <div className="message-artifact-card-cta">
                            <Layers size={13} />
                            <span>Open in Panel</span>
                          </div>
                        </div>
                      )}

                      {/* Render Citation Badges with YouTube Links */}
                      {m.citations_json && m.citations_json.length > 0 && (
                        <div className="citations-wrapper">
                          <div className="citations-title">
                            <span>Podcast Grounding & YouTube Timestamps:</span>
                          </div>
                          <div className="citation-chips">
                            {m.citations_json.map((cit, cIdx) => (
                              <CitationBadge key={cIdx} citation={cit} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Chips for Assistant responses */}
                      {m.role === 'assistant' && (
                        <div className="message-actions">
                          {m.citations_json && m.citations_json.length > 0 && (
                            <>
                              <button
                                className="btn-action-chip"
                                onClick={() =>
                                  handleSendMessage({
                                    text: `Turn this into an ~1,250-word Ship 30 for 30 essay: ${m.content.slice(
                                      0,
                                      200
                                    )}`,
                                    generate_ship30: true
                                  })
                                }
                              >
                                <BookOpen size={12} color="var(--accent-amber)" />
                                <span>Ship 30 for 30 Essay</span>
                              </button>

                              <button
                                className="btn-action-chip"
                                onClick={() =>
                                  handleSendMessage({
                                    text: `Generate an interactive HTML artifact calculator based on this framework`,
                                    generate_artifact: true
                                  })
                                }
                              >
                                <Code2 size={12} color="var(--accent-emerald)" />
                                <span>Interactive Artifact</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            className="btn-action-chip"
                            onClick={() => handleCopyMessage(idx, m.content)}
                            title="Copy response"
                          >
                            {copiedIndex === idx ? (
                              <Check size={12} color="var(--accent-emerald)" />
                            ) : (
                              <Copy size={12} />
                            )}
                            <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                          </button>

                          {/* Like / Unlike feedback buttons */}
                          <button
                            type="button"
                            className={`btn-action-chip feedback-btn ${m.feedback === 'like' ? 'liked' : ''}`}
                            onClick={() => handleFeedback(idx, m.id, 'like')}
                            title="Helpful response"
                          >
                            <ThumbsUp size={12} />
                            {m.feedback === 'like' && <span>Helpful</span>}
                          </button>

                          <button
                            type="button"
                            className={`btn-action-chip feedback-btn ${m.feedback === 'unlike' ? 'unliked' : ''}`}
                            onClick={() => handleFeedback(idx, m.id, 'unlike')}
                            title="Needs improvement"
                          >
                            <ThumbsDown size={12} />
                            {m.feedback === 'unlike' && <span>Needs Work</span>}
                          </button>

                          {m.created_at && (
                            <span className="message-time-assistant">
                              {formatMessageTime(m.created_at)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* User message timestamp */}
                      {m.role === 'user' && m.created_at && (
                        <div className="message-time-user">
                          {formatMessageTime(m.created_at)}
                        </div>
                      )}
                    </div>

                    {m.role === 'user' && (
                      <div className="avatar user">👤</div>
                    )}
                  </div>
                ))
              )}

              {loading && (
                <div className="message-row assistant">
                  <div className="avatar assistant">🎙️</div>
                  <div className="bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Sparkles size={16} className="animate-spin" color="var(--accent-primary)" />
                    <span>Searching Lenny's transcripts and synthesizing grounded response...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="chat-input-wrapper">
              <form
                className="input-container"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <textarea
                  className="chat-textarea"
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask any product or growth question from Lenny's Podcast..."
                />
                <button
                  type="submit"
                  className="btn-send"
                  disabled={!input.trim() || loading}
                  title="Send message"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Claude-Style Side-by-Side Artifact Viewer */}
          {activeArtifact && (
            <ArtifactViewer
              artifact={activeArtifact}
              onClose={() => setActiveArtifact(null)}
              isExpanded={isArtifactExpanded}
              onToggleExpand={() => setIsArtifactExpanded(!isArtifactExpanded)}
              theme={theme}
            />
          )}
        </div>
      </div>

      {/* Settings & Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          fetchModelStatus();
        }}
        modelStatus={modelStatus}
        currentProvider={currentProvider}
        onChangeProvider={setCurrentProvider}
        currentModel={currentModel}
        onChangeModel={setCurrentModel}
        initialTab={settingsInitialTab}
        onSaveConfig={(cfg) => {
          if (cfg.provider) setCurrentProvider(cfg.provider);
          if (cfg.model) setCurrentModel(cfg.model);
          fetchModelStatus();
        }}
      />
    </div>
  );
}
