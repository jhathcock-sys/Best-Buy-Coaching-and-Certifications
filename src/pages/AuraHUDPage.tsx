import React, { useState, useMemo } from 'react';
import { Radar, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateAuraBatchInsights, AuraInsight } from '../services/ai/auraEngine';
import AuraActionCard from '../components/AuraHUD/AuraActionCard';
import '../components/AuraHUD/AuraHUD.css';

interface AuraHUDPageProps {
  onCoachEmployee: (employee: any) => void;
}

const EMPTY_OBJ = {};

export default function AuraHUDPage({ onCoachEmployee }: AuraHUDPageProps) {
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const deptGoals = useStore((state) => state.deptGoals) || EMPTY_OBJ;
  const apiKey = useStore((state) => state.apiKey);
  const playbookSettings = useStore((state) => state.playbookSettings);
  
  const _rawroster = rosterHistory[activePeriod] || EMPTY_OBJ;
  const roster = useMemo(() => Object.values(_rawroster).sort((a: any, b: any) => a.name.localeCompare(b.name)), [_rawroster]);

  const [insights, setInsights] = useState<Record<string, AuraInsight>>({});
  const [isScanning, setIsScanning] = useState(false);

  const handleScanFloor = async () => {
    if (!apiKey) {
      alert("Please configure your Gemini API key in Settings first.");
      return;
    }
    
    setIsScanning(true);
    setInsights({});
    
    // Sort employees by lowest performance first to prioritize coaching insights
    const sortedRoster = [...roster].sort((a: any, b: any) => {
      const aScore = (a.revenue || 0) + (a.memberships || 0) * 500;
      const bScore = (b.revenue || 0) + (b.memberships || 0) * 500;
      return aScore - bScore;
    });

    try {
      const batchInsights = await generateAuraBatchInsights(sortedRoster, deptGoals, apiKey, playbookSettings);
      setInsights(batchInsights);
    } catch (e) {
      console.error("Batch scan failed:", e);
    }
    
    setIsScanning(false);
  };

  return (
    <div className="aura-hud-container">
      {isScanning && <div className="aura-radar-sweep" />}
      
      <div className="aura-header">
        <div>
          <h1 className="aura-title">
            <Radar size={32} className="text-bby-yellow" />
            Aura Radar
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '600px' }}>
            Live floor command. Detects behavioral patterns and surfaces active coaching moments across your store.
          </p>
        </div>
        
        <button 
          className="btn btn-primary flex-center gap-sm" 
          onClick={handleScanFloor}
          disabled={isScanning}
          style={{ padding: '0.75rem 1.5rem', transition: 'var(--transition-normal)', zIndex: 2 }}
          data-testid="scan-floor-btn"
        >
          <RefreshCw size={18} className={isScanning ? 'spin' : ''} />
          {isScanning ? 'Scanning Floor...' : 'Scan Floor'}
        </button>
      </div>

      <div className="aura-masonry-grid">
        {roster.map((emp: any) => (
          <AuraActionCard 
            key={emp.id}
            employee={emp}
            insight={insights[emp.id] || null}
            isScanning={isScanning}
            onCoachEmployee={onCoachEmployee}
          />
        ))}
        {roster.length === 0 && (
          <div className="glass-card p-xl flex-center w-full" style={{ gridColumn: '1 / -1' }}>
            <p className="text-muted text-center">No active employees in the current period.</p>
          </div>
        )}
      </div>
      
      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
