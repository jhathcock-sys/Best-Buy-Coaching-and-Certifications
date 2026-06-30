import { GenerativeChartConfig } from '../../types';
import { MetricChart } from './MetricChart';
import { BarChart } from './BarChart';

interface Props {
  config: GenerativeChartConfig;
}

export function DynamicChartRenderer({ config }: Props) {
  if (!config?.dataPoints || !Array.isArray(config.dataPoints)) return null;

  switch (config.chartType) {
    case 'metric':
      return <MetricChart config={config} />;
    case 'bar':
    case 'line':
    default:
      return <BarChart config={config} />;
  }
}
