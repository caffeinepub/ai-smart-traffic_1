import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Signal {
    density: Density;
    color: Color;
    countdown: bigint;
    vehicleCount: bigint;
}
export interface Detection {
    direction: Direction;
    cameraCount: bigint;
    densityPercentage: bigint;
    noiseDbLevel: bigint;
}
export interface Violation {
    id: bigint;
    status: string;
    direction: Direction;
    timestamp: bigint;
    severity: string;
    plate: string;
    violationType: string;
}
export interface Emergency {
    id: bigint;
    direction: Direction;
    active: boolean;
    timestamp: bigint;
    vehicleId: string;
}
export interface Command {
    direction: Direction;
    color: Color;
}
export enum Color {
    red = "red",
    green = "green",
    yellow = "yellow"
}
export enum Density {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum Direction {
    east = "east",
    west = "west",
    north = "north"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addViolation(direction: Direction, plate: string, violationType: string, severity: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearEmergency(id: bigint): Promise<void>;
    completePendingCommand(command: Command): Promise<void>;
    getAdapterData(): Promise<Array<[Direction, Signal]>>;
    getArduinoData(): Promise<Array<[Direction, Signal]>>;
    getCallerUserRole(): Promise<UserRole>;
    getEmergencyState(): Promise<Array<[bigint, Emergency]>>;
    getPendingCommands(): Promise<Array<Command>>;
    getReport(): Promise<Array<[Direction, Signal]>>;
    getSignalState(): Promise<[Array<[Direction, Signal]>, bigint]>;
    getStatistics(): Promise<[bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint]>;
    getStatusAsync(): Promise<[Array<[Direction, Signal]>, Array<[bigint, Emergency]>, Array<[bigint, Violation]>, bigint]>;
    getViolationState(): Promise<Array<[bigint, Violation]>>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isEmergencyActive(direction: Direction): Promise<boolean>;
    isTrafficDirectionRed(direction: Direction): Promise<boolean>;
    nextCycle(): Promise<[Direction, Color]>;
    toggleRedLight(): Promise<void>;
    triggerEmergency(direction: Direction, vehicleId: string): Promise<void>;
    updateSensorData(direction: Direction, vehicleCount: bigint, density: Density): Promise<Detection>;
}
