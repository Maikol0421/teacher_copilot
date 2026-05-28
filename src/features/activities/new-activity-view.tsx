"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  BookOpenText,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Loader2,
  MessageSquareText,
  Presentation,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore, selectActiveSchoolYear } from "@/store/app-store";
import { ActivityType } from "@/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Callout } from "@/components/shared/callout";

const ACTIVITY_TYPES: Array<{
  value: ActivityType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}> = [
  {
    value: "tarea",
    label: "Tarea",
    description: "Trabajo en casa o asignación corta.",
    icon: ClipboardCheck,
    color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/30",
  },
  {
    value: "examen",
    label: "Examen",
    description: "Evaluación escrita o digital.",
    icon: GraduationCap,
    color: "bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-500/30",
  },
  {
    value: "trabajo",
    label: "Trabajo",
    description: "Proyecto o investigación.",
    icon: BookOpenText,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/30",
  },
  {
    value: "participacion",
    label: "Participación",
    description: "Intervenciones y aportes en clase.",
    icon: MessageSquareText,
    color: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/30",
  },
  {
    value: "exposicion",
    label: "Exposición",
    description: "Presentación oral o demostración.",
    icon: Presentation,
    color: "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-500/30",
  },
];

export default function NewActivityView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { groups, subjects, periods, criteria } = useAppStore();
  const activeYear = useAppStore(selectActiveSchoolYear);
  const addActivity = useAppStore((s) => s.addActivity);

  // Grupos del ciclo activo y configurados
  const eligibleGroups = useMemo(() => {
    if (!activeYear) return [];
    return groups.filter(
      (g) =>
        g.schoolYearId === activeYear.id &&
        subjects.some((s) => s.groupId === g.id) &&
        periods.some((p) => p.groupId === g.id)
    );
  }, [activeYear, groups, subjects, periods]);

  // Autoselección de grupo si solo hay 1
  const initialGroup =
    searchParams.get("group") ??
    (eligibleGroups.length === 1 ? eligibleGroups[0].id : "");

  const [name, setName] = useState("");
  const [type, setType] = useState<ActivityType>("tarea");
  const [groupId, setGroupId] = useState(initialGroup);
  const [subjectId, setSubjectId] = useState("");
  const [criterionId, setCriterionId] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [maxScore, setMaxScore] = useState("10");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const groupSubjects = useMemo(() => {
    return subjects.filter((s) => s.groupId === groupId);
  }, [subjects, groupId]);

  const currentGroup = eligibleGroups.find((g) => g.id === groupId);
  const activePeriod = currentGroup?.activePeriodId
    ? periods.find((p) => p.id === currentGroup.activePeriodId)
    : null;
  const currentSubject = groupSubjects.find((s) => s.id === subjectId);

  const subjectCriteria = useMemo(() => {
    if (!currentSubject || !activePeriod) return [];
    return criteria
      .filter(
        (c) => c.subjectId === currentSubject.id && c.periodId === activePeriod.id
      )
      .sort((a, b) => a.order - b.order);
  }, [criteria, currentSubject, activePeriod]);

  // Autoselect materia si solo 1
  useEffect(() => {
    if (groupId && groupSubjects.length === 1) {
      setSubjectId(groupSubjects[0].id);
    } else if (!groupSubjects.some((s) => s.id === subjectId)) {
      setSubjectId("");
    }
  }, [groupId, groupSubjects, subjectId]);

  // Autoselect criterio si solo 1
  useEffect(() => {
    if (subjectId && subjectCriteria.length === 1) {
      setCriterionId(subjectCriteria[0].id);
    } else if (!subjectCriteria.some((c) => c.id === criterionId)) {
      setCriterionId("");
    }
  }, [subjectId, subjectCriteria, criterionId]);

  const canSubmit =
    name.trim() && groupId && subjectId && criterionId && activePeriod && dueDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !activePeriod) return;
    setSubmitting(true);
    await addActivity({
      groupId,
      subjectId,
      periodId: activePeriod.id,
      criterionId,
      name: name.trim(),
      type,
      dueDate: new Date(dueDate).toISOString(),
      maxScore: Number(maxScore),
      description,
    });
    toast.success("Actividad creada", { description: name.trim() });
    setSubmitting(false);
    router.push(`/grupos/${groupId}`);
  };

  if (!activeYear) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader title="Nueva actividad" />
        <Callout
          tone="warning"
          icon={AlertCircle}
          title="Necesitas un ciclo escolar activo"
          description="Selecciona o crea un ciclo escolar para crear actividades."
          action={
            <Button asChild>
              <Link href="/ciclos">Ir a ciclos</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (eligibleGroups.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageHeader title="Nueva actividad" />
        <Callout
          tone="warning"
          icon={AlertCircle}
          title="No hay grupos configurados"
          description="Necesitas al menos un grupo con materias y periodos configurados antes de crear actividades."
          action={
            <Button asChild>
              <Link href="/grupos">Ir a grupos</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Nueva actividad"
        description="La actividad se atar? a un grupo, materia y criterio del periodo activo."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Tipo de actividad
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {ACTIVITY_TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = type === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center",
                        active
                          ? `${t.color} border-current shadow-sm`
                          : "border-border hover:border-foreground/20 hover:bg-accent/40"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active && "scale-110")} />
                      <p className="text-xs font-semibold">{t.label}</p>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {ACTIVITY_TYPES.find((t) => t.value === type)?.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Ej. Resumen del Sistema Solar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Grupo</Label>
                <Select
                  value={groupId}
                  onValueChange={(v) => {
                    setGroupId(v);
                    setSubjectId("");
                    setCriterionId("");
                  }}
                  disabled={eligibleGroups.length === 1}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleGroups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: g.color }}
                          />
                          {g.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {eligibleGroups.length === 1 && (
                  <p className="text-[10px] text-muted-foreground">
                    Autoseleccionado (único grupo configurado).
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Materia</Label>
                <Select
                  value={subjectId}
                  onValueChange={setSubjectId}
                  disabled={!groupId || groupSubjects.length === 1}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        groupId ? "Selecciona materia" : "Elige un grupo primero"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {groupSubjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2">
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
                {groupSubjects.length === 1 && (
                  <p className="text-[10px] text-muted-foreground">
                    Autoseleccionada (única materia).
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Criterio</Label>
                <Select
                  value={criterionId}
                  onValueChange={setCriterionId}
                  disabled={!subjectId || subjectCriteria.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona criterio" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectCriteria.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} <span className="text-muted-foreground">({c.weight}%)</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {subjectId && subjectCriteria.length === 0 && (
                  <p className="text-[10px] text-amber-600">
                    Esta materia no tiene criterios definidos en su periodo activo.
                  </p>
                )}
              </div>
            </div>

            {activePeriod && (
              <div className="text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
                Esta actividad se registrará en el periodo activo del grupo:{" "}
                <strong className="text-foreground">{activePeriod.name}</strong>.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">
                  <CalendarDays className="inline h-3.5 w-3.5 mr-1" />
                  Fecha de entrega
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxScore">Puntuación máxima</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min="0"
                  max="100"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Instrucciones, criterios o material para la actividad…"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit || submitting}
            size="lg"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Crear actividad
          </Button>
        </div>
      </form>
    </div>
  );
}
