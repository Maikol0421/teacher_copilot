"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { Criterion, Group, Period, Subject } from "@/types";
import { validateCriteria } from "@/lib/grades";
import { cn } from "@/lib/utils";

interface Props {
  group: Group;
  subjects: Subject[];
  periods: Period[];
  criteria: Criterion[];
}

interface DraftItem {
  id?: string;
  name: string;
  weight: number;
}

const SUGGESTIONS = ["Examen", "Tareas", "Trabajos", "Participación", "Exposiciones", "Proyecto", "Cuaderno"];

export function CriteriaEditor({ group: _group, subjects, periods, criteria }: Props) {
  const saveCriteria = useAppStore((s) => s.saveCriteria);

  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id ?? "");
  const [periodId, setPeriodId] = useState<string>(periods[0]?.id ?? "");
  const [draft, setDraft] = useState<DraftItem[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar criterios actuales cuando cambia (subject, period)
  useEffect(() => {
    if (!subjectId || !periodId) {
      setDraft([]);
      return;
    }
    const existing = criteria
      .filter((c) => c.subjectId === subjectId && c.periodId === periodId)
      .sort((a, b) => a.order - b.order)
      .map((c) => ({ id: c.id, name: c.name, weight: c.weight }));
    if (existing.length > 0) setDraft(existing);
    else
      setDraft([
        { name: "Examen", weight: 40 },
        { name: "Tareas", weight: 30 },
        { name: "Trabajos", weight: 20 },
        { name: "Participación", weight: 10 },
      ]);
  }, [subjectId, periodId, criteria]);

  const validation = useMemo(() => validateCriteria(draft), [draft]);

  const handleAdd = (suggested?: string) => {
    setDraft((d) => [
      ...d,
      { name: suggested ?? "", weight: Math.max(0, 100 - d.reduce((a, b) => a + b.weight, 0)) },
    ]);
  };

  const handleRemove = (idx: number) => {
    setDraft((d) => d.filter((_, i) => i !== idx));
  };

  const handleAutoBalance = () => {
    if (draft.length === 0) return;
    const even = Math.floor(100 / draft.length);
    const remainder = 100 - even * draft.length;
    setDraft((d) =>
      d.map((it, i) => ({ ...it, weight: i === 0 ? even + remainder : even }))
    );
  };

  const handleSave = async () => {
    setSaveState("saving");
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    const r = await saveCriteria({
      groupId: _group.id,
      subjectId,
      periodId,
      items: draft,
    });
    if (!r.ok) {
      setSaveState("idle");
      toast.error(r.error);
      return;
    }
    setSaveState("saved");
    toast.success("Criterios guardados");
    savedTimeoutRef.current = setTimeout(() => setSaveState("idle"), 1800);
  };

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  if (subjects.length === 0 || periods.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card/40 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Primero agrega al menos 1 materia y 1 periodo para configurar criterios.
        </p>
      </div>
    );
  }

  const currentPeriod = periods.find((p) => p.id === periodId);
  const activePeriodHint = _group.activePeriodId === periodId;

  return (
    <div className="space-y-4">
      {/* Selectores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Materia
          </label>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Periodo
          </label>
          <Select value={periodId} onValueChange={setPeriodId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activePeriodHint && currentPeriod && (
        <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 rounded-md px-2.5 py-1.5">
          <Check className="h-3.5 w-3.5" />
          <span>
            <strong>{currentPeriod.name}</strong> es el periodo activo del grupo.
          </span>
        </div>
      )}

      {/* Lista de criterios editable */}
      <div className="space-y-2">
        {draft.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 rounded-lg border bg-card/60 p-2"
          >
            <span className="text-xs font-mono text-muted-foreground w-6 text-center">
              {idx + 1}
            </span>
            <Input
              value={item.name}
              onChange={(e) =>
                setDraft((d) =>
                  d.map((it, i) => (i === idx ? { ...it, name: e.target.value } : it))
                )
              }
              placeholder="Nombre del criterio"
              className="flex-1"
            />
            <div className="relative w-24 shrink-0">
              <Input
                type="number"
                min="0"
                max="100"
                value={item.weight}
                onChange={(e) =>
                  setDraft((d) =>
                    d.map((it, i) =>
                      i === idx
                        ? { ...it, weight: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }
                        : it
                    )
                  )
                }
                className="pr-7 text-right tabular-nums"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                %
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-rose-600"
              onClick={() => handleRemove(idx)}
              aria-label="Eliminar criterio"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Sugerencias rápidas */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground mr-1">Sugerencias:</span>
        {SUGGESTIONS.filter((s) => !draft.some((d) => d.name === s)).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleAdd(s)}
            className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-accent transition-colors"
          >
            + {s}
          </button>
        ))}
      </div>

      {/* Barra de validación */}
      <div className="rounded-lg border bg-card/40 p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Total
          </span>
          <span
            className={cn(
              "text-lg font-semibold tabular-nums",
              validation.isValid ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {validation.total}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full transition-all",
              validation.isValid
                ? "bg-emerald-500"
                : validation.total > 100
                  ? "bg-rose-500"
                  : "bg-amber-500"
            )}
            style={{ width: `${Math.min(100, validation.total)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          {validation.isValid ? (
            <span className="flex items-center gap-1 text-emerald-600">
              <Check className="h-3.5 w-3.5" /> Listo para guardar
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-600">
              <AlertCircle className="h-3.5 w-3.5" />
              {validation.total > 100
                ? `Excede por ${validation.total - 100}%`
                : `Faltan ${validation.missing}%`}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleAutoBalance} className="h-7 text-xs">
            Auto-balance
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
        <Button variant="outline" onClick={() => handleAdd()} className="border-dashed">
          <Plus className="h-4 w-4" /> Agregar criterio
        </Button>
        <Button
          onClick={handleSave}
          disabled={!validation.isValid || saveState !== "idle"}
          className={cn(
            saveState === "saved" &&
              "bg-emerald-600 hover:bg-emerald-600 text-white"
          )}
        >
          {saveState === "saving" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Guardando…
            </>
          ) : saveState === "saved" ? (
            <>
              <Check className="h-4 w-4" /> Guardado
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Guardar criterios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
