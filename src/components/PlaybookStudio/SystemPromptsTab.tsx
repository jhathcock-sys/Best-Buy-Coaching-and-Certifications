import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';

export default function SystemPromptsTab({ customSystemPrompt, setCustomSystemPrompt }) {
  return (
    <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '950px', margin: '0 auto', width: '100%' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--info)" /> AI System Prompts Configurator
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Provide the custom instructions that train the Gemini generative engine how to coach and evaluate like your store leaders would.
            </p>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Coaching & Empathy Prompt Instructions:</label>
              <textarea 
                className="form-control" 
                rows={8}
                style={{ resize: 'none', fontSize: '0.85rem' }}
                placeholder="Ensure you lead with humanity. Coach advisors to explore the customer needs by congratulated them first, and offering protection by describing usage scenarios rather than pitch checklist lines..."
                value={customSystemPrompt}
                onChange={(e) => setCustomSystemPrompt(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-card">
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="var(--bby-yellow)" /> Style & Training Corpus (Few-Shot Exemplars)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.4 }}>
                Provide examples of high-quality coaching logs you have written in the past. When using the **Gemini Engine**, these logs are fed directly into the model as few-shot training examples, prompting it to perfectly copy your formatting, coaching style, tone, standards, and metrics vocabulary!
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {trainingLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--border-glass)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No custom training logs added. Preloading Best Buy default framework.
                  </div>
                ) : (
                  trainingLogs.map((log, idx) => (
                    <div key={idx} style={{ position: 'relative', background: 'rgba(0, 70, 190, 0.03)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '1.25rem 2.5rem 1.25rem 1.25rem' }}>
                      <button 
                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: 0 }}
                        onClick={() => handleRemoveTrainingLog(idx)}
                        title="Remove Training Exemplar"
                      >
                        <Trash2 size={16} />
                      </button>
                      <span style={{ fontSize: '0.7rem', color: 'var(--bby-yellow)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                        Exemplar #{idx + 1}
                      </span>
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {log}
                      </pre>
                    </div>
                  ))
                )}
              </div>

              {isAddingLog ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', border: '1px solid var(--bby-blue)', borderRadius: '14px', background: 'rgba(0, 70, 190, 0.02)' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ color: '#fff' }}>Paste Exemplar Coaching Log Text:</label>
                    <textarea 
                      className="form-control" 
                      rows={8} 
                      style={{ resize: 'none', fontSize: '0.8rem', fontFamily: 'monospace' }}
                      placeholder="Paste a complete 4-section coaching log that represents your personal writing style..."
                      value={newTrainingLog}
                      onChange={(e) => setNewTrainingLog(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => setIsAddingLog(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={handleAddTrainingLog}>
                      Add Exemplar to Corpus
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-secondary" style={{ width: '100%', borderStyle: 'dashed' }} onClick={() => setIsAddingLog(true)}>
                  + Add Past Coaching Exemplar to Training Corpus
                </button>
              )}
            </div>
          </div>
        
      </div>
    </>
  );
}
