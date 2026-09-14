import React, { useState } from 'react';
import { X, Server, Key, Database, Check, RefreshCw } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  modelStatus,
  onSaveConfig,
  currentProvider,
  onChangeProvider
}) {
  const [provider, setProvider] = useState(currentProvider || 'ollama');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [databaseUrl, setDatabaseUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onChangeProvider(provider);
    onSaveConfig({
      provider,
      ollamaUrl,
      ollamaModel,
      anthropicKey,
      openaiKey,
      databaseUrl
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Server size={18} color="#6366f1" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>System Configuration & LLM Routing</h3>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Active Provider Selector */}
          <div className="form-group">
            <label>Active LLM Engine</label>
            <select
              className="form-input"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="ollama">Ollama (Local LLM - llama3.2 / mistral)</option>
              <option value="anthropic">Anthropic Claude (Cloud - claude-3-5-sonnet)</option>
              <option value="openai">OpenAI (Cloud - gpt-4o)</option>
              <option value="fallback">Grounded Fallback Engine (Zero-dependency offline mode)</option>
            </select>
          </div>

          {/* Ollama Config */}
          {provider === 'ollama' && (
            <>
              <div className="form-group">
                <label>Ollama Base URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
              </div>
              <div className="form-group">
                <label>Ollama Model</label>
                <input
                  type="text"
                  className="form-input"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="llama3.2"
                />
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Status: {modelStatus?.ollama_available ? '🟢 Connected' : '🟠 Offline (will auto-route to Grounded Fallback)'}
                </div>
              </div>
            </>
          )}

          {/* Anthropic Config */}
          {provider === 'anthropic' && (
            <div className="form-group">
              <label>Anthropic API Key</label>
              <input
                type="password"
                className="form-input"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-api..."
              />
            </div>
          )}

          {/* OpenAI Config */}
          {provider === 'openai' && (
            <div className="form-group">
              <label>OpenAI API Key</label>
              <input
                type="password"
                className="form-input"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
              />
            </div>
          )}

          {/* Database Info */}
          <div className="form-group">
            <label>Supabase / PostgreSQL Connection (Optional)</label>
            <input
              type="password"
              className="form-input"
              value={databaseUrl}
              onChange={(e) => setDatabaseUrl(e.target.value)}
              placeholder="postgresql+asyncpg://postgres:pass@db.ref.supabase.co:5432/postgres"
            />
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Current Persistence: <strong>{modelStatus?.database_type === 'postgresql' ? 'Supabase PostgreSQL' : 'Local SQLite (Active)'}</strong>
            </div>
          </div>

          {/* Knowledge Base Info */}
          <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: 'var(--text-muted)' }}>Indexed Episodes:</span>
              <strong style={{ color: '#38bdf8' }}>{modelStatus?.indexed_episodes || 303}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Indexed Transcript Chunks:</span>
              <strong style={{ color: '#38bdf8' }}>{modelStatus?.indexed_chunks || 15194}</strong>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-action-chip" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-new-chat"
            style={{ margin: 0, padding: '8px 16px' }}
            onClick={handleSave}
          >
            {savedSuccess ? <Check size={14} /> : <RefreshCw size={14} />}
            <span>{savedSuccess ? 'Saved!' : 'Save & Apply'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
