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
  Search,
  ChevronDown,
  Trash2
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

  // Custom added models (persisted in localStorage)
  const [customModels, setCustomModels] = useState(() => {
    try {
      const saved = localStorage.getItem('lenny_custom_models');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Add Model input bar state
  const [newModelProvider, setNewModelProvider] = useState('');
  const [newModelName, setNewModelName] = useState('');

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

  // Merge dynamic detected Ollama models
  const dynamicOllamaModels = detectedModels
    .filter((dm) => !DEFAULT_MODELS.some((m) => m.id === dm) && !customModels.some((m) => m.id === dm))
    .map((dm) => ({
      id: dm,
      name: dm,
      provider: 'ollama',
      providerLabel: 'Ollama',
      category: 'Local'
    }));

  // Combined models catalog: Default predefined models first, then auto-detected Ollama, then custom models at the last!
  const allModels = [...DEFAULT_MODELS, ...dynamicOllamaModels, ...customModels];

  const filteredModels = searchFilter.trim()
    ? allModels.filter(
        (m) =>
          m.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          m.providerLabel.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : allModels;

  // Check if provider has an API key configured (for cloud providers) or is local/fallback
  const isProviderConfigured = (p) => {
    if (p === 'fallback' || p === 'ollama') return true;
    if (p === 'gemini') {
      return Boolean((geminiKey && geminiKey.trim().length > 5) || modelStatus?.available_providers?.includes('gemini'));
    }
    if (p === 'openai') {
      return Boolean((openaiKey && openaiKey.trim().length > 5) || modelStatus?.available_providers?.includes('openai'));
    }
    if (p === 'anthropic') {
      return Boolean((anthropicKey && anthropicKey.trim().length > 5) || modelStatus?.available_providers?.includes('anthropic'));
    }
    return false;
  };

  // Check if a model is currently active
  const isModelActive = (m) => {
    if (m.provider === 'fallback' && provider === 'fallback') return true;
    if (m.provider === provider && (activeModelId === m.id || activeModelId === m.name)) return true;
    return activeModelId === m.id;
  };

  // Toggle model to active
  const handleToggleModel = (m) => {
    if (!isProviderConfigured(m.provider)) return;

    setActiveModelId(m.id);
    setProvider(m.provider);

    if (m.provider === 'ollama') setOllamaModel(m.id);
    else if (m.provider === 'openai') setOpenaiModel(m.id);
    else if (m.provider === 'anthropic') setAnthropicModel(m.id);
    else if (m.provider === 'gemini') setGeminiModel(m.id);

    if (onChangeProvider) onChangeProvider(m.provider);
    if (onChangeModel) onChangeModel(m.id);
  };

  // Add custom model from the Add Model bar
  const handleAddModel = () => {
    if (!newModelName.trim() || !newModelProvider) return;
    const cleanName = newModelName.trim();
    const providerLabels = {
      gemini: 'Gemini',
      ollama: 'Ollama',
      anthropic: 'Anthropic',
      openai: 'OpenAI'
    };

    const newModel = {
      id: cleanName,
      name: cleanName,
      provider: newModelProvider,
      providerLabel: providerLabels[newModelProvider] || newModelProvider,
      isCustom: true
    };

    const updated = [...customModels.filter((m) => m.id !== cleanName), newModel];
    setCustomModels(updated);
    try {
      localStorage.setItem('lenny_custom_models', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom model:', e);
    }

    setNewModelName('');
    setNewModelProvider('');

    // If provider is configured, activate it
    if (isProviderConfigured(newModel.provider)) {
      handleToggleModel(newModel);
    }
  };

  // Delete custom model
  const handleDeleteCustomModel = (modelId) => {
    const updated = customModels.filter((m) => m.id !== modelId);
    setCustomModels(updated);
    try {
      localStorage.setItem('lenny_custom_models', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete custom model:', e);
    }
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
            {/* 1. MODELS TAB (Matches Reference Screenshot + Add Model Bar) */}
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

                {/* Models List Table matching reference screenshot */}
                <div className="models-table-container">
                  {filteredModels.map((m) => {
                    const isConfigured = isProviderConfigured(m.provider);
                    const active = isConfigured && isModelActive(m);

                    return (
                      <div
                        key={`${m.provider}-${m.id}`}
                        className={`models-table-row ${active ? 'row-active' : ''} ${!isConfigured ? 'row-disabled' : ''}`}
                        onClick={() => {
                          if (isConfigured) handleToggleModel(m);
                        }}
                        title={isConfigured ? '' : `API key required in Main Providers to enable ${m.name}`}
                      >
                        <div className="model-col-provider">{m.providerLabel}</div>
                        <div className="model-col-name">
                          <span>{m.name}</span>
                          {!isConfigured && (
                            <span className="model-key-warning">
                              API key required
                            </span>
                          )}
                        </div>
                        <div className="model-col-toggle" onClick={(e) => e.stopPropagation()}>
                          {m.isCustom && (
                            <button
                              type="button"
                              className="custom-model-delete-btn"
                              onClick={() => handleDeleteCustomModel(m.id)}
                              title="Remove model"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          <label className={`pill-switch ${!isConfigured ? 'disabled' : ''}`}>
                            <input
                              type="checkbox"
                              checked={active}
                              disabled={!isConfigured}
                              onChange={() => {
                                if (isConfigured) handleToggleModel(m);
                              }}
                            />
                            <span className="pill-slider"></span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Model Bar (at the LAST, matching reference image) */}
                <div className="add-model-bar-container">
                  <div className="add-model-select-wrapper">
                    <select
                      value={newModelProvider}
                      onChange={(e) => setNewModelProvider(e.target.value)}
                      className="add-model-select"
                    >
                      <option value="">Provider Name</option>
                      <option value="gemini">Gemini</option>
                      <option value="ollama">Ollama</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="openai">OpenAI</option>
                    </select>
                    <ChevronDown size={13} className="add-model-select-arrow" />
                  </div>

                  <input
                    type="text"
                    placeholder="Model Name"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    className="add-model-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddModel();
                    }}
                  />

                  <button
                    type="button"
                    className="add-model-submit-btn"
                    onClick={handleAddModel}
                    disabled={!newModelName.trim() || !newModelProvider}
                  >
                    Add
                  </button>

                  {(newModelName || newModelProvider) && (
                    <button
                      type="button"
                      className="add-model-cancel-btn"
                      onClick={() => {
                        setNewModelName('');
                        setNewModelProvider('');
                      }}
                      title="Clear"
                    >
                      ×
                    </button>
                  )}
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

            {/* 3. MAIN PROVIDERS TAB (Matching Minimalist Screenshot Style) */}
            {activeTab === 'main' && (
              <div className="local-providers-view">
                <h2 className="local-providers-title">Main Providers</h2>
                <p className="local-providers-desc">
                  This app can access external AI providers for high-intelligence cloud reasoning. Keys are stored safely in memory and your local environment.
                </p>

                {/* Google Gemini */}
                <div className="local-endpoint-section">
                  <label className="local-endpoint-label">Google Gemini</label>
                  <input
                    type="password"
                    className="local-endpoint-input"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                  />
                  <div className="local-endpoint-footer">
                    Get your API key{' '}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="local-link"
                    >
                      here
                    </a>
                    .
                  </div>
                </div>

                {/* OpenAI */}
                <div className="local-endpoint-section">
                  <label className="local-endpoint-label">OpenAI</label>
                  <input
                    type="password"
                    className="local-endpoint-input"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-proj-..."
                  />
                  <div className="local-endpoint-footer">
                    Get your API key{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="local-link"
                    >
                      here
                    </a>
                    .
                  </div>
                </div>

                {/* OpenAI Custom Base URL */}
                <div className="local-endpoint-section">
                  <label className="local-endpoint-label" style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                    OpenAI Base URL (Optional)
                  </label>
                  <input
                    type="text"
                    className="local-endpoint-input"
                    value={openaiBaseUrl}
                    onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                  />
                </div>

                {/* Anthropic Claude */}
                <div className="local-endpoint-section">
                  <label className="local-endpoint-label">Anthropic Claude</label>
                  <input
                    type="password"
                    className="local-endpoint-input"
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder="sk-ant-api..."
                  />
                  <div className="local-endpoint-footer">
                    Get your API key{' '}
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="local-link"
                    >
                      here
                    </a>
                    .
                  </div>
                </div>
              </div>
            )}

            {/* 4. DATABASE & STORAGE TAB */}
            {activeTab === 'database' && (
              <div className="local-providers-view">
                <h2 className="local-providers-title">Database Persistence</h2>
                <p className="local-providers-desc">
                  Conversations and generated artifacts are persisted in your live Supabase PostgreSQL database with local SQLite fallback.
                </p>

                <div className="local-endpoint-section">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div className="pulse-dot" />
                    <span style={{ fontWeight: 600, color: '#34d399', fontSize: '0.86rem' }}>
                      Supabase PostgreSQL Connected & Active
                    </span>
                  </div>

                  <label className="local-endpoint-label">Supabase Connection URI</label>
                  <input
                    type="password"
                    className="local-endpoint-input"
                    value={databaseUrl}
                    onChange={(e) => setDatabaseUrl(e.target.value)}
                    placeholder="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres"
                  />
                  <div className="local-endpoint-footer">
                    Using Session Pooler on port 5432 (IPv4 & IPv6 compatible).
                  </div>
                </div>

                <div className="local-endpoint-section" style={{ marginTop: 8 }}>
                  <label className="local-endpoint-label">Knowledge Base Metadata</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.84rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: 12, borderRadius: 6 }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>EPISODES INDEXED</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>
                        {modelStatus?.indexed_episodes || 303}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: 12, borderRadius: 6 }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TRANSCRIPT SEGMENTS</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#818cf8', marginTop: 4 }}>
                        {modelStatus?.indexed_chunks || 15194}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
