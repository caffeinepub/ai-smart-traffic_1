import { useCallback, useEffect, useRef, useState } from "react";
import { Color, Density, Direction } from "../backend.d";
import type { backendInterface } from "../backend.d";
import { createActorWithConfig } from "../config";

export interface SignalState {
  color: Color;
  density: Density;
  countdown: number;
  vehicleCount: number;
}

export interface SensorData {
  cameraCount: number;
  densityPercentage: number;
  noiseDbLevel: number;
  cameraAmbulance: boolean;
  noiseAmbulance: boolean;
}

export interface EmergencyEvent {
  id: number;
  direction: Direction;
  vehicleId: string;
  timestamp: number;
  active: boolean;
  detectionMethod: string;
  noiseDb: number;
}

export interface ViolationRecord {
  id: number;
  direction: Direction;
  plate: string;
  violationType: string;
  severity: string;
  timestamp: number;
  status: string;
}

export interface TrafficState {
  signals: Record<Direction, SignalState>;
  sensors: Record<Direction, SensorData>;
  emergencies: EmergencyEvent[];
  violations: ViolationRecord[];
  cycles: number;
  isEmergencyActive: boolean;
  activeEmergency: EmergencyEvent | null;
  systemUptime: number;
  aiMode: boolean;
}

const DIRECTIONS = [Direction.north, Direction.east, Direction.west];

const VIOLATION_TYPES = [
  "Red Light Running",
  "Speeding",
  "Wrong Way Entry",
  "Lane Violation",
];

const PLATES = [
  "TN01AB1234",
  "TN02CD5678",
  "TN03EF9012",
  "TN04GH3456",
  "TN05IJ7890",
  "MH01KL2345",
  "KA03MN6789",
  "DL05OP0123",
  "AP07QR4567",
  "TS09ST8901",
  "TN10UV2345",
  "TN11WX6789",
];

function randomPlate(): string {
  return PLATES[Math.floor(Math.random() * PLATES.length)];
}

function randomViolationType(): string {
  return VIOLATION_TYPES[Math.floor(Math.random() * VIOLATION_TYPES.length)];
}

function randomSeverity(): string {
  const r = Math.random();
  if (r < 0.3) return "high";
  if (r < 0.65) return "medium";
  return "low";
}

function densityFromCount(count: number): Density {
  if (count >= 50) return Density.high;
  if (count >= 25) return Density.medium;
  return Density.low;
}

function densityPercent(count: number): number {
  return Math.min(100, Math.round((count / 80) * 100));
}

const DEFAULT_SIGNALS: Record<Direction, SignalState> = {
  [Direction.north]: {
    color: Color.green,
    density: Density.low,
    countdown: 30,
    vehicleCount: 12,
  },
  [Direction.east]: {
    color: Color.red,
    density: Density.medium,
    countdown: 45,
    vehicleCount: 28,
  },
  [Direction.west]: {
    color: Color.red,
    density: Density.low,
    countdown: 60,
    vehicleCount: 8,
  },
};

const DEFAULT_SENSORS: Record<Direction, SensorData> = {
  [Direction.north]: {
    cameraCount: 12,
    densityPercentage: 15,
    noiseDbLevel: 58,
    cameraAmbulance: false,
    noiseAmbulance: false,
  },
  [Direction.east]: {
    cameraCount: 28,
    densityPercentage: 35,
    noiseDbLevel: 65,
    cameraAmbulance: false,
    noiseAmbulance: false,
  },
  [Direction.west]: {
    cameraCount: 8,
    densityPercentage: 10,
    noiseDbLevel: 52,
    cameraAmbulance: false,
    noiseAmbulance: false,
  },
};

