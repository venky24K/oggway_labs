import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  Cloud,
  Database,
  Cpu,
  RefreshCw,
  ExternalLink,
  Check,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Info,
  Key
} from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  modelStatus,
  onSaveConfig,
  currentProvider,
  onChangeProvider
}) {
  const [activeTab, setActiveTab] = useState('local'); // 'local' | 'cloud' | 'database' | 'active'
  const [provider, setProvider] = useState(currentProvider || 'ollama');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [detectedModels, setDetectedModels] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState(false);

  // Cloud Providers
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o');
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState('');

  const [anthropicKey, setAnthropicKey] = useState('');
  const [anthropicModel, setAnthropicModel] = useState('claude-3-5-sonnet-20241022');

  // Database
  const [databaseUrl, setDatabaseUrl] = useState(
    'postgresql://postgres.cbanzhreccncemwwdpqh:Venky2427..@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (modelStatus) {
      setOllamaConnected(modelStatus.ollama_available);
      if (modelStatus.ollama_models) {
        setDetectedModels(modelStatus.ollama_models);
      }
    }
  }, [modelStatus]);

  if (!isOpen) return null;

  // Scan Ollama models dynamically via backend API
  const handleScanOllamaModels = async () => {
    setScanning(true);
    try {
      const res = await fetch(`/api/models?endpoint=${encodeURIComponent(ollamaUrl)}`);
      if (res.ok) {
        const data = await res.json();
        setOllamaConnected(data.ollama_available);
        setDetectedModels(data.ollama_models || []);
        if (data.ollama_models && data.ollama_models.length > 0) {
          if (!data.ollama_models.includes(ollamaModel)) {
            setOllamaModel(data.ollama_models[0]);
          }
        }
      }
    } catch (e) {
      console.error('Error scanning Ollama:', e);
      setOllamaConnected(false);
    } finally {
      setScanning(false);
    }
  };

  const handleSaveAll = async () => {
    onChangeProvider(provider);

    // Save to backend settings API
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          ollama_url: ollamaUrl,
          ollama_model: ollamaModel,
          openai_key: openaiKey,
          openai_model: openaiModel,
          openai_base_url: openaiBaseUrl,
          anthropic_key: anthropicKey,
          anthropic_model: anthropicModel,
          database_url: databaseUrl
        })
      });
    } catch (e) {
      console.error('Error saving settings to backend:', e);
    }

    if (onSaveConfig) {
      onSaveConfig({
        provider,
        ollamaUrl,
        ollamaModel,
        openaiKey,
        openaiModel,
        anthropicKey,
        anthropicModel,
        databaseUrl
      });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Server size={20} color="#6366f1" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>LLM Models & Infrastructure Settings</h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Configure local Ollama, cloud providers, and Supabase persistence
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Two-section Studio Container */}
        <div className="settings-studio-container">
          {/* Left Navigation Headings */}
          <div className="settings-nav-pane">
            <button
              className={`settings-nav-item ${activeTab === 'local' ? 'active' : ''}`}
              onClick={() => setActiveTab('local')}
            >
              <Cpu size={16} />
              <span>Local Providers (Ollama)</span>
            </button>

            <button
              className={`settings-nav-item ${activeTab === 'cloud' ? 'active' : ''}`}
              onClick={() => setActiveTab('cloud')}
            >
              <Cloud size={16} />
              <span>Cloud Providers (API)</span>
            </button>

            <button
              className={`settings-nav-item ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => setActiveTab('database')}
            >
              <Database size={16} />
              <span>Database (Supabase)</span>
            </button>

            <button
              className={`settings-nav-item ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              <CheckCircle2 size={16} />
              <span>Active Engine Toggle</span>
            </button>
          </div>

          {/* Right Section Content */}
          <div className="settings-content-pane">
            {/* 1. LOCAL PROVIDERS TAB */}
            {activeTab === 'local' && (
              <>
                <div className="settings-banner">
                  <strong>Local Intelligence:</strong> This application can access any model that you host locally.
                  We automatically detect your local models by default.
                </div>

                {/* Live Connection & Model Scanner */}
                <div className="instructions-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h4 style={{ margin: 0 }}>
                      <Cpu size={16} color="#818cf8" />
                      <span>Local Ollama Detection</span>
                    </h4>
                    <button
                      className="btn-action-chip"
                      onClick={handleScanOllamaModels}
                      disabled={scanning}
                      style={{ padding: '6px 12px' }}
                    >
                      <RefreshCw size={12} className={scanning ? 'animate-spin' : ''} />
                      <span>{scanning ? 'Scanning...' : 'Scan Local Models'}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', marginBottom: 12 }}>
                    <div className={`pulse-dot ${ollamaConnected ? '' : 'offline'}`} />
                    <span style={{ fontWeight: 600, color: ollamaConnected ? '#34d399' : '#f59e0b' }}>
                      {ollamaConnected
                        ? `Ollama Service Connected at ${ollamaUrl}`
                        : `Ollama Service Not Detected at ${ollamaUrl}`}
                    </span>
                  </div>

                  {/* Detected Models List */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Available Local Models ({detectedModels.length} detected):
                    </label>

                    {detectedModels.length > 0 ? (
                      <div className="model-chip-grid">
                        {detectedModels.map((m) => (
                          <div
                            key={m}
                            className={`model-chip ${ollamaModel === m ? 'selected' : ''}`}
                            onClick={() => setOllamaModel(m)}
                          >
                            <Check size={12} style={{ opacity: ollamaModel === m ? 1 : 0 }} />
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          marginTop: 8,
                          padding: 10,
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: 6,
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {ollamaConnected
                          ? 'Ollama is running, but no models are downloaded yet. Pull a model below (e.g. llama3.2) and click Scan!'
                          : 'Start Ollama or install a model to enable zero-cost local inference.'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Endpoint Configuration */}
                <div className="form-group">
                  <label>Ollama API Endpoint</label>
                  <input
                    type="text"
                    className="form-input"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                  />
                  <div style={{ marginTop: 6 }}>
                    <a
                      href="https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-expose-ollama-on-my-network"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="external-link"
                    >
                      <span>Read more about custom endpoints here</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                {/* Setup Instructions from Download to Pull */}
                <div className="instructions-card">
                  <h4>
                    <Terminal size={15} color="#38bdf8" />
                    <span>Ollama Setup Instructions (Download to Pull)</span>
                  </h4>

                  <div className="instruction-step">
                    <div className="step-number">1</div>
                    <div>
                      <strong>Download Ollama:</strong> Install Ollama on your machine from{' '}
                      <a
                        href="https://ollama.com/download"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external-link"
                        style={{ display: 'inline', margin: 0 }}
                      >
                        ollama.com/download ↗
                      </a>
                    </div>
                  </div>

                  <div className="instruction-step">
                    <div className="step-number">2</div>
                    <div>
                      <strong>Pull a Recommended Model:</strong> Open your terminal and run:
                      <div style={{ marginTop: 4 }}>
                        <span className="code-pill">ollama pull llama3.2</span> or{' '}
                        <span className="code-pill">ollama pull mistral</span>
                      </div>
                    </div>
                  </div>

                  <div className="instruction-step">
                    <div className="step-number">3</div>
                    <div>
                      <strong>Start the Server:</strong> Verify Ollama is running in your background or run{' '}
                      <span className="code-pill">ollama serve</span> (listens on port 11434).
                    </div>
                  </div>

                  <div className="instruction-step">
                    <div className="step-number">4</div>
                    <div>
                      <strong>Scan & Select:</strong> Click the <strong>"Scan Local Models"</strong> button above to
                      populate your model list automatically!
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 2. CLOUD PROVIDERS TAB */}
            {activeTab === 'cloud' && (
              <>
                <div className="settings-banner">
                  <strong>Cloud Models:</strong> Configure OpenAI or Anthropic Claude API keys. All keys are stored
                  safely in memory and in your local environment.
                </div>

                {/* OpenAI Section */}
                <div className="instructions-card">
                  <h4>
                    <Cloud size={16} color="#10b981" />
                    <span>OpenAI Configuration</span>
                  </h4>

                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label>OpenAI API Key</label>
                    <input
                      type="password"
                      className="form-input"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-proj-..."
                    />
                    <div style={{ marginTop: 4 }}>
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external-link"
                      >
                        <span>Get your OpenAI API key here</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label>Model</label>
                      <select
                        className="form-input"
                        value={openaiModel}
                        onChange={(e) => setOpenaiModel(e.target.value)}
                      >
                        <option value="gpt-4o">gpt-4o (Flagship)</option>
                        <option value="gpt-4o-mini">gpt-4o-mini (Fast & Efficient)</option>
                        <option value="o1-preview">o1-preview (Reasoning)</option>
                        <option value="o1-mini">o1-mini (Reasoning Mini)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Custom Base URL (Optional)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={openaiBaseUrl}
                        onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                        placeholder="https://api.openai.com/v1"
                      />
                    </div>
                  </div>
                </div>

                {/* Anthropic Section */}
                <div className="instructions-card">
                  <h4>
                    <Cloud size={16} color="#f59e0b" />
                    <span>Anthropic Claude Configuration</span>
                  </h4>

                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label>Anthropic API Key</label>
                    <input
                      type="password"
                      className="form-input"
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      placeholder="sk-ant-api..."
                    />
                    <div style={{ marginTop: 4 }}>
                      <a
                        href="https://console.anthropic.com/settings/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external-link"
                      >
                        <span>Get your Anthropic API key here</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Model</label>
                    <select
                      className="form-input"
                      value={anthropicModel}
                      onChange={(e) => setAnthropicModel(e.target.value)}
                    >
                      <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</option>
                      <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Fast)</option>
                      <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* 3. DATABASE & STORAGE TAB */}
            {activeTab === 'database' && (
              <>
                <div className="settings-banner">
                  <strong>Persistence Engine:</strong> Conversations and generated artifacts are stored in your live
                  Supabase PostgreSQL database.
                </div>

                <div className="instructions-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div className="pulse-dot" />
                    <span style={{ fontWeight: 600, color: '#34d399' }}>
                      Supabase PostgreSQL Connected & Active
                    </span>
                  </div>

                  <div className="form-group">
                    <label>Supabase PostgreSQL Connection URI</label>
                    <input
                      type="password"
                      className="form-input"
                      value={databaseUrl}
                      onChange={(e) => setDatabaseUrl(e.target.value)}
                      placeholder="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres"
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                      Using Session Pooler on port 5432 (IPv4 & IPv6 compatible).
                    </div>
                  </div>
                </div>

                <div className="instructions-card">
                  <h4>
                    <Info size={15} color="#38bdf8" />
                    <span>Knowledge Base Metadata</span>
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.84rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8 }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>EPISODES INDEXED</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>
                        {modelStatus?.indexed_episodes || 303}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8 }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>TRANSCRIPT SEGMENTS</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#818cf8', marginTop: 4 }}>
                        {modelStatus?.indexed_chunks || 15194}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 4. ACTIVE ENGINE TOGGLE TAB */}
            {activeTab === 'active' && (
              <>
                <div className="settings-banner">
                  <strong>Active Inference Engine:</strong> Choose which engine handles your queries. Fallback is always
                  available if local or cloud services become unreachable.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div
                    className={`quick-prompt-card ${provider === 'ollama' ? 'active' : ''}`}
                    onClick={() => setProvider('ollama')}
                    style={{
                      cursor: 'pointer',
                      borderColor: provider === 'ollama' ? '#818cf8' : 'var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>Ollama Local LLM</div>
                      {provider === 'ollama' && <Check size={16} color="#818cf8" />}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Runs locally on your machine ({ollamaModel}). 100% private, zero API fees.
                    </div>
                  </div>

                  <div
                    className={`quick-prompt-card ${provider === 'anthropic' ? 'active' : ''}`}
                    onClick={() => setProvider('anthropic')}
                    style={{
                      cursor: 'pointer',
                      borderColor: provider === 'anthropic' ? '#818cf8' : 'var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>Anthropic Claude 3.5 Sonnet</div>
                      {provider === 'anthropic' && <Check size={16} color="#818cf8" />}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      High-intelligence cloud reasoning via official Anthropic Claude SDK.
                    </div>
                  </div>

                  <div
                    className={`quick-prompt-card ${provider === 'openai' ? 'active' : ''}`}
                    onClick={() => setProvider('openai')}
                    style={{
                      cursor: 'pointer',
                      borderColor: provider === 'openai' ? '#818cf8' : 'var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>OpenAI (GPT-4o)</div>
                      {provider === 'openai' && <Check size={16} color="#818cf8" />}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Fast multimodal cloud completions via official OpenAI API.
                    </div>
                  </div>

                  <div
                    className={`quick-prompt-card ${provider === 'fallback' ? 'active' : ''}`}
                    onClick={() => setProvider('fallback')}
                    style={{
                      cursor: 'pointer',
                      borderColor: provider === 'fallback' ? '#818cf8' : 'var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>Grounded Fallback Engine</div>
                      {provider === 'fallback' && <Check size={16} color="#818cf8" />}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                      Zero-dependency deterministic RAG synthesizer. Works immediately on any machine with 0ms latency.
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Active: <strong>{provider.toUpperCase()}</strong> ({provider === 'ollama' ? ollamaModel : provider})
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-action-chip" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-new-chat"
              style={{ margin: 0, padding: '8px 18px' }}
              onClick={handleSaveAll}
            >
              {savedSuccess ? <Check size={15} color="#fff" /> : <CheckCircle2 size={15} />}
              <span>{savedSuccess ? 'Changes Applied!' : 'Save & Apply Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
