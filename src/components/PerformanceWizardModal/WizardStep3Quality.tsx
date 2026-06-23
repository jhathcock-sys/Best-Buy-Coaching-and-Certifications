import React, { useState } from 'react';
import { X, Wand2, Loader2, Sparkles } from 'lucide-react';
import { generatePerformanceGap } from '../../services/ai';
import { useStore } from '../../store/useStore';

export default function WizardStep3Quality({ 
  editForm,
  setEditForm,
  departmentGoals,
  employee
 }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const apiKey = useStore((state: any) => state.apiKey);

  const handleAiAnalyze = async () => {
    if (!apiKey) {
      setAiError("Please add your Gemini API Key in Playbook Studio.");
      return;
    }
    setIsGenerating(true);
    setAiError('');
    
    try {
      const history = employee?.history || [];
      const gapDesc = await generatePerformanceGap(
        apiKey, 
        employee?.name || 'Associate', 
        editForm, 
        history, 
        departmentGoals
      );
      
      setEditForm({ ...editForm, gap: gapDesc });
    } catch (err: any) {
      setAiError(err.message || 'Failed to auto-generate gap.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.25s ease' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>5 Star Surveys:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="stepper-btn" 
                    onClick={() => {
                      setEditForm(prev => {
                        if (prev.surveys === 'Failing') {
                          return { ...prev, surveys: '0' };
                        }
                        const val = parseInt(prev.surveys) || 0;
                        if (val <= 0) {
                          return { ...prev, surveys: 'Failing' };
                        }
                        return { ...prev, surveys: (val - 1).toString() };
                      });
                    }}
                  >-</button>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                    value={editForm.surveys}
                    onChange={(e) => setEditForm({ ...editForm, surveys: e.target.value })}
                  />
                  <button 
                    type="button" 
                    className="stepper-btn" 
                    onClick={() => {
                      setEditForm(prev => {
                        if (prev.surveys === 'Failing') {
                          return { ...prev, surveys: '1' };
                        }
                        const val = parseInt(prev.surveys) || 0;
                        return { ...prev, surveys: (val + 1).toString() };
                      });
                    }}
                  >+</button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>RPH index ($):</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, rph: Math.max(0, parseInt(prev.rph) - 50) }))}>-50</button>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                    value={editForm.rph}
                    onChange={(e) => setEditForm({ ...editForm, rph: e.target.value })}
                  />
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, rph: parseInt(prev.rph) + 50 }))}>+50</button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Total Transactions:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, transactions: Math.max(0, parseInt(prev.transactions) - 10) }))}>-10</button>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}
                    value={editForm.transactions}
                    onChange={(e) => setEditForm({ ...editForm, transactions: e.target.value })}
                  />
                  <button type="button" className="stepper-btn" onClick={() => setEditForm(prev => ({ ...prev, transactions: parseInt(prev.transactions) + 10 }))}>+10</button>
                </div>
              </div>

              {/* AI Auto-Analyze Gap Box */}
              <div style={{ background: 'rgba(253, 216, 53, 0.05)', border: '1px solid rgba(253, 216, 53, 0.2)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--bby-yellow)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Wand2 size={16} /> AI Opportunity Analyzer
                  </h4>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleAiAnalyze}
                    disabled={isGenerating}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    {isGenerating ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                    Auto-Analyze Metrics
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Gemini will evaluate current & historical pacing against department targets.</p>
                {aiError && <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{aiError}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Opportunity Gap Description:</label>
                <textarea 
                  className="form-control" 
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', minHeight: '60px', resize: 'vertical' }}
                  value={editForm.gap}
                  onChange={(e) => setEditForm({ ...editForm, gap: e.target.value })}
                  placeholder="e.g. Employee is struggling with Membership attach rate compared to target..."
                />
              </div>
            </div>
    </>
  );
}
