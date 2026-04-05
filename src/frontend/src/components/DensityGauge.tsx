import { Density } from "../backend.d";

interface DensityGaugeProps {
  direction: string;
  density: Density;
  percentage: number;
  vehicleCount: number;
}

function getArcColor(density: Density): string {
  if (density === Density.high) return "#E53E3E";
  if (density === Density.medium) return "#F2C94C";
  return "#2ECC71";
}

function getDensityLabel(density: Density): string {
  if (density === Density.high) return "HIGH";
  if (density === Density.medium) return "MODERATE";
  return "LOW";
}

export function DensityGauge({
  direction,
  density,
  percentage,
  vehicleCount,
}: DensityGaugeProps) {
  const r = 38;
  const cx = 52;
  const cy = 52;
  const color = getArcColor(density);
  const label = getDensityLabel(density);

  // Semi-circle arc: starts at 180deg, ends at 0deg
  const startX = cx - r;
  const startY = cy;
  const endX = cx + r;
  const endY = cy;

  // Compute endpoint of filled arc
  const angle = Math.PI - (percentage / 100) * Math.PI;
  const fillEndX = cx + r * Math.cos(angle);
  const fillEndY = cy - r * Math.sin(angle);

  const labelColors: Record<string, string> = {
    HIGH: "text-signal-red",
    MODERATE: "text-signal-yellow",
    LOW: "text-signal-green",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs text-steel font-semibold tracking-widest uppercase">
        {direction}
      </div>
      <div className="relative">
        <svg
          width="104"
          height="62"
          viewBox="0 0 104 62"
          role="img"
          aria-label={`${direction} traffic density: ${percentage}%`}
        >
          {/* Background arc */}
          <path
            d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`}
            fill="none"
            stroke="#1A2A43"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Filled arc */}
          {percentage > 0 && (
            <path
              d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${fillEndX} ${fillEndY}`}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
            />
          )}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-lg font-bold text-foreground leading-none">
            {percentage}%
          </span>
          <span className="text-xs text-steel leading-none">
            {vehicleCount}v
          </span>
        </div>
      </div>
      <div
        className={`text-xs font-bold tracking-widest ${labelColors[label] ?? "text-steel"}`}
      >
        {label}
      </div>
    </div>
  );
}
