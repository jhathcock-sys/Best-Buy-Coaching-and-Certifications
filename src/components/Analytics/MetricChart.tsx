import { GenerativeChartConfig } from '../../types';

interface Props {
  config: GenerativeChartConfig;
}

export function MetricChart({ config }: Props) {
  if (!config?.dataPoints || !Array.isArray(config.dataPoints)) return null;

  const { title, narrativeSummary, dataPoints, format } = config;

  const formatValue = (val: number) => {
    if (format === 'currency') return `$${val.toLocaleString()}`;
    if (format === 'percentage') return `${val}%`;
    return val.toLocaleString();
  };

  return (
    <div className="border-glass rounded-xl p-lg flex-column gap-lg bg-black-alpha-20" data-testid="metric-chart-container">
      <h3 className="text-2xl font-bold text-white m-0" data-testid="metric-chart-title">{title}</h3>
      <p className="text-secondary text-lg m-0" data-testid="metric-chart-summary">{narrativeSummary}</p>
      <div className="flex-row flex-wrap gap-xl mt-md" data-testid="metric-chart-data-points">
        {dataPoints.map((dp, i) => (
          <div key={i} className="flex-column gap-sm p-xl flex-1 rounded-lg border-glass bg-white-alpha-02 min-w-[200px]" data-testid={`metric-chart-point-${i}`}>
            <span className="text-sm text-secondary uppercase tracking-widest">{dp.label}</span>
            <span className="text-5xl font-bold" style={{ color: dp.colorAccent || 'var(--bby-blue)', textShadow: `0 0 20px ${dp.colorAccent || 'var(--bby-blue)'}40` }} data-testid={`metric-chart-value-${i}`}>
              {formatValue(dp.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