const INITIAL_VIOLATIONS: ViolationRecord[] = [
  {
    id: 1,
    direction: Direction.north,
    plate: "TN01AB1234",
    violationType: "Red Light Running",
    severity: "high",
    timestamp: Date.now() - 120000,
    status: "pending",
  },
  {
    id: 2,
    direction: Direction.east,
    plate: "KA03MN6789",
    violationType: "Speeding",
    severity: "medium",
    timestamp: Date.now() - 300000,
    status: "reviewed",
  },
  {
    id: 3,
    direction: Direction.west,
    plate: "DL05OP0123",
    violationType: "Wrong Way Entry",
    severity: "high",
    timestamp: Date.now() - 600000,
    status: "actioned",
  },
  {
    id: 4,
    direction: Direction.north,
    plate: "MH01KL2345",
    violationType: "Lane Violation",
    severity: "low",
    timestamp: Date.now() - 900000,
    status: "pending",
  },
  {
    id: 5,
    direction: Direction.east,
    plate: "TN05IJ7890",
    violationType: "Red Light Running",
    severity: "medium",
    timestamp: Date.now() - 1200000,
    status: "reviewed",
  },
];

// Module-level actor cache
let actorCache: backendInterface | null = null;
async function getActor(): Promise<backendInterface> {
  if (!actorCache) {
    actorCache = await createActorWithConfig();
  }
  return actorCache;
}

