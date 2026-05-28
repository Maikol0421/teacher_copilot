"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarRange,
  ClipboardList,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore, selectActiveSchoolYear } from "@/store/app-store";
import {
  calculateGroupAverage,
  getRiskStudents,
} from "@/lib/grades";
import { useHydrated } from "@/hooks/use-hydrated";
import { StatsCards } from "./stats-cards";
import { AverageChart } from "./average-chart";
import { RiskStudentsPanel } from "./risk-students-panel";
import { PendingActivitiesPanel } from "./pending-activities-panel";
import { PageHeader } from "@/components/shared/page-header";
import { GroupCard } from "@/features/groups/group-card";
import { EmptyState } from "@/components/shared/empty-state";

export default function DashboardView() {
  const hydrated = useHydrated();
  const {
    teacher,
    groups,
    students,
    subjects,
    periods,
    criteria,
    activities,
    grades,
  } = useAppStore();
  const activeYear = useAppStore(selectActiveSchoolYear);

  const data = useMemo(() => {
    if (!activeYear) return null;
    const yearGroups = groups.filter((g) => g.schoolYearId === activeYear.id);
    const yearStudents = students.filter((s) =>
      yearGroups.some((g) => g.id === s.groupId)
    );
    const yearActivities = activities.filter((a) =>
      yearGroups.some((g) => g.id === a.groupId)
    );

    const groupsWithAvg = yearGroups.map((g) => {
      const gs = students.filter((s) => s.groupId === g.id);
      const gSubjects = subjects.filter((s) => s.groupId === g.id);
      const gPeriods = periods.filter((p) => p.groupId === g.id);
      return {
        group: g,
        avg: calculateGroupAverage(gs, gSubjects, criteria, yearActivities, grades),
        studentsCount: gs.length,
        subjectsCount: gSubjects.length,
        periodsCount: gPeriods.length,
        isConfigured: gSubjects.length > 0 && gPeriods.length > 0,
      };
    });

    const overallAverage =
      groupsWithAvg.reduce((acc, g) => acc + g.avg, 0) /
      Math.max(groupsWithAvg.filter((g) => g.avg > 0).length, 1);

    const risk = getRiskStudents(
      yearStudents,
      subjects,
      criteria,
      yearActivities,
      grades
    );

    const pendingToGrade = yearActivities
      .filter((a) => new Date(a.dueDate).getTime() <= Date.now())
      .map((a) => {
        const groupStudents = students.filter((s) => s.groupId === a.groupId);
        const graded = grades.filter(
          (g) => g.activityId === a.id && g.value != null
        ).length;
        return {
          activity: a,
          missing: groupStudents.length - graded,
          totalStudents: groupStudents.length,
        };
      })
      .filter((p) => p.missing > 0)
      .sort((a, b) => b.missing - a.missing)
      .slice(0, 4);

    return {
      totalStudents: yearStudents.length,
      groupsWithAvg,
      overallAverage,
      risk,
      pendingToGrade,
    };
  }, [activeYear, groups, students, subjects, periods, criteria, activities, grades]);

  const firstName = teacher.name.split(" ")[1] ?? teacher.name;

  if (!activeYear) {
    return (
      <div className="space-y-6">
        <PageHeader title={`${greeting()}, ${firstName}`} />
        <EmptyState
          icon={CalendarRange}
          title="Selecciona un ciclo escolar"
          description="Para ver el dashboard primero debes tener un ciclo escolar activo."
          action={
            <Button asChild>
              <Link href="/ciclos">
                <CalendarRange className="h-4 w-4" /> Administrar ciclos
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description={`Ciclo escolar ${activeYear.name} · ${data.groupsWithAvg.length} grupos`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/actividades/nueva">
                <ClipboardList className="h-4 w-4" /> Nueva actividad
              </Link>
            </Button>
            <Button asChild>
              <Link href="/capturar">
                <Sparkles className="h-4 w-4" /> Capturar calificaciones
              </Link>
            </Button>
          </>
        }
      />

      <StatsCards
        stats={[
          {
            label: "Promedio general",
            value: hydrated ? (data.overallAverage || 0).toFixed(1) : "—",
            icon: TrendingUp,
            trend: "+0.3",
            trendPositive: true,
            tone: "primary",
          },
          {
            label: "Alumnos totales",
            value: hydrated ? data.totalStudents.toString() : "—",
            icon: Users,
            trend: "+12",
            trendPositive: true,
            tone: "emerald",
          },
          {
            label: "Grupos activos",
            value: hydrated ? data.groupsWithAvg.length.toString() : "—",
            icon: GraduationCap,
            trend: activeYear.name,
            tone: "violet",
          },
          {
            label: "Alumnos en riesgo",
            value: hydrated ? data.risk.length.toString() : "—",
            icon: ArrowUpRight,
            trend: hydrated && data.risk.length > 0 ? "Atención" : "",
            trendPositive: false,
            tone: "amber",
          },
        ]}
      />

      {data.groupsWithAvg.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aún no tienes grupos en este ciclo"
          description="Empieza por crear un grupo y configurar sus materias y periodos."
          action={
            <Button asChild>
              <Link href="/grupos">
                <Users className="h-4 w-4" /> Ir a grupos
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Promedio por grupo</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Promedios actuales del ciclo
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/reportes" className="text-xs">
                    Ver reportes <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <AverageChart
                  data={data.groupsWithAvg.map((g) => ({
                    name: g.group.name,
                    avg: g.avg,
                    color: g.group.color,
                  }))}
                />
              </CardContent>
            </Card>

            <RiskStudentsPanel
              students={data.risk.slice(0, 6).map((r) => ({
                id: r.student.id,
                name: r.student.fullName,
                avg: r.avg,
                group: groups.find((g) => g.id === r.student.groupId)?.name ?? "—",
              }))}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <PendingActivitiesPanel
              pending={data.pendingToGrade.map((p) => ({
                id: p.activity.id,
                name: p.activity.name,
                type: p.activity.type,
                groupName: groups.find((g) => g.id === p.activity.groupId)?.name ?? "—",
                missing: p.missing,
                total: p.totalStudents,
              }))}
            />

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Grupos recientes</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accesos rápidos a tus grupos
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/grupos" className="text-xs">
                    Ver todos <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                {data.groupsWithAvg.slice(0, 4).map(({ group, avg, studentsCount, subjectsCount, isConfigured }) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    avg={avg}
                    studentsCount={studentsCount}
                    subjectsCount={subjectsCount}
                    isConfigured={isConfigured}
                    compact
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}
