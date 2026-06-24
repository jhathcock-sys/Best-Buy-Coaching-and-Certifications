import { useState, useMemo } from 'react';
import { TrendingUp, CreditCard, Users } from 'lucide-react';

import { useDashboardContext } from '../../pages/DashboardContext';

export default function DashboardTrendChart() {
  const { calculatedMetrics } = useDashboardContext();
  const [chartMetric, setChartMetric] = useState('memberships');

  const chartData = useMemo(() => {
    const isMemb = chartMetric === 'memberships';
    const currentVal = isMemb ? (calculatedMetrics?.memberships || 0) : (calculatedMetrics?.creditCards || 0);
    
    // Instead of hardcoding 42, 47, 49, we create a smooth slope based on current value.
    // If we have a very low value, we ensure it doesn't dip below 0.
    const step = Math.max(1, Math.round(currentVal * 0.15)); 
    const w1 = Math.max(0, currentVal - (step * 3));
    const w2 = Math.max(0, currentVal - (step * 2));
    const w3 = Math.max(0, currentVal - step);
    const w4 = currentVal;

    const values = [w1, w2, w3, w4];
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const xCoords = [80, 200, 320, 440];

    // Dynamically calculate the ceiling for the chart so lines don't fly off screen or flatline at bottom
    const maxValue = Math.max(...values, isMemb ? 10 : 2); // Provide a reasonable minimum ceiling
    const maxRange = maxValue * 1.2; // Add 20% headroom

    const points = values.map((val, idx) => {
      const x = xCoords[idx];
      const y = 170 - (val / maxRange) * 140;
      return { x, y, value: val, label: labels[idx] };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L 440 170 L 80 170 Z`;

    return { points, linePath, areaPath };
  }, [calculatedMetrics, chartMetric]);

  const { points, linePath, areaPath } = chartData;

  return (
    <div className="glass-card p-xl w-full" style={{ position: 'relative' }}>
      <div className="flex-between flex-wrap gap-sm mb-lg">
        <div>
          <h2 className="text-xl font-bold m-0 mb-xs flex-center gap-sm tracking-tight justify-start">
            <TrendingUp size={20} color="var(--warning)" />
            30-Day Trend Analysis
          </h2>
          <p className="m-0 text-sm text-secondary">
            Comparing current trajectory vs store targets.
          </p>
        </div>
        <div className="flex-center gap-sm p-sm rounded-xl border-glass bg-surface">
          <button 
            className={`btn btn-sm ${chartMetric === 'memberships' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setChartMetric('memberships')}
          >
            <Users size={14} /> PMs
          </button>
          <button 
            className={`btn btn-sm ${chartMetric === 'cards' ? 'bg-warning text-black' : 'btn-secondary'}`}
            onClick={() => setChartMetric('cards')}
            style={{ 
              boxShadow: chartMetric === 'cards' ? '0 4px 15px var(--warning-glow)' : 'none'
            }}
          >
            <CreditCard size={14} /> Cards
          </button>
        </div>
      </div>

      <div className="flex-center p-md border-glass w-full" style={{ height: '220px', background: 'var(--black-alpha-20)', borderRadius: '14px' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartMetric === 'memberships' ? 'var(--bby-blue-alpha-20)' : 'var(--warning-glow)'} />
              <stop offset="100%" stopColor={chartMetric === 'memberships' ? 'rgba(0, 70, 190, 0)' : 'rgba(253, 216, 53, 0)'} />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={chartMetric === 'memberships' ? '#3b82f6' : 'var(--warning)'} />
              <stop offset="100%" stopColor={chartMetric === 'memberships' ? 'var(--bby-blue)' : 'var(--warning)'} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {[40, 80, 120, 160].map((y, i) => (
            <line key={`grid-${i}`} x1="40" y1={y} x2="480" y2={y} stroke="var(--white-alpha-05)" strokeWidth="1" strokeDasharray="4 4" />
          ))}

          <path d={areaPath} fill="url(#trendGradient)" />
          <path 
            d={linePath} 
            fill="none" 
            stroke="url(#lineGradient)" 
            strokeWidth="3.5" 
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            style={{ 
              strokeDasharray: 2000, 
              strokeDashoffset: 0, 
              animation: 'dashDraw 2s ease-out forwards' 
            }} 
          />

          {points.map((p, idx) => (
            <g key={`point-${idx}`} style={{ animation: `fadeInPoint 0.5s ease forwards`, animationDelay: `${0.2 + idx * 0.15}s`, opacity: 0 }}>
              <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-obsidian)" stroke={chartMetric === 'memberships' ? '#60a5fa' : 'var(--warning)'} strokeWidth="2.5" />
              <text x={p.x} y={p.y - 15} fill="var(--text-primary)" fontSize="12" fontWeight="700" textAnchor="middle">{p.value}</text>
              <text x={p.x} y="190" fill="var(--text-secondary)" fontSize="11" fontWeight="600" textAnchor="middle">{p.label}</text>
            </g>
          ))}
        </svg>
      </div>

    </div>
  );
}
