import { useState, useMemo } from 'react';
import { TrendingUp, CreditCard, Users } from 'lucide-react';

interface DashboardTrendChartProps {
  calculatedMetrics: any;
}

export default function DashboardTrendChart({ calculatedMetrics }: DashboardTrendChartProps) {
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
    <div className="glass-card" style={{ padding: '1.75rem', width: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.02em', color: '#fff' }}>
            <TrendingUp size={20} color="var(--bby-yellow)" />
            30-Day Trend Analysis
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Comparing current trajectory vs store targets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          <button 
            className={`metric-toggle-btn ${chartMetric === 'memberships' ? 'active' : ''}`}
            onClick={() => setChartMetric('memberships')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer',
              background: chartMetric === 'memberships' ? 'var(--bby-blue)' : 'transparent',
              color: chartMetric === 'memberships' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Users size={14} /> PMs
          </button>
          <button 
            className={`metric-toggle-btn ${chartMetric === 'cards' ? 'active' : ''}`}
            onClick={() => setChartMetric('cards')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer',
              background: chartMetric === 'cards' ? 'var(--bby-yellow)' : 'transparent',
              color: chartMetric === 'cards' ? '#000' : 'var(--text-secondary)'
            }}
          >
            <CreditCard size={14} /> Cards
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: '220px', background: 'rgba(11, 15, 25, 0.2)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartMetric === 'memberships' ? 'rgba(0, 70, 190, 0.4)' : 'rgba(253, 216, 53, 0.4)'} />
              <stop offset="100%" stopColor={chartMetric === 'memberships' ? 'rgba(0, 70, 190, 0)' : 'rgba(253, 216, 53, 0)'} />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={chartMetric === 'memberships' ? '#3b82f6' : '#fef08a'} />
              <stop offset="100%" stopColor={chartMetric === 'memberships' ? '#0046be' : '#fdd835'} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {[40, 80, 120, 160].map((y, i) => (
            <line key={`grid-${i}`} x1="40" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
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
              <circle cx={p.x} cy={p.y} r="5" fill="#111827" stroke={chartMetric === 'memberships' ? '#60a5fa' : '#fef08a'} strokeWidth="2.5" />
              <text x={p.x} y={p.y - 15} fill="#fff" fontSize="12" fontWeight="700" textAnchor="middle">{p.value}</text>
              <text x={p.x} y="190" fill="var(--text-secondary)" fontSize="11" fontWeight="600" textAnchor="middle">{p.label}</text>
            </g>
          ))}
        </svg>
      </div>

      <style>{`
        @keyframes dashDraw { from { stroke-dashoffset: 2000; } to { stroke-dashoffset: 0; } }
        @keyframes fadeInPoint { to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
