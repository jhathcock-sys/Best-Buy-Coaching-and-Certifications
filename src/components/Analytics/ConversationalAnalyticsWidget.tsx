import React, { useState } from 'react';
import { Sparkles, AlertCircle, TrendingUp } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { DynamicChartRenderer } from './DynamicChartRenderer';
import { askConversationalAnalytics } from '../../services/ai/geminiAnalytics';
import { GenerativeChartConfig } from '../../types';

interface ConversationalAnalyticsWidgetProps {
  compact?: boolean;
}

export const ConversationalAnalyticsWidget: React.FC<ConversationalAnalyticsWidgetProps> = ({ compact = false }) => {
  const dailySnapshots = useStore(state => state.dailySnapshots);
  const isPlaybookHydrated = useStore(state => state.isPlaybookHydrated);
  
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [chartConfig, setChartConfig] = useState<GenerativeChartConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setChartConfig(null);
    
    try {
      const config = await askConversationalAnalytics(query, dailySnapshots);
      if (config) {
        setChartConfig(config);
      } else {
        setError('Failed to generate insights. Please try again.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred while fetching analytics.');
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPlaybookHydrated) {
    return (
      <div className={`glass-card flex-center flex-column w-full h-full gap-md ${compact ? 'p-lg' : 'p-2xl'}`}>
        <div className="w-40px h-40px border-3 border-solid border-white-alpha-10 border-bby-yellow-t-4 rounded-full animate-spin"></div>
        <span className="text-secondary text-sm font-semibold uppercase tracking-widest animate-fade-in">Loading Data...</span>
      </div>
    );
  }

  return (
    <div className={`glass-card flex-column w-full h-full relative overflow-hidden ${compact ? 'p-lg' : 'p-xl'}`}>
      <div className="absolute top-0 left-0 w-full h-1 opacity-50" style={{ background: 'linear-gradient(to right, var(--bby-blue), var(--bby-yellow))' }} />
      
      {/* Header */}
      <div className={`flex-column ${compact ? 'gap-xs mb-lg' : 'gap-sm mb-xl'}`}>
        <h2 className={`${compact ? 'text-xl' : 'text-3xl'} m-0 flex-row align-center gap-sm font-bold text-white`}>
          {compact ? <TrendingUp size={20} color="var(--bby-blue)" /> : <TrendingUp size={28} color="var(--bby-blue)" />}
          {compact ? 'Ask Analytics AI' : 'Conversational Analytics'}
        </h2>
        <p className={`text-secondary m-0 ${compact ? 'text-sm' : 'text-lg'}`}>
          {compact ? 'Ask questions about store trends.' : 'Ask questions about your store\'s performance trends using AI.'}
        </p>
      </div>

      {/* AI Input Area */}
      <div className="mb-lg">
        <form onSubmit={handleSubmit} className={`gap-md w-full ${compact ? 'flex-column align-stretch' : 'flex-row align-center'}`}>
          <div className="flex-1 relative w-full">
            <Sparkles size={18} className="absolute left-md top-1/2 text-bby-blue opacity-70" style={{ transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={compact ? "e.g. Best week for PMs?" : "e.g. What was our best week for memberships?"}
              className={`w-full bg-black-alpha-30 border-glass rounded-lg py-md pr-md pl-2-5rem text-white transition-all outline-none ${compact ? 'text-md' : 'text-lg'}`}
              style={{ borderColor: isFocused ? 'var(--bby-blue)' : undefined }}
              data-testid="ai-trend-input"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`bg-bby-blue text-white font-bold py-md px-xl rounded-lg border-none transition-all flex-row align-center justify-center gap-sm ${(isLoading || !query.trim()) ? 'opacity-50' : 'hover-opacity-80'}`}
            style={{ cursor: (isLoading || !query.trim()) ? 'not-allowed' : 'pointer' }}
            data-testid="ai-trend-submit"
          >
            {isLoading ? 'Analyzing...' : 'Ask AI'}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className={`flex-column align-center justify-center py-xl gap-md ${compact ? 'flex-1' : ''}`}>
          <div className="w-40px h-40px border-3 border-solid border-white-alpha-10 border-bby-yellow-t-4 rounded-full animate-spin"></div>
          <span className="text-bby-blue text-md font-bold animate-pulse">Analyzing Store Data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="border-glass border-error-alpha-20 bg-error-alpha-15 p-md rounded-lg flex-row gap-md align-center mb-md">
          <AlertCircle size={20} className="text-error flex-shrink-0" />
          <p className="text-white m-0 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && chartConfig && (
        <div className="animate-fade-in flex-1 overflow-auto" data-testid="ai-trend-result">
          <DynamicChartRenderer config={chartConfig} />
        </div>
      )}

    </div>
  );
};
