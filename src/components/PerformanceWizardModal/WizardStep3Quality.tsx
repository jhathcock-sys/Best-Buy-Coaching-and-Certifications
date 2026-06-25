import React, { useState } from 'react';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { generatePerformanceGap } from '../../services/ai';
import { useStore } from '../../store/useStore';
import { Employee, DeptGoal } from '../../types';

import { WizardEditFormState } from './WizardStep1General';
import { StoreState } from '../../types/store';

export interface WizardStep3QualityProps {
  editForm: WizardEditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<WizardEditFormState>>;
  departmentGoals: Record<string, unknown>;
  employee: Employee | null;
}

export default function WizardStep3Quality({ 
  editForm,
  setEditForm,
  departmentGoals,
  employee
 }: WizardStep3QualityProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const apiKey = useStore((state: StoreState) => state.apiKey);

  const handleAiAnalyze = async () => {
    if (!apiKey) {
      setAiError("Please add your Gemini API Key in Playbook Studio.");
      return;
    }
    setIsGenerating(true);
    setAiError('');
    
    try {
      const history = (employee as Employee & { history?: unknown[] })?.history || [];
      const gapDesc = await generatePerformanceGap(
        apiKey, 
        employee?.name || 'Associate', 
        editForm, 
        history, 
        departmentGoals
      );
      
      setEditForm(prev => ({ ...prev, gap: gapDesc }));
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : 'Failed to auto-generate gap.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="flex-column gap-xl animate-fade-in">
        <div className="form-group">
          <label className="form-label text-xs">5 Star Surveys:</label>
          <div className="flex-center gap-sm justify-start">
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => {
                setEditForm(prev => {
                  if (prev.surveys === 'Failing') {
                    return { ...prev, surveys: '0' };
                  }
                  const val = parseInt(String(prev.surveys || '0'), 10);
                  if (val <= 0) {
                    return { ...prev, surveys: 'Failing' };
                  }
                  return { ...prev, surveys: String(val - 1) };
                });
              }}
              data-testid="wizard-step3-surveys-minus"
            >
              -
            </button>
            <input 
              type="text" 
              className="form-control px-md py-sm text-sm text-center" 
              value={editForm.surveys ?? '0'}
              onChange={(e) => setEditForm(prev => ({ ...prev, surveys: e.target.value }))}
              data-testid="wizard-step3-surveys-input"
            />
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => {
                setEditForm(prev => {
                  if (prev.surveys === 'Failing') {
                    return { ...prev, surveys: '1' };
                  }
                  const val = parseInt(String(prev.surveys || '0'), 10);
                  return { ...prev, surveys: String(val + 1) };
                });
              }}
              data-testid="wizard-step3-surveys-plus"
            >
              +
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label text-xs">RPH index ($):</label>
          <div className="flex-center gap-sm justify-start">
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setEditForm(prev => ({ ...prev, rph: Math.max(0, parseInt(String(prev.rph || '0'), 10) - 50) }))}
              data-testid="wizard-step3-rph-minus"
            >
              -50
            </button>
            <input 
              type="number" 
              className="form-control px-md py-sm text-sm text-center" 
              value={editForm.rph ?? 0}
              onChange={(e) => setEditForm(prev => ({ ...prev, rph: e.target.value }))}
              data-testid="wizard-step3-rph-input"
            />
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setEditForm(prev => ({ ...prev, rph: parseInt(String(prev.rph || '0'), 10) + 50 }))}
              data-testid="wizard-step3-rph-plus"
            >
              +50
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label text-xs">Total Transactions:</label>
          <div className="flex-center gap-sm justify-start">
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setEditForm(prev => ({ ...prev, transactions: Math.max(0, parseInt(String(prev.transactions || '0'), 10) - 10) }))}
              data-testid="wizard-step3-transactions-minus"
            >
              -10
            </button>
            <input 
              type="number" 
              className="form-control px-md py-sm text-sm text-center" 
              value={editForm.transactions ?? 0}
              onChange={(e) => setEditForm(prev => ({ ...prev, transactions: e.target.value }))}
              data-testid="wizard-step3-transactions-input"
            />
            <button 
              type="button" 
              className="stepper-btn" 
              onClick={() => setEditForm(prev => ({ ...prev, transactions: parseInt(String(prev.transactions || '0'), 10) + 10 }))}
              data-testid="wizard-step3-transactions-plus"
            >
              +10
            </button>
          </div>
        </div>

        {/* AI Auto-Analyze Gap Box */}
        <div className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl flex-column gap-sm mt-sm">
          <div className="flex-between items-center">
            <h4 className="m-0 text-sm text-[var(--bby-yellow)] flex-center justify-start gap-xs">
              <Wand2 size={16} /> AI Opportunity Analyzer
            </h4>
            <button 
              type="button" 
              className="btn btn-secondary flex-center gap-xs px-3 py-1.5 text-xs" 
              onClick={handleAiAnalyze}
              disabled={isGenerating}
              data-testid="ai-analyze-btn"
            >
              {isGenerating ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
              Auto-Analyze Metrics
            </button>
          </div>
          <p className="m-0 text-xs text-secondary">Gemini will evaluate current & historical pacing against department targets.</p>
          {aiError && <span className="text-error text-xs mt-1">{aiError}</span>}
        </div>

        <div className="form-group mt-sm">
          <label className="form-label text-xs">Opportunity Gap Description:</label>
          <textarea 
            className="form-control px-md py-sm text-sm min-h-[60px] resize-y" 
            value={editForm.gap || ''}
            onChange={(e) => setEditForm(prev => ({ ...prev, gap: e.target.value }))}
            placeholder="e.g. Employee is struggling with Membership attach rate compared to target..."
            data-testid="wizard-step3-gap-input"
          />
        </div>
      </div>
    </>
  );
}
