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
  Key,
  Layers,
  Sparkles,
  Search
} from 'lucide-react';

const DEFAULT_MODELS = [
  // Gemini (Google)
  { id: 'gemini-3.6-flash', name: 'gemini-3.6-flash', provider: 'gemini', providerLabel: 'Gemini', category: 'Cloud' },
  { id: 'gemini-3.1-pro-preview', name: 'gemini-3.1-pro-preview', provider: 'gemini', providerLabel: 'Gemini', category: 'Cloud' },
  { id: 'gemini-3.1-pro', name: 'gemini-3.1-pro', provider: 'gemini', providerLabel: 'Gemini', category: 'Cloud' },
  { id: 'gemini-3.1-flash', name: 'gemini-3.1-flash', provider: 'gemini', providerLabel: 'Gemini', category: 'Cloud' },

  // OpenAI
  { id: 'gpt-4o', name: 'gpt-4o', provider: 'openai', providerLabel: 'OpenAI', category: 'Cloud' },
  { id: 'gpt-4o-mini', name: 'gpt-4o-mini', provider: 'openai', providerLabel: 'OpenAI', category: 'Cloud' },
  { id: 'o1-preview', name: 'o1-preview', provider: 'openai', providerLabel: 'OpenAI', category: 'Cloud' },
  { id: 'o1-mini', name: 'o1-mini', provider: 'openai', providerLabel: 'OpenAI', category: 'Cloud' },

  // Anthropic
  { id: 'claude-3-5-sonnet-20241022', name: 'claude-3-5-sonnet-20241022', provider: 'anthropic', providerLabel: 'Anthropic', category: 'Cloud' },
  { id: 'claude-3-5-haiku-20241022', name: 'claude-3-5-haiku-20241022', provider: 'anthropic', providerLabel: 'Anthropic', category: 'Cloud' },
  { id: 'claude-3-opus-20240229', name: 'claude-3-opus-20240229', provider: 'anthropic', providerLabel: 'Anthropic', category: 'Cloud' },

  // Ollama (Local)
  { id: 'llama3.2', name: 'llama3.2', provider: 'ollama', providerLabel: 'Ollama', category: 'Local' },
  { id: 'mistral', name: 'mistral', provider: 'ollama', providerLabel: 'Ollama', category: 'Local' },
  { id: 'deepseek-r1:8b', name: 'deepseek-r1:8b', provider: 'ollama', providerLabel: 'Ollama', category: 'Local' },
  { id: 'phi3', name: 'phi3', provider: 'ollama', providerLabel: 'Ollama', category: 'Local' },

  // Deterministic Fallback
  { id: 'fallback-rag', name: 'Grounded Fallback Engine', provider: 'fallback', providerLabel: 'Fallback', category: 'Local' }
];

