import React, { useEffect, useState } from 'react';
import { Tag, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { scrapeDeals, Deal } from '../services/api/bestBuyApi';

export const MemberDealsPage: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await scrapeDeals();
      if (signal?.aborted) return;
      setDeals(data);
    } catch (err: any) {
      if (signal?.aborted) return;
      setError(err.message || 'Failed to fetch deals.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchDeals(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="space-y-6" data-testid="member-deals-page">
      <div className="flex-between">
        <div>
          <h2 className="text-2xl font-bold font-outfit text-white flex-align gap-2">
            <Tag className="w-6 h-6 text-bby-blue" />
            Best Buy Member Deals
          </h2>
          <p className="text-gray-400 mt-1">Live deals curated from Slickdeals RSS feed.</p>
        </div>
        <button 
          onClick={() => fetchDeals()} 
          disabled={loading}
          className="glass-button flex-align gap-2 text-white hover:text-bby-blue transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="glass-card bg-red-500/10 border-red-500/50 flex flex-col items-center justify-center p-8 text-center text-red-400 space-y-4">
          <AlertCircle className="w-12 h-12 mb-2" />
          <h3 className="text-lg font-bold">Failed to load deals</h3>
          <p className="max-w-md">{error}</p>
          <button onClick={() => fetchDeals()} className="glass-button mt-4 cursor-pointer" data-testid="fetch-deals-btn">Try Again</button>
        </div>
      ) : loading && deals.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse space-y-4 h-48">
              <div className="h-6 bg-white/10 rounded w-3/4"></div>
              <div className="h-4 bg-white/5 rounded w-1/2"></div>
              <div className="h-20 bg-white/5 rounded w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">
          <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No active deals found at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {deals.map((deal, idx) => (
            <a 
              key={idx} 
              href={deal.link}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`deal-item-${idx}`}
              className="glass-card p-6 flex flex-col hover:border-bby-blue/50 transition-all group block"
            >
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-bby-blue transition-colors">
                {deal.title}
              </h3>
              
              <div 
                className="text-sm text-gray-400 prose prose-invert max-w-none flex-grow line-clamp-3 mb-4"
                dangerouslySetInnerHTML={{ __html: deal.description }}
              />

              <div className="mt-auto pt-4 border-t border-white/10 flex-between items-center text-sm font-medium text-bby-blue">
                View Deal
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};
