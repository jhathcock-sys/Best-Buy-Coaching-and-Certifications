import { GenerativeChartConfig } from '../../types';

interface Props {
  config: GenerativeChartConfig;
}

export function BarChart({ config }: Props) {
  if (!config?.dataPoints || !Array.isArray(config.dataPoints)) return null;

  const { title, narrativeSummary, dataPoints, format } = config;

  const formatValue = (val: number) => {
    if (format === 'currency') return `$${val.toLocaleString()}`;
    if (format === 'percentage') return `${val}%`;
    return val.toLocaleString();
  };

  const maxValue = Math.max(1, ...dataPoints.map(d => d.value));

  return (
    <div className="border-glass rounded-xl p-lg bg-black-alpha-20 w-full" data-testid="bar-chart-container">
      <div className="mb-xl flex-column gap-sm">
        <h3 className="text-2xl font-bold text-white m-0" data-testid="bar-chart-title">{title}</h3>
        <p className="text-secondary text-lg m-0" data-testid="bar-chart-summary">{narrativeSummary}</p>
      </div>

      <div className="flex-row align-end gap-md pt-xl mt-xl h-300px" data-testid="bar-chart-data-points">
        {dataPoints.map((dp, i) => {
          const heightPct = Math.max(5, (dp.value / maxValue) * 100);
          const color = dp.colorAccent || 'var(--bby-blue)';
          
          return (
            <div key={i} className="flex-1 flex-column align-center gap-sm h-full" data-testid={`bar-chart-point-${i}`}>
              <div className="relative w-full h-full flex-row align-end justify-center">
                <div 
                  className="w-full rounded-t-md transition-all duration-500 max-w-[80px]"
                  style={{ 
                    height: `${heightPct}%`, 
                    background: `linear-gradient(to top, ${color}40, ${color})`
                  }} 
                  title={`${dp.label}: ${formatValue(dp.value)}`}
                  data-testid={`bar-chart-bar-${i}`}
                />
                <span 
                  className="absolute text-sm font-bold text-white whitespace-nowrap" 
                  style={{ top: `calc(${100 - heightPct}% - 1.75rem)` }}
                  data-testid={`bar-chart-value-${i}`}
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
