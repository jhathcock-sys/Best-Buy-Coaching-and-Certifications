

export interface MetricSparklineProps {
  dataPoints: number[];
  color?: string;
}

export default function MetricSparkline({ dataPoints = [], color = 'var(--bby-blue)' }: MetricSparklineProps) {
  if (!dataPoints || dataPoints.length === 0) {
    return <span className="text-xs text-muted" data-testid="sparkline-no-history">No history</span>;
  }
  
  const width = 110;
  const height = 26;

  let pointsToRender = [...dataPoints];
  if (pointsToRender.length === 1) {
    // Draw flat line
    pointsToRender = [pointsToRender[0], pointsToRender[0]];
  }

  const minVal = Math.min(...pointsToRender);
  const maxVal = Math.max(...pointsToRender);
  const valRange = maxVal - minVal || 1;

  const points = pointsToRender.map((val, idx) => {
    const x = (idx / (pointsToRender.length - 1)) * (width - 10) + 5;
    const y = height - ((val - minVal) / valRange) * (height - 8) - 4;
    return { x, y, val };
  });

  const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="flex-row align-center gap-sm" data-testid="metric-sparkline">
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="#fff"
            stroke={color}
            strokeWidth="1.5"
            className="cursor-pointer"
          >
            <title>{p.val}</title>
          </circle>
        ))}
      </svg>
      <span className="text-xs text-white font-semibold">
        {dataPoints[dataPoints.length - 1]}
      </span>
    </div>
  );
}

