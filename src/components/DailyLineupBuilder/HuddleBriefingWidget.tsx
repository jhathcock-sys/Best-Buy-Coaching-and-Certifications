import React, { useState } from 'react';
import { Wand2, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { generateHuddleScript } from '../../services/ai/geminiHuddle';
import { Employee } from '../../types';

const EMPTY_OBJ = {};

export default function HuddleBriefingWidget() {
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<string>('');
  const [error, setError] = useState<string>('');

  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const _rawroster = rosterHistory[activePeriod] || EMPTY_OBJ;
  const roster: Employee[] = React.useMemo(
    () => (Object.values(_rawroster) as Employee[]).sort((a, b) => (a?.name || '').localeCompare(b?.name || '')), 
    [_rawroster]
  );
  
  const apiKey = useStore(state => state.apiKey);
  const playbookSettings = useStore(state => state.playbookSettings);

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Please configure your Gemini API key in Settings first.");
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const generatedScript = await generateHuddleScript(roster, apiKey, playbookSettings);
      setScript(generatedScript);
    } catch (err: unknown) {
      console.error('Huddle Generation Error:', err);
      const e = err as Error;
      setError(e?.message || "Failed to generate huddle script.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card w-full flex-column gap-md">
      <div className="flex-between align-center">
        <h3 className="font-heading text-lg m-0 flex-row align-center gap-sm">
          <Sparkles size={20} className="text-bby-yellow" /> Morning Huddle Script
        </h3>
        <button 
          data-testid="generate-huddle-btn"
          className="btn btn-secondary text-bby-blue cursor-pointer flex-row align-center gap-xs"
          onClick={handleGenerate}
          disabled={loading || roster.length === 0}
        >
          <Wand2 size={16} className={loading ? "animate-pulse" : ""} />
          {loading ? 'Generating...' : 'Generate Morning Huddle'}
        </button>
      </div>
      
      {error && (
        <div data-testid="huddle-error" className="alert-card-danger p-sm text-sm rounded-xl">
          {error}
        </div>
      )}

      {script && !loading && (
        <div 
          data-testid="huddle-script-output"
          className="p-md text-secondary rounded-xl border-glass"
          style={{ 
            background: 'var(--bg-obsidian)',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6'
          }}
        >
          {script}
        </div>
      )}
      
      {loading && !script && (
        <div data-testid="huddle-loading" className="p-xl flex-center flex-column gap-md text-bby-blue">
          <Wand2 size={32} className="animate-pulse" />
          <p className="m-0 text-sm animate-pulse text-bby-blue">Drafting AI coaching tips for the team...</p>
        </div>
      )}
    </div>
  );
}
