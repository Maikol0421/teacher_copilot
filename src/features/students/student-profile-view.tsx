"use client";

import Link from "next/link";
import { useMemo } from "react";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";
import {
  calculateStudentAverage,
  getGradeStatus,
  gradeStatusLabels,
  gradeStatusStyles,
} from "@/lib/grades";
import { cn, formatDate } from "@/lib/utils";
import { GradePill } from "@/components/shared/grade-pill";
import { ActivityTypeBadge } from "@/features/activities/activity-type-badge";
import { groupDetailPath } from "@/lib/routes";

interface StudentProfileViewProps {
  studentId: string;
}

export default function StudentProfileView({ studentId }: StudentProfileViewProps) {
  const { students, groups, subjects, criteria, activities, grades, initialized } =
    useAppStore();
  const student = students.find((s) => s.id === studentId);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-sm text-muted-foreground">
        Cargando alumno…
      </div>
    );
  }

  if (!student) notFound();

  const group = groups.find((g) => g.id === student.groupId);
  const groupSubjects = useMemo(
    () => subjects.filter((s) => s.groupId === student.groupId),
    [subjects, student.groupId]
  );
  const groupActivities = useMemo(
    () => activities.filter((a) => a.groupId === student.groupId),
    [activities, student.groupId]
  );
  const studentGrades = useMemo(
    () => grades.filter((g) => g.studentId === student.id),
    [grades, student.id]
  );

  const avg = calculateStudentAverage(student.id, groupSubjects, criteria, groupActivities, grades);
  const status = getGradeStatus(avg);

  const bySubject = useMemo(() => {
    return groupSubjects.map((s) => {
      const subjectActivities = groupActivities.filter((a) => a.subjectId === s.id);
      const subjectGrades = studentGrades.filter((g) =>
        subjectActivities.some((a) => a.id === g.activityId)
      );
      const values = subjectGrades.map((g) => g.value).filter((v): v is number => v != null);
      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      return { subject: s, avg: Math.round(avg * 10) / 10, count: subjectGrades.length };
    });
  }, [groupSubjects, groupActivities, studentGrades]);

  const recentHistory = useMemo(() => {
    return studentGrades
      .filter((g) => g.value != null)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 12)
      .map((g) => {
        const act = groupActivities.find((a) => a.id === g.activityId);
        const sub = subjects.find((s) => s.id === act?.subjectId);
        return { grade: g, activity: act, subject: sub };
      });
  }, [studentGrades, groupActivities, subjects]);

  const trendData = useMemo(() => {
    return [...studentGrades]
      .filter((g) => g.value != null)
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
      .slice(-10)
      .map((g, i) => ({ name: `#${i + 1}`, value: g.value }));
  }, [studentGrades]);

  const pendingActivities = groupActivities.filter(
    (a) =>
      new Date(a.dueDate).getTime() > Date.now() ||
      !studentGrades.some((g) => g.activityId === a.id && g.value != null)
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link href={group ? groupDetailPath(group.id) : "/grupos"}>
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div
          className="h-2"
          style={{
            background: `linear-gradient(135deg, ${group?.color ?? "#3b82f6"}, ${group?.color ?? "#3b82f6"}44)`,
          }}
        />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Alumno
              </p>
              <h1 className="text-2xl font-semibold tracking-tight mt-0.5">
                {student.fullName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{student.studentCode}</span>
                <span>·</span>
                <Link
                  href={group ? groupDetailPath(group.id) : "#"}
                  className="hover:text-foreground"
                >
                  {group?.name}
                </Link>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Inscrito{" "}
                  {formatDate(student.enrolledAt)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("border", gradeStatusStyles[status])}
                >
                  {gradeStatusLabels[status]}
                </Badge>
                <Badge variant="soft">{studentGrades.length} calificaciones</Badge>
                <Badge variant="soft">{pendingActivities.length} pendientes</Badge>
              </div>
            </div>
            <div className="text-center md:text-right shrink-0">
              <p className="text-xs text-muted-foreground">Promedio general</p>
              <GradePill
                value={avg}
                size="lg"
                className="mt-1 text-2xl h-12 min-w-[5rem]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Materias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bySubject.map(({ subject, avg, count }) => (
              <div
                key={subject.id}
                className="flex items-center gap-3 rounded-lg border bg-card/40 p-3"
              >
                <div
                  className="h-8 w-8 rounded-md grid place-items-center text-xs font-semibold text-white shrink-0"
                  style={{ backgroundColor: subject.color }}
                >
                  {subject.code}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{subject.name}</p>
                  <p className="text-xs text-muted-foreground">{count} calificaciones</p>
                </div>
                <GradePill value={avg || null} size="sm" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Tendencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 10]} fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "0.5rem",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={group?.color ?? "hsl(var(--primary))"}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" /> Historial reciente
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {recentHistory.map(({ grade, activity, subject }) => {
              if (!activity || !subject) return null;
              return (
                <div
                  key={grade.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div
                    className="h-9 w-9 rounded-lg grid place-items-center text-xs font-semibold text-white shrink-0"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <ActivityTypeBadge type={activity.type} />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(grade.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <GradePill value={grade.value} size="sm" />
                </div>
              );
            })}
            {recentHistory.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">
                Aún no hay calificaciones registradas.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingActivities.slice(0, 6).map((a) => {
              const subject = subjects.find((s) => s.id === a.subjectId);
              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-lg border bg-card/40 p-3"
                >
                  <div
                    className="h-8 w-8 rounded-md grid place-items-center text-xs font-semibold text-white shrink-0"
                    style={{ backgroundColor: subject?.color ?? "#666" }}
                  >
                    {subject?.code ?? "·"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(a.dueDate)}
                    </p>
                  </div>
                </div>
              );
            })}
            {pendingActivities.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Sin pendientes.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
