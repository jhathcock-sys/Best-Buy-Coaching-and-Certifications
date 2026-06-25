import React, { Suspense } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface AdvisorLayoutProps {
  dbConnected: boolean;
  children: React.ReactNode;
}

export default function AdvisorLayout({ dbConnected, children }: AdvisorLayoutProps) {
  const logout = useStore((state) => state.logout);

  return (
    <div className="layout-container dark-theme flex-column h-full overflow-hidden" data-testid="advisor-layout">
      <div className="flex-between p-md bg-white-alpha-05 border-b-glass">
        <div className="flex-center gap-sm">
          <div className="p-sm bg-bby-blue rounded-8">
            <Sparkles size={18} color="#fff" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight">FloorVision</span>
        </div>
        <div className="flex-center gap-md">
          {dbConnected ? (
            <div className="badge-sync" data-testid="cloud-sync-badge">
              <span className="badge-sync-dot" />
              <span className="badge-sync-text">Cloud Sync</span>
            </div>
          ) : (
            <div className="badge-sandbox" data-testid="local-sandbox-badge">
              <span className="badge-sandbox-dot" />
              <span className="badge-sandbox-text">Local Sandbox</span>
            </div>
          )}
          <button 
            onClick={logout} 
            className="btn btn-secondary cursor-pointer"
            data-testid="advisor-logout-btn"
          >
            Log Out
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={
          <div className="flex-center flex-column w-full h-full gap-md" data-testid="loading-module-spinner">
            <div className="w-50px h-50px border-4 border-solid border-white-alpha-10 border-bby-yellow-t-4 rounded-full animate-spin"></div>
            <span className="text-secondary text-sm font-semibold uppercase tracking-widest animate-fade-in">Loading Module...</span>
          </div>
        }>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
