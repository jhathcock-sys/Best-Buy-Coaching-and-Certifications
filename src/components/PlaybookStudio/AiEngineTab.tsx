import React, { useState } from 'react';
import { Key, Sparkles, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function AiEngineTab() {
  const apiKey = useStore((state) => state.apiKey);
  const playbookSettings = useStore(state => state.playbookSettings);
  const onSaveSettings = useStore(state => state.saveSettings);

  const [aiMode, setAiMode] = useState<'local' | 'flash' | 'pro'>((playbookSettings?.aiMode as 'local' | 'flash' | 'pro') || (playbookSettings?.useGemini ? 'flash' : 'local'));
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');

  React.useEffect(() => {
    if (playbookSettings) {
      setAiMode((playbookSettings.aiMode as 'local' | 'flash' | 'pro') || (playbookSettings.useGemini ? 'flash' : 'local'));
    }
  }, [playbookSettings]);

  React.useEffect(() => {
    if (apiKey) {
      setLocalApiKey(apiKey);
    }
  }, [apiKey]);

  return (
    <>
      <div className="w-full max-w-[800px] mx-auto" data-testid="ai-engine-tab">
        <div className="glass-card">
          <div className="flex-between align-center mb-lg">
            <h3 className="flex-center-y gap-sm text-lg m-0">
              <Key size={20} color="var(--bby-blue)" /> Simulation Engine Strategy
            </h3>
            
            <button 
              className="btn btn-primary flex-center gap-sm px-md py-sm font-bold cursor-pointer" 
              data-testid="save-platform-config-btn"
              onClick={() => {
                const nextMode = aiMode === 'local' ? 'local' : aiMode;
                if (playbookSettings) {
                  onSaveSettings({
                    apiKey: localApiKey,
                    playbookSettings: {
                      ...playbookSettings,
                      aiMode: nextMode
                    }
                  });
                  alert('Settings saved globally! Changes will apply immediately.');
                }
              }}
            >
              <Check size={16} />
              Save Settings
            </button>
          </div>

          <div className="flex-column gap-lg">
            
            <div className="flex-column gap-md p-lg bg-white-alpha-02 border-glass rounded-xl border border-solid">
              <label className="flex-start gap-md cursor-pointer">
                <input 
                  type="radio" 
                  name="engine_mode" 
                  checked={aiMode === 'local'} 
                  onChange={() => setAiMode('local')}
                  className="mt-xs"
                  data-testid="ai-mode-local"
                />
                <div>
                  <span className="font-semibold text-md">Standard Free: Default Local Sandbox Engine</span>
                  <p className="text-sm text-secondary mt-xs leading-relaxed">
                    Runs entirely client-side inside the browser. Extremely fast, requires no tokens, works anywhere offline, and parses advisor answers through state-based NLP mapping.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex-column gap-md p-lg bg-white-alpha-02 border-glass rounded-xl border border-solid">
              <label className="flex-start gap-md cursor-pointer">
                <input 
                  type="radio" 
                  name="engine_mode" 
                  checked={aiMode === 'flash'} 
                  onChange={() => setAiMode('flash')}
                  className="mt-xs"
                  data-testid="ai-mode-flash"
                />
                <div>
                  <span className="font-semibold text-md flex-center-y gap-xs">
                    Standard Cloud: Gemini 3.5 Flash <Sparkles size={12} color="var(--bby-yellow)" />
                  </span>
                  <p className="text-sm text-secondary mt-xs leading-relaxed">
                    Enables open-ended fluid conversation roleplays. Requires a Google AI Studio API key. Runs completely on the free-tier limits, resulting in zero overall token spend.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex-column gap-md p-lg bg-white-alpha-02 border-glass rounded-xl border border-solid">
              <label className="flex-start gap-md cursor-pointer">
                <input 
                  type="radio" 
                  name="engine_mode" 
                  checked={aiMode === 'pro'} 
                  onChange={() => setAiMode('pro')}
                  className="mt-xs"
                  data-testid="ai-mode-pro"
                />
                <div>
                  <span className="font-semibold text-md flex-center-y gap-xs text-bby-yellow">
                    Premium Pro: Gemini 3.5 Pro <Key size={12} color="var(--bby-yellow)" />
                  </span>
                  <p className="text-sm text-secondary mt-xs leading-relaxed">
                    Unlocks Google's flagship reasoning model for high-fidelity Grow coaching logs and advanced dialogue auditing. Evaluates soft skills (empathy, rapport, active listening). Requires a Google AI Studio API key.
                  </p>
                </div>
              </label>
            </div>

            {(aiMode === 'flash' || aiMode === 'pro') && (
              <div className="form-group mt-sm animate-scale-in">
                <label className="form-label" htmlFor="api-key-input">Google AI Studio API Key:</label>
                <input 
                  id="api-key-input"
                  type="password" 
                  className="form-control" 
                  placeholder="Enter your Gemini API key (AIzaSy...)"
                  value={localApiKey || ''}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  data-testid="api-key-input"
                />
                <p className="text-xs text-muted mt-xs">
                  Your key is securely saved locally in your own browser's storage and never sent to any external server (except directly to the Google Gemini API endpoint).
                </p>
              </div>
            )}

          </div>
        </div>
        
      </div>
    </>
  );
}
