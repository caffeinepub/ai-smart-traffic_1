import type { ViolationRecord } from "../hooks/useTrafficSimulation";

interface ViolationTableProps {
  violations: ViolationRecord[];
  compact?: boolean;
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    high: { bg: "#6A1F2A", text: "#F87171" },
    medium: { bg: "#2A2415", text: "#F2C94C" },
    low: { bg: "#152A1E", text: "#2ECC71" },
  };
  const s = styles[severity.toLowerCase()] ?? styles.low;
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-semibold uppercase"
      style={{ background: s.bg, color: s.text }}
    >
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "text-signal-yellow",
    reviewed: "text-accentBlue",
    actioned: "text-signal-green",
  };
  return (
    <span
      className={`text-xs font-semibold capitalize ${map[status] ?? "text-steel"}`}
    >
      {status}
    </span>
  );
}

export function ViolationTable({
  violations,
  compact = false,
}: ViolationTableProps) {
  const rows = compact ? violations.slice(0, 5) : violations;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" data-ocid="violations.table">
        <thead>
          <tr style={{ borderBottom: "1px solid #25344D" }}>
            {!compact && (
              <th className="text-left py-2 px-2 text-steel font-semibold">
                ID
              </th>
            )}
            <th className="text-left py-2 px-2 text-steel font-semibold">
              Time
            </th>
            <th className="text-left py-2 px-2 text-steel font-semibold">
              Dir
            </th>
            <th className="text-left py-2 px-2 text-steel font-semibold">
              Plate
            </th>
            {!compact && (
              <th className="text-left py-2 px-2 text-steel font-semibold">
                Type
              </th>
            )}
            <th className="text-left py-2 px-2 text-steel font-semibold">
              Severity
            </th>
            {!compact && (
              <th className="text-left py-2 px-2 text-steel font-semibold">
                Status
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((v, idx) => (
            <tr
              key={v.id}
              data-ocid={`violations.item.${idx + 1}`}
              style={{ borderBottom: "1px solid #1A2A4344" }}
              className="hover:bg-navy-500 transition-colors"
            >
              {!compact && <td className="py-2 px-2 text-steel">#{v.id}</td>}
              <td className="py-2 px-2 text-steel">
                {new Date(v.timestamp).toLocaleTimeString()}
              </td>
              <td className="py-2 px-2 capitalize text-foreground font-medium">
                {v.direction}
              </td>
              <td className="py-2 px-2 font-mono text-accentBlue">{v.plate}</td>
              {!compact && (
                <td className="py-2 px-2 text-steel">{v.violationType}</td>
              )}
              <td className="py-2 px-2">
                <SeverityBadge severity={v.severity} />
              </td>
              {!compact && (
                <td className="py-2 px-2">
                  <StatusBadge status={v.status} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div
          data-ocid="violations.empty_state"
          className="text-center py-6 text-steel text-xs"
        >
          No violations recorded
        </div>
      )}
    </div>
  );
}
