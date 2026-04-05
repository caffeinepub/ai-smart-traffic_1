import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Color, Direction } from "../backend.d";
import { AIDetectionPanel } from "../components/AIDetectionPanel";
import { DensityGauge } from "../components/DensityGauge";
import { EmergencyBanner } from "../components/EmergencyBanner";
import { JunctionVisualization } from "../components/JunctionVisualization";
import { ViolationTable } from "../components/ViolationTable";
import type { TrafficState } from "../hooks/useTrafficSimulation";

interface DashboardProps {
  state: TrafficState;
  setSignalColor: (dir: Direction, color: Color) => void;
  triggerEmergency: (dir: Direction, vehicleId: string) => Promise<void>;
  clearEmergency: (id: number) => Promise<void>;
  setAiMode: (val: boolean) => void;
}

function AdminControlPanel({
  state,
  setSignalColor,
  triggerEmergency,
  clearEmergency,
  setAiMode,
}: DashboardProps) {
  const [picker, setPicker] = useState<Direction | null>(null);
  const dirs = [Direction.north, Direction.east, Direction.west];

  const colorStyle: Record<Color, { bg: string; text: string }> = {
    [Color.green]: { bg: "#1F8F55", text: "#2ECC71" },
    [Color.yellow]: { bg: "#2A2415", text: "#F2C94C" },
    [Color.red]: { bg: "#6A1F2A", text: "#E53E3E" },
  };

  return (
    <div
      className="rounded-xl p-4 border mb-3"
      style={{ background: "#121C2E", borderColor: "#25344D" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground tracking-wide">
          Admin Control Panel
        </h3>
        <div className="flex items-center gap-2" data-ocid="admin.toggle">
          <Switch
            id="ai-mode"
            checked={state.aiMode}
            onCheckedChange={setAiMode}
            data-ocid="admin.switch"
          />
          <Label
            htmlFor="ai-mode"
            className="text-xs text-steel cursor-pointer"
          >
            AI Mode
          </Label>
        </div>
      </div>

      <div className="text-xs text-steel mb-2 font-medium">
        Manual Signal Override
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {dirs.map((dir) => {
          const sig = state.signals[dir];
          const cs = colorStyle[sig?.color ?? Color.red];
          return (
            <div key={dir} className="relative">
              <button
                type="button"
                data-ocid={`admin.${dir}.button`}
                onClick={() => setPicker(picker === dir ? null : dir)}
                className="w-full rounded-lg py-2 px-1 text-xs font-bold transition-all border uppercase tracking-wide"
                style={{
                  background: cs.bg,
                  color: cs.text,
                  borderColor: `${cs.text}44`,
                }}
              >
                <div className="capitalize mb-0.5">{dir}</div>
                <div className="opacity-80">
                  {sig?.color?.toUpperCase() ?? "RED"}
                </div>
              </button>
              {picker === dir && (
                <div
                  className="absolute top-full left-0 right-0 z-20 rounded-lg mt-1 p-1 border"
                  style={{ background: "#1A2A43", borderColor: "#25344D" }}
                >
                  {([Color.green, Color.yellow, Color.red] as Color[]).map(
                    (c) => (
                      <button
                        type="button"
                        key={c}
                        data-ocid={`admin.${dir}.${c}_button`}
                        onClick={() => {
                          setSignalColor(dir, c);
                          setPicker(null);
                        }}
                        className="w-full text-xs font-semibold py-1 rounded px-2 mb-1 last:mb-0 uppercase tracking-wide transition-colors"
                        style={{
                          background: colorStyle[c].bg,
                          color: colorStyle[c].text,
                          border: `1px solid ${colorStyle[c].text}44`,
                        }}
                      >
                        {c}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-steel mb-2 font-medium">
        Emergency Controls
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {dirs.map((dir) => (
          <button
            type="button"
            key={dir}
            data-ocid={`emergency.${dir}.open_modal_button`}
            onClick={() =>
              triggerEmergency(
                dir,
                `AMB-MANUAL-${Date.now().toString().slice(-4)}`,
              )
            }
            className="text-xs font-semibold py-1.5 rounded-lg uppercase border transition-colors"
            style={{
              background: "#6A1F2A",
              color: "#F87171",
              borderColor: "#B53A3A44",
            }}
          >
            {dir[0].toUpperCase()} EM
          </button>
        ))}
      </div>
      {state.activeEmergency && (
        <button
          type="button"
          data-ocid="emergency.clear_button"
          onClick={() => clearEmergency(state.activeEmergency!.id)}
          className="w-full text-xs font-semibold py-1.5 rounded-lg border transition-colors"
          style={{
            background: "#152A1E",
            color: "#2ECC71",
            borderColor: "#2ECC7144",
          }}
        >
          ✓ Clear Active Emergency
        </button>
      )}
    </div>
  );
}

export function Dashboard({
  state,
  setSignalColor,
  triggerEmergency,
  clearEmergency,
  setAiMode,
}: DashboardProps) {
  const dirs = [Direction.north, Direction.east, Direction.west];
  const recentEmergencies = state.emergencies.slice(0, 5);

  return (
    <main data-ocid="dashboard.page" className="p-4 space-y-0">
      {state.isEmergencyActive && state.activeEmergency && (
        <EmergencyBanner
          emergency={state.activeEmergency}
          onClear={clearEmergency}
        />
      )}

      <div className="grid grid-cols-[1fr_300px] gap-4">
        {/* LEFT COLUMN */}
        <div className="space-y-4 min-w-0">
          <div
            className="rounded-xl border overflow-hidden"
            style={{ background: "#121C2E", borderColor: "#25344D" }}
          >
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid #25344D" }}
            >
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  3-Way Junction Live Traffic Signal Visualization
                </h2>
                <p className="text-xs text-steel mt-0.5">
                  North · East · West Intersection — Real-Time
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-signal-green animate-pulse" />
                <span className="text-xs text-signal-green font-semibold">
                  LIVE
                </span>
              </div>
            </div>
            <div className="p-3">
              <JunctionVisualization
                signals={state.signals}
                isEmergencyActive={state.isEmergencyActive}
                emergencyDirection={state.activeEmergency?.direction}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              className="rounded-xl p-4 border"
              style={{ background: "#121C2E", borderColor: "#25344D" }}
            >
              <h3 className="text-xs font-bold text-steel uppercase tracking-wider mb-3">
                Traffic Density
              </h3>
              <div className="flex justify-around gap-2">
                {dirs.map((dir) => (
                  <DensityGauge
                    key={dir}
                    direction={dir.toUpperCase()}
                    density={state.signals[dir]?.density ?? ("low" as any)}
                    percentage={state.sensors[dir]?.densityPercentage ?? 0}
                    vehicleCount={state.signals[dir]?.vehicleCount ?? 0}
                  />
                ))}
              </div>
            </div>

            <div
              className="rounded-xl p-4 border"
              style={{ background: "#121C2E", borderColor: "#25344D" }}
            >
              <h3 className="text-xs font-bold text-steel uppercase tracking-wider mb-3">
                AI Detection Status
              </h3>
              <AIDetectionPanel
                sensors={state.sensors}
                isEmergencyActive={state.isEmergencyActive}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-3">
          <AdminControlPanel
            state={state}
            setSignalColor={setSignalColor}
            triggerEmergency={triggerEmergency}
            clearEmergency={clearEmergency}
            setAiMode={setAiMode}
          />

          <div
            className="rounded-xl border"
            style={{ background: "#121C2E", borderColor: "#25344D" }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid #25344D" }}
            >
              <h3 className="text-sm font-bold text-foreground">
                Recent Violations
              </h3>
            </div>
            <div className="p-2">
              <ViolationTable violations={state.violations} compact={true} />
            </div>
          </div>

          <div
            className="rounded-xl border"
            style={{ background: "#121C2E", borderColor: "#25344D" }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid #25344D" }}
            >
              <h3 className="text-sm font-bold text-foreground">
                Emergency Alerts
              </h3>
            </div>
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
              {recentEmergencies.length === 0 ? (
                <div
                  data-ocid="emergency.empty_state"
                  className="text-xs text-steel text-center py-4"
                >
                  No emergency events
                </div>
              ) : (
                recentEmergencies.map((em, idx) => (
                  <div
                    key={em.id}
                    data-ocid={`emergency.item.${idx + 1}`}
                    className="flex items-start gap-2 text-xs"
                    style={{
                      borderBottom: "1px solid #1A2A4344",
                      paddingBottom: 6,
                    }}
                  >
                    <span
                      className={em.active ? "text-signal-red" : "text-steel"}
                    >
                      {em.active ? "🚨" : "⚫"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-foreground capitalize">
                        {em.direction} — {em.vehicleId}
                      </div>
                      <div className="text-steel text-[10px]">
                        {em.detectionMethod}
                      </div>
                      <div className="text-steel text-[10px]">
                        {new Date(em.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    {em.active && (
                      <span className="text-signal-red font-bold blink text-[10px]">
                        ACTIVE
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
