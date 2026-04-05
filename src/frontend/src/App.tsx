import { Toaster } from "@/components/ui/sonner";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTrafficSimulation } from "./hooks/useTrafficSimulation";
import { ArduinoGuide } from "./pages/ArduinoGuide";
import { Dashboard } from "./pages/Dashboard";
import { EmergencyCenter } from "./pages/EmergencyCenter";
import { SystemStatus } from "./pages/SystemStatus";
import { ViolationsPage } from "./pages/ViolationsPage";

type Page =
  | "dashboard"
  | "monitoring"
  | "violations"
  | "emergency"
  | "admin"
  | "status"
  | "arduino";

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "monitoring", label: "Live Monitoring", icon: "📡" },
  { id: "violations", label: "Violations Records", icon: "🚨" },
  { id: "emergency", label: "Emergency Center", icon: "🚑" },
  { id: "admin", label: "Admin Controls", icon: "⚙️" },
  { id: "status", label: "System Status", icon: "💻" },
  { id: "arduino", label: "Arduino Guide", icon: "🔌" },
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs text-steel">
      {time.toLocaleString("en-IN", { hour12: false })}
    </span>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [notifCount, setNotifCount] = useState(2);
  const sim = useTrafficSimulation();
  const lastEmergencyId = useRef<number | null>(null);

  // Toast on emergency
  useEffect(() => {
    if (sim.isEmergencyActive && sim.activeEmergency) {
      const em = sim.activeEmergency;
      if (em.id !== lastEmergencyId.current) {
        lastEmergencyId.current = em.id;
        toast.error(`🚨 Emergency: ${em.vehicleId} via ${em.direction}`, {
          duration: 8000,
        });
        setNotifCount((prev) => prev + 1);
      }
    }
  }, [sim.isEmergencyActive, sim.activeEmergency]);

  const trafficState = {
    signals: sim.signals,
    sensors: sim.sensors,
    emergencies: sim.emergencies,
    violations: sim.violations,
    cycles: sim.cycles,
    isEmergencyActive: sim.isEmergencyActive,
    activeEmergency: sim.activeEmergency,
    systemUptime: sim.systemUptime,
    aiMode: sim.aiMode,
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
      case "monitoring":
      case "admin":
        return (
          <Dashboard
            state={trafficState}
            setSignalColor={sim.setSignalColor}
            triggerEmergency={sim.triggerEmergency}
            clearEmergency={sim.clearEmergency}
            setAiMode={sim.setAiMode}
          />
        );
      case "violations":
        return (
          <ViolationsPage
            violations={sim.violations}
            addViolation={sim.addViolation}
          />
        );
      case "emergency":
        return (
          <EmergencyCenter
            emergencies={sim.emergencies}
            triggerEmergency={sim.triggerEmergency}
            clearEmergency={sim.clearEmergency}
          />
        );
      case "status":
        return <SystemStatus state={trafficState} />;
      case "arduino":
        return <ArduinoGuide />;
      default:
        return null;
    }
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#0B1220" }}
    >
      <Toaster theme="dark" position="top-right" />

      {/* Sidebar */}
      <aside
        className="flex flex-col w-52 flex-shrink-0 overflow-y-auto"
        style={{
          background: "#0F1A2E",
          borderRight: "1px solid #25344D",
        }}
      >
        {/* Sidebar Logo */}
        <div
          className="px-4 py-4 flex items-center gap-3"
          style={{ borderBottom: "1px solid #25344D" }}
        >
          <img
            src="/assets/generated/traffic-police-crest-transparent.dim_80x80.png"
            alt="Traffic Police"
            className="w-8 h-8 object-contain"
          />
          <div>
            <div className="text-[10px] font-bold text-foreground tracking-wider leading-tight">
              TRAFFIC POLICE
            </div>
            <div className="text-[9px] text-steel tracking-wide leading-tight">
              MANAGEMENT SYSTEM
            </div>
          </div>
        </div>

        {/* Emergency indicator in sidebar */}
        {sim.isEmergencyActive && (
          <div
            className="mx-3 mt-3 px-3 py-2 rounded-lg emergency-pulse text-xs font-bold text-center"
            style={{
              background: "#6A1F2A",
              color: "#F87171",
              border: "1px solid #B53A3A44",
            }}
          >
            🚨 EMERGENCY ACTIVE
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => setPage(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-xs"
              style={{
                background: page === item.id ? "#2F5F9E" : "transparent",
                color: page === item.id ? "#E9EEF7" : "#9AA9C0",
                boxShadow: page === item.id ? "0 0 12px #2F5F9E55" : "none",
                border:
                  page === item.id
                    ? "1px solid #2D73FF44"
                    : "1px solid transparent",
              }}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="font-medium leading-tight">{item.label}</span>
              {item.id === "emergency" && sim.isEmergencyActive && (
                <span className="ml-auto text-[9px] font-bold bg-signal-red text-white px-1.5 py-0.5 rounded-full blink">
                  {sim.emergencies.filter((e) => e.active).length}
                </span>
              )}
              {item.id === "violations" && sim.violations.length > 0 && (
                <span
                  className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#1A2A43", color: "#9AA9C0" }}
                >
                  {sim.violations.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div
          className="px-4 py-3 text-[10px] text-steel"
          style={{ borderTop: "1px solid #25344D" }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-signal-green" />
            <span>System Online</span>
          </div>
          <div>
            Uptime: {Math.floor(sim.systemUptime / 60)}m {sim.systemUptime % 60}
            s
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-5 py-3"
          style={{
            background: "#0F1A2E",
            borderBottom: "1px solid #25344D",
            minHeight: 52,
          }}
        >
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm font-bold text-foreground">
                {NAV_ITEMS.find((n) => n.id === page)?.label ?? "Dashboard"}
              </div>
              <LiveClock />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-steel"
              style={{ background: "#1A2A43", border: "1px solid #25344D" }}
            >
              <span>🔍</span>
              <input
                data-ocid="header.search_input"
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-xs text-foreground placeholder-steel w-28"
              />
            </div>

            {/* Notification bell */}
            <button
              type="button"
              data-ocid="header.notifications.button"
              className="relative p-2 rounded-lg transition-colors"
              style={{ background: "#1A2A43", border: "1px solid #25344D" }}
              onClick={() => setNotifCount(0)}
            >
              <span className="text-base">🔔</span>
              {notifCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded-full text-white"
                  style={{ background: "#E53E3E" }}
                >
                  {notifCount}
                </span>
              )}
            </button>

            {/* Officer badge */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: "#1A2A43", border: "1px solid #25344D" }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: "#2F5F9E", color: "white" }}
              >
                OA
              </div>
              <div>
                <div className="font-semibold text-foreground leading-tight">
                  Officer Admin
                </div>
                <div className="text-[10px] text-steel leading-tight">
                  Administrator
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">{renderPage()}</div>

        {/* Footer */}
        <footer
          className="flex-shrink-0 flex items-center justify-between px-5 py-2 text-[10px] text-steel"
          style={{
            background: "#0B1220",
            borderTop: "1px solid #25344D",
          }}
        >
          <div>
            AI Smart Traffic Police Management System &mdash; Government
            Operations Dashboard
          </div>
          <div>
            &copy; {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accentBlue transition-colors"
            >
              caffeine.ai
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
