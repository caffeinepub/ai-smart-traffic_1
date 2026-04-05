import type { EmergencyEvent } from "../hooks/useTrafficSimulation";

interface EmergencyBannerProps {
  emergency: EmergencyEvent;
  onClear: (id: number) => void;
}

export function EmergencyBanner({ emergency, onClear }: EmergencyBannerProps) {
  return (
    <div
      data-ocid="emergency.panel"
      className="emergency-pulse rounded-xl px-4 py-3 flex items-center justify-between gap-4 mb-4"
      style={{
        background:
          "linear-gradient(135deg, #6A1F2A 0%, #B53A3A 50%, #6A1F2A 100%)",
        border: "1px solid #B53A3A",
        boxShadow: "0 0 30px #B53A3A55, 0 4px 20px #0008",
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0 text-2xl">🚨</div>
        <div className="min-w-0">
          <div className="font-bold text-white text-sm tracking-wide">
            EMERGENCY VEHICLE DETECTED – PRIORITY ROUTING ACTIVATED
          </div>
          <div className="text-xs text-red-200 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
            <span>ID: {emergency.vehicleId}</span>
            <span className="capitalize">Direction: {emergency.direction}</span>
            <span>Detected via: {emergency.detectionMethod}</span>
            <span>{new Date(emergency.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        data-ocid="emergency.close_button"
        onClick={() => onClear(emergency.id)}
        className="flex-shrink-0 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors border border-white/30"
      >
        Clear
      </button>
    </div>
  );
}
