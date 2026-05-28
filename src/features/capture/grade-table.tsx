"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Criterion, Grade, Student, Subject } from "@/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { getGradeStatus, gradeStatusStyles } from "@/lib/grades";
import { ActivityTypeBadge } from "@/features/activities/activity-type-badge";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GradeTableProps {
  students: Student[];
  activities: Activity[];
  subjects: Subject[];
  grades: Grade[];
  criteria?: Criterion[];
}

interface CellRef {
  studentIdx: number;
  activityIdx: number;
}

export function GradeTable({ students, activities, subjects, grades, criteria }: GradeTableProps) {
  const upsertGrade = useAppStore((s) => s.upsertGrade);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [active, setActive] = useState<CellRef | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const valueMap = useMemo(() => {
    const m = new Map<string, number | null>();
    for (const g of grades) m.set(`${g.studentId}|${g.activityId}`, g.value);
    return m;
  }, [grades]);

  const getRef = useCallback((s: number, a: number) => `cell-${s}-${a}`, []);

  const handleChange = useCallback(
    (studentId: string, activityId: string, raw: string) => {
      const trimmed = raw.trim();
      if (trimmed === "") {
        upsertGrade({ studentId, activityId, value: null });
        return;
      }
      const num = parseFloat(trimmed.replace(",", "."));
      if (Number.isNaN(num)) return;
      const value = Math.max(0, Math.min(10, num));
      const key = `${studentId}|${activityId}`;
      setSaving(key);
      upsertGrade({ studentId, activityId, value });
      // Simulated autosave
      setTimeout(() => {
        setSaving(null);
        setSavedAt(new Date());
      }, 350);
    },
    [upsertGrade]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, studentIdx: number, activityIdx: number) => {
      let target: HTMLInputElement | null = null;
      const focusByRef = (s: number, a: number) => {
        const el = containerRef.current?.querySelector<HTMLInputElement>(
          `[data-cell="${getRef(s, a)}"]`
        );
        el?.focus();
        el?.select();
      };

      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = (studentIdx + 1) % students.length;
        focusByRef(next, activityIdx);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = (studentIdx - 1 + students.length) % students.length;
        focusByRef(next, activityIdx);
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          const a = activityIdx - 1;
          if (a < 0) {
            const s = (studentIdx - 1 + students.length) % students.length;
            focusByRef(s, activities.length - 1);
          } else focusByRef(studentIdx, a);
        } else {
          const a = activityIdx + 1;
          if (a >= activities.length) {
            const s = (studentIdx + 1) % students.length;
            focusByRef(s, 0);
          } else focusByRef(studentIdx, a);
        }
      } else if (e.key === "ArrowRight") {
        const t = e.target as HTMLInputElement;
        if (t.selectionStart === t.value.length) {
          e.preventDefault();
          const a = (activityIdx + 1) % activities.length;
          focusByRef(studentIdx, a);
        }
      } else if (e.key === "ArrowLeft") {
        const t = e.target as HTMLInputElement;
        if (t.selectionStart === 0) {
          e.preventDefault();
          const a = (activityIdx - 1 + activities.length) % activities.length;
          focusByRef(studentIdx, a);
        }
      } else if (e.key === "Escape") {
        (e.target as HTMLInputElement).blur();
      }
    },
    [students.length, activities.length, getRef]
  );

  useEffect(() => {
    if (savedAt) {
      const t = setTimeout(() => {
        toast.success("Calificaciones guardadas", {
          description: "Autoguardado completo.",
          duration: 1500,
        });
      }, 0);
      return () => clearTimeout(t);
    }
  }, [savedAt]);

  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card/40 p-12 text-center">
        <p className="text-muted-foreground">No hay actividades en este grupo.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/30 text-xs">
        <p className="text-muted-foreground">
          Usa <kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px]">Tab</kbd>{" "}
          y <kbd className="rounded border bg-background px-1.5 py-0.5 text-[10px]">Enter</kbd>{" "}
          para navegar. Las calificaciones se guardan automáticamente.
        </p>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Guardando…</span>
            </>
          ) : savedAt ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>Guardado</span>
            </>
          ) : (
            <span>Listo para capturar</span>
          )}
        </div>
      </div>

      <div className="overflow-auto scrollbar-thin max-h-[70vh]">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead className="sticky top-0 z-20 bg-card">
            <tr>
              <th
                className="sticky left-0 z-30 bg-card border-b border-r px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground"
                style={{ minWidth: 240 }}
              >
                Alumno
              </th>
              {activities.map((a) => {
                const subject = subjects.find((s) => s.id === a.subjectId);
                const criterion = criteria?.find((c) => c.id === a.criterionId);
                return (
                  <th
                    key={a.id}
                    className="border-b border-r last:border-r-0 px-3 py-2 text-left font-normal align-bottom"
                    style={{ minWidth: 140 }}
                  >
                    <div className="flex flex-col gap-1.5 items-start">
                      <ActivityTypeBadge type={a.type} />
                      <p className="text-xs font-medium line-clamp-2">{a.name}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {subject && (
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: subject.color }}
                          >
                            {subject.code}
                          </span>
                        )}
                        {criterion && (
                          <span className="text-[10px] text-muted-foreground">
                            · {criterion.name} {criterion.weight}%
                          </span>
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {students.map((student, si) => (
              <tr key={student.id} className="group">
                <td
                  className={cn(
                    "sticky left-0 z-10 bg-card border-b border-r px-4 py-2",
                    "group-hover:bg-accent/30 transition-colors"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] tabular-nums text-muted-foreground w-5 text-right shrink-0">
                      {si + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{student.fullName}</p>
                      <p className="text-[10px] text-muted-foreground">{student.studentCode}</p>
                    </div>
                  </div>
                </td>
                {activities.map((a, ai) => {
                  const val = valueMap.get(`${student.id}|${a.id}`) ?? null;
                  const status = getGradeStatus(val);
                  const isActive = active?.studentIdx === si && active?.activityIdx === ai;
                  return (
                    <td
                      key={a.id}
                      className={cn(
                        "border-b border-r last:border-r-0 group-hover:bg-accent/20 transition-colors",
                        isActive && "bg-primary/5"
                      )}
                    >
                      <input
                        type="text"
                        inputMode="decimal"
                        defaultValue={val == null ? "" : val.toString()}
                        data-cell={getRef(si, ai)}
                        onFocus={() => setActive({ studentIdx: si, activityIdx: ai })}
                        onBlur={() => setActive(null)}
                        onChange={(e) =>
                          handleChange(student.id, a.id, e.currentTarget.value)
                        }
                        onKeyDown={(e) => handleKeyDown(e, si, ai)}
                        placeholder="—"
                        className={cn(
                          "h-9 w-full px-3 text-sm font-semibold tabular-nums bg-transparent",
                          "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-inset",
                          "transition-colors text-center rounded-none",
                          gradeStatusStyles[status],
                          status === "empty" && "text-muted-foreground"
                        )}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
