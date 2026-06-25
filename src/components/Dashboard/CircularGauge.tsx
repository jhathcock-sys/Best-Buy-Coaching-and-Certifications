import React from 'react';

export interface CircularGaugeProps {
  value: number;
  max?: number;
  label: string;
  prefix?: string;
  suffix?: string;
  colorName?: string;
  icon?: React.ElementType;
  description?: string;
}

const CircularGauge = ({ 
  value, 
  max = 100, 
  label, 
  prefix = "", 
  suffix = "%", 
  colorName = 'blue', 
  icon: Icon, 
  description 
}: CircularGaugeProps) => {
  const safeValue = value ?? 0;
  const percentage = max > 0 ? Math.min((safeValue / max) * 100, 100) : 0;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const testId = `circular-gauge-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div 
      className={`glass-card metric-card hover-scale p-md flex-column justify-center align-center relative w-full gauge-${colorName}`}
      data-testid={testId}
    >
      <div className="metric-circle-container relative flex-center">
        <svg className="metric-svg" viewBox="0 0 120 120" width="120" height="120">
          <circle className="metric-circle-bg" cx="60" cy="60" r={radius} />
          <circle 
            className="metric-circle-fill gauge-circle-fill" 
            cx="60" 
            cy="60" 
            r={radius} 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="metric-val flex-center absolute inset-0 font-bold gauge-val">
          {prefix && <span className="text-sm opacity-80 mr-xs">{prefix}</span>}
          <span className={safeValue >= 1000 ? 'text-xl' : 'text-2xl'}>{safeValue}</span>
          {suffix && <span className="text-xs opacity-80 ml-xs">{suffix}</span>}
        </div>
      </div>
      <div className="font-bold text-primary mt-sm text-center">{label}</div>
      {description && <div className="text-xs text-secondary text-center mt-xs">{description}</div>}
      {Icon && <Icon className="absolute top-md right-md opacity-20 w-6 h-6 gauge-icon" />}
    </div>
  );
};

export default CircularGauge;