export function ArduinoGuide() {
  const arduinoCode = `// ============================================================
// Smart Traffic Police Management System - Arduino Uno Code
// Controls: North, East, West signal LEDs via Serial
// Protocol: JSON commands from backend via USB Serial
// ============================================================

#include <ArduinoJson.h>

// === PIN CONFIGURATION ===
// North Direction
const int NORTH_RED    = 2;
const int NORTH_YELLOW = 3;
const int NORTH_GREEN  = 4;

// East Direction
const int EAST_RED     = 5;
const int EAST_YELLOW  = 6;
const int EAST_GREEN   = 7;

// West Direction
const int WEST_RED     = 8;
const int WEST_YELLOW  = 9;
const int WEST_GREEN   = 10;

// Emergency LED (optional)
const int EMERGENCY_LED = 13;

// === SIGNAL STATE ===
String northState = "RED";
String eastState  = "RED";
String westState  = "RED";

void setup() {
  Serial.begin(9600);
  
  // Initialize all pins as OUTPUT
  int pins[] = {
    NORTH_RED, NORTH_YELLOW, NORTH_GREEN,
    EAST_RED,  EAST_YELLOW,  EAST_GREEN,
    WEST_RED,  WEST_YELLOW,  WEST_GREEN,
    EMERGENCY_LED
  };
  for (int i = 0; i < 10; i++) {
    pinMode(pins[i], OUTPUT);
    digitalWrite(pins[i], LOW);
  }
  
  // Default state: all RED
  setSignal("north", "red");
  setSignal("east",  "red");
  setSignal("west",  "red");
  
  Serial.println("READY");
}

void loop() {
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\\n');
    input.trim();
    parseCommand(input);
  }
  delay(50);
}

void setSignal(String direction, String color) {
  int redPin, yellowPin, greenPin;
  
  if (direction == "north") {
    redPin = NORTH_RED; yellowPin = NORTH_YELLOW; greenPin = NORTH_GREEN;
    northState = color;
  } else if (direction == "east") {
    redPin = EAST_RED; yellowPin = EAST_YELLOW; greenPin = EAST_GREEN;
    eastState = color;
  } else if (direction == "west") {
    redPin = WEST_RED; yellowPin = WEST_YELLOW; greenPin = WEST_GREEN;
    westState = color;
  } else { return; }
  
  // Turn all off first
  digitalWrite(redPin,    LOW);
  digitalWrite(yellowPin, LOW);
  digitalWrite(greenPin,  LOW);
  
  // Activate the correct LED
  if (color == "red")    digitalWrite(redPin,    HIGH);
  if (color == "yellow") digitalWrite(yellowPin, HIGH);
  if (color == "green")  digitalWrite(greenPin,  HIGH);
}

void parseCommand(String json) {
  // Expected JSON format:
  // {"type":"signal","direction":"north","color":"green"}
  // {"type":"emergency","direction":"north"}
  // {"type":"status"}
  
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, json);
  if (err) {
    Serial.println("{\"status\":\"error\",\"msg\":\"parse_fail\"}");
    return;
  }
  
  String type = doc["type"];
  
  if (type == "signal") {
    String dir   = doc["direction"];
    String color = doc["color"];
    dir.toLowerCase();
    color.toLowerCase();
    setSignal(dir, color);
    Serial.println("{\"status\":\"ok\",\"direction\":\"" + dir + "\",\"color\":\"" + color + "\"}");
  }
  else if (type == "emergency") {
    String dir = doc["direction"];
    dir.toLowerCase();
    // Override all signals
    setSignal("north", dir == "north" ? "green" : "red");
    setSignal("east",  dir == "east"  ? "green" : "red");
    setSignal("west",  dir == "west"  ? "green" : "red");
    // Flash emergency LED
    for (int i = 0; i < 6; i++) {
      digitalWrite(EMERGENCY_LED, HIGH); delay(200);
      digitalWrite(EMERGENCY_LED, LOW);  delay(200);
    }
    Serial.println("{\"status\":\"emergency\",\"direction\":\"" + dir + "\"}");
  }
  else if (type == "status") {
    String response = "{\"north\":\"" + northState + "\",\"east\":\"" + 
                      eastState + "\",\"west\":\"" + westState + "\"}";
    Serial.println(response);
  }
}`;

  const envConfig = `# .env Configuration for Smart Traffic System

# Backend
CANISTER_ID_BACKEND=your-canister-id-here
BASE_URL=/

# Arduino Serial Port
ARDUINO_PORT=/dev/ttyUSB0        # Linux
# ARDUINO_PORT=COM3               # Windows
# ARDUINO_PORT=/dev/cu.usbmodem1 # macOS
ARDUINO_BAUD=9600

# Simulation Mode (no Arduino hardware)
VITE_SIMULATION_MODE=true

# Optional: Mock backend for testing
# VITE_USE_MOCK=true`;

  const pinTable = [
    { dir: "NORTH", signal: "RED", pin: "D2", color: "#E53E3E" },
    { dir: "NORTH", signal: "YELLOW", pin: "D3", color: "#F2C94C" },
    { dir: "NORTH", signal: "GREEN", pin: "D4", color: "#2ECC71" },
    { dir: "EAST", signal: "RED", pin: "D5", color: "#E53E3E" },
    { dir: "EAST", signal: "YELLOW", pin: "D6", color: "#F2C94C" },
    { dir: "EAST", signal: "GREEN", pin: "D7", color: "#2ECC71" },
    { dir: "WEST", signal: "RED", pin: "D8", color: "#E53E3E" },
    { dir: "WEST", signal: "YELLOW", pin: "D9", color: "#F2C94C" },
    { dir: "WEST", signal: "GREEN", pin: "D10", color: "#2ECC71" },
    { dir: "ALL", signal: "EMERGENCY", pin: "D13", color: "#F87171" },
  ];

  return (
    <main data-ocid="arduino.page" className="p-4 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Arduino Integration Guide
        </h1>
        <p className="text-xs text-steel mt-0.5">
          Hardware setup, wiring, and communication protocol
        </p>
      </div>

      {/* Architecture Diagram */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "#121C2E", borderColor: "#25344D" }}
      >
        <h2 className="text-sm font-bold text-foreground mb-3">
          System Architecture
        </h2>
        <pre
          className="text-xs font-mono text-steel overflow-x-auto p-4 rounded-lg"
          style={{ background: "#0B1220", border: "1px solid #25344D" }}
        >{`
  ┌──────────────────────┐          ┌──────────────────┐
  │   React.js Frontend    │          │   AI Simulation      │
  │  Traffic Dashboard     │          │  Camera Detection   │
  │  Admin Control Panel   │          │  Noise Sensor (85dB) │
  │  Emergency Alerts      │          └──────────────────┘
  └──────────────────────┘                  │
           │  ICP Canister API              │
           │  WebSocket/Polling             │
  ┌──────────────────────┐          │
  │  Motoko Backend (ICP)  │──────────┘
  │  Signal State Manager  │
  │  Emergency Handler     │
  │  Violation Records     │
  └──────────────────────┘
           │  Serial Commands (USB)
           │  JSON Protocol
  ┌──────────────────────┐
  │  Arduino Uno (IoT)     │
  │  9 LED Signal Lights   │
  │  N/E/W × R/Y/G         │
  └──────────────────────┘
           │
  ┌──────────────────────┐
  │  Physical Traffic LEDs │
  │  (North/East/West)     │
  └──────────────────────┘
`}</pre>
      </div>

      {/* Pin Configuration */}
      <div
        className="rounded-xl border"
        style={{ background: "#121C2E", borderColor: "#25344D" }}
      >
        <div
          className="px-4 py-3"
          style={{ borderBottom: "1px solid #25344D" }}
        >
          <h2 className="text-sm font-bold text-foreground">
            Arduino Uno Pin Configuration
          </h2>
        </div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid #25344D" }}>
                <th className="text-left py-2 px-3 text-steel">Direction</th>
                <th className="text-left py-2 px-3 text-steel">Signal</th>
                <th className="text-left py-2 px-3 text-steel">Arduino Pin</th>
                <th className="text-left py-2 px-3 text-steel">LED Color</th>
                <th className="text-left py-2 px-3 text-steel">Resistor</th>
              </tr>
            </thead>
            <tbody>
              {pinTable.map((row, idx) => (
                <tr
                  key={`${row.dir}-${row.signal}`}
                  data-ocid={`arduino.pin.item.${idx + 1}`}
                  style={{ borderBottom: "1px solid #1A2A4344" }}
                >
                  <td className="py-2 px-3 font-semibold text-foreground">
                    {row.dir}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{ background: `${row.color}22`, color: row.color }}
                    >
                      {row.signal}
                    </span>
                  </td>
                  <td
                    className="py-2 px-3 font-mono font-bold"
                    style={{ color: "#2D73FF" }}
                  >
                    {row.pin}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: row.color }}
                      />
                      <span className="text-steel capitalize">
                        {row.signal.toLowerCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-steel">
                    {row.signal === "EMERGENCY" ? "Onboard" : "220Ω"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wiring */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "#121C2E", borderColor: "#25344D" }}
      >
        <h2 className="text-sm font-bold text-foreground mb-3">
          Wiring Diagram Description
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {["North", "East", "West"].map((dir, di) => (
            <div
              key={dir}
              className="rounded-lg p-3"
              style={{ background: "#0B1220", border: "1px solid #25344D" }}
            >
              <div className="text-xs font-bold text-foreground mb-2">
                {dir} Signal
              </div>
              {["RED", "YELLOW", "GREEN"].map((color, ci) => {
                const pin = 2 + di * 3 + ci;
                const c =
                  color === "RED"
                    ? "#E53E3E"
                    : color === "YELLOW"
                      ? "#F2C94C"
                      : "#2ECC71";
                return (
                  <div key={color} className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: c }}
                    />
                    <span className="text-steel text-xs">{color} LED</span>
                    <span
                      className="ml-auto font-mono text-xs"
                      style={{ color: "#2D73FF" }}
                    >
                      D{pin}
                    </span>
                    <span className="text-steel text-xs">→ 220Ω → GND</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div
          className="mt-3 p-3 rounded-lg text-xs text-steel"
          style={{ background: "#0B1220", border: "1px solid #25344D" }}
        >
          <span className="font-semibold text-foreground">Note:</span> Connect
          each LED anode to the Arduino digital pin through a 220Ω resistor.
          Connect all LED cathodes to GND. Use 5V LEDs compatible with Arduino
          5V output.
        </div>
      </div>

      {/* Arduino Code */}
      <div
        className="rounded-xl border"
        style={{ background: "#121C2E", borderColor: "#25344D" }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid #25344D" }}
        >
          <h2 className="text-sm font-bold text-foreground">
            Arduino C++ Code
          </h2>
          <span
            className="text-xs px-2 py-0.5 rounded font-semibold"
            style={{ background: "#152A1E", color: "#2ECC71" }}
          >
            Upload to Arduino Uno
          </span>
        </div>
        <div className="p-4">
          <pre className="text-xs overflow-x-auto">
            <code>{arduinoCode}</code>
          </pre>
        </div>
      </div>

      {/* Setup Instructions */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "#121C2E", borderColor: "#25344D" }}
      >
        <h2 className="text-sm font-bold text-foreground mb-3">
          Setup Instructions
        </h2>
        <div className="space-y-3">
          {[
            {
              step: "1",
              title: "Install Arduino IDE",
              desc: 'Download from arduino.cc. Install the ArduinoJson library via Sketch → Include Library → Manage Libraries → Search "ArduinoJson" → Install v6.x',
            },
            {
              step: "2",
              title: "Wire LEDs",
              desc: "Connect 9 LEDs per pin table above. Each LED needs a 220Ω resistor in series. Connect all GND to Arduino GND rail.",
            },
            {
              step: "3",
              title: "Upload Code",
              desc: "Open the Arduino code above in Arduino IDE. Select Board: Arduino Uno, Port: your COM/ttyUSB port. Click Upload.",
            },
            {
              step: "4",
              title: "Configure .env",
              desc: "Set ARDUINO_PORT to your serial port (COM3, /dev/ttyUSB0, etc). Set ARDUINO_BAUD=9600.",
            },
            {
              step: "5",
              title: "Test Serial",
              desc: 'Open Serial Monitor at 9600 baud. Send: {"type":"signal","direction":"north","color":"green"}  — The North GREEN LED should light up.',
            },
            {
              step: "6",
              title: "Run System",
              desc: "Start the frontend. The backend adapter will automatically poll getPendingCommands() and send them to Arduino via serial.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: "#1A2A43",
                  color: "#2D73FF",
                  border: "1px solid #2D73FF44",
                }}
              >
                {item.step}
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground mb-0.5">
                  {item.title}
                </div>
                <div className="text-xs text-steel leading-relaxed">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Serial Protocol */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "#121C2E", borderColor: "#25344D" }}
      >
        <h2 className="text-sm font-bold text-foreground mb-3">
          Serial Communication Protocol
        </h2>
        <div className="space-y-2">
          {[
            {
              label: "Set Signal",
              cmd: `{"type":"signal","direction":"north","color":"green"}`,
            },
            {
              label: "Emergency Override",
              cmd: `{"type":"emergency","direction":"north"}`,
            },
            { label: "Status Request", cmd: `{"type":"status"}` },
            {
              label: "Response (OK)",
              cmd: `{"status":"ok","direction":"north","color":"green"}`,
            },
            {
              label: "Response (Emergency)",
              cmd: `{"status":"emergency","direction":"north"}`,
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-steel w-36 flex-shrink-0">
                {item.label}:
              </span>
              <code
                className="text-xs flex-1 px-2 py-1 rounded"
                style={{
                  background: "#0B1220",
                  color: "#85C1E9",
                  border: "1px solid #25344D",
                }}
              >
                {item.cmd}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Simulation vs Hardware */}
      <div
        className="rounded-xl border p-4"
        style={{ background: "#121C2E", borderColor: "#25344D" }}
      >
        <h2 className="text-sm font-bold text-foreground mb-3">Run Modes</h2>
        <div className="grid grid-cols-2 gap-4">
          <div
            className="rounded-lg p-3"
            style={{ background: "#0B1220", border: "1px solid #2ECC7144" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-signal-green" />
              <span className="text-xs font-bold text-signal-green">
                SIMULATION MODE
              </span>
            </div>
            <div className="text-xs text-steel space-y-1">
              <div>• No hardware required</div>
              <div>• Full AI simulation runs in browser</div>
              <div>
                • Set{" "}
                <code className="text-accentBlue">
                  VITE_SIMULATION_MODE=true
                </code>
              </div>
              <div>• Arduino commands logged to console</div>
              <div>• Ideal for development and demo</div>
            </div>
          </div>
          <div
            className="rounded-lg p-3"
            style={{ background: "#0B1220", border: "1px solid #2D73FF44" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-accentBlue" />
              <span className="text-xs font-bold text-accentBlue">
                HARDWARE MODE
              </span>
            </div>
            <div className="text-xs text-steel space-y-1">
              <div>• Arduino Uno connected via USB</div>
              <div>• Backend polls getPendingCommands()</div>
              <div>• Sends JSON over serial port</div>
              <div>
                • Configure{" "}
                <code className="text-accentBlue">ARDUINO_PORT</code> in .env
              </div>
              <div>• Real LED signals activated</div>
            </div>
          </div>
        </div>
      </div>

      {/* .env config */}
      <div
        className="rounded-xl border"
        style={{ background: "#121C2E", borderColor: "#25344D" }}
      >
        <div
          className="px-4 py-3"
          style={{ borderBottom: "1px solid #25344D" }}
        >
          <h2 className="text-sm font-bold text-foreground">
            .env Configuration
          </h2>
        </div>
        <div className="p-4">
          <pre className="text-xs overflow-x-auto">
            <code>{envConfig}</code>
          </pre>
        </div>
      </div>
    </main>
  );
}
