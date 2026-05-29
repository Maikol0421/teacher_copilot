"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Sliders,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore, selectActiveSchoolYear } from "@/store/app-store";
import { PageHeader } from "@/components/shared/page-header";
import { useIsMobile } from "@/hooks/use-mobile";
import { GradeTable } from "./grade-table";
import { QuickCaptureMobile } from "./quick-capture-mobile";
import { EmptyState } from "@/components/shared/empty-state";
import { Callout } from "@/components/shared/callout";
import { formatDate } from "@/lib/utils";
import { groupDetailPath } from "@/lib/routes";
import { sortStudentsByLastName } from "@/lib/students";

export default function CaptureView() {
  const searchParams = useSearchParams();
  const { groups, students, subjects, periods, criteria, activities, grades } =
    useAppStore();
  const activeYear = useAppStore(selectActiveSchoolYear);
  const isMobile = useIsMobile();

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
    (eligibleGroups.length === 1 ? eligibleGroups[0].id : eligibleGroups[0]?.id ?? "");

  const [groupId, setGroupId] = useState<string>(initialGroup);
  const [subjectId, setSubjectId] = useState<string>("");
  const [criterionId, setCriterionId] = useState<string>("");
  const [activityId, setActivityId] = useState<string>("");

  // ── Grupo + periodo activo del grupo ──
  const currentGroup = eligibleGroups.find((g) => g.id === groupId);
  const activePeriod = currentGroup?.activePeriodId
    ? periods.find((p) => p.id === currentGroup.activePeriodId)
    : null;

  // ── Materias del grupo ──
  const groupSubjects = useMemo(
    () => subjects.filter((s) => s.groupId === groupId),
    [subjects, groupId]
  );

  const currentSubject = groupSubjects.find((s) => s.id === subjectId);

  // ── Criterios del (materia, periodo activo del grupo) ──
  const subjectCriteria = useMemo(() => {
    if (!currentSubject || !activePeriod) return [];
    return criteria
      .filter(
        (c) => c.subjectId === currentSubject.id && c.periodId === activePeriod.id
      )
      .sort((a, b) => a.order - b.order);
  }, [criteria, currentSubject, activePeriod]);

  // ── Actividades del criterio, ordenadas de más reciente a más antigua ──
  const criterionActivities = useMemo(() => {
    if (!criterionId) return [];
    return activities
      .filter((a) => a.criterionId === criterionId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [activities, criterionId]);

  // Auto-selecciones en cascada
  useEffect(() => {
    if (groupSubjects.length === 1) {
      setSubjectId(groupSubjects[0].id);
    } else if (!groupSubjects.some((s) => s.id === subjectId)) {
      setSubjectId("");
    }
  }, [groupId, groupSubjects, subjectId]);

  useEffect(() => {
    if (subjectCriteria.length === 1) {
      setCriterionId(subjectCriteria[0].id);
    } else if (!subjectCriteria.some((c) => c.id === criterionId)) {
      setCriterionId("");
    }
  }, [subjectId, subjectCriteria, criterionId]);

  useEffect(() => {
    // Autoseleccionar la actividad más reciente del criterio
    if (criterionActivities.length > 0) {
      const stillExists = criterionActivities.some((a) => a.id === activityId);
      if (!stillExists) setActivityId(criterionActivities[0].id);
    } else {
      setActivityId("");
    }
  }, [criterionId, criterionActivities, activityId]);

  const groupStudents = useMemo(
    () => sortStudentsByLastName(students.filter((s) => s.groupId === groupId)),
    [students, groupId]
  );

  const activity = criterionActivities.find((a) => a.id === activityId);

  // Stats
  const filledForActivity = activity
    ? grades.filter((g) => g.activityId === activity.id && g.value != null).length
    : 0;
  const progress =
    activity && groupStudents.length > 0
      ? Math.round((filledForActivity / groupStudents.length) * 100)
      : 0;

  // ── Estados vacíos ──
  if (!activeYear) {
    return (
      <div className="space-y-6">
        <PageHeader title="Capturar calificaciones" />
        <Callout
          tone="warning"
          icon={AlertCircle}
          title="Selecciona un ciclo escolar"
          description="Para capturar calificaciones primero necesitas un ciclo escolar activo."
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
      <div className="space-y-6">
        <PageHeader title="Capturar calificaciones" />
        <Callout
          tone="warning"
          icon={AlertCircle}
          title="Sin grupos configurados"
          description="Configura al menos un grupo con materias y periodos para empezar."
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
    <div className="space-y-6">
      <PageHeader
        title="Capturar calificaciones"
        description="Elige grupo, materia y criterio. La actividad más reciente se autoselecciona."
        actions={
          activity ? (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-muted-foreground">
                {filledForActivity} de {groupStudents.length} ({progress}%)
              </span>
            </div>
          ) : null
        }
      />

      {/* Selector cascada */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <SelectorField
            icon={Users}
            label="Grupo"
            autoSelected={eligibleGroups.length === 1}
          >
            <Select
              value={groupId}
              onValueChange={setGroupId}
              disabled={eligibleGroups.length === 1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                {eligibleGroups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    <span className="inline-flex items-center gap-2">
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
          </SelectorField>

          <SelectorField
            icon={BookOpen}
            label="Materia"
            autoSelected={groupSubjects.length === 1}
          >
            <Select
              value={subjectId}
              onValueChange={setSubjectId}
              disabled={!groupId || groupSubjects.length === 1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Materia" />
              </SelectTrigger>
              <SelectContent>
                {groupSubjects.map((s) => (
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
          </SelectorField>

          <SelectorField
            icon={Sliders}
            label="Criterio"
            autoSelected={subjectCriteria.length === 1}
            hint={
              activePeriod ? `Periodo: ${activePeriod.name}` : "Sin periodo activo"
            }
          >
            <Select
              value={criterionId}
              onValueChange={setCriterionId}
              disabled={!subjectId || subjectCriteria.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Criterio" />
              </SelectTrigger>
              <SelectContent>
                {subjectCriteria.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}{" "}
                    <span className="text-muted-foreground">({c.weight}%)</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SelectorField>

          <SelectorField
            icon={ClipboardList}
            label="Actividad"
            autoSelected={criterionActivities.length === 1}
            hint={
              activity
                ? `Última: ${formatDate(activity.createdAt)}`
                : "Sin actividades"
            }
          >
            <Select
              value={activityId}
              onValueChange={setActivityId}
              disabled={!criterionId || criterionActivities.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Actividad" />
              </SelectTrigger>
              <SelectContent>
                {criterionActivities.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SelectorField>
        </div>
      </Card>

      {/* Tabla / mobile capture */}
      {!groupId ? (
        <EmptyState
          icon={Users}
          title="Selecciona un grupo"
          description="Para empezar a calificar, elige el grupo."
        />
      ) : groupStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin alumnos"
          description="Este grupo aún no tiene alumnos."
          action={
            <Button asChild>
              <Link href={groupDetailPath(groupId)}>Ir al grupo</Link>
            </Button>
          }
        />
      ) : !subjectId ? (
        <EmptyState
          icon={BookOpen}
          title="Selecciona una materia"
          description="Cada materia tiene sus propios criterios y actividades."
        />
      ) : !criterionId ? (
        <EmptyState
          icon={Sliders}
          title="Selecciona un criterio"
          description={
            subjectCriteria.length === 0
              ? "Esta materia no tiene criterios definidos en su periodo activo."
              : "Elige el criterio que quieres calificar."
          }
          action={
            subjectCriteria.length === 0 && (
              <Button asChild>
                <Link href={groupDetailPath(groupId)}>Configurar criterios</Link>
              </Button>
            )
          }
        />
      ) : !activity ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin actividades"
          description="No hay actividades creadas para este criterio."
          action={
            <Button asChild>
              <Link href={`/actividades/nueva?group=${groupId}`}>
                Crear actividad
              </Link>
            </Button>
          }
        />
      ) : isMobile ? (
        <QuickCaptureMobile
          students={groupStudents}
          activity={activity}
          grades={grades}
        />
      ) : (
        <GradeTable
          students={groupStudents}
          activities={[activity]}
          subjects={subjects.filter((s) => s.id === activity.subjectId)}
          grades={grades}
        />
      )}
    </div>
  );
}

function SelectorField({
  icon: Icon,
  label,
  autoSelected,
  hint,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  autoSelected?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" /> {label}
        {autoSelected && (
          <span className="ml-auto text-[10px] text-primary normal-case font-normal">
            Auto
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
