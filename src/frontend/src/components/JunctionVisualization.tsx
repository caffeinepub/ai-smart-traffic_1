import { Color, Direction } from "../backend.d";
import type { Density } from "../backend.d";
import type { SignalState } from "../hooks/useTrafficSimulation";

interface JunctionVisualizationProps {
  signals: Record<Direction, SignalState>;
  isEmergencyActive: boolean;
  emergencyDirection?: Direction;
}

function TrafficSignalPole({
  x,
  y,
  state,
  label,
  labelPos,
}: {
  x: number;
  y: number;
  state: SignalState;
  label: string;
  labelPos: "top" | "bottom" | "left" | "right";
}) {
  const colors = [Color.red, Color.yellow, Color.green];
  const colorValues: Record<
    Color,
    { active: string; inactive: string; glow: string }
  > = {
    [Color.red]: {
      active: "#E53E3E",
      inactive: "#2A1515",
      glow: "0 0 10px #E53E3E88",
    },
    [Color.yellow]: {
      active: "#F2C94C",
      inactive: "#2A2415",
      glow: "0 0 10px #F2C94C88",
    },
    [Color.green]: {
      active: "#2ECC71",
      inactive: "#152A1E",
      glow: "0 0 10px #2ECC7188",
    },
  };

  const W = 18;
  const H = 52;
  const dotR = 6;

  let lx = x + W / 2;
  let ly = y + H / 2;
  let anchor = "middle";

  if (labelPos === "top") {
    ly = y - 6;
  } else if (labelPos === "bottom") {
    ly = y + H + 14;
  } else if (labelPos === "left") {
    lx = x - 6;
    anchor = "end";
  } else if (labelPos === "right") {
    lx = x + W + 6;
    anchor = "start";
  }

  return (
    <g>
      {/* Housing */}
      <rect
        x={x}
        y={y}
        width={W}
        height={H}
        rx={4}
        fill="#121C2E"
        stroke="#25344D"
        strokeWidth={1.5}
      />
      {/* Lights */}
      {colors.map((c, i) => {
        const isActive = state.color === c;
        const dotCy = y + 10 + i * 16;
        return (
          <circle
            key={c}
            cx={x + W / 2}
            cy={dotCy}
            r={dotR}
            fill={isActive ? colorValues[c].active : colorValues[c].inactive}
            style={
              isActive ? { filter: `drop-shadow(${colorValues[c].glow})` } : {}
            }
          />
        );
      })}
      {/* Label */}
      <text
        x={lx}
        y={ly}
        textAnchor={anchor as "middle" | "end" | "start"}
        fontSize={10}
        fontWeight={600}
        fill="#9AA9C0"
        fontFamily="Inter, sans-serif"
        letterSpacing={1}
      >
        {label}
      </text>
      {/* Vehicle count badge */}
      <text
        x={x + W / 2}
        y={y + H + 26}
        textAnchor="middle"
        fontSize={9}
        fill="#E9EEF7"
        fontFamily="Inter, sans-serif"
      >
        {state.vehicleCount}v
      </text>
    </g>
  );
}

