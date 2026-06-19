// @ts-nocheck
import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

// Circular Gauge Helper
const CircularGauge = ({ value, max = 100, label, prefix = "", suffix = "%", color, icon: Icon, description }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className="glass-card metric-card" 
      style={{ 
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
        cursor: 'pointer' 
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = `0 12px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.02), 0 0 15px ${color}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="metric-circle-container">
        <svg className="metric-svg" viewBox="0 0 120 120" width="120" height="120">
          <circle className="metric-circle-bg" cx="60" cy="60" r={radius} />
          <circle 
            className="metric-circle-fill" 
            cx="60" 
            cy="60" 
            r={radius} 
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 5px ${color}a0)` }}
          />
        </svg>
        <div className="metric-val" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', textShadow: `0 0 10px ${color}50` }}>
          {prefix && <span style={{ fontSize: '0.95rem', opacity: 0.8, marginRight: '1px' }}>{prefix}</span>}
          <span style={{ fontSize: value >= 1000 ? '1.25rem' : '1.55rem' }}>{value}</span>
          {suffix && <span style={{ fontSize: '0.85rem', opacity: 0.8, marginLeft: '1px' }}>{suffix}</span>}
        </div>
      </div>
      <div className="metric-label" style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{label}</div>
      <div className="metric-sub" style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>{description}</div>
      <Icon style={{ color: color, position: 'absolute', top: '1rem', right: '1rem', opacity: 0.15, width: 22, height: 22 }} />
    </div>
  );
};

export default CircularGauge;