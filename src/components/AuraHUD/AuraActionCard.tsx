import React from 'react';
import { PlayCircle, Target, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { AuraInsight } from '../../services/ai/auraEngine';
import './AuraHUD.css';

interface AuraActionCardProps {
  employee: any;
  insight: AuraInsight | null;
  isScanning: boolean;
  onCoachEmployee: (employee: any) => void;
}

export default function AuraActionCard({ employee, insight, isScanning, onCoachEmployee }: AuraActionCardProps) {
  const statusClass = insight ? `aura-card-${insight.status}` : 'aura-card-steady';
  const showSkeleton = isScanning && !insight;

  return (
    <div className={`glass-card rounded-xl p-md aura-card border-glass ${statusClass}`} data-testid={`aura-card-${employee.id}`}>
      
      <div className="flex-row justify-between align-center mb-md">
        <div>
          <h3 className="text-lg font-heading text-white m-0">
            {employee.name}
          </h3>
          <span className="text-xs text-secondary">{employee.department}</span>
        </div>
        
        {insight?.status === 'needs_coaching' && <AlertTriangle size={20} className="text-bby-yellow" />}
        {insight?.status === 'excellent' && <CheckCircle size={20} className="text-success" />}
        {insight?.status === 'steady' && <Target size={20} className="text-info" />}
      </div>

      <div className="flex-row gap-md mb-md flex-wrap">
        <div className="flex-1 min-w-45">
          <span className="text-xxs text-muted uppercase">Revenue</span>
          <div className="text-base text-white font-semibold">${employee.revenue?.toLocaleString() || 0}</div>
        </div>
        <div className="flex-1 min-w-45">
          <span className="text-xxs text-muted uppercase">Memberships</span>
          <div className="text-base text-white font-semibold">{employee.memberships || 0}</div>
        </div>
      </div>

      <div className="aura-insight-pill mb-md">
        {showSkeleton ? (
          <div className="flex-row align-center gap-sm">
            <div className="w-3 h-3 rounded-full bg-bby-yellow animate-pulse" />
            <span className="text-secondary">Gemini analyzing...</span>
          </div>
        ) : insight ? (
          <>
            <div className="font-semibold text-white mb-xs">{insight.action}</div>
            <div className="text-secondary">{insight.insight}</div>
          </>
        ) : (
          <div className="text-secondary">Awaiting Scan...</div>
        )}
      </div>

      <button 
        className="btn btn-primary w-full flex-center gap-sm p-md-sm transition-normal"
        onClick={() => onCoachEmployee(employee)}
      >
        <PlayCircle size={16} /> Coach Now
      </button>

    </div>
  );
}
