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
    } catch (err: any) {
      console.error('Huddle Generation Error:', err);
      setError(err?.message || "Failed to generate huddle script.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card glass-panel w-full p-lg flex-column gap-md">
      <div className="flex-between align-center">
        <h3 className="font-heading text-lg m-0 flex-row align-center gap-sm">
          <Sparkles size={20} className="text-bby-yellow" /> Morning Huddle Script
        </h3>
        <button 
          data-testid="generate-huddle-btn"
          className="btn cursor-pointer flex-row align-center gap-xs"
          style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}
          onClick={handleGenerate}
          disabled={loading || roster.length === 0}
        >
          <Wand2 size={16} className={loading ? "animate-pulse" : ""} />
          {loading ? 'Generating...' : 'Generate Morning Huddle'}
        </button>
      </div>
      
      {error && (
        <div className="p-sm text-sm" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {script && !loading && (
        <div 
          data-testid="huddle-script-output"
          className="p-md text-secondary"
          style={{ 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: '8px', 
            border: '1px solid var(--border-glass)',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6'
          }}
        >
          {script}
        </div>
      )}
      
      {loading && !script && (
        <div className="p-xl flex-center flex-column gap-md" style={{ color: '#38bdf8' }}>
          <Wand2 size={32} className="animate-pulse" />
          <p className="m-0 text-sm animate-pulse">Drafting AI coaching tips for the team...</p>
        </div>
      )}
    </div>
  );
}
