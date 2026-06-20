import React from 'react';
import { Key, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export default function AiEngineTab({ aiMode, setAiMode, localApiKey, setLocalApiKey, playbookSettings, storePin, setStorePin }) {
  return (
    <>
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key size={20} color="var(--bby-blue)" /> Simulation Engine Strategy
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-glass)',
                  padding: '1.25rem', 
                  borderRadius: '16px' 
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="engine_mode" 
                    checked={aiMode === 'local'} 
                    onChange={() => setAiMode('local')}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Standard Free: Default Local Sandbox Engine</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                      Runs entirely client-side inside the browser. Extremely fast, requires no tokens, works anywhere offline, and parses advisor answers through state-based NLP mapping.
                    </p>
                  </div>
                </label>
              </div>

              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-glass)',
                  padding: '1.25rem', 
                  borderRadius: '16px' 
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="engine_mode" 
                    checked={aiMode === 'flash'} 
                    onChange={() => setAiMode('flash')}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Standard Cloud: Gemini 3.5 Flash <Sparkles size={12} color="var(--bby-yellow)" />
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                      Enables open-ended fluid conversation roleplays. Requires a Google AI Studio API key. Runs completely on the free-tier limits, resulting in zero overall token spend.
                    </p>
                  </div>
                </label>
              </div>

              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--border-glass)',
                  padding: '1.25rem', 
                  borderRadius: '16px' 
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="engine_mode" 
                    checked={aiMode === 'pro'} 
                    onChange={() => setAiMode('pro')}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--bby-yellow)' }}>
                      Premium Pro: Gemini 3.1 Pro <Key size={12} color="var(--bby-yellow)" />
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                      Unlocks Google's flagship reasoning model for high-fidelity Grow coaching logs and advanced dialogue auditing. Evaluates soft skills (empathy, rapport, active listening). Requires a Google AI Studio API key.
                    </p>
                  </div>
                </label>
              </div>

              {aiMode === 'flash' && (
                <div className="form-group" style={{ marginTop: '0.5rem', animation: 'fadeIn 0.2s ease' }}>
                  <label className="form-label">Google AI Studio API Key:</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="Enter your Gemini API key (AIzaSy...)"
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                  />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
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
