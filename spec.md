# AI Smart Traffic Police Management System

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full-stack Smart Traffic Police Management System
- 3-way junction (North, East, West) traffic signal control
- AI simulation module for vehicle/ambulance detection
- Dual-sensor ambulance detection: camera (visual) + noise sensor (sound/dB)
- Emergency vehicle priority override system
- Violation detection and history management
- Admin manual signal control panel
- Real-time traffic density monitoring (Low/Medium/High)
- Arduino integration guide and code documentation
- Government-style professional dark dashboard UI

### Modify
N/A - new project

### Remove
N/A - new project

## Implementation Plan

### Backend (Motoko)
1. Traffic signal state management (North/East/West: RED/YELLOW/GREEN, countdown timers)
2. AI simulation engine:
   - Vehicle density computation (random simulation with trend)
   - Ambulance detection via camera feed simulation (visual patterns)
   - Noise sensor simulation (dB level simulation)
   - Combined ambulance detection logic: BOTH camera + noise sensor must trigger
   - Violation detection simulation (red-light running, speeding, wrong-way)
3. Emergency override system:
   - Set priority direction GREEN, all others RED
   - Store active emergency record
   - Alert log management
4. Violation records CRUD (timestamp, location, plate, type, status)
5. Signal cycle automation (timed rotation with density-weighted timing)
6. System statistics (total violations, active emergencies, signal uptime)

### Frontend (React + TypeScript)
1. Dark navy government-style dashboard layout with sidebar navigation
2. Pages: Dashboard, Live Monitoring, Violation Records, Emergency Center, Admin Controls, System Status
3. Live junction visualization card - top-down 3-way intersection with:
   - Animated signal lights per direction
   - Vehicle count overlays
   - Countdown timers
4. Traffic density gauge cards (semi-circular arcs per direction)
5. AI Detection Status panel:
   - Camera feed simulation thumbnail with car count
   - Noise sensor waveform + dB readout
6. Emergency alert banner (ambulance detected - camera + noise triggered)
7. Admin control panel - manual signal override per direction
8. Violation history table with pagination and severity coloring
9. Emergency alerts list with timestamps
10. Header: crest, system title, officer name, live clock
11. Arduino integration documentation page with code snippets and wiring diagrams
12. Setup/Run instructions page

### Data Models
- SignalState: { direction, color, countdown, density }
- Violation: { id, timestamp, location, plate, type, status, severity }
- EmergencyEvent: { id, timestamp, direction, vehicleId, detectedBy, active }
- AIDetection: { camera: { count, density, ambulanceDetected }, noiseSensor: { dB, level, ambulanceDetected } }
- SystemStats: { totalViolations, activeEmergencies, signalCycles, uptime }
