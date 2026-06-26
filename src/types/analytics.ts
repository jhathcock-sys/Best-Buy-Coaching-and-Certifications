export interface DataPoint {
  label: string;
  value: number;
  colorAccent?: string;
}

export interface GenerativeChartConfig {
  chartType: 'bar' | 'metric' | 'line';
  title: string;
  narrativeSummary: string;
  dataPoints: DataPoint[];
  format: 'currency' | 'number' | 'percentage';
}
