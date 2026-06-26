import React, { useState, useMemo } from 'react';
import { Radar, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateAuraBatchInsights, AuraInsight } from '../services/ai/auraEngine';
import AuraActionCard from '../components/AuraHUD/AuraActionCard';
import { Employee } from '../types';
import '../components/AuraHUD/AuraHUD.css';

interface AuraHUDPageProps {
  onCoachEmployee: (employee: Employee) => void;
}

const EMPTY_OBJ = {};

export default function AuraHUDPage({ onCoachEmployee }: AuraHUDPageProps) {
  const activePeriod = useStore((state) => state.activePeriod);
  const rosterHistory = useStore((state) => state.rosterHistory) || EMPTY_OBJ;
  const deptGoals = useStore((state) => state.deptGoals) || EMPTY_OBJ;
  const apiKey = useStore((state) => state.apiKey);
  const playbookSettings = useStore((state) => state.playbookSettings);
  
  const _rawroster = rosterHistory[activePeriod] || EMPTY_OBJ;
  const roster = useMemo(() => (Object.values(_rawroster) as Employee[]).sort((a, b) => (a?.name || '').localeCompare(b?.name || '')), [_rawroster]);

  const [insights, setInsights] = useState<Record<string, AuraInsight>>({});
  const [isScanning, setIsScanning] = useState(false);

  const handleScanFloor = async () => {
    if (!apiKey) {
      alert("Please configure your Gemini API key in Settings first.");
      return;
    }
    if (isScanning) return;
    if (roster.length === 0) return;
    
    setIsScanning(true);
    setInsights({});
    
    // Sort employees by lowest performance first to prioritize coaching insights
    const sortedRoster = [...roster].sort((a, b) => {
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
          <p className="text-secondary mt-sm max-w-600">
            Live floor command. Detects behavioral patterns and surfaces active coaching moments across your store.
          </p>
        </div>
        
        <button 
          className="btn btn-primary flex-center gap-sm px-lg py-md transition-normal z-2 cursor-pointer" 
          onClick={handleScanFloor}
          disabled={isScanning}
          data-testid="scan-floor-btn"
        >
          <RefreshCw size={18} className={isScanning ? 'animate-spin' : ''} />
          {isScanning ? 'Scanning Floor...' : 'Scan Floor'}
        </button>
      </div>

      <div className="aura-masonry-grid">
        {roster.map((emp) => (
          <AuraActionCard 
            key={emp.id}
            employee={emp}
            insight={insights[emp.id] || null}
            isScanning={isScanning}
            onCoachEmployee={onCoachEmployee}
          />
        ))}
        {roster.length === 0 && (
          <div className="glass-card p-xl flex-center w-full col-span-full" data-testid="empty-roster-state">
            <p className="text-muted text-center">No active employees in the current period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
