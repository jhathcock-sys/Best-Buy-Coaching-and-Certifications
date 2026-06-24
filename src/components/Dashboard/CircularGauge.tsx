import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

// Circular Gauge Helper
const CircularGauge = ({ value, max = 100, label, prefix = "", suffix = "%", color, icon: Icon, description }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-card metric-card hover-scale p-md flex-column justify-center align-center relative w-full">
      <div className="metric-circle-container relative flex-center">
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
            style={{ filter: `drop-shadow(0 0 5px ${color}80)` }}
          />
        </svg>
        <div className="metric-val flex-center absolute inset-0 font-bold" style={{ textShadow: `0 0 10px ${color}50` }}>
          {prefix && <span className="text-sm opacity-80 mr-xs">{prefix}</span>}
          <span className={value >= 1000 ? 'text-xl' : 'text-2xl'}>{value}</span>
          {suffix && <span className="text-xs opacity-80 ml-xs">{suffix}</span>}
        </div>
      </div>
      <div className="font-bold text-primary mt-sm text-center">{label}</div>
      <div className="text-xs text-secondary text-center mt-xs">{description}</div>
      <Icon style={{ color: color }} className="absolute top-md right-md opacity-20 w-6 h-6" />
    </div>
  );
};

export default CircularGauge;