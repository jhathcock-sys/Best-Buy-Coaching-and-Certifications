import { useState } from 'react';
import { TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DynamicChartRenderer } from '../components/Analytics/DynamicChartRenderer';
import { askConversationalAnalytics } from '../services/ai/geminiAnalytics';
import { GenerativeChartConfig } from '../types';

export default function TrendReportingPage() {
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
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPlaybookHydrated) {
    return (
      <div className="flex-center flex-column w-full h-full gap-md min-h-screen">
        <div className="w-50px h-50px border-4 border-solid border-white-alpha-10 border-bby-yellow-t-4 rounded-full animate-spin"></div>
        <span className="text-secondary text-sm font-semibold uppercase tracking-widest animate-fade-in">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex-column mx-auto w-full pb-3xl" style={{ maxWidth: '1200px' }}>
      
      {/* Header */}
      <div className="flex-column gap-sm mb-xl">
        <h1 className="text-4xl m-0 flex-row align-center gap-md font-bold text-white">
          <TrendingUp size={36} color="var(--bby-blue)" />
          Conversational Analytics
        </h1>
        <p className="text-secondary text-lg m-0">
          Ask questions about your store's performance trends using AI.
        </p>
      </div>

      {/* AI Input Area */}
      <div className="glass-card p-xl mb-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 opacity-50" style={{ background: 'linear-gradient(to right, var(--bby-blue), var(--bby-yellow))' }} />
        <form onSubmit={handleSubmit} className="flex-row gap-md align-center w-full">
          <div className="flex-1 relative">
            <Sparkles size={20} className="absolute left-md top-1/2 text-bby-blue opacity-70" style={{ transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="e.g. What was our best week for memberships?"
              className="w-full bg-black-alpha-30 border-glass rounded-lg py-md pr-md pl-2-5rem text-white text-lg transition-all outline-none"
              style={{ borderColor: isFocused ? 'var(--bby-blue)' : undefined }}
              data-testid="ai-trend-input"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className={`bg-bby-blue text-white font-bold py-md px-xl rounded-lg border-none transition-all flex-row align-center gap-sm ${(isLoading || !query.trim()) ? 'opacity-50' : 'hover-opacity-80'}`}
            style={{ cursor: (isLoading || !query.trim()) ? 'not-allowed' : 'pointer' }}
            data-testid="ai-trend-submit"
          >
            {isLoading ? 'Analyzing...' : 'Ask AI'}
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex-column align-center justify-center py-3xl gap-lg">
          <div className="w-50px h-50px border-4 border-solid border-white-alpha-10 border-bby-yellow-t-4 rounded-full animate-spin"></div>
          <span className="text-bby-blue text-lg font-bold animate-pulse">Analyzing Store Data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="glass-card border-error-alpha-20 bg-error-alpha-15 p-xl flex-row gap-md align-center">
          <AlertCircle size={24} className="text-error flex-shrink-0" />
          <p className="text-white m-0 text-lg">{error}</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && chartConfig && (
        <div className="animate-fade-in" data-testid="ai-trend-result">
          <DynamicChartRenderer config={chartConfig} />
        </div>
      )}

    </div>
  );
}
