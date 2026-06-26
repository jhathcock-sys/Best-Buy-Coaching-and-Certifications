import { useState, useEffect } from 'react';

export default function ServiceWorkerBanner() {
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleUpdate = () => setSwUpdateAvailable(true);
    window.addEventListener('sw-update-available', handleUpdate);
    return () => window.removeEventListener('sw-update-available', handleUpdate);
  }, []);

  if (!swUpdateAvailable) return null;

  return (
    <div 
      className="glass-card flex-column gap-sm animate-fade-in fixed bottom-6 right-6 p-5 z-[9999] max-w-[320px]"
      data-testid="sw-update-banner"
    >
      <div>
        <h4 className="m-0 text-base font-bold text-white">App Update Available</h4>
        <p className="m-0 mt-xs text-sm text-secondary">
          A new version of FloorVision is available. Refresh to load new sales tools and metrics.
        </p>
      </div>
      <div className="flex-center gap-sm">
        <button 
          className="btn btn-primary w-full p-sm text-sm cursor-pointer" 
          data-testid="sw-update-reload-btn"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </button>
        <button 
          className="btn btn-secondary px-md py-sm text-sm cursor-pointer" 
          data-testid="sw-update-dismiss-btn"
          onClick={() => setSwUpdateAvailable(false)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