export function JunctionVisualization({
  signals,
  isEmergencyActive,
  emergencyDirection,
}: JunctionVisualizationProps) {
  const W = 420;
  const H = 340;
  const CX = W / 2;
  const CY = H / 2;
  const ROAD_W = 70;
  const ISLAND_W = 50;

  const roadColor = "#1A2A43";
  const laneColor = "#25344D";
  const centerColor = "#162338";

  // Animated cars
  const northGreen = signals[Direction.north]?.color === Color.green;
  const eastGreen = signals[Direction.east]?.color === Color.green;
  const westGreen = signals[Direction.west]?.color === Color.green;

  return (
    <div
      className="relative w-full"
      style={{ background: "#0B1220", borderRadius: 12, overflow: "hidden" }}
    >
      {/* Countdown HUD */}
      <div
        className="absolute top-3 right-3 z-10 text-xs font-mono rounded-lg px-3 py-2"
        style={{ background: "#121C2ECC", border: "1px solid #25344D" }}
      >
        <div className="text-steel text-[10px] font-semibold mb-1 tracking-wider">
          COUNTDOWN
        </div>
        {([Direction.north, Direction.east, Direction.west] as Direction[]).map(
          (dir) => {
            const s = signals[dir];
            const colorMap: Record<Color, string> = {
              [Color.green]: "#2ECC71",
              [Color.yellow]: "#F2C94C",
              [Color.red]: "#E53E3E",
            };
            return (
              <div key={dir} className="flex items-center gap-2">
                <span className="text-steel capitalize text-[9px] w-6">
                  {dir[0].toUpperCase()}
                </span>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: s ? colorMap[s.color] : "#333" }}
                />
                <span
                  className="font-bold"
                  style={{ color: s ? colorMap[s.color] : "#ccc" }}
                >
                  {s?.countdown ?? 0}s
                </span>
              </div>
            );
          },
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block", maxHeight: 340 }}
        role="img"
        aria-label="3-way traffic junction visualization"
      >
        {/* Background */}
        <rect width={W} height={H} fill="#0B1220" />

        {/* Grid blueprint lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            // biome-ignore lint/suspicious/noArrayIndexKey: static grid lines
            key={`hg${i}`}
            x1={0}
            y1={i * 30}
            x2={W}
            y2={i * 30}
            stroke="#25344D22"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <line
            // biome-ignore lint/suspicious/noArrayIndexKey: static grid lines
            key={`vg${i}`}
            x1={i * 30}
            y1={0}
            x2={i * 30}
            y2={H}
            stroke="#25344D22"
            strokeWidth={1}
          />
        ))}

        {/* North road */}
        <rect
          x={CX - ROAD_W / 2}
          y={0}
          width={ROAD_W}
          height={CY - ISLAND_W / 2}
          fill={roadColor}
        />
        <line
          x1={CX}
          y1={0}
          x2={CX}
          y2={CY - ISLAND_W / 2}
          stroke={laneColor}
          strokeWidth={1}
          strokeDasharray="8,6"
        />

        {/* East road */}
        <rect
          x={CX + ISLAND_W / 2}
          y={CY - ROAD_W / 2}
          width={W - CX - ISLAND_W / 2}
          height={ROAD_W}
          fill={roadColor}
        />
        <line
          x1={CX + ISLAND_W / 2}
          y1={CY}
          x2={W}
          y2={CY}
          stroke={laneColor}
          strokeWidth={1}
          strokeDasharray="8,6"
        />

        {/* West road */}
        <rect
          x={0}
          y={CY - ROAD_W / 2}
          width={CX - ISLAND_W / 2}
          height={ROAD_W}
          fill={roadColor}
        />
        <line
          x1={0}
          y1={CY}
          x2={CX - ISLAND_W / 2}
          y2={CY}
          stroke={laneColor}
          strokeWidth={1}
          strokeDasharray="8,6"
        />

        {/* Center intersection box */}
        <rect
          x={CX - ISLAND_W / 2}
          y={CY - ISLAND_W / 2}
          width={ISLAND_W}
          height={ISLAND_W}
          fill={centerColor}
          stroke={laneColor}
          strokeWidth={1}
        />
        <line
          x1={CX - ISLAND_W / 2}
          y1={CY}
          x2={CX + ISLAND_W / 2}
          y2={CY}
          stroke={laneColor}
          strokeWidth={1}
        />
        <line
          x1={CX}
          y1={CY - ISLAND_W / 2}
          x2={CX}
          y2={CY + ISLAND_W / 2}
          stroke={laneColor}
          strokeWidth={1}
        />

        {/* Stop lines */}
        <line
          x1={CX - ROAD_W / 2}
          y1={CY - ISLAND_W / 2 - 4}
          x2={CX + ROAD_W / 2}
          y2={CY - ISLAND_W / 2 - 4}
          stroke="#E9EEF7"
          strokeWidth={2}
          opacity={0.6}
        />
        <line
          x1={CX + ISLAND_W / 2 + 4}
          y1={CY - ROAD_W / 2}
          x2={CX + ISLAND_W / 2 + 4}
          y2={CY + ROAD_W / 2}
          stroke="#E9EEF7"
          strokeWidth={2}
          opacity={0.6}
        />
        <line
          x1={CX - ISLAND_W / 2 - 4}
          y1={CY - ROAD_W / 2}
          x2={CX - ISLAND_W / 2 - 4}
          y2={CY + ROAD_W / 2}
          stroke="#E9EEF7"
          strokeWidth={2}
          opacity={0.6}
        />

        {/* Direction labels */}
        <text
          x={CX + ROAD_W / 2 + 8}
          y={30}
          fill="#9AA9C0"
          fontSize={11}
          fontFamily="Inter"
          fontWeight={600}
        >
          N
        </text>
        <text
          x={CX + ROAD_W / 2 + 8}
          y={43}
          fill="#9AA9C0"
          fontSize={11}
          fontFamily="Inter"
        >
          ↑
        </text>
        <text
          x={W - 32}
          y={CY - ROAD_W / 2 - 8}
          fill="#9AA9C0"
          fontSize={11}
          fontFamily="Inter"
          fontWeight={600}
        >
          E →
        </text>
        <text
          x={8}
          y={CY - ROAD_W / 2 - 8}
          fill="#9AA9C0"
          fontSize={11}
          fontFamily="Inter"
          fontWeight={600}
        >
          ← W
        </text>

        {/* Animated cars - North */}
        {northGreen && (
          <rect
            x={CX - 12}
            y={CY - ISLAND_W / 2 - 40}
            width={14}
            height={22}
            rx={3}
            fill="#2D73FF"
            style={{ filter: "drop-shadow(0 0 4px #2D73FF88)" }}
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,30; 0,-80"
              dur="3s"
              repeatCount="indefinite"
            />
          </rect>
        )}

        {/* Animated cars - East */}
        {eastGreen && (
          <rect
            x={CX + ISLAND_W / 2 + 20}
            y={CY - 8}
            width={22}
            height={14}
            rx={3}
            fill="#2ECC71"
            style={{ filter: "drop-shadow(0 0 4px #2ECC7188)" }}
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="-40,0; 120,0"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </rect>
        )}

        {/* Animated cars - West */}
        {westGreen && (
          <rect
            x={CX - ISLAND_W / 2 - 42}
            y={CY - 6}
            width={22}
            height={14}
            rx={3}
            fill="#F2C94C"
            style={{ filter: "drop-shadow(0 0 4px #F2C94C88)" }}
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="50,0; -130,0"
              dur="4s"
              repeatCount="indefinite"
            />
          </rect>
        )}

        {/* Emergency vehicle */}
        {isEmergencyActive && emergencyDirection && (
          <rect
            x={
              emergencyDirection === Direction.north
                ? CX - 8
                : emergencyDirection === Direction.east
                  ? CX + ISLAND_W / 2 + 10
                  : 20
            }
            y={
              emergencyDirection === Direction.north
                ? CY - ISLAND_W / 2 - 30
                : CY - 12
            }
            width={emergencyDirection === Direction.north ? 16 : 28}
            height={emergencyDirection === Direction.north ? 28 : 16}
            rx={3}
            fill="#E53E3E"
            style={{ filter: "drop-shadow(0 0 8px #E53E3E)" }}
          >
            <animate
              attributeName="opacity"
              values="1;0.4;1"
              dur="0.6s"
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="translate"
              values={
                emergencyDirection === Direction.north
                  ? "0,20; 0,-100"
                  : emergencyDirection === Direction.east
                    ? "-50,0; 200,0"
                    : "80,0; -200,0"
              }
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
        )}

        {/* Traffic signal poles */}
        <TrafficSignalPole
          x={CX + ROAD_W / 2 + 8}
          y={CY - ISLAND_W / 2 - 60}
          state={
            signals[Direction.north] ?? {
              color: Color.red,
              density: "low" as Density,
              countdown: 0,
              vehicleCount: 0,
            }
          }
          label="NORTH"
          labelPos="top"
        />
        <TrafficSignalPole
          x={CX + ISLAND_W / 2 + 10}
          y={CY - ROAD_W / 2 - 70}
          state={
            signals[Direction.east] ?? {
              color: Color.red,
              density: "low" as Density,
              countdown: 0,
              vehicleCount: 0,
            }
          }
          label="EAST"
          labelPos="right"
        />
        <TrafficSignalPole
          x={CX - ISLAND_W / 2 - 38}
          y={CY + ROAD_W / 2 + 8}
          state={
            signals[Direction.west] ?? {
              color: Color.red,
              density: "low" as Density,
              countdown: 0,
              vehicleCount: 0,
            }
          }
          label="WEST"
          labelPos="bottom"
        />
      </svg>
    </div>
  );
}
