"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  PenSquare,
  Settings2,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Callout } from "@/components/shared/callout";
import { useAppStore } from "@/store/app-store";
import {
  calculateGroupAverage,
  calculateStudentAverage,
  calculateActivityAverage,
  getGradeDistribution,
} from "@/lib/grades";
import { StudentsTab } from "@/features/students/students-tab";
import { ActivitiesTab } from "@/features/activities/activities-tab";
import { GradesTab } from "@/features/capture/grades-tab";
import { StatsTab } from "./stats-tab";
import { GroupConfigTab } from "./group-config-tab";
import { GradePill } from "@/components/shared/grade-pill";
import { sortStudentsByLastName } from "@/lib/students";

interface GroupDetailViewProps {
  groupId: string;
}

export default function GroupDetailView({ groupId }: GroupDetailViewProps) {
  const {
    groups,
    students,
    subjects,
    periods,
    criteria,
    activities,
    grades,
  } = useAppStore();
  const group = groups.find((g) => g.id === groupId);

  if (!group) notFound();

  const groupStudents = useMemo(
    () => sortStudentsByLastName(students.filter((s) => s.groupId === groupId)),
    [students, groupId]
  );
  const groupActivities = useMemo(
    () => activities.filter((a) => a.groupId === groupId),
    [activities, groupId]
  );
  const groupSubjects = useMemo(
    () => [...subjects.filter((s) => s.groupId === groupId)].sort((a, b) => a.order - b.order),
    [subjects, groupId]
  );
  const groupPeriods = useMemo(
    () => [...periods.filter((p) => p.groupId === groupId)].sort((a, b) => a.order - b.order),
    [periods, groupId]
  );
  const groupCriteria = useMemo(
    () => criteria.filter((c) => c.groupId === groupId),
    [criteria, groupId]
  );

  const avg = calculateGroupAverage(
    groupStudents,
    groupSubjects,
    groupCriteria,
    groupActivities,
    grades
  );

  const isConfigured = groupSubjects.length > 0 && groupPeriods.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href="/grupos">
            <ArrowLeft className="h-4 w-4" /> Volver a grupos
          </Link>
        </Button>
        {isConfigured && (
          <Button asChild>
            <Link href={`/capturar?group=${group.id}`}>
              <PenSquare className="h-4 w-4" /> Capturar calificaciones
            </Link>
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <div
          className="h-2"
          style={{ background: `linear-gradient(90deg, ${group.color}, ${group.color}66)` }}
        />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="grid h-14 w-14 place-items-center rounded-xl text-white font-semibold shadow-sm"
                style={{ backgroundColor: group.color }}
              >
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{group.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <p className="text-sm text-muted-foreground capitalize">
                    {group.level} · {group.grade}° grado
                  </p>
                  {(() => {
                    const activePeriod = groupPeriods.find(
                      (p) => p.id === group.activePeriodId
                    );
                    if (!activePeriod) return null;
                    return (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/8 rounded-full px-2 py-0.5">
                        <CalendarClock className="h-3 w-3" />
                        {activePeriod.name}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Stat label="Alumnos" value={groupStudents.length.toString()} icon={Users} />
              <Stat label="Materias" value={groupSubjects.length.toString()} icon={BookOpen} />
              <Stat label="Periodos" value={groupPeriods.length.toString()} icon={CalendarClock} />
              <Stat label="Actividades" value={groupActivities.length.toString()} icon={ClipboardList} />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Promedio</span>
                <GradePill value={avg || null} size="lg" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!isConfigured && (
        <Callout
          tone="warning"
          icon={AlertTriangle}
          title="Este grupo aún no está configurado"
          description={
            groupSubjects.length === 0 && groupPeriods.length === 0
              ? "Para poder agregar alumnos y empezar a calificar, primero configura al menos 1 materia y 1 periodo."
              : groupSubjects.length === 0
                ? "Falta agregar al menos una materia."
                : "Falta agregar al menos un periodo."
          }
        />
      )}

      <Tabs defaultValue={isConfigured ? "alumnos" : "configuracion"} className="space-y-4">
        <TabsList className="overflow-x-auto scrollbar-thin w-full sm:w-auto">
          <TabsTrigger value="configuracion" className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="alumnos" disabled={!isConfigured}>
            Alumnos
          </TabsTrigger>
          <TabsTrigger value="actividades" disabled={!isConfigured}>
            Actividades
          </TabsTrigger>
          <TabsTrigger value="calificaciones" disabled={!isConfigured}>
            Calificaciones
          </TabsTrigger>
          <TabsTrigger value="estadisticas" disabled={!isConfigured}>
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configuracion">
          <GroupConfigTab
            group={group}
            subjects={groupSubjects}
            periods={groupPeriods}
            criteria={groupCriteria}
          />
        </TabsContent>

        <TabsContent value="alumnos">
          <StudentsTab
            group={group}
            students={groupStudents.map((s) => ({
              student: s,
              avg: calculateStudentAverage(
                s.id,
                groupSubjects,
                groupCriteria,
                groupActivities,
                grades
              ),
            }))}
          />
        </TabsContent>

        <TabsContent value="actividades">
          <ActivitiesTab
            group={group}
            activities={groupActivities.map((a) => ({
              activity: a,
              subject: groupSubjects.find((s) => s.id === a.subjectId)!,
              avg: calculateActivityAverage(a.id, grades),
            }))}
          />
        </TabsContent>

        <TabsContent value="calificaciones">
          <GradesTab
            group={group}
            students={groupStudents}
            subjects={groupSubjects}
            periods={groupPeriods}
            criteria={groupCriteria}
            activities={groupActivities}
            grades={grades}
          />
        </TabsContent>

        <TabsContent value="estadisticas">
          <StatsTab
            students={groupStudents}
            subjects={groupSubjects}
            criteria={groupCriteria}
            activities={groupActivities}
            grades={grades}
            distribution={getGradeDistribution(
              grades.filter((g) => groupActivities.some((a) => a.id === g.activityId))
            )}
            color={group.color}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className="font-semibold tabular-nums mt-0.5">{value}</span>
    </div>
  );
}
