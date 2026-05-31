'use client';

/**
 * Tiny inline trend chart — 7 data points, ~80×24px SVG. Used inside QCTile
 * to show 7-day history at a glance. Purple stroke, soft area fill below.
 */
interface QCSparklineProps {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
}

export function QCSparkline({ data, className, width = 80, height = 24 }: QCSparklineProps) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  // Map data to SVG path
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * (width - 2) + 1;
      const y = height - 2 - ((d - min) / range) * (height - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const pathD = `M ${points.split(' ').join(' L ')}`;
  // Filled area underneath
  const areaD = `${pathD} L ${(width - 1).toFixed(1)},${height - 1} L 1,${height - 1} Z`;

  // Last point indicator
  const lastX = (((data.length - 1) / (data.length - 1)) * (width - 2) + 1).toFixed(1);
  const lastY = (height - 2 - ((data[data.length - 1] - min) / range) * (height - 4)).toFixed(1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="qc-sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a4df8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7a4df8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#qc-sparkline-fill)" />
      <path
        d={pathD}
        fill="none"
        stroke="#7a4df8"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r="1.8" fill="#7a4df8" />
    </svg>
  );
}
