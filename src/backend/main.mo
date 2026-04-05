import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Direction = {
    #north;
    #east;
    #west;
  };

  module Direction {
    func toNat(direction : Direction) : Nat {
      switch (direction) {
        case (#north) { 0 };
        case (#east) { 1 };
        case (#west) { 2 };
      };
    };

    public func compare(d1 : Direction, d2 : Direction) : Order.Order {
      Nat.compare(toNat(d1), toNat(d2));
    };
  };

  type Color = {
    #red;
    #yellow;
    #green;
  };

  module Color {
    func toNat(color : Color) : Nat {
      switch (color) {
        case (#red) { 0 };
        case (#yellow) { 1 };
        case (#green) { 2 };
      };
    };

    public func compare(c1 : Color, c2 : Color) : Order.Order {
      Nat.compare(toNat(c1), toNat(c2));
    };
  };

  type Density = {
    #low;
    #medium;
    #high;
  };

  type Signal = {
    color : Color;
    countdown : Nat;
    density : Density;
    vehicleCount : Nat;
  };

  type Detection = {
    direction : Direction;
    cameraCount : Nat;
    densityPercentage : Nat;
    noiseDbLevel : Nat;
  };

  type Emergency = {
    id : Nat;
    timestamp : Int;
    direction : Direction;
    vehicleId : Text;
    active : Bool;
  };

  module Emergency {
    public func compare(e1 : Emergency, e2 : Emergency) : Order.Order {
      Nat.compare(e1.id, e2.id);
    };
  };

  type Violation = {
    id : Nat;
    timestamp : Int;
    direction : Direction;
    plate : Text;
    violationType : Text;
    severity : Text;
    status : Text;
  };

  module Violation {
    public func compare(v1 : Violation, v2 : Violation) : Order.Order {
      Nat.compare(v1.id, v2.id);
    };
  };

  type Command = {
    direction : Direction;
    color : Color;
  };

  module Command {
    public func compare(c1 : Command, c2 : Command) : Order.Order {
      switch (Direction.compare(c1.direction, c2.direction)) {
        case (#equal) { Color.compare(c1.color, c2.color) };
        case (order) { order };
      };
    };
  };

  type Statistics = {
    totalRed : Nat;
    totalYellow : Nat;
    totalGreen : Nat;
    roadLoad : Text;
    roadDirections : Nat;
    cycles : Nat;
    uptime : Int;
    code : Nat;
    totalViolations : Nat;
  };

  type Report = {
    signals : [Signal];
  };

  var currentCycle : Nat = 0;
  var totalViolations : Nat = 0;
  var totalRed : Nat = 0;
  var totalYellow : Nat = 0;
  var totalGreen : Nat = 0;
  var totalDirections : Nat = 0;
  var totalCycles : Nat = 0;

  let signals = Map.empty<Direction, Signal>();
  let emergencies = Map.empty<Nat, Emergency>();
  let violations = Map.empty<Nat, Violation>();
  var pendingCommands = List.empty<Command>();

  public shared ({ caller }) func initialize() : async () {
    let directions = [#north, #east, #west];
    let colors = [#red, #yellow, #green];

    if (currentCycle < 3) {
      switch (colors[currentCycle]) {
        case (#red) { totalRed += 1 };
        case (#yellow) { totalYellow += 1 };
        case (#green) { totalGreen += 1 };
      };
    };

    for (i in Nat.range(0, 3)) {
      if (not signals.containsKey(directions[i])) {
        let signal : Signal = {
          color = colors[i];
          countdown = 0;
          density = #low;
          vehicleCount = 0;
        };
        signals.add(directions[i], signal);
      };
    };
  };

  public shared ({ caller }) func nextCycle() : async (Direction, Color) {
    let nextCycleIndex = (currentCycle + 1) % 3;
    currentCycle := nextCycleIndex;

    switch (nextCycleIndex) {
      case (0) { totalRed += 1 };
      case (1) { totalYellow += 1 };
      case (2) { totalGreen += 1 };
      case (_) { () };
    };

    if (nextCycleIndex == 0) {
      totalCycles += 1;
    };

    let directions = [#north, #east, #west];
    let colors = [#red, #yellow, #green];

    for (i in Nat.range(0, 3)) {
      let signal : Signal = {
        color = colors[(nextCycleIndex + i) % 3];
        countdown = 0;
        density = #low;
        vehicleCount = 0;
      };
      signals.add(directions[i], signal);
    };

    (directions[nextCycleIndex], colors[nextCycleIndex]);
  };

  public shared ({ caller }) func updateSensorData(direction : Direction, vehicleCount : Nat, density : Density) : async Detection {
    switch (signals.get(direction)) {
      case (null) {
        let defaultSignal : Signal = {
          color = #red;
          countdown = 0;
          density = #medium;
          vehicleCount = 0;
        };
        signals.add(direction, defaultSignal);
      };
      case (?signal) {
        let updatedSignal : Signal = {
          color = signal.color;
          countdown = signal.countdown;
          density;
          vehicleCount;
        };
        signals.add(direction, updatedSignal);
      };
    };

    {
      direction;
      cameraCount = vehicleCount;
      densityPercentage = switch (density) {
        case (#low) { 33 };
        case (#medium) { 66 };
        case (#high) { 100 };
      };
      noiseDbLevel = 55;
    };
  };

  public shared ({ caller }) func triggerEmergency(direction : Direction, vehicleId : Text) : async () {
    let emergencyId = Time.now();
    totalDirections += 1;
    let emergency : Emergency = {
      id = totalDirections;
      timestamp = emergencyId;
      direction;
      vehicleId;
      active = true;
    };
    emergencies.add(totalDirections, emergency);

    let directions = [#north, #east, #west];
    for (dir in directions.values()) {
      let defaultSignal : Signal = {
        color = #red;
        countdown = 5;
        density = #medium;
        vehicleCount = 5;
      };
      signals.add(dir, defaultSignal);
    };

    switch (signals.get(direction)) {
      case (null) {
        let defaultSignal : Signal = {
          color = #green;
          countdown = 5;
          density = #medium;
          vehicleCount = 5;
        };
        signals.add(direction, defaultSignal);
      };
      case (?signal) {
        let updatedSignal : Signal = {
          color = #green;
          countdown = 5;
          density = signal.density;
          vehicleCount = signal.vehicleCount;
        };
        signals.add(direction, updatedSignal);
      };
    };
  };

  public shared ({ caller }) func clearEmergency(id : Nat) : async () {
    switch (emergencies.get(id)) {
      case (null) {
        let defaultEmergency : Emergency = {
          id;
          timestamp = 1111;
          direction = #north;
          vehicleId = "empty";
          active = false;
        };
        emergencies.add(id, defaultEmergency);
      };
      case (?emergency) {
        let updatedEmergency : Emergency = {
          id = emergency.id;
          timestamp = emergency.timestamp;
          direction = emergency.direction;
          vehicleId = emergency.vehicleId;
          active = false;
        };
        emergencies.add(id, updatedEmergency);
      };
    };
  };

  public shared ({ caller }) func addViolation(direction : Direction, plate : Text, violationType : Text, severity : Text) : async Nat {
    totalViolations += 1;
    let violation : Violation = {
      id = totalViolations;
      timestamp = Time.now();
      direction;
      plate;
      violationType;
      severity;
      status = "active";
    };
    violations.add(totalViolations, violation);
    totalViolations;
  };

  public shared ({ caller }) func toggleRedLight() : async () {
    let directions = [#north, #east, #west];
    for (dir in directions.values()) {
      switch (signals.get(dir)) {
        case (null) { () };
        case (?signal) {
          let updatedSignal : Signal = {
            color = #red;
            countdown = signal.countdown;
            density = signal.density;
            vehicleCount = signal.vehicleCount;
          };
          signals.add(dir, updatedSignal);
        };
      };
    };
  };

  public query ({ caller }) func getSignalState() : async ([(Direction, Signal)], Nat) {
    (signals.toArray(), currentCycle);
  };

  public query ({ caller }) func getEmergencyState() : async ([(Nat, Emergency)]) {
    emergencies.toArray();
  };

  public query ({ caller }) func getViolationState() : async ([(Nat, Violation)]) {
    violations.toArray();
  };

  public query ({ caller }) func getAdapterData() : async [(Direction, Signal)] {
    signals.toArray();
  };

  public query ({ caller }) func getArduinoData() : async [(Direction, Signal)] {
    signals.toArray();
  };

  public shared ({ caller }) func isEmergencyActive(direction : Direction) : async Bool {
    emergencies.values().any(func(emergency) { emergency.direction == direction and emergency.active });
  };

  public shared ({ caller }) func isTrafficDirectionRed(direction : Direction) : async Bool {
    switch (direction) {
      case (#north) { true };
      case (#east) { true };
      case (#west) { true };
    };
  };

  public query ({ caller }) func getPendingCommands() : async [Command] {
    pendingCommands.toArray().sort();
  };

  public shared ({ caller }) func completePendingCommand(command : Command) : async () {
    let filteredCommands = pendingCommands.filter(func(cmd) { not (cmd == command) });
    pendingCommands := filteredCommands;
  };

  public shared ({ caller }) func getStatusAsync() : async ([(Direction, Signal)], [(Nat, Emergency)], [(Nat, Violation)], Int) {
    let unixTimestamp = Time.now();
    (signals.toArray(), emergencies.toArray(), violations.toArray(), unixTimestamp);
  };

  public query ({ caller }) func getStatistics() : async (Nat, Nat, Nat, Nat, Nat, Nat, Nat, Nat) {
    let directions = [#north, #east, #west];
    let totalRedCount = directions.size();
    let totalYellowCount = directions.size();
    let totalGreenCount = directions.size();

    let roadLoads = 0;
    let systemCycles = currentCycle;
    let uptime = Time.now();
    let totalViolations = violations.size();

    let uptimeNat = uptime.toNat();
    (totalRedCount, totalYellowCount, totalGreenCount, roadLoads, systemCycles, uptimeNat, totalViolations, 9999);
  };

  public query ({ caller }) func getReport() : async [(Direction, Signal)] {
    signals.toArray();
  };
};
