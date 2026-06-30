import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DynamicChartRenderer } from '../DynamicChartRenderer';
import { GenerativeChartConfig } from '../../../types';

describe('DynamicChartRenderer', () => {
  it('renders nothing when config or dataPoints is null', () => {
    const { container } = render(<DynamicChartRenderer config={null as any} />);
    expect(container.firstChild).toBeNull();
    
    const configWithoutDataPoints = { chartType: 'metric' } as GenerativeChartConfig;
    const { container: container2 } = render(<DynamicChartRenderer config={configWithoutDataPoints} />);
    expect(container2.firstChild).toBeNull();
  });

  it('renders MetricChart when chartType is metric', () => {
    const config: GenerativeChartConfig = {
      chartType: 'metric',
      title: 'Test Metric',
      narrativeSummary: 'Summary',
      dataPoints: [{ label: 'Point 1', value: 10 }],
      format: 'number'
    };
    render(<DynamicChartRenderer config={config} />);
    expect(screen.getByTestId('metric-chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('metric-chart-title')).toHaveTextContent('Test Metric');
  });

  it('renders BarChart when chartType is bar', () => {
    const config: GenerativeChartConfig = {
      chartType: 'bar',
      title: 'Test Bar',
      narrativeSummary: 'Summary',
      dataPoints: [{ label: 'Point 1', value: 10 }],
      format: 'number'
    };
    render(<DynamicChartRenderer config={config} />);
    expect(screen.getByTestId('bar-chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart-title')).toHaveTextContent('Test Bar');
  });

  it('renders BarChart as default fallback for line chartType', () => {
    const config: GenerativeChartConfig = {
      chartType: 'line',
      title: 'Test Line',
      narrativeSummary: 'Summary',
      dataPoints: [{ label: 'Point 1', value: 10 }],
      format: 'number'
    };
    render(<DynamicChartRenderer config={config} />);
    expect(screen.getByTestId('bar-chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart-title')).toHaveTextContent('Test Line');
  });
});
