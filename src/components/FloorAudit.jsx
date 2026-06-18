import { useState } from 'react';
import { Camera, CheckCircle, AlertCircle, RefreshCw, Sparkles, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { auditStoreFloorGemini } from '../services/ai';

// Base64 Mock Retail Queue Image for Demo
const MOCK_RETAIL_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export default function FloorAudit() {
  const { apiKey, playbookSettings } = useApp();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageMime, setImageMime] = useState('image/png');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [huddleScript, setHuddleScript] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageMime(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setAuditResult(null);
      setHuddleScript('');
    };
    reader.readAsDataURL(file);
  };

  const handleTryDemo = () => {
    setSelectedImage(`data:image/png;base64,${MOCK_RETAIL_IMAGE}`);
    setImageMime('image/png');
    setAuditResult(null);
    setHuddleScript('');
  };

  const handleRunAudit = async () => {
    if (!selectedImage) return;
    setIsAuditing(true);

    try {
      const base64Data = selectedImage.split(',')[1];
      const result = await auditStoreFloorGemini(apiKey, base64Data, imageMime, playbookSettings);
      setAuditResult(result);
    } catch (e) {
      console.error(e);
      alert('An error occurred during floor layout audit.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleGenerateHuddleScript = async () => {
    if (!auditResult) return;
    setIsGeneratingScript(true);
    
    // Simulate generation of a specific leader huddle script based on visual observations
    await new Promise(resolve => setTimeout(resolve, 800));
    
    
    const script = `## 💬 Live Leadership Huddle Script: Visual Floor Actions

"Team, listen up. I just did a quick walk of our floor layout, and we have a couple of immediate adjustments to make:

👉 **Observations:** We currently see: ${auditResult.observations[0] || 'bottlenecks forming'}. Also, ${auditResult.observations[1] || 'shoppers needing assistance'}.
🎯 **Our Action Plan:** 
1. ${auditResult.actionPlan[0] || 'Clear queue immediately.'}
2. ${auditResult.actionPlan[1] || 'Reposition staffing to coverage gaps.'}
3. ${auditResult.actionPlan[2] || 'Tidy up display tables.'}

Let's move fast, get our customers greeted, and ensure checkout remains smooth. Thank you, let's crush the shift!"`;

    setHuddleScript(script);
    setIsGeneratingScript(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
      
      {/* Left Column: Image Selector */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera color="var(--bby-blue)" size={22} /> Visual Floor Audit
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
            Capture a live photo of checkout queues, visual merchandising displays, or department staffing layouts. Gemini will conduct a store general manager audit.
          </p>
        </div>

        {selectedImage ? (
          <div style={{ position: 'relative', width: '100%', minHeight: '220px', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--border-glass)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {selectedImage.startsWith('data:image/png;base64,iVBORw0K') ? (
              // Mock Placeholder UI
              <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <Camera size={38} color="var(--bby-yellow)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Demo Store Queue Snapshot Loaded</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Busy register lane with 3+ waiting customers, unsorted Computing laptop table.</span>
              </div>
            ) : (
              <img src={selectedImage} alt="Store upload preview" style={{ width: '100%', height: 'auto', maxHeight: '350px', objectFit: 'contain' }} />
            )}
            <button 
              className="btn btn-secondary" 
              style={{ position: 'absolute', bottom: '10px', right: '10px', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} 
              onClick={() => { setSelectedImage(null); setAuditResult(null); setHuddleScript(''); }}
            >
              Clear Image
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-glass)', borderRadius: '16px', padding: '3.5rem 2rem', background: 'rgba(255,255,255,0.01)', transition: 'border-color var(--transition-fast)' }} className="commitment-card-hover">
              <Camera size={44} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>Select Store Photo</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PNG, JPG or WebP images</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR</span>
            </div>

            <button className="btn btn-secondary" onClick={handleTryDemo} style={{ width: '100%' }}>
              Load Demo Store Photo Snapshot
            </button>
          </div>
        )}

        {selectedImage && (
          <button 
            className="btn btn-accent" 
            style={{ width: '100%' }}
            onClick={handleRunAudit}
            disabled={isAuditing}
          >
            {isAuditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <RefreshCw size={14} className="typing-dots" style={{ animation: 'spin 2s linear infinite' }} /> Inspecting Store Layout...
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <Sparkles size={16} /> Audit Store Floor Layout
              </div>
            )}
          </button>
        )}
      </div>

      {/* Right Column: AI Analysis Report */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {isAuditing && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2rem', justifyContent: 'center' }}>
            <div className="skeleton-pulse" style={{ height: '24px', width: '50%', background: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '90%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '85%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
              <Sparkles size={24} className="typing-dots" style={{ color: 'var(--bby-yellow)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Gemini is auditing visual floor layout...</span>
            </div>
          </div>
        )}

        {!isAuditing && !auditResult && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.85rem' }}>Upload or select a demo floor snapshot, then run the audit to see general manager recommendations.</p>
          </div>
        )}

        {!isAuditing && auditResult && (
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--info)" /> Audit Report Summary
              </h3>
              <span className="tag-pill" style={{
                background: auditResult.status === 'Green' ? 'var(--success-glow)' : auditResult.status === 'Yellow' ? 'var(--warning-glow)' : 'var(--error-glow)',
                color: auditResult.status === 'Green' ? 'var(--success)' : auditResult.status === 'Yellow' ? 'var(--warning)' : 'var(--error)',
                borderColor: auditResult.status === 'Green' ? 'rgba(16,185,129,0.2)' : auditResult.status === 'Yellow' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {auditResult.status.toUpperCase()} STATUS
              </span>
            </div>

            <div style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Summary State</span>
              <p style={{ fontSize: '0.85rem', color: '#fff', marginTop: '0.15rem', lineHeight: 1.4 }}>{auditResult.statusDetails}</p>
            </div>

            {/* Observations List */}
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                Visual Observations ({auditResult.observations.length})
              </span>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {auditResult.observations.map((obs, idx) => (
                  <li key={idx} style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{obs}</li>
                ))}
              </ul>
            </div>

            {/* Action Items Checklist */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                Immediate Leader Action Plan
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {auditResult.actionPlan.map((act, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(16,185,129,0.01)', border: '1px solid var(--border-glass)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                    <div style={{ background: 'var(--success-glow)', color: 'var(--success)', borderRadius: '50%', padding: '0.2rem', display: 'flex', alignItems: 'center' }}>
                      <CheckCircle size={14} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Huddle Script */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!huddleScript ? (
                <button className="btn btn-accent" style={{ width: '100%', color: '#000' }} onClick={handleGenerateHuddleScript} disabled={isGeneratingScript}>
                  {isGeneratingScript ? 'Generating Huddle Script...' : 'Compile Huddle Script from Audit'}
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Huddle Announcement Script</span>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => { navigator.clipboard.writeText(huddleScript); alert('Copied to clipboard!'); }}>
                      <Clipboard size={12} /> Copy Script
                    </button>
                  </div>
                  <textarea 
                    className="form-control" 
                    readOnly 
                    rows={6} 
                    style={{ fontSize: '0.8rem', fontFamily: 'monospace', resize: 'none' }}
                    value={huddleScript}
                  />
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
