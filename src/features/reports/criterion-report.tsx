"use client";

import { useMemo } from "react";
import { ArrowLeft, Download, MoveHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { sortStudentsByLastName } from "@/lib/students";
import { Group } from "@/types";
import { GradePill } from "@/components/shared/grade-pill";
import { average, formatDateShort, roundTo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { downloadCSV, slug, toCSV } from "@/lib/csv";
import { ActivityTypeBadge } from "@/features/activities/activity-type-badge";

interface Props {
  group: Group;
  periodId: string;
  subjectId: string;
  criterionId: string;
  onBack: () => void;
}

export function CriterionReport({
  group,
  periodId,
  subjectId,
  criterionId,
  onBack,
}: Props) {
  const { students, subjects, criteria, activities, grades, periods } =
    useAppStore();

  const subject = subjects.find((s) => s.id === subjectId);
  const period = periods.find((p) => p.id === periodId);
  const criterion = criteria.find((c) => c.id === criterionId);

  const criterionActivities = useMemo(
    () =>
      activities
        .filter((a) => a.criterionId === criterionId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
    [activities, criterionId]
  );

  const groupStudents = useMemo(
    () => sortStudentsByLastName(students.filter((s) => s.groupId === group.id)),
    [students, group.id]
  );

  const data = useMemo(() => {
    const rows = groupStudents.map((st) => {
      const perActivity: Record<string, number | null> = {};
      criterionActivities.forEach((a) => {
        const g = grades.find(
          (gr) => gr.activityId === a.id && gr.studentId === st.id
        );
        perActivity[a.id] = g?.value ?? null;
      });
      const values = Object.values(perActivity).filter(
        (v): v is number => v !== null
      );
      const studentAvg = values.length ? roundTo(average(values)) : 0;
      return { student: st, perActivity, studentAvg };
    });

    const activityAverages: Record<string, number> = {};
    criterionActivities.forEach((a) => {
      const vals = rows
        .map((r) => r.perActivity[a.id])
        .filter((v): v is number => v !== null);
      activityAverages[a.id] = vals.length ? roundTo(average(vals)) : 0;
    });

    const allAvgs = rows.map((r) => r.studentAvg).filter((v) => v > 0);
    const criterionAvg = allAvgs.length ? roundTo(average(allAvgs)) : 0;

    return { rows, activityAverages, criterionAvg };
  }, [groupStudents, criterionActivities, grades]);

  const handleExport = () => {
    if (data.rows.length === 0) return toast.error("Sin alumnos para exportar");
    if (criterionActivities.length === 0)
      return toast.error("Sin actividades para exportar");

    const csvRows = data.rows.map((r) => {
      const row: Record<string, string | number> = {
        apellidoPaterno: r.student.paternalLastName,
        apellidoMaterno: r.student.maternalLastName ?? "",
        nombres: r.student.firstName,
        matricula: r.student.studentCode,
      };
      criterionActivities.forEach((a) => {
        const v = r.perActivity[a.id];
        row[a.name] = v !== null ? v.toFixed(2) : "";
      });
      row["Promedio criterio"] = r.studentAvg ? r.studentAvg.toFixed(2) : "";
      return row;
    });

    const footer: Record<string, string | number> = {
      apellidoPaterno: "PROMEDIO ACTIVIDAD",
      apellidoMaterno: "",
      nombres: "",
      matricula: "",
    };
    criterionActivities.forEach((a) => {
      footer[a.name] = data.activityAverages[a.id]
        ? data.activityAverages[a.id].toFixed(2)
        : "";
    });
    footer["Promedio criterio"] = data.criterionAvg
      ? data.criterionAvg.toFixed(2)
      : "";

    const cols = [
      { key: "apellidoPaterno", label: "Apellido paterno" },
      { key: "apellidoMaterno", label: "Apellido materno" },
      { key: "nombres", label: "Nombres" },
      { key: "matricula", label: "Matrícula" },
      ...criterionActivities.map((a) => ({ key: a.name, label: a.name })),
      { key: "Promedio criterio", label: "Promedio criterio" },
    ];

    const csv = toCSV([...csvRows, footer], cols);
    downloadCSV(
      `gradeflow-${slug(group.name)}-${slug(subject?.name ?? "")}-${slug(
        criterion?.name ?? ""
      )}-${slug(period?.name ?? "")}`,
      csv
    );
    toast.success("Reporte exportado");
  };

  if (!subject || !criterion) return null;

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <button
            onClick={onBack}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" /> Detalle de {subject.name}
          </button>
          <CardTitle>{criterion.name}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {group.name} · {subject.name} · {period?.name} · Peso{" "}
            <strong>{criterion.weight}%</strong> ·{" "}
            {criterionActivities.length} actividades
          </p>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <div className="md:text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Prom. criterio
            </p>
            <GradePill value={data.criterionAvg || null} size="lg" />
          </div>
          <Button variant="outline" onClick={handleExport} size="sm" className="md:h-9 md:px-4 md:text-sm">
            <Download className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {criterionActivities.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground border-t">
            Aún no se han creado actividades para este criterio.
          </div>
        ) : (
          <>
          <div className="md:hidden flex items-center justify-center gap-1.5 px-3 py-1.5 border-t bg-muted/40 text-[10px] text-muted-foreground">
            <MoveHorizontal className="h-3 w-3" />
            <span>Desliza para ver cada actividad</span>
          </div>
          <div className="overflow-x-auto scrollbar-thin border-t report-scroll">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="sticky left-0 z-20 bg-muted border-b border-r px-3 py-2 text-left font-medium text-xs text-muted-foreground uppercase tracking-wider w-[180px] min-w-[180px]">
                    Alumno
                  </th>
                  {criterionActivities.map((a) => (
                    <th
                      key={a.id}
                      className="report-data-col bg-muted border-b border-r last:border-r-0 px-2 py-2 text-center font-medium align-bottom"
                      style={{ minWidth: 130 }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <ActivityTypeBadge type={a.type} />
                        <span className="text-[11px] font-medium leading-tight line-clamp-2">
                          {a.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDateShort(a.dueDate)}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="report-data-col bg-muted border-b px-3 py-2 text-center font-medium text-xs text-muted-foreground uppercase tracking-wider min-w-[80px]">
                    Prom.
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r, i) => (
                  <tr key={r.student.id} className="group">
                    <td className="sticky left-0 z-10 bg-card group-hover:bg-accent/40 border-b border-r px-3 py-2 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] tabular-nums text-muted-foreground w-5 text-right shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {r.student.fullName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {r.student.studentCode}
                          </p>
                        </div>
                      </div>
                    </td>
                    {criterionActivities.map((a) => (
                      <td
                        key={a.id}
                        className={cn(
                          "report-data-col border-b border-r last:border-r-0 px-2 py-2 text-center",
                          "group-hover:bg-accent/20 transition-colors"
                        )}
                      >
                        <GradePill value={r.perActivity[a.id]} size="sm" />
                      </td>
                    ))}
                    <td className="report-data-col border-b px-3 py-2 text-center group-hover:bg-accent/20 transition-colors">
                      <GradePill value={r.studentAvg || null} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0">
                <tr>
                  <td className="sticky left-0 z-10 bg-muted border-t border-r px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Promedio
                  </td>
                  {criterionActivities.map((a) => (
                    <td
                      key={a.id}
                      className="report-data-col bg-muted border-t border-r last:border-r-0 px-2 py-2 text-center"
                    >
                      <GradePill
                        value={data.activityAverages[a.id] || null}
                        size="sm"
                      />
                    </td>
                  ))}
                  <td className="report-data-col bg-muted border-t px-3 py-2 text-center">
                    <GradePill value={data.criterionAvg || null} size="sm" />
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
