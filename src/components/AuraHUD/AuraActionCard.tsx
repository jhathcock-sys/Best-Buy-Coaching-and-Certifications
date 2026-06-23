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
    <div className={`glass-card rounded-xl p-md aura-card ${statusClass}`} style={{ border: '1px solid var(--border-glass)' }} data-testid={`aura-card-${employee.id}`}>
      
      <div className="flex-row justify-between align-center mb-md">
        <div>
          <h3 className="text-lg" style={{ fontFamily: 'var(--font-heading)', color: '#fff', margin: 0 }}>
            {employee.name}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{employee.department}</span>
        </div>
        
        {insight?.status === 'needs_coaching' && <AlertTriangle size={20} className="text-bby-yellow" />}
        {insight?.status === 'excellent' && <CheckCircle size={20} className="text-success" />}
        {insight?.status === 'steady' && <Target size={20} className="text-info" />}
      </div>

      <div className="flex-row gap-md mb-md" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '45%' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Revenue</span>
          <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>${employee.revenue?.toLocaleString() || 0}</div>
        </div>
        <div style={{ flex: 1, minWidth: '45%' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Memberships</span>
          <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{employee.memberships || 0}</div>
        </div>
      </div>

      <div className="aura-insight-pill mb-md">
        {showSkeleton ? (
          <div className="flex-row align-center gap-sm">
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--bby-yellow)', animation: 'pulse 1.5s infinite' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Gemini analyzing...</span>
          </div>
        ) : insight ? (
          <>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>{insight.action}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{insight.insight}</div>
          </>
        ) : (
          <div style={{ color: 'var(--text-secondary)' }}>Awaiting Scan...</div>
        )}
      </div>

      <button 
        className="btn btn-primary w-full flex-center gap-sm"
        onClick={() => onCoachEmployee(employee)}
        style={{ padding: '0.75rem', transition: 'var(--transition-normal)' }}
      >
        <PlayCircle size={16} /> Coach Now
      </button>

    </div>
  );
}
