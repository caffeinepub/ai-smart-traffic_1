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
import { ViolationTable } from "../components/ViolationTable";
import type { ViolationRecord } from "../hooks/useTrafficSimulation";

interface ViolationsPageProps {
  violations: ViolationRecord[];
  addViolation: (
    dir: Direction,
    plate: string,
    vtype: string,
    severity: string,
  ) => Promise<void>;
}

const VIOLATION_TYPES = [
  "Red Light Running",
  "Speeding",
  "Wrong Way Entry",
  "Lane Violation",
];

export function ViolationsPage({
  violations,
  addViolation,
}: ViolationsPageProps) {
  const [filter, setFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newDir, setNewDir] = useState<Direction>(Direction.north);
  const [newType, setNewType] = useState(VIOLATION_TYPES[0]);
  const [newSeverity, setNewSeverity] = useState("medium");
  const PER_PAGE = 10;

  const filtered =
    filter === "all"
      ? violations
      : violations.filter((v) => v.severity === filter);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleAdd = async () => {
    if (!newPlate.trim()) return;
    await addViolation(newDir, newPlate.toUpperCase(), newType, newSeverity);
    setNewPlate("");
    setAddOpen(false);
  };

  const stats = {
    high: violations.filter((v) => v.severity === "high").length,
    medium: violations.filter((v) => v.severity === "medium").length,
    low: violations.filter((v) => v.severity === "low").length,
  };

  return (
    <main data-ocid="violations.page" className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Violation Records
          </h1>
          <p className="text-xs text-steel mt-0.5">
            All detected traffic violations — {total} records
          </p>
        </div>
        <Button
          data-ocid="violations.add_button"
          onClick={() => setAddOpen(!addOpen)}
          className="text-xs"
          style={{
            background: "#1A2A43",
            color: "#E9EEF7",
            border: "1px solid #25344D",
          }}
        >
          + Add Violation
        </Button>
      </div>

      {/* Add Violation Form */}
      {addOpen && (
        <div
          data-ocid="violations.modal"
          className="rounded-xl p-4 border space-y-3"
          style={{ background: "#121C2E", borderColor: "#25344D" }}
        >
          <h3 className="text-sm font-semibold text-foreground">
            Add New Violation
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="violation-plate"
                className="text-xs text-steel mb-1 block"
              >
                Plate Number
              </label>
              <Input
                id="violation-plate"
                data-ocid="violations.input"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
                placeholder="TN01AB1234"
                className="bg-navy-500 border-navy-300 text-foreground text-xs h-8"
              />
            </div>
            <div>
              <label
                htmlFor="violation-dir"
                className="text-xs text-steel mb-1 block"
              >
                Direction
              </label>
              <Select
                value={newDir}
                onValueChange={(v) => setNewDir(v as Direction)}
              >
                <SelectTrigger
                  id="violation-dir"
                  data-ocid="violations.select"
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
            <div>
              <label
                htmlFor="violation-type"
                className="text-xs text-steel mb-1 block"
              >
                Violation Type
              </label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger
                  id="violation-type"
                  className="bg-navy-500 border-navy-300 text-foreground text-xs h-8"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{ background: "#1A2A43", border: "1px solid #25344D" }}
                >
                  {VIOLATION_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-foreground">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="violation-severity"
                className="text-xs text-steel mb-1 block"
              >
                Severity
              </label>
              <Select value={newSeverity} onValueChange={setNewSeverity}>
                <SelectTrigger
                  id="violation-severity"
                  className="bg-navy-500 border-navy-300 text-foreground text-xs h-8"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{ background: "#1A2A43", border: "1px solid #25344D" }}
                >
                  <SelectItem value="high" className="text-signal-red">
                    High
                  </SelectItem>
                  <SelectItem value="medium" className="text-signal-yellow">
                    Medium
                  </SelectItem>
                  <SelectItem value="low" className="text-signal-green">
                    Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              data-ocid="violations.submit_button"
              onClick={handleAdd}
              className="text-xs"
              style={{ background: "#2D73FF", color: "white" }}
            >
              Add Record
            </Button>
            <Button
              data-ocid="violations.cancel_button"
              variant="ghost"
              onClick={() => setAddOpen(false)}
              className="text-xs text-steel"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: total, color: "#9AA9C0" },
          { label: "High", value: stats.high, color: "#E53E3E" },
          { label: "Medium", value: stats.medium, color: "#F2C94C" },
          { label: "Low", value: stats.low, color: "#2ECC71" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-3 border text-center"
            style={{ background: "#121C2E", borderColor: "#25344D" }}
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-xs text-steel mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["all", "high", "medium", "low"].map((f) => (
          <button
            type="button"
            key={f}
            data-ocid={`violations.${f}.tab`}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border capitalize transition-colors"
            style={{
              background: filter === f ? "#1A2A43" : "transparent",
              borderColor: filter === f ? "#2D73FF" : "#25344D",
              color: filter === f ? "#E9EEF7" : "#9AA9C0",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-xl border"
        style={{ background: "#121C2E", borderColor: "#25344D" }}
      >
        <div className="p-3">
          <ViolationTable violations={pageData} compact={false} />
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: "#25344D" }}
          >
            <span className="text-xs text-steel">
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="violations.pagination_prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs px-3 py-1 rounded border disabled:opacity-30 transition-colors"
                style={{ borderColor: "#25344D", color: "#9AA9C0" }}
              >
                ← Prev
              </button>
              <button
                type="button"
                data-ocid="violations.pagination_next"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="text-xs px-3 py-1 rounded border disabled:opacity-30 transition-colors"
                style={{ borderColor: "#25344D", color: "#9AA9C0" }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
