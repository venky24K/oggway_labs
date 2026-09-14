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
  Radio,
  Share2,
  Layers
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import ArtifactViewer from './components/ArtifactViewer';
import CitationBadge from './components/CitationBadge';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [isArtifactExpanded, setIsArtifactExpanded] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);
  const [currentProvider, setCurrentProvider] = useState('ollama');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load initial model status and sessions
  useEffect(() => {
    fetchModelStatus();
    fetchSessions();
  }, []);

  const fetchModelStatus = async () => {
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const data = await res.json();
        setModelStatus(data);
        setCurrentProvider(data.current_provider);
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
          setActiveArtifact(data.artifacts[data.artifacts.length - 1]);
        } else {
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
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
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
    const userMsg = { role: 'user', content: query };
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
        fetchSessions();
      }

      const assistantMsg = {
        role: 'assistant',
        content: data.message,
        citations_json: data.citations || [],
        model_used: data.model_used,
        artifact: data.artifact
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If an artifact was returned, automatically open Artifact Viewer!
      if (data.artifact) {
        setActiveArtifact(data.artifact);
      }
    } catch (e) {
      console.error('Error sending message:', e);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error connecting to Lenny Growth Assistant: ${e.message}. Please check that the server is running or switch to the Grounded Fallback Engine in Settings.`,
          citations_json: []
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

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={loadSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onSelectQuickPrompt={(prompt) => handleSendMessage({ text: prompt })}
        isOpen={sidebarOpen}
      />

      {/* Main Workspace */}
      <div className="main-workspace">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <button
              className="btn-icon"
              style={{ display: 'md-none' }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={18} />
            </button>
            <div className="header-title-wrapper">
              <h2>The Lenny Growth Assistant</h2>
              <p>Grounded in 303 episodes & 15,000+ transcript segments</p>
            </div>
          </div>

          <div className="header-right">
            {/* Model Provider Pill */}
            <div
              className="status-pill"
              onClick={() => setIsSettingsOpen(true)}
              style={{ cursor: 'pointer' }}
              title="Click to configure provider & settings"
            >
              <div
                className={`pulse-dot ${
                  modelStatus?.ollama_available || currentProvider !== 'ollama' ? '' : 'offline'
                }`}
              />
              <span>
                {currentProvider === 'ollama'
                  ? modelStatus?.ollama_available
                    ? 'Ollama Local (llama3.2)'
                    : 'Ollama Offline (Fallback Ready)'
                  : currentProvider === 'anthropic'
                  ? 'Anthropic Claude'
                  : currentProvider === 'openai'
                  ? 'OpenAI'
                  : 'Grounded Fallback Engine'}
              </span>
            </div>

            {/* Artifact toggle button if artifact exists */}
            {activeArtifact && (
              <button
                className="btn-action-chip accent"
                onClick={() => setActiveArtifact(activeArtifact ? null : activeArtifact)}
              >
                <Layers size={13} />
                <span>Artifact Viewer</span>
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
                    <div
                      className="quick-prompt-card"
                      onClick={() =>
                        handleSendMessage({
                          text: "How does Elena Verna define Product-Led Growth vs Sales-Led Growth?"
                        })
                      }
                    >
                      <div className="prompt-tag">Elena Verna • PLG Strategy</div>
                      <div className="prompt-text">
                        "How does Elena Verna define Product-Led Growth vs Sales-Led Growth?"
                      </div>
                    </div>

                    <div
                      className="quick-prompt-card"
                      onClick={() =>
                        handleSendMessage({
                          text: "What are Brian Chesky's key principles for 'Founder Mode' and redesigning product reviews?"
                        })
                      }
                    >
                      <div className="prompt-tag">Brian Chesky • Leadership</div>
                      <div className="prompt-text">
                        "What are Brian Chesky's key principles for Founder Mode?"
                      </div>
                    </div>

                    <div
                      className="quick-prompt-card"
                      onClick={() =>
                        handleSendMessage({
                          text: "Write a Ship 30 for 30 essay on product-led growth retention loops based on Lenny's Podcast",
                          generate_ship30: true
                        })
                      }
                    >
                      <div className="prompt-tag">Ship 30 for 30 • Atomic Essay</div>
                      <div className="prompt-text">
                        "⚡ Turn PLG retention loops into an ~1,250-word Ship 30 for 30 essay"
                      </div>
                    </div>

                    <div
                      className="quick-prompt-card"
                      onClick={() =>
                        handleSendMessage({
                          text: "Generate an interactive Growth & Retention Model calculator HTML artifact",
                          generate_artifact: true
                        })
                      }
                    >
                      <div className="prompt-tag">Interactive Artifact • Viewer</div>
                      <div className="prompt-text">
                        "📊 Generate an interactive Growth & Retention Model calculator widget"
                      </div>
                    </div>
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
                        style={{ whiteSpace: 'pre-wrap' }}
                        dangerouslySetInnerHTML={{
                          __html: m.content
                            .replace(/### (.*?)\n/g, '<h3 style="margin: 10px 0 6px; color: #818cf8;">$1</h3>')
                            .replace(/#### (.*?)\n/g, '<h4 style="margin: 8px 0 4px; color: #38bdf8;">$1</h4>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        }}
                      />

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
                            <BookOpen size={12} color="#f59e0b" />
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
                            <Code2 size={12} color="#10b981" />
                            <span>Interactive Artifact</span>
                          </button>

                          <button
                            className="btn-action-chip"
                            onClick={() => handleCopyMessage(idx, m.content)}
                          >
                            {copiedIndex === idx ? (
                              <Check size={12} color="#10b981" />
                            ) : (
                              <Copy size={12} />
                            )}
                            <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                          </button>
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
                    <Sparkles size={16} className="animate-spin" color="#818cf8" />
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
            />
          )}
        </div>
      </div>

      {/* Settings & Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        modelStatus={modelStatus}
        currentProvider={currentProvider}
        onChangeProvider={setCurrentProvider}
        onSaveConfig={(cfg) => {
          setCurrentProvider(cfg.provider);
        }}
      />
    </div>
  );
}
