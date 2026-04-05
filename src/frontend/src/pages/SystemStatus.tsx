import { Color, Direction } from "../backend.d";
import type { TrafficState } from "../hooks/useTrafficSimulation";

interface SystemStatusProps {
  state: TrafficState;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function SystemStatus({ state }: SystemStatusProps) {
  const dirs = [Direction.north, Direction.east, Direction.west];

  const stats = [
    {
      label: "Total Violations",
      value: state.violations.length,
      color: "#E53E3E",
      icon: "🚨",
    },
    {
      label: "Active Emergencies",
      value: state.emergencies.filter((e) => e.active).length,
      color: "#F2C94C",
      icon: "⚠️",
    },
    {
      label: "Signal Cycles",
      value: state.cycles,
      color: "#2D73FF",
      icon: "🔄",
    },
    {
      label: "System Uptime",
      value: formatUptime(state.systemUptime),
      color: "#2ECC71",
      icon: "⏱️",
      isString: true,
    },
  ];

  const colorMap: Record<Color, { text: string; bg: string }> = {
    [Color.green]: { text: "#2ECC71", bg: "#152A1E" },
    [Color.yellow]: { text: "#F2C94C", bg: "#2A2415" },
    [Color.red]: { text: "#E53E3E", bg: "#6A1F2A" },
  };

  return (
    <main data-ocid="status.page" className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">System Status</h1>
        <p className="text-xs text-steel mt-0.5">
          Real-time operational metrics &amp; health dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            data-ocid={`status.${s.label.toLowerCase().replace(/\s/g, "-")}.card`}
            className="rounded-xl p-4 border"
            style={{ background: "#121C2E", borderColor: "#25344D" }}
          >
            <div className="text-xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>
              {(s as any).isString ? s.value : s.value}
            </div>
            <div className="text-xs text-steel mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Signal State Table */}
        <div
          className="rounded-xl border"
          style={{ background: "#121C2E", borderColor: "#25344D" }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid #25344D" }}
          >
            <h3 className="text-sm font-bold text-foreground">Signal State</h3>
          </div>
          <div className="p-3">
            <table className="w-full text-xs" data-ocid="status.signals.table">
              <thead>
                <tr style={{ borderBottom: "1px solid #25344D" }}>
                  <th className="text-left py-2 px-2 text-steel">Direction</th>
                  <th className="text-left py-2 px-2 text-steel">Signal</th>
                  <th className="text-left py-2 px-2 text-steel">Countdown</th>
                  <th className="text-left py-2 px-2 text-steel">Vehicles</th>
                  <th className="text-left py-2 px-2 text-steel">Density</th>
                </tr>
              </thead>
              <tbody>
                {dirs.map((dir, idx) => {
                  const sig = state.signals[dir];
                  const cs = colorMap[sig?.color ?? Color.red];
                  return (
                    <tr
                      key={dir}
                      data-ocid={`status.signal.row.${idx + 1}`}
                      style={{ borderBottom: "1px solid #1A2A4344" }}
                    >
                      <td className="py-2 px-2 capitalize font-semibold text-foreground">
                        {dir}
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                          style={{ background: cs.bg, color: cs.text }}
                        >
                          {sig?.color ?? "red"}
                        </span>
                      </td>
                      <td
                        className="py-2 px-2 font-mono"
                        style={{ color: cs.text }}
                      >
                        {sig?.countdown ?? 0}s
                      </td>
                      <td className="py-2 px-2 text-foreground">
                        {sig?.vehicleCount ?? 0}
                      </td>
                      <td className="py-2 px-2 capitalize text-steel">
                        {sig?.density ?? "low"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Health */}
        <div
          className="rounded-xl border"
          style={{ background: "#121C2E", borderColor: "#25344D" }}
        >
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid #25344D" }}
          >
            <h3 className="text-sm font-bold text-foreground">System Health</h3>
          </div>
          <div className="p-3 space-y-3">
            {[
              {
                label: "Backend Canister",
                status: "online",
                detail: "IC Mainnet",
              },
              {
                label: "AI Detection Module",
                status: "online",
                detail: "Camera + Noise",
              },
              {
                label: "Signal Controller",
                status: "online",
                detail: "3 directions",
              },
              {
                label: "Arduino Adapter",
                status: state.isEmergencyActive ? "active" : "standby",
                detail: "Serial COM",
              },
              {
                label: "Simulation Engine",
                status: "online",
                detail: "3s tick",
              },
              {
                label: "Emergency System",
                status: state.isEmergencyActive ? "alert" : "ready",
                detail: "Priority routing",
              },
            ].map((item, idx) => (
              <div
                key={item.label}
                data-ocid={`status.health.item.${idx + 1}`}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-steel">{item.detail}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.status === "alert"
                        ? "bg-signal-red animate-pulse"
                        : item.status === "active"
                          ? "bg-signal-yellow animate-pulse"
                          : item.status === "standby"
                            ? "bg-steel"
                            : "bg-signal-green animate-pulse"
                    }`}
                  />
                  <span
                    className="text-xs font-semibold capitalize"
                    style={{
                      color:
                        item.status === "alert"
                          ? "#E53E3E"
                          : item.status === "active"
                            ? "#F2C94C"
                            : item.status === "standby"
                              ? "#6A7A94"
                              : "#2ECC71",
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sensor Data */}
      <div
        className="rounded-xl border"
        style={{ background: "#121C2E", borderColor: "#25344D" }}
      >
        <div
          className="px-4 py-3"
          style={{ borderBottom: "1px solid #25344D" }}
        >
          <h3 className="text-sm font-bold text-foreground">Sensor Readings</h3>
        </div>
        <div className="p-3">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid #25344D" }}>
                <th className="text-left py-2 px-2 text-steel">Direction</th>
                <th className="text-left py-2 px-2 text-steel">Camera Count</th>
                <th className="text-left py-2 px-2 text-steel">Density %</th>
                <th className="text-left py-2 px-2 text-steel">Noise dB</th>
                <th className="text-left py-2 px-2 text-steel">Cam Amb.</th>
                <th className="text-left py-2 px-2 text-steel">Noise Amb.</th>
              </tr>
            </thead>
            <tbody>
              {dirs.map((dir, idx) => {
                const s = state.sensors[dir];
                return (
                  <tr
                    key={dir}
                    data-ocid={`status.sensor.row.${idx + 1}`}
                    style={{ borderBottom: "1px solid #1A2A4344" }}
                  >
                    <td className="py-2 px-2 capitalize font-semibold text-foreground">
                      {dir}
                    </td>
                    <td className="py-2 px-2 text-foreground">
                      {s?.cameraCount ?? 0}
                    </td>
                    <td className="py-2 px-2 text-foreground">
                      {s?.densityPercentage ?? 0}%
                    </td>
                    <td
                      className="py-2 px-2 font-mono font-bold"
                      style={{
                        color:
                          (s?.noiseDbLevel ?? 0) > 85
                            ? "#E53E3E"
                            : (s?.noiseDbLevel ?? 0) > 70
                              ? "#F2C94C"
                              : "#2ECC71",
                      }}
                    >
                      {s?.noiseDbLevel ?? 0}
                    </td>
                    <td className="py-2 px-2">
                      <span
                        style={{
                          color: s?.cameraAmbulance ? "#E53E3E" : "#2ECC71",
                        }}
                      >
                        {s?.cameraAmbulance ? "⚠ YES" : "No"}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span
                        style={{
                          color: s?.noiseAmbulance ? "#E53E3E" : "#2ECC71",
                        }}
                      >
                        {s?.noiseAmbulance ? "⚠ YES" : "No"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
