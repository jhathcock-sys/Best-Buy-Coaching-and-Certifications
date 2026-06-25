import React, { Suspense } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface AdvisorLayoutProps {
  dbConnected: boolean;
  children: React.ReactNode;
}

export default function AdvisorLayout({ dbConnected, children }: AdvisorLayoutProps) {
  return (
    <div className="layout-container dark-theme flex-column h-full" style={{ overflow: 'hidden' }}>
      <div className="flex-between p-md" style={{ background: 'var(--white-alpha-05)', borderBottom: '1px solid var(--border-glass)' }}>
        <div className="flex-center gap-sm">
          <div className="p-sm" style={{ background: 'var(--bby-blue)', borderRadius: '8px' }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>FloorVision</span>
        </div>
        <div className="flex-center gap-md">
          {dbConnected ? (
            <div className="badge-sync">
              <span className="badge-sync-dot" />
              <span className="badge-sync-text">Cloud Sync</span>
            </div>
          ) : (
            <div className="badge-sandbox">
              <span className="badge-sandbox-dot" />
              <span className="badge-sandbox-text">Local Sandbox</span>
            </div>
          )}
          <button 
            onClick={() => useStore.getState().logout()} 
            className="btn btn-secondary"
            data-testid="advisor-logout-btn"
          >
            Log Out
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Suspense fallback={
          <div className="flex-center flex-column w-full h-full gap-md">
            <div style={{ width: '50px', height: '50px', border: '4px solid var(--white-alpha-10)', borderTopColor: 'var(--bby-yellow)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', animation: 'fadeIn 0.5s ease' }}>Loading Module...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
          </div>
        }>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
