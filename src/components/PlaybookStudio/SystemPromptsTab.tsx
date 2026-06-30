import React, { useState } from 'react';
import { Sparkles, BookOpen, Trash2, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { StoreState } from '../../types/store';

export default function SystemPromptsTab() {
  const { playbookSettings, apiKey, saveSettings } = useStore(useShallow((state: StoreState) => ({
    playbookSettings: state.playbookSettings,
    apiKey: state.apiKey,
    saveSettings: state.saveSettings
  })));

  const [customSystemPrompt, setCustomSystemPrompt] = useState(playbookSettings?.customSystemPrompt || '');
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [newLogBody, setNewLogBody] = useState('');

  React.useEffect(() => {
    if (playbookSettings?.customSystemPrompt !== undefined) {
      setCustomSystemPrompt(playbookSettings.customSystemPrompt);
    }
  }, [playbookSettings?.customSystemPrompt]);

  const trainingLogs = playbookSettings?.trainingLogs || [];

  const handleSaveSystemPrompt = () => {
    if (!playbookSettings || !saveSettings || !apiKey) return;
    saveSettings({
      apiKey: apiKey,
      playbookSettings: {
        ...playbookSettings,
        customSystemPrompt
      }
    });
    alert('System coaching prompts saved successfully!');
  };

  const handleAddTrainingLog = () => {
    if (!newLogBody.trim()) return;
    if (!playbookSettings || !saveSettings || !apiKey) return;
    
    const newLogs = [...trainingLogs, newLogBody];
    saveSettings({ 
      apiKey,
      playbookSettings: { ...playbookSettings, trainingLogs: newLogs } 
    });
    
    setNewLogBody('');
    setIsAddingLog(false);
  };

  const handleRemoveTrainingLog = (index: number) => {
    if (!playbookSettings || !saveSettings || !apiKey) return;
    
    const newLogs = [...trainingLogs];
    newLogs.splice(index, 1);
    saveSettings({ 
      apiKey,
      playbookSettings: { ...playbookSettings, trainingLogs: newLogs } 
    });
  };

  return (
    <>
        <div className="flex-column gap-2xl w-full max-w-[950px] mx-auto" data-testid="system-prompts-tab">
          <div className="glass-card">
            <h3 className="text-xl mb-md flex-center-y gap-sm">
              <BookOpen size={20} color="var(--info)" /> AI System Prompts Configurator
            </h3>
            <p className="text-sm text-secondary mb-xl">
              Provide the custom instructions that train the Gemini generative engine how to coach and evaluate like your store leaders would.
            </p>

            <div className="form-group m-0">
              <label className="form-label" htmlFor="system-prompt-textarea">Coaching & Empathy Prompt Instructions:</label>
              <textarea 
                id="system-prompt-textarea"
                className="form-control text-sm resize-none" 
                rows={8}
                placeholder="Ensure you lead with humanity. Coach advisors to explore the customer needs by congratulated them first, and offering protection by describing usage scenarios rather than pitch checklist lines..."
                value={customSystemPrompt}
                onChange={(e) => setCustomSystemPrompt(e.target.value)}
                data-testid="system-prompt-textarea"
              />
              <div className="flex justify-end mt-sm">
                <button 
                  className="btn btn-primary px-lg py-sm text-sm font-bold flex-center-y gap-xs cursor-pointer"
                  onClick={handleSaveSystemPrompt}
                  data-testid="save-system-prompt-btn"
                >
                  <Check size={16} /> Save Prompt Instructions
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div>
              <h3 className="text-xl mb-xs flex-center-y gap-sm">
                <Sparkles size={20} color="var(--bby-yellow)" /> Style & Training Corpus (Few-Shot Exemplars)
              </h3>
              <p className="text-sm text-secondary leading-relaxed">
                Provide examples of high-quality coaching logs you have written in the past. When using the **Gemini Engine**, these logs are fed directly into the model as few-shot training examples, prompting it to perfectly copy your formatting, coaching style, tone, standards, and metrics vocabulary!
              </p>
            </div>

            <div className="flex-column gap-xl mt-xl">
              <div className="flex-column gap-lg">
                {trainingLogs.length === 0 ? (
                  <div className="text-center p-2xl border border-dashed border-[var(--border-glass)] rounded-xl text-muted text-sm" data-testid="empty-logs-message">
                    No custom training logs added. Preloading Best Buy default framework.
                  </div>
                ) : (
                  trainingLogs.map((log, idx) => (
                    <div key={idx} className="relative bg-black-alpha-20 border border-[var(--border-glass)] rounded-xl p-md pr-2xl" data-testid={`training-log-row-${idx}`}>
                      <button 
                        className="absolute top-md right-md bg-transparent border-none text-error cursor-pointer p-0 hover-text-white transition-normal"
                        onClick={() => handleRemoveTrainingLog(idx)}
                        title="Remove Training Exemplar"
                        data-testid={`remove-log-btn-${idx}`}
                      >
                        <Trash2 size={16} />
                      </button>
                      <span className="text-xs text-bby-yellow uppercase font-bold tracking-wider block mb-sm">
                        Exemplar #{idx + 1}
                      </span>
                      <pre className="m-0 whitespace-pre-wrap font-mono text-xs text-secondary leading-relaxed">
                        {log}
                      </pre>
                    </div>
                  ))
                )}
              </div>

              {isAddingLog ? (
                <div className="flex-column gap-md p-lg border border-bby-blue rounded-xl bg-white-alpha-01" data-testid="add-log-form">
                  <div className="form-group m-0">
                    <label className="form-label text-white" htmlFor="new-log-textarea">Paste Exemplar Coaching Log Text:</label>
                    <textarea 
                      id="new-log-textarea"
                      className="form-control resize-none text-xs font-mono" 
                      rows={8} 
                      placeholder="Paste a complete 4-section coaching log that represents your personal writing style..."
                      value={newLogBody}
                      onChange={(e) => setNewLogBody(e.target.value)}
                      data-testid="new-log-textarea"
                    />
                  </div>
                  <div className="flex gap-md justify-end">
                    <button 
                      className="btn btn-secondary px-md py-sm text-sm cursor-pointer" 
                      onClick={() => setIsAddingLog(false)}
                      data-testid="cancel-log-btn"
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary px-md py-sm text-sm cursor-pointer" 
                      onClick={handleAddTrainingLog}
                      data-testid="submit-log-btn"
                    >
                      Add Exemplar to Corpus
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="btn btn-secondary w-full border-dashed cursor-pointer py-md" 
                  onClick={() => setIsAddingLog(true)}
                  data-testid="open-add-log-btn"
                >
                  + Add Past Coaching Exemplar to Training Corpus
                </button>
              )}
            </div>
          </div>
        
      </div>
    </>
  );
}
