import { GenerativeChartConfig } from '../../types';

interface Props {
  config: GenerativeChartConfig;
}

export function DynamicChartRenderer({ config }: Props) {
  const { chartType, title, narrativeSummary, dataPoints, format } = config;

  const formatValue = (val: number) => {
    if (format === 'currency') return `$${val.toLocaleString()}`;
    if (format === 'percentage') return `${val}%`;
    return val.toLocaleString();
  };

  if (chartType === 'metric') {
    return (
      <div className="border-glass rounded-xl p-lg flex-column gap-lg bg-black-alpha-20">
        <h3 className="text-2xl font-bold text-white m-0">{title}</h3>
        <p className="text-secondary text-lg m-0">{narrativeSummary}</p>
        <div className="flex-row flex-wrap gap-xl mt-md">
          {dataPoints.map((dp, i) => (
            <div key={i} className="flex-column gap-sm p-xl flex-1 rounded-lg border-glass bg-white-alpha-02" style={{ minWidth: '200px' }}>
              <span className="text-sm text-secondary uppercase tracking-widest">{dp.label}</span>
              <span className="text-5xl font-bold" style={{ color: dp.colorAccent || 'var(--bby-blue)', textShadow: `0 0 20px ${dp.colorAccent || 'var(--bby-blue)'}40` }}>
                {formatValue(dp.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Bar chart (default fallback for 'bar' and 'line')
  const maxValue = Math.max(1, ...dataPoints.map(d => d.value));

  return (
    <div className="border-glass rounded-xl p-lg bg-black-alpha-20 w-full">
      <div className="mb-xl flex-column gap-sm">
        <h3 className="text-2xl font-bold text-white m-0">{title}</h3>
        <p className="text-secondary text-lg m-0">{narrativeSummary}</p>
      </div>

      <div className="flex-row align-end gap-md pt-xl mt-xl h-300px">
        {dataPoints.map((dp, i) => {
          const heightPct = Math.max(5, (dp.value / maxValue) * 100);
          const color = dp.colorAccent || 'var(--bby-blue)';
          
          return (
            <div key={i} className="flex-1 flex-column align-center gap-sm h-full">
              <div className="relative w-full h-full flex-row align-end justify-center">
                <div 
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{ 
                    maxWidth: '80px',
                    height: `${heightPct}%`, 
                    background: `linear-gradient(to top, ${color}40, ${color})`
                  }} 
                  title={`${dp.label}: ${formatValue(dp.value)}`}
                />
                <span 
                  className="absolute text-sm font-bold text-white whitespace-nowrap" 
                  style={{ top: `calc(${100 - heightPct}% - 1.75rem)` }}
                >
                  {formatValue(dp.value)}
                </span>
              </div>
              <span className="text-sm text-muted text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-xs">
                {dp.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
