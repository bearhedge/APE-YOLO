interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  testId?: string;
}

export function MiniChart({ data, width = 200, height = 48, color = '#10B981', testId }: MiniChartProps) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="sparkline-container" data-testid={testId}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}
