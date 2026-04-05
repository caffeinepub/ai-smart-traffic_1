import { Color } from "../backend.d";

interface SignalLightProps {
  color: Color;
  active: boolean;
  size?: number;
}

export function SignalLight({ color, active, size = 16 }: SignalLightProps) {
  const colorMap: Record<Color, string> = {
    [Color.red]: active
      ? "bg-signal-red signal-red-glow"
      : "bg-navy-400 opacity-30",
    [Color.yellow]: active
      ? "bg-signal-yellow signal-yellow-glow"
      : "bg-navy-400 opacity-30",
    [Color.green]: active
      ? "bg-signal-green signal-green-glow"
      : "bg-navy-400 opacity-30",
  };

  return (
    <div
      className={`rounded-full transition-all duration-500 ${colorMap[color]}`}
      style={{ width: size, height: size }}
    />
  );
}
