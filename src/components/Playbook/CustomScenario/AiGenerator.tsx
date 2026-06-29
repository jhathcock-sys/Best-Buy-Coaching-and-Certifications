import React from 'react';
import { Wand2, Sparkles, Loader2 } from 'lucide-react';

interface AiGeneratorProps {
  aiPrompt: string;
  setAiPrompt: (val: string) => void;
  isGenerating: boolean;
  handleAiGenerate: () => void;
  aiError: string;
}

export default function AiGenerator({
  aiPrompt, setAiPrompt, isGenerating, handleAiGenerate, aiError
}: AiGeneratorProps) {
  return (
    <div className="bg-yellow-500/5 border border-yellow-500/20 p-md rounded-xl flex-column gap-sm">
      <h4 className="m-0 text-sm text-[var(--bby-yellow)] flex-center justify-start gap-xs">
        <Wand2 size={16} /> Auto-Generate with AI
      </h4>
      <p className="m-0 text-xs text-secondary">Describe a scenario and let Gemini build out the customer profile and objections.</p>
      <div className="flex gap-sm">
        <input 
          type="text" 
          className="form-control flex-1" 
          placeholder="e.g. An angry customer trying to return a laptop past policy..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          data-testid="scenario-ai-prompt-input"
        />
        <button 
          type="button" 
          className="btn btn-secondary flex-center gap-xs whitespace-nowrap" 
          onClick={handleAiGenerate}
          disabled={isGenerating || !aiPrompt.trim()}
          data-testid="scenario-ai-generate-btn"
        >
          {isGenerating ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
          Generate
        </button>
      </div>
      {aiError && <span className="text-error text-xs">{aiError}</span>}
    </div>
  );
}
