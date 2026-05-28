"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Activity, Grade, Student } from "@/types";
import {
  getGradeStatus,
  gradeStatusLabels,
  gradeStatusStyles,
} from "@/lib/grades";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

interface QuickCaptureMobileProps {
  students: Student[];
  activity: Activity;
  grades: Grade[];
}

type FilterMode = "all" | "pending" | "graded";

export function QuickCaptureMobile({
  students,
  activity,
  grades,
}: QuickCaptureMobileProps) {
  const upsertGrade = useAppStore((s) => s.upsertGrade);
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerFilter, setPickerFilter] = useState<FilterMode>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const student = students[index];
  const currentGrade = useMemo(() => {
    return grades.find(
      (g) => g.studentId === student?.id && g.activityId === activity.id
    );
  }, [grades, student, activity]);

  const [draft, setDraft] = useState<string>(
    currentGrade?.value != null ? String(currentGrade.value) : ""
  );

  useEffect(() => {
    setDraft(currentGrade?.value != null ? String(currentGrade.value) : "");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [index, currentGrade]);

  // Mapa alumno → grade existente, para mostrar en el selector
  const gradeByStudent = useMemo(() => {
    const m = new Map<string, Grade>();
    grades
      .filter((g) => g.activityId === activity.id)
      .forEach((g) => m.set(g.studentId, g));
    return m;
  }, [grades, activity.id]);

  const completed = students.filter(
    (s) => (gradeByStudent.get(s.id)?.value ?? null) !== null
  ).length;

  const save = (advance: boolean) => {
    const trimmed = draft.trim();
    let value: number | null = null;
    if (trimmed !== "") {
      const n = parseFloat(trimmed.replace(",", "."));
      if (!Number.isNaN(n)) value = Math.max(0, Math.min(10, n));
    }
    setSaving(true);
    upsertGrade({ studentId: student.id, activityId: activity.id, value });
    setTimeout(() => {
      setSaving(false);
      if (advance) {
        // Avanzar al siguiente alumno pendiente (mejor UX que el siguiente lineal)
        const nextPending = findNextPending(index);
        if (nextPending !== -1) {
          setIndex(nextPending);
        } else {
          toast.success("¡Todos calificados!", {
            description: `${students.length} alumnos completos`,
            duration: 1500,
          });
        }
      } else {
        toast.success("Guardado", {
          description: student.fullName,
          duration: 1000,
        });
      }
    }, 220);
  };

  const findNextPending = (fromIdx: number) => {
    for (let i = fromIdx + 1; i < students.length; i++) {
      if ((gradeByStudent.get(students[i].id)?.value ?? null) === null) return i;
    }
    // Buscar desde el inicio
    for (let i = 0; i <= fromIdx; i++) {
      if ((gradeByStudent.get(students[i].id)?.value ?? null) === null) return i;
    }
    return -1;
  };

  const skip = () => {
    const nextIdx = (index + 1) % students.length;
    setIndex(nextIdx);
  };

  const goPrev = () => {
    setIndex(Math.max(0, index - 1));
  };

  const goToStudent = (studentId: string) => {
    const idx = students.findIndex((s) => s.id === studentId);
    if (idx >= 0) {
      setIndex(idx);
      setPickerOpen(false);
      setPickerQuery("");
    }
  };

  // Lista filtrada en el picker
  const pickerStudents = useMemo(() => {
    const q = pickerQuery.toLowerCase().trim();
    return students.filter((s) => {
      const g = gradeByStudent.get(s.id);
      const isGraded = (g?.value ?? null) !== null;
      if (pickerFilter === "pending" && isGraded) return false;
      if (pickerFilter === "graded" && !isGraded) return false;
      if (q && !s.fullName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [students, pickerQuery, pickerFilter, gradeByStudent]);

  if (!student) return null;

  const grade = draft ? parseFloat(draft.replace(",", ".")) : null;
  const status = getGradeStatus(grade);
  const pendingCount = students.length - completed;
  const quickButtons = [10, 9, 8, 7, 6, 5];

  return (
    <>
      {/* Contenido con padding inferior para no quedar bajo la barra fija + nav móvil */}
      <div className="flex flex-col gap-4 pb-[calc(8.5rem+env(safe-area-inset-bottom))] animate-fade-in">
        {/* Progreso */}
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              <span className="font-medium text-foreground">{index + 1}</span> de{" "}
              {students.length}
            </span>
            <span>
              <span className="font-medium text-emerald-600">{completed}</span>{" "}
              calificados · {pendingCount} por calificar
            </span>
          </div>
          <Progress
            value={(completed / students.length) * 100}
            className="h-1.5"
            indicatorClassName="bg-emerald-500"
          />
        </div>

        {/* Header con alumno actual = botón para abrir el selector */}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="rounded-2xl border bg-card p-5 text-center transition-all active:scale-[0.99] hover:bg-accent/40 group"
        >
          <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            <Users className="h-3 w-3 shrink-0" />
            Toca para cambiar de alumno
          </div>
          {(currentGrade?.value ?? null) !== null && (
            <div className="flex justify-center mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 text-[10px] font-medium border border-emerald-500/30">
                <Check className="h-3 w-3" /> Calificado
              </span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 px-1">
            <p className="font-semibold text-xl leading-tight">{student.fullName}</p>
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {student.studentCode} · Lista #{index + 1}
          </p>
        </button>

        {/* Input grande */}
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground text-center mb-4">
            Calificación
          </p>
          <div className="flex items-center justify-center">
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max="10"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="—"
              className={cn(
                "w-44 h-28 text-6xl font-bold text-center tabular-nums rounded-2xl border-2 bg-transparent transition-all",
                "focus:outline-none focus:ring-4 focus:ring-primary/20",
                gradeStatusStyles[status]
              )}
            />
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {gradeStatusLabels[status]}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {quickButtons.map((v) => (
              <Button
                key={v}
                size="lg"
                variant="outline"
                onClick={() => setDraft(String(v))}
                className="h-12 text-lg font-semibold"
              >
                {v}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Barra de acciones fija — encima del nav móvil, sin sobreponer contenido */}
      <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 border-t bg-background/95 backdrop-blur-sm px-4 py-2.5 md:hidden">
        <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
          <Button
            variant="outline"
            size="lg"
            onClick={goPrev}
            disabled={index === 0}
            className="h-12"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={skip}
            className="h-12 text-sm gap-1 text-muted-foreground px-2"
          >
            <CircleSlash className="h-4 w-4 shrink-0" />
            <span className="truncate">Omitir</span>
          </Button>
          <Button
            size="lg"
            onClick={() => save(true)}
            className="h-12 col-span-2"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : pendingCount <= 1 && (currentGrade?.value ?? null) === null ? (
              <>
                <Check className="h-5 w-5" /> Terminar
              </>
            ) : (
              <>
                <span className="truncate">Guardar y siguiente</span>
                <ChevronRight className="h-5 w-5 shrink-0" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ─── Selector de alumno ─────────────────────────────────────── */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden max-h-[85vh] flex flex-col">
          <DialogHeader className="p-4 pb-3 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Elegir alumno
            </DialogTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={pickerQuery}
                onChange={(e) => setPickerQuery(e.target.value)}
                placeholder="Buscar por nombre…"
                className="pl-9 h-10"
                autoFocus
              />
            </div>
            <div className="flex items-center rounded-lg border p-0.5 bg-muted/30 mt-2">
              {(
                [
                  { id: "all", label: `Todos · ${students.length}` },
                  { id: "pending", label: `Pendientes · ${pendingCount}` },
                  { id: "graded", label: `Calificados · ${completed}` },
                ] as { id: FilterMode; label: string }[]
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPickerFilter(f.id)}
                  className={cn(
                    "flex-1 h-8 rounded-md text-xs font-medium transition-colors",
                    pickerFilter === f.id
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {pickerStudents.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Sin resultados
              </div>
            ) : (
              <ul className="divide-y">
                {pickerStudents.map((s) => {
                  const g = gradeByStudent.get(s.id);
                  const v = g?.value ?? null;
                  const isGraded = v !== null;
                  const isCurrent = s.id === student.id;
                  const studentStatus = getGradeStatus(v);
                  const realIdx = students.findIndex((x) => x.id === s.id);
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() => goToStudent(s.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                          isCurrent
                            ? "bg-primary/8"
                            : "hover:bg-accent/60 active:bg-accent"
                        )}
                      >
                        <span className="w-7 text-center tabular-nums text-xs text-muted-foreground shrink-0">
                          {realIdx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm truncate",
                              isCurrent ? "font-semibold" : "font-medium"
                            )}
                          >
                            {s.fullName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {s.studentCode}
                          </p>
                        </div>
                        {isGraded ? (
                          <span
                            className={cn(
                              "px-2 py-1 rounded-md border text-xs font-semibold tabular-nums min-w-[40px] text-center",
                              gradeStatusStyles[studentStatus]
                            )}
                          >
                            {v?.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic px-2">
                            Pendiente
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-primary text-xs font-medium ml-1">
                            Aquí
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t p-3 grid grid-cols-2 gap-2 bg-muted/20">
            <Button
              variant="outline"
              onClick={() => {
                const nextPending = findNextPending(index);
                if (nextPending !== -1) {
                  setIndex(nextPending);
                  setPickerOpen(false);
                  setPickerQuery("");
                } else {
                  toast.success("¡No quedan pendientes!");
                }
              }}
              disabled={pendingCount === 0}
            >
              Ir al siguiente pendiente
            </Button>
            <Button variant="ghost" onClick={() => setPickerOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
