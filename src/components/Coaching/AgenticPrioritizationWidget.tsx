import React, { useState } from 'react';
import { Target, Wand2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Employee } from '../../types';
import { generateCoachingTargets, CoachingTarget } from '../../services/ai/geminiCoachingTarget';

const EMPTY_OBJ = {};

export default function AgenticPrioritizationWidget() {
  const [loading, setLoading] = useState(false);
  const [targets, setTargets] = useState<CoachingTarget[]>([]);
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
    if (roster.length === 0) {
      setError("No employees in current roster.");
      return;
    }
    
    setLoading(true);
    setError('');
    setTargets([]);
    
    try {
      const generatedTargets = await generateCoachingTargets(roster, apiKey, playbookSettings);
      setTargets(generatedTargets);
    } catch (err: unknown) {
      console.error('Coaching Target Error:', err);
      const e = err as Error;
      setError(e?.message || "Failed to identify coaching targets.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card w-full flex-column gap-md mb-xl" data-testid="agentic-prioritization-widget">
      <div className="flex-between align-center">
        <h3 className="font-heading text-lg m-0 flex-row align-center gap-sm">
          <Target size={20} className="text-error" /> Coaching Priorities
        </h3>
        <button 
          data-testid="find-targets-btn"
          className="btn btn-primary cursor-pointer flex-row align-center gap-xs"
          onClick={handleGenerate}
          disabled={loading || roster.length === 0}
        >
          <Wand2 size={16} className={loading ? "animate-pulse" : ""} />
          {loading ? 'Analyzing...' : 'Find Coaching Targets'}
        </button>
      </div>
      
      {error && (
        <div data-testid="target-error" className="alert-card-danger p-sm text-sm rounded-xl mt-sm">
          {error}
        </div>
      )}

      {loading && (
        <div data-testid="target-loading" className="p-xl flex-center flex-column gap-md text-bby-blue mt-sm">
          <Wand2 size={32} className="animate-pulse" />
          <p className="m-0 text-sm animate-pulse">Analyzing KPI gaps for interventions...</p>
        </div>
      )}

      {!loading && targets.length > 0 && (
        <div className="dashboard-grid mt-sm gap-md" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {targets.map((target, idx) => (
            <div 
              key={idx} 
              data-testid={`coaching-target-card-${idx}`}
              className="p-md rounded-xl flex-column gap-sm bg-obsidian border border-glass"
            >
              <div className="font-bold text-lg text-bby-blue flex-between">
                <span>{target.name}</span>
                <span className="text-xs px-sm py-xs rounded-full bg-error-alpha-15 text-error">
                  Intervention Required
                </span>
              </div>
              <p className="text-sm text-primary m-0">
                <strong className="text-muted">Reason:</strong> {target.reason}
              </p>
              <p className="text-sm text-success m-0 p-sm rounded-xl bg-success-alpha-15">
                <strong className="text-success">Action:</strong> {target.recommendedAction}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
