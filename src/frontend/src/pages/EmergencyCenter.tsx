import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Direction } from "../backend.d";
import type { EmergencyEvent } from "../hooks/useTrafficSimulation";

interface EmergencyCenterProps {
  emergencies: EmergencyEvent[];
  triggerEmergency: (dir: Direction, vehicleId: string) => Promise<void>;
  clearEmergency: (id: number) => Promise<void>;
}

export function EmergencyCenter({
  emergencies,
  triggerEmergency,
  clearEmergency,
}: EmergencyCenterProps) {
  const [dir, setDir] = useState<Direction>(Direction.north);
  const [vehicleId, setVehicleId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const active = emergencies.filter((e) => e.active);
  const history = emergencies.filter((e) => !e.active);

  const handleTrigger = async () => {
    if (!vehicleId.trim()) return;
    setSubmitting(true);
    await triggerEmergency(dir, vehicleId.toUpperCase());
    setVehicleId("");
    setSubmitting(false);
  };

  return (
    <main data-ocid="emergency.page" className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Emergency Center</h1>
        <p className="text-xs text-steel mt-0.5">
          Ambulance &amp; emergency vehicle priority management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Active Emergencies",
            value: active.length,
            color: "#E53E3E",
            icon: "🚨",
          },
          {
            label: "Total Events",
            value: emergencies.length,
            color: "#9AA9C0",
            icon: "⚠️",
          },
          {
            label: "Resolved",
            value: history.length,
            color: "#2ECC71",
            icon: "✓",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 border"
            style={{ background: "#121C2E", borderColor: "#25344D" }}
          >
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs text-steel">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          {/* Active Emergencies */}
          <div
            className="rounded-xl border"
            style={{ background: "#121C2E", borderColor: "#25344D" }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid #25344D" }}
            >
              <div className="flex items-center gap-2">
                {active.length > 0 && (
                  <div className="w-2.5 h-2.5 rounded-full bg-signal-red animate-pulse" />
                )}
                <h3 className="text-sm font-bold text-foreground">
                  Active Emergencies
                </h3>
                {active.length > 0 && (
                  <span className="ml-auto text-xs font-bold text-signal-red blink">
                    ALERT
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 space-y-3">
              {active.length === 0 ? (
                <div
                  data-ocid="emergency.active.empty_state"
                  className="text-xs text-steel text-center py-6"
                >
                  No active emergencies
                </div>
              ) : (
                active.map((em, idx) => (
                  <div
                    key={em.id}
                    data-ocid={`emergency.active.item.${idx + 1}`}
                    className="rounded-xl p-3 border emergency-pulse"
                    style={{ background: "#1A0A0E", borderColor: "#B53A3A" }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🚨</span>
                          <span className="font-bold text-white text-sm">
                            {em.vehicleId}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded font-bold capitalize"
                            style={{
                              background: "#B53A3A44",
                              color: "#F87171",
                            }}
                          >
                            {em.direction}
                          </span>
                        </div>
                        <div className="text-xs text-red-300 mb-1">
                          {em.detectionMethod}
                        </div>
                        <div className="text-xs text-steel">
                          Triggered: {new Date(em.timestamp).toLocaleString()}
                        </div>
                        {em.noiseDb > 0 && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: "#F2C94C" }}
                          >
                            Noise Level: {em.noiseDb} dB (threshold: 85 dB)
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        data-ocid={`emergency.active.clear_button.${idx + 1}`}
                        onClick={() => clearEmergency(em.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                        style={{
                          background: "#152A1E",
                          color: "#2ECC71",
                          borderColor: "#2ECC7144",
                        }}
                      >
                        Resolve
                      </button>
                    </div>
                    <div
                      className="mt-2 p-2 rounded text-xs"
                      style={{ background: "#0B1220" }}
                    >
                      <div className="text-steel mb-1">
                        Signal Override Active:
                      </div>
                      <div className="flex gap-3">
                        {[Direction.north, Direction.east, Direction.west].map(
                          (d) => (
                            <div key={d} className="flex items-center gap-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  background:
                                    d === em.direction ? "#2ECC71" : "#E53E3E",
                                }}
                              />
                              <span className="capitalize text-steel">
                                {d[0].toUpperCase()}:{" "}
                              </span>
                              <span
                                className="font-semibold capitalize"
                                style={{
                                  color:
                                    d === em.direction ? "#2ECC71" : "#E53E3E",
                                }}
                              >
                                {d === em.direction ? "GREEN" : "RED"}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* History */}
          <div
            className="rounded-xl border"
            style={{ background: "#121C2E", borderColor: "#25344D" }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid #25344D" }}
            >
              <h3 className="text-sm font-bold text-foreground">
                Emergency History
              </h3>
            </div>
            <div className="p-3">
              {history.length === 0 ? (
                <div className="text-xs text-steel text-center py-4">
                  No history
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map((em, idx) => (
                    <div
                      key={em.id}
                      data-ocid={`emergency.history.item.${idx + 1}`}
                      className="flex items-center gap-3 text-xs py-2"
                      style={{ borderBottom: "1px solid #1A2A4344" }}
                    >
                      <span className="text-steel">⚫</span>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">
                          {em.vehicleId}
                        </div>
                        <div className="text-steel">{em.detectionMethod}</div>
                      </div>
                      <div className="text-right">
                        <div className="capitalize text-foreground">
                          {em.direction}
                        </div>
                        <div className="text-steel">
                          {new Date(em.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Manual Trigger Form */}
        <div
          className="rounded-xl p-4 border h-fit"
          style={{ background: "#121C2E", borderColor: "#25344D" }}
        >
          <h3 className="text-sm font-bold text-foreground mb-1">
            Manual Emergency Trigger
          </h3>
          <p className="text-xs text-steel mb-4">
            Officer can manually activate priority routing
          </p>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="em-vehicle-id"
                className="text-xs text-steel mb-1 block"
              >
                Vehicle ID / Plate
              </label>
              <Input
                id="em-vehicle-id"
                data-ocid="emergency.vehicleid.input"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                placeholder="AMB-TN-0012 or KA01-1234"
                className="bg-navy-500 border-navy-300 text-foreground text-xs h-8"
              />
            </div>
            <div>
              <label
                htmlFor="em-direction"
                className="text-xs text-steel mb-1 block"
              >
                Direction / Approach
              </label>
              <Select value={dir} onValueChange={(v) => setDir(v as Direction)}>
                <SelectTrigger
                  id="em-direction"
                  data-ocid="emergency.direction.select"
                  className="bg-navy-500 border-navy-300 text-foreground text-xs h-8"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{ background: "#1A2A43", border: "1px solid #25344D" }}
                >
                  {[Direction.north, Direction.east, Direction.west].map(
                    (d) => (
                      <SelectItem
                        key={d}
                        value={d}
                        className="text-foreground capitalize"
                      >
                        {d}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              data-ocid="emergency.trigger.primary_button"
              onClick={handleTrigger}
              disabled={submitting || !vehicleId.trim()}
              className="w-full text-sm font-bold"
              style={{ background: "#B53A3A", color: "white" }}
            >
              {submitting ? "⏳ Activating..." : "🚨 Trigger Emergency"}
            </Button>

            <div
              className="rounded-lg p-3 text-xs space-y-1"
              style={{ background: "#0B1220", border: "1px solid #25344D" }}
            >
              <div className="text-steel font-semibold mb-2">
                Detection Protocol
              </div>
              <div className="flex items-center gap-2">
                <span className="text-signal-green">✓</span>
                <span className="text-steel">
                  Camera: Ambulance pattern recognition
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-signal-green">✓</span>
                <span className="text-steel">
                  Noise Sensor: Siren &gt; 85 dB threshold
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-signal-yellow">⚠</span>
                <span className="text-steel">
                  Both must trigger for auto-activation
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