export function useTrafficSimulation() {
  const [signals, setSignals] =
    useState<Record<Direction, SignalState>>(DEFAULT_SIGNALS);
  const [sensors, setSensors] =
    useState<Record<Direction, SensorData>>(DEFAULT_SENSORS);
  const [emergencies, setEmergencies] = useState<EmergencyEvent[]>([]);
  const [violations, setViolations] =
    useState<ViolationRecord[]>(INITIAL_VIOLATIONS);
  const [cycles, setCycles] = useState(0);
  const [aiMode, setAiMode] = useState(true);
  const [systemUptime, setSystemUptime] = useState(0);
  const startTime = useRef(Date.now());
  const nextViolationId = useRef(6);
  const nextEmergencyId = useRef(1);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uptimeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emergencyTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Sync from backend
  const syncFromBackend = useCallback(async () => {
    try {
      const actor = await getActor();
      const [signalData, emergencyData, violationData, cycleCount] =
        await actor.getStatusAsync();

      const newSignals = { ...signals };
      for (const [dir, sig] of signalData) {
        newSignals[dir] = {
          color: sig.color,
          density: sig.density,
          countdown: Number(sig.countdown),
          vehicleCount: Number(sig.vehicleCount),
        };
      }
      setSignals(newSignals);
      setCycles(Number(cycleCount));

      if (emergencyData.length > 0) {
        const backendEmergencies: EmergencyEvent[] = emergencyData.map(
          ([id, em]) => ({
            id: Number(id),
            direction: em.direction,
            vehicleId: em.vehicleId,
            timestamp: Number(em.timestamp),
            active: em.active,
            detectionMethod: "Camera Detection + Noise Sensor",
            noiseDb: 0,
          }),
        );
        setEmergencies((prev) => {
          const existing = new Set(prev.map((e) => e.id));
          const newOnes = backendEmergencies.filter((e) => !existing.has(e.id));
          return [...newOnes, ...prev].slice(0, 20);
        });
      }

      if (violationData.length > 0) {
        const backendViolations: ViolationRecord[] = violationData.map(
          ([id, v]) => ({
            id: Number(id),
            direction: v.direction,
            plate: v.plate,
            violationType: v.violationType,
            severity: v.severity,
            timestamp: Number(v.timestamp),
            status: v.status,
          }),
        );
        setViolations((prev) => {
          const existingIds = new Set(prev.map((v) => v.id));
          const newOnes = backendViolations.filter(
            (v) => !existingIds.has(v.id),
          );
          return [...newOnes, ...prev].slice(0, 50);
        });
      }
    } catch {
      // Backend unavailable, use local simulation
    }
  }, [signals]);

  // Main simulation tick
  const runSimulationTick = useCallback(async () => {
    const newSensors = { ...sensors };
    const newSignals = { ...signals };

    for (const dir of DIRECTIONS) {
      const prevCount = sensors[dir]?.cameraCount ?? 20;
      const delta = Math.floor(Math.random() * 20) - 8;
      const newCount = Math.max(0, Math.min(80, prevCount + delta));
      const density = densityFromCount(newCount);

      const prevNoise = sensors[dir]?.noiseDbLevel ?? 60;
      const noiseDelta = Math.floor(Math.random() * 16) - 6;
      const newNoise = Math.max(30, Math.min(105, prevNoise + noiseDelta));

      const cameraAmbulance = Math.random() < 0.02;
      const noiseAmbulance = newNoise > 85 && Math.random() < 0.03;

      newSensors[dir] = {
        cameraCount: newCount,
        densityPercentage: densityPercent(newCount),
        noiseDbLevel: newNoise,
        cameraAmbulance,
        noiseAmbulance,
      };

      // Trigger emergency when BOTH camera and noise detect ambulance
      if (cameraAmbulance && noiseAmbulance) {
        const vehicleId = `AMB-${Date.now().toString().slice(-6)}`;
        const emergencyId = nextEmergencyId.current++;
        const newEmergency: EmergencyEvent = {
          id: emergencyId,
          direction: dir,
          vehicleId,
          timestamp: Date.now(),
          active: true,
          detectionMethod: `Camera Detection + Noise Sensor (${newNoise} dB)`,
          noiseDb: newNoise,
        };
        setEmergencies((prev) => [newEmergency, ...prev].slice(0, 20));

        for (const d of DIRECTIONS) {
          newSignals[d] = {
            ...newSignals[d],
            color: d === dir ? Color.green : Color.red,
          };
        }

        try {
          const actor = await getActor();
          await actor.triggerEmergency(dir, vehicleId);
        } catch {
          /* silent */
        }

        const timeout = setTimeout(() => {
          setEmergencies((prev) =>
            prev.map((e) =>
              e.id === emergencyId ? { ...e, active: false } : e,
            ),
          );
          emergencyTimeouts.current.delete(emergencyId);
          getActor()
            .then((actor) => actor.clearEmergency(BigInt(emergencyId)))
            .catch(() => null);
        }, 30000);
        emergencyTimeouts.current.set(emergencyId, timeout);
      }

      newSignals[dir] = { ...newSignals[dir], vehicleCount: newCount, density };

      if (Math.random() < 0.01) {
        const vid = nextViolationId.current++;
        const plate = randomPlate();
        const vtype = randomViolationType();
        const severity = randomSeverity();
        const newViolation: ViolationRecord = {
          id: vid,
          direction: dir,
          plate,
          violationType: vtype,
          severity,
          timestamp: Date.now(),
          status: "pending",
        };
        setViolations((prev) => [newViolation, ...prev].slice(0, 50));
        try {
          const actor = await getActor();
          await actor.addViolation(dir, plate, vtype, severity);
        } catch {
          /* silent */
        }
      }

      try {
        const actor = await getActor();
        await actor.updateSensorData(dir, BigInt(newCount), density);
      } catch {
        /* silent */
      }
    }

    setSensors(newSensors);
    setSignals(newSignals);
  }, [sensors, signals]);

  // Countdown tick
  useEffect(() => {
    const interval = setInterval(() => {
      setSignals((prev) => {
        const updated = { ...prev };
        for (const dir of DIRECTIONS) {
          const current = updated[dir];
          if (current.countdown > 0) {
            updated[dir] = { ...current, countdown: current.countdown - 1 };
          }
        }
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // System uptime
  useEffect(() => {
    uptimeIntervalRef.current = setInterval(() => {
      setSystemUptime(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => {
      if (uptimeIntervalRef.current) clearInterval(uptimeIntervalRef.current);
    };
  }, []);

  // Main simulation + backend sync (every 3s)
  useEffect(() => {
    syncFromBackend();
    simIntervalRef.current = setInterval(() => {
      runSimulationTick();
      syncFromBackend();
    }, 3000);
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [runSimulationTick, syncFromBackend]);

  // Signal cycle (every 15s) when AI mode on
  useEffect(() => {
    if (!aiMode) return;
    cycleIntervalRef.current = setInterval(async () => {
      try {
        const actor = await getActor();
        await actor.nextCycle();
      } catch {
        /* silent */
      }
      setCycles((prev) => prev + 1);
      setSignals((prev) => {
        const dirs = DIRECTIONS;
        const currentGreenIdx = dirs.findIndex(
          (d) => prev[d]?.color === Color.green,
        );
        const nextGreenIdx = (currentGreenIdx + 1) % dirs.length;
        const updated = { ...prev };
        for (let i = 0; i < dirs.length; i++) {
          const d = dirs[i];
          updated[d] = {
            ...updated[d],
            color:
              i === nextGreenIdx
                ? Color.green
                : i === (nextGreenIdx - 1 + 3) % 3
                  ? Color.yellow
                  : Color.red,
            countdown:
              i === nextGreenIdx
                ? 30
                : i === (nextGreenIdx - 1 + 3) % 3
                  ? 5
                  : 45,
          };
        }
        return updated;
      });
    }, 15000);
    return () => {
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
    };
  }, [aiMode]);

  const setSignalColor = useCallback(async (dir: Direction, color: Color) => {
    setSignals((prev) => ({ ...prev, [dir]: { ...prev[dir], color } }));
  }, []);

  const triggerEmergency = useCallback(
    async (dir: Direction, vehicleId: string) => {
      const emergencyId = nextEmergencyId.current++;
      const newEmergency: EmergencyEvent = {
        id: emergencyId,
        direction: dir,
        vehicleId,
        timestamp: Date.now(),
        active: true,
        detectionMethod: "Manual Override by Officer",
        noiseDb: 0,
      };
      setEmergencies((prev) => [newEmergency, ...prev].slice(0, 20));
      setSignals((prev) => {
        const updated = { ...prev };
        for (const d of DIRECTIONS) {
          updated[d] = {
            ...updated[d],
            color: d === dir ? Color.green : Color.red,
          };
        }
        return updated;
      });
      try {
        const actor = await getActor();
        await actor.triggerEmergency(dir, vehicleId);
      } catch {
        /* silent */
      }
      const timeout = setTimeout(() => {
        setEmergencies((prev) =>
          prev.map((e) => (e.id === emergencyId ? { ...e, active: false } : e)),
        );
        emergencyTimeouts.current.delete(emergencyId);
      }, 30000);
      emergencyTimeouts.current.set(emergencyId, timeout);
    },
    [],
  );

  const clearEmergency = useCallback(async (id: number) => {
    setEmergencies((prev) =>
      prev.map((e) => (e.id === id ? { ...e, active: false } : e)),
    );
    const timeout = emergencyTimeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      emergencyTimeouts.current.delete(id);
    }
    try {
      const actor = await getActor();
      await actor.clearEmergency(BigInt(id));
    } catch {
      /* silent */
    }
  }, []);

  const addViolation = useCallback(
    async (dir: Direction, plate: string, vtype: string, severity: string) => {
      const vid = nextViolationId.current++;
      const newViolation: ViolationRecord = {
        id: vid,
        direction: dir,
        plate,
        violationType: vtype,
        severity,
        timestamp: Date.now(),
        status: "pending",
      };
      setViolations((prev) => [newViolation, ...prev].slice(0, 50));
      try {
        const actor = await getActor();
        await actor.addViolation(dir, plate, vtype, severity);
      } catch {
        /* silent */
      }
    },
    [],
  );

  const activeEmergency = emergencies.find((e) => e.active) ?? null;
  const isEmergencyActive = activeEmergency !== null;

  return {
    signals,
    sensors,
    emergencies,
    violations,
    cycles,
    isEmergencyActive,
    activeEmergency,
    systemUptime,
    aiMode,
    setAiMode,
    setSignalColor,
    triggerEmergency,
    clearEmergency,
    addViolation,
    DIRECTIONS,
  };
}