export default function SettingsModal({
  isOpen,
  onClose,
  modelStatus,
  onSaveConfig,
  currentProvider,
  onChangeProvider,
  currentModel,
  onChangeModel,
  initialTab = 'models'
}) {
  const [activeTab, setActiveTab] = useState(initialTab || 'models'); // 'models' | 'local' | 'main' | 'database'
  const [provider, setProvider] = useState(currentProvider || 'ollama');
  const [activeModelId, setActiveModelId] = useState(currentModel || 'llama3.2');
  const [searchFilter, setSearchFilter] = useState('');

  // Local Ollama
  const [ollamaUrl, setOllamaUrl] = useState('http://127.0.0.1:11434');
  const [ollamaModel, setOllamaModel] = useState(currentModel || 'llama3.2');
  const [detectedModels, setDetectedModels] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState(false);

  // Main / Cloud Providers
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o');
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState('');

  const [anthropicKey, setAnthropicKey] = useState('');
  const [anthropicModel, setAnthropicModel] = useState('claude-3-5-sonnet-20241022');

  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.1-pro');

  // Database
  const [databaseUrl, setDatabaseUrl] = useState(
    'postgresql://postgres.cbanzhreccncemwwdpqh:Venky2427..@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Synchronize initialTab when opening
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (currentProvider) setProvider(currentProvider);
    if (currentModel) setActiveModelId(currentModel);
  }, [currentProvider, currentModel]);

  useEffect(() => {
    if (modelStatus) {
      setOllamaConnected(modelStatus.ollama_available);
      if (modelStatus.ollama_models) {
        setDetectedModels(modelStatus.ollama_models);
      }
    }
  }, [modelStatus]);

  if (!isOpen) return null;

  // Merge detected models into full catalog
  const dynamicOllamaModels = detectedModels
    .filter((dm) => !DEFAULT_MODELS.some((m) => m.id === dm))
    .map((dm) => ({
      id: dm,
      name: dm,
      provider: 'ollama',
      providerLabel: 'Ollama',
      category: 'Local'
    }));

  const allModels = [...DEFAULT_MODELS, ...dynamicOllamaModels];

  const filteredModels = searchFilter.trim()
    ? allModels.filter(
        (m) =>
          m.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          m.providerLabel.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : allModels;

  // Check if a model is currently active
  const isModelActive = (m) => {
    if (m.provider === 'fallback' && provider === 'fallback') return true;
    if (m.provider === provider && (activeModelId === m.id || activeModelId === m.name)) return true;
    return activeModelId === m.id;
  };

  // Toggle model to active
  const handleToggleModel = (m) => {
    setActiveModelId(m.id);
    setProvider(m.provider);

    if (m.provider === 'ollama') setOllamaModel(m.id);
    else if (m.provider === 'openai') setOpenaiModel(m.id);
    else if (m.provider === 'anthropic') setAnthropicModel(m.id);
    else if (m.provider === 'gemini') setGeminiModel(m.id);

    if (onChangeProvider) onChangeProvider(m.provider);
    if (onChangeModel) onChangeModel(m.id);
  };

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
    if (onChangeProvider) onChangeProvider(provider);
    if (onChangeModel) onChangeModel(activeModelId);

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
          gemini_key: geminiKey,
          gemini_model: geminiModel,
          database_url: databaseUrl
        })
      });
    } catch (e) {
      console.error('Error saving settings to backend:', e);
    }

    if (onSaveConfig) {
      onSaveConfig({
        provider,
        model: activeModelId,
        ollamaUrl,
        ollamaModel,
        openaiKey,
        openaiModel,
        anthropicKey,
        anthropicModel,
        geminiKey,
        geminiModel,
        databaseUrl
      });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Server size={20} color="#38bdf8" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Settings & Model Management</h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Configure models, local engines, main providers, and Supabase persistence
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Two-section Studio Container */}
        <div className="settings-studio-container">
          {/* Left Navigation Headings (Active tab shows solid blue pill) */}
          <div className="settings-nav-pane">
            <button
              className={`settings-nav-item ${activeTab === 'models' ? 'active' : ''}`}
              onClick={() => setActiveTab('models')}
            >
              <span>Models</span>
            </button>

            <button
              className={`settings-nav-item ${activeTab === 'local' ? 'active' : ''}`}
              onClick={() => setActiveTab('local')}
            >
              <span>Local Providers</span>
            </button>

            <button
              className={`settings-nav-item ${activeTab === 'main' ? 'active' : ''}`}
              onClick={() => setActiveTab('main')}
            >
              <span>Main Providers</span>
            </button>

            <button
              className={`settings-nav-item ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => setActiveTab('database')}
            >
              <span>Database (Supabase)</span>
            </button>
          </div>

          {/* Right Section Content */}
          <div className="settings-content-pane">
            {/* 1. MODELS TAB (Matches User Screenshot) */}
            {activeTab === 'models' && (
              <div className="models-section-view">
                <div className="models-section-header">
                  <h2 className="models-title">Models</h2>
                  <div className="models-search-wrapper">
                    <Search size={14} color="var(--text-muted)" />
                    <input
                      type="text"
                      placeholder="Filter models..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="models-search-input"
                    />
                    {searchFilter && (
                      <button className="search-clear-btn" onClick={() => setSearchFilter('')}>
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Models List Table matching the screenshot */}
                <div className="models-table-container">
                  {filteredModels.map((m) => {
                    const active = isModelActive(m);
                    return (
                      <div
                        key={`${m.provider}-${m.id}`}
                        className={`models-table-row ${active ? 'row-active' : ''}`}
                        onClick={() => handleToggleModel(m)}
                      >
                        <div className="model-col-provider">{m.providerLabel}</div>
                        <div className="model-col-name">{m.name}</div>
                        <div className="model-col-toggle" onClick={(e) => e.stopPropagation()}>
                          <label className="pill-switch">
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => handleToggleModel(m)}
                            />
                            <span className="pill-slider"></span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. LOCAL PROVIDERS TAB (Matching Reference Image) */}
            {activeTab === 'local' && (
              <div className="local-providers-view">
                <h2 className="local-providers-title">Local Providers</h2>
                <p className="local-providers-desc">
                  This app can access any model that you host locally. We automatically detect your local models by default.
                </p>

                <div className="local-instructions-section">
                  <div className="local-instructions-heading">Ollama Setup Instructions</div>
                  <ol className="local-instructions-list">
                    <li>
                      1. Download{' '}
                      <a
                        href="https://ollama.com/download"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="local-link"
                      >
                        Ollama
                      </a>
                      .
                    </li>
                    <li>2. Open your terminal.</li>
                    <li>
                      3. Run <code className="local-code">ollama pull your_model</code> to install a model.
                      <div className="local-subtext">
                        This app automatically detects locally running models and enables them.
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="local-endpoint-section">
                  <label className="local-endpoint-label">Ollama</label>
                  <input
                    type="text"
                    className="local-endpoint-input"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://127.0.0.1:11434"
                  />
                  <div className="local-endpoint-footer">
                    Read more about custom{' '}
                    <a
                      href="https://github.com/ollama/ollama/blob/main/docs/faq.md#how-can-i-expose-ollama-on-my-network"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="local-link"
                    >
                      Endpoints here
                    </a>
                    .
                  </div>
                </div>

                {/* Subtle detected models indicator if local models exist */}
                {detectedModels.length > 0 && (
                  <div className="local-detected-strip">
                    <span className="local-detected-dot" />
                    <span>
                      {detectedModels.length} local {detectedModels.length === 1 ? 'model' : 'models'} detected ({detectedModels.join(', ')})
                    </span>
                    <button
                      type="button"
                      className="local-rescan-btn"
                      onClick={handleScanOllamaModels}
                      disabled={scanning}
                      title="Rescan local models"
                    >
                      <RefreshCw size={11} className={scanning ? 'animate-spin' : ''} />
                      <span>{scanning ? 'Scanning...' : 'Rescan'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. MAIN PROVIDERS TAB (Cloud Providers: Gemini, OpenAI, Anthropic) */}
            {activeTab === 'main' && (
              <>
                <div className="settings-banner">
                  <strong>Main Cloud Providers:</strong> Configure Google Gemini, OpenAI, or Anthropic Claude API keys.
                  Keys are stored safely in memory and your local environment.
                </div>

                {/* Gemini Section */}
                <div className="instructions-card">
                  <h4>
                    <Sparkles size={16} color="#38bdf8" />
                    <span>Google Gemini Configuration</span>
                  </h4>

                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label>Google Gemini API Key</label>
                    <input
                      type="password"
                      className="form-input"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                    />
                    <div style={{ marginTop: 4 }}>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external-link"
                      >
                        <span>Get your API key here</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Model</label>
                    <select
                      className="form-input"
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                    >
                      <option value="gemini-3.1-pro">gemini-3.1-pro (Flagship Multimodal)</option>
                      <option value="gemini-3.6-flash">gemini-3.6-flash (Fast & Responsive)</option>
                      <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Advanced Preview)</option>
                      <option value="gemini-3.1-flash">gemini-3.1-flash (Standard Flash)</option>
                    </select>
                  </div>
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
                        <span>Get your API key here</span>
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
                        <span>Get your API key here</span>
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

            {/* 4. DATABASE & STORAGE TAB */}
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
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Selected Model: <strong style={{ color: '#f8fafc' }}>{activeModelId}</strong> ({provider})
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
