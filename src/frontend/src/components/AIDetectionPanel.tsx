import { Direction } from "../backend.d";
import type { SensorData } from "../hooks/useTrafficSimulation";

interface AIDetectionPanelProps {
  sensors: Record<Direction, SensorData>;
  isEmergencyActive: boolean;
}

function NoiseWaveform({ dbLevel }: { dbLevel: number }) {
  const bars = 20;
  const normalized = dbLevel / 105;

  return (
    <div className="flex items-end gap-[2px] h-8">
      {Array.from({ length: bars }, (_, i) => {
        const base = 0.2 + Math.sin((i / bars) * Math.PI * 2) * 0.3;
        const h = Math.max(10, Math.round((base + normalized * 0.5) * 32));
        const color =
          dbLevel > 85 ? "#E53E3E" : dbLevel > 70 ? "#F2C94C" : "#2ECC71";
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static waveform bars
            key={i}
            className="waveform-bar flex-1 rounded-sm transition-all duration-300"
            style={{
              height: h,
              background: color,
              animationDelay: `${i * 0.03}s`,
              opacity: 0.7 + normalized * 0.3,
            }}
          />
        );
      })}
    </div>
  );
}

function NoiseLabel({ db }: { db: number }) {
  if (db > 85)
    return <span className="text-signal-red font-bold text-xs">HEAVY</span>;
  if (db > 70)
    return (
      <span className="text-signal-yellow font-bold text-xs">NORMAL+</span>
    );
  return <span className="text-signal-green font-bold text-xs">LOW</span>;
}

export function AIDetectionPanel({
  sensors,
  isEmergencyActive: _isEmergencyActive,
}: AIDetectionPanelProps) {
  const directions = [Direction.north, Direction.east, Direction.west];

  const maxNoiseSensor = directions.reduce((best, dir) => {
    const s = sensors[dir];
    return s && s.noiseDbLevel > (sensors[best]?.noiseDbLevel ?? 0)
      ? dir
      : best;
  }, Direction.north);

  const noiseSensor = sensors[maxNoiseSensor];
  const totalVehicles = directions.reduce(
    (sum, dir) => sum + (sensors[dir]?.cameraCount ?? 0),
    0,
  );
  const avgDensity =
    directions.reduce(
      (sum, dir) => sum + (sensors[dir]?.densityPercentage ?? 0),
      0,
    ) / 3;

  const ambulanceDir = directions.find(
    (d) => sensors[d]?.cameraAmbulance && sensors[d]?.noiseAmbulance,
  );

  const vehicleSlots = Array.from(
    {
      length: Math.min(totalVehicles > 40 ? 3 : totalVehicles > 20 ? 2 : 1, 3),
    },
    (_, i) => i,
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Camera Feed Panel */}
      <div
        className="rounded-xl p-3 border"
        style={{ background: "#121C2E", borderColor: "#25344D" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accentBlue animate-pulse" />
            <span className="text-xs font-semibold text-steel tracking-wider uppercase">
              Camera AI
            </span>
          </div>
          {ambulanceDir && (
            <span className="text-xs font-bold text-signal-red blink">AMB</span>
          )}
        </div>

        <div
          className="scanline rounded-lg mb-2 relative overflow-hidden"
          style={{ background: "#0B1220", height: 64 }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(#25344D44 1px, transparent 1px), linear-gradient(90deg, #25344D44 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          {vehicleSlots.map((i) => (
            <div
              key={i}
              className="absolute w-4 h-6 rounded-sm"
              style={{
                background: ambulanceDir ? "#E53E3E" : "#2D73FF",
                left: 12 + i * 22,
                top: "50%",
                transform: "translateY(-50%)",
                boxShadow: ambulanceDir
                  ? "0 0 6px #E53E3E"
                  : "0 0 6px #2D73FF88",
                opacity: 0.9,
              }}
            />
          ))}
          <svg
            className="absolute right-2 top-2"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              fill="none"
              stroke="#2D73FF88"
              strokeWidth="1"
            />
            <line
              x1="8"
              y1="2"
              x2="8"
              y2="4"
              stroke="#2D73FF"
              strokeWidth="1"
            />
            <line
              x1="8"
              y1="12"
              x2="8"
              y2="14"
              stroke="#2D73FF"
              strokeWidth="1"
            />
            <line
              x1="2"
              y1="8"
              x2="4"
              y2="8"
              stroke="#2D73FF"
              strokeWidth="1"
            />
            <line
              x1="12"
              y1="8"
              x2="14"
              y2="8"
              stroke="#2D73FF"
              strokeWidth="1"
            />
          </svg>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-steel">Vehicles</span>
            <span className="text-foreground font-semibold">
              {totalVehicles}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-steel">Avg Density</span>
            <span className="text-foreground font-semibold">
              {Math.round(avgDensity)}%
            </span>
          </div>
          {directions.map((dir) => (
            <div key={dir} className="flex justify-between text-xs">
              <span className="text-steel capitalize">{dir}</span>
              <span
                className="font-semibold"
                style={{
                  color: sensors[dir]?.cameraAmbulance ? "#E53E3E" : "#9AA9C0",
                }}
              >
                {sensors[dir]?.cameraAmbulance
                  ? "🚑 AMB"
                  : `${sensors[dir]?.cameraCount ?? 0}v`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Noise Sensor Panel */}
      <div
        className="rounded-xl p-3 border"
        style={{ background: "#121C2E", borderColor: "#25344D" }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background:
                  (noiseSensor?.noiseDbLevel ?? 0) > 85 ? "#E53E3E" : "#2ECC71",
                boxShadow:
                  (noiseSensor?.noiseDbLevel ?? 0) > 85
                    ? "0 0 6px #E53E3E"
                    : "0 0 6px #2ECC71",
              }}
            />
            <span className="text-xs font-semibold text-steel tracking-wider uppercase">
              Noise Sensor
            </span>
          </div>
          <NoiseLabel db={noiseSensor?.noiseDbLevel ?? 60} />
        </div>

        <div className="mb-2">
          <NoiseWaveform dbLevel={noiseSensor?.noiseDbLevel ?? 60} />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-steel">Peak dB</span>
            <span
              className="font-bold"
              style={{
                color:
                  (noiseSensor?.noiseDbLevel ?? 0) > 85
                    ? "#E53E3E"
                    : (noiseSensor?.noiseDbLevel ?? 0) > 70
                      ? "#F2C94C"
                      : "#2ECC71",
              }}
            >
              {noiseSensor?.noiseDbLevel ?? 0} dB
            </span>
          </div>
          {directions.map((dir) => (
            <div key={dir} className="flex justify-between text-xs">
              <span className="text-steel capitalize">{dir}</span>
              <span
                className="font-semibold"
                style={{
                  color: sensors[dir]?.noiseAmbulance ? "#E53E3E" : "#9AA9C0",
                }}
              >
                {sensors[dir]?.noiseAmbulance
                  ? "⚠ HIGH"
                  : `${sensors[dir]?.noiseDbLevel ?? 0}dB`}
              </span>
            </div>
          ))}
          <div
            className="mt-1 pt-1 border-t"
            style={{ borderColor: "#25344D" }}
          >
            <div className="flex justify-between text-xs">
              <span className="text-steel">Threshold</span>
              <span className="text-steel">85 dB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
