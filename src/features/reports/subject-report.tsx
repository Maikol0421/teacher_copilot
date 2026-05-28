"use client";

import { useMemo } from "react";
import { ArrowLeft, ChevronRight, Download, MoveHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { calculateStudentSubjectPeriodAverage } from "@/lib/grades";
import { sortStudentsByLastName } from "@/lib/students";
import { Group } from "@/types";
import { GradePill } from "@/components/shared/grade-pill";
import { average, roundTo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { downloadCSV, slug, toCSV } from "@/lib/csv";

interface Props {
  group: Group;
  periodId: string;
  subjectId: string;
  onBack: () => void;
  onOpenCriterion: (criterionId: string) => void;
}

export function SubjectReport({
  group,
  periodId,
  subjectId,
  onBack,
  onOpenCriterion,
}: Props) {
  const { students, subjects, criteria, activities, grades, periods } =
    useAppStore();

  const subject = subjects.find((s) => s.id === subjectId);
  const period = periods.find((p) => p.id === periodId);

  const subjectCriteria = useMemo(
    () =>
      criteria
        .filter((c) => c.subjectId === subjectId && c.periodId === periodId)
        .sort((a, b) => a.order - b.order),
    [criteria, subjectId, periodId]
  );

  const groupStudents = useMemo(
    () => sortStudentsByLastName(students.filter((s) => s.groupId === group.id)),
    [students, group.id]
  );

  // Promedio del alumno por criterio: avg de calificaciones de actividades del criterio
  const data = useMemo(() => {
    const rows = groupStudents.map((st) => {
      const perCriterion: Record<string, number> = {};
      subjectCriteria.forEach((c) => {
        const critActivities = activities.filter((a) => a.criterionId === c.id);
        const studentGrades = critActivities
          .map((a) =>
            grades.find((g) => g.activityId === a.id && g.studentId === st.id)
          )
          .filter((g) => g && g.value != null)
          .map((g) => g!.value as number);
        perCriterion[c.id] = studentGrades.length
          ? roundTo(average(studentGrades))
          : 0;
      });
      // Promedio ponderado en la materia/periodo
      const subjectAvg = calculateStudentSubjectPeriodAverage(
        st.id,
        subjectId,
        periodId,
        criteria,
        activities,
        grades
      );
      return { student: st, perCriterion, subjectAvg };
    });

    // Promedio por criterio (avg simple entre alumnos)
    const criterionAverages: Record<string, number> = {};
    subjectCriteria.forEach((c) => {
      const vals = rows.map((r) => r.perCriterion[c.id]).filter((v) => v > 0);
      criterionAverages[c.id] = vals.length ? roundTo(average(vals)) : 0;
    });

    const subjectAvgs = rows.map((r) => r.subjectAvg).filter((v) => v > 0);
    const subjectAverage = subjectAvgs.length ? roundTo(average(subjectAvgs)) : 0;

    return { rows, criterionAverages, subjectAverage };
  }, [groupStudents, subjectCriteria, activities, grades, subjectId, periodId, criteria]);

  const handleExport = () => {
    if (data.rows.length === 0) return toast.error("Sin alumnos para exportar");
    const csvRows = data.rows.map((r) => {
      const row: Record<string, string | number> = {
        apellidoPaterno: r.student.paternalLastName,
        apellidoMaterno: r.student.maternalLastName ?? "",
        nombres: r.student.firstName,
        matricula: r.student.studentCode,
      };
      subjectCriteria.forEach((c) => {
        row[`${c.name} (${c.weight}%)`] = r.perCriterion[c.id]
          ? r.perCriterion[c.id].toFixed(2)
          : "";
      });
      row["Promedio materia"] = r.subjectAvg ? r.subjectAvg.toFixed(2) : "";
      return row;
    });
    // Footer: promedio por criterio
    const footer: Record<string, string | number> = {
      apellidoPaterno: "PROMEDIO CRITERIO",
      apellidoMaterno: "",
      nombres: "",
      matricula: "",
    };
    subjectCriteria.forEach((c) => {
      footer[`${c.name} (${c.weight}%)`] = data.criterionAverages[c.id]
        ? data.criterionAverages[c.id].toFixed(2)
        : "";
    });
    footer["Promedio materia"] = data.subjectAverage
      ? data.subjectAverage.toFixed(2)
      : "";

    const cols = [
      { key: "apellidoPaterno", label: "Apellido paterno" },
      { key: "apellidoMaterno", label: "Apellido materno" },
      { key: "nombres", label: "Nombres" },
      { key: "matricula", label: "Matrícula" },
      ...subjectCriteria.map((c) => ({
        key: `${c.name} (${c.weight}%)`,
        label: `${c.name} (${c.weight}%)`,
      })),
      { key: "Promedio materia", label: "Promedio materia" },
    ];
    const csv = toCSV([...csvRows, footer], cols);
    downloadCSV(
      `gradeflow-${slug(group.name)}-${slug(subject?.name ?? "")}-${slug(period?.name ?? "")}`,
      csv
    );
    toast.success("Reporte exportado");
  };

  if (!subject) return null;

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Reporte del grupo
            </button>
          </div>
          <CardTitle className="flex items-center gap-2">
            <span
              className="h-6 w-6 rounded-md grid place-items-center text-white text-[10px] font-semibold"
              style={{ backgroundColor: subject.color }}
            >
              {subject.code}
            </span>
            {subject.name}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {group.name} · {period?.name} · {subjectCriteria.length} criterios
          </p>
          {subjectCriteria.length > 0 && (
            <p className="text-[11px] text-muted-foreground hidden md:block">
              Toca el nombre de un criterio para ver las actividades.
            </p>
          )}
        </div>
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <div className="md:text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Prom. materia
            </p>
            <GradePill value={data.subjectAverage || null} size="lg" />
          </div>
          <Button variant="outline" onClick={handleExport} size="sm" className="md:h-9 md:px-4 md:text-sm">
            <Download className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {subjectCriteria.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground border-t">
            Esta materia aún no tiene criterios para el periodo{" "}
            <strong>{period?.name}</strong>.
          </div>
        ) : (
          <>
          <div className="md:hidden flex items-center justify-center gap-1.5 px-3 py-1.5 border-t bg-muted/40 text-[10px] text-muted-foreground">
            <MoveHorizontal className="h-3 w-3" />
            <span>Desliza para ver cada criterio</span>
          </div>
          <div className="overflow-x-auto scrollbar-thin border-t report-scroll">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="sticky left-0 z-20 bg-muted border-b border-r px-3 py-2 text-left font-medium text-xs text-muted-foreground uppercase tracking-wider w-[180px] min-w-[180px]">
                    Alumno
                  </th>
                  {subjectCriteria.map((c) => (
                    <th
                      key={c.id}
                      className="report-data-col bg-muted border-b border-r last:border-r-0 px-2 py-2 text-center font-medium align-bottom"
                      style={{ minWidth: 110 }}
                    >
                      <button
                        onClick={() => onOpenCriterion(c.id)}
                        className="group flex flex-col items-center gap-0.5 w-full hover:text-primary transition-colors"
                      >
                        <span className="text-[11px] font-medium leading-tight">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {c.weight}%
                        </span>
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </th>
                  ))}
                  <th className="report-data-col bg-muted border-b px-3 py-2 text-center font-medium text-xs text-muted-foreground uppercase tracking-wider min-w-[80px]">
                    Materia
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
                    {subjectCriteria.map((c) => (
                      <td
                        key={c.id}
                        className={cn(
                          "report-data-col border-b border-r last:border-r-0 px-2 py-2 text-center",
                          "group-hover:bg-accent/20 transition-colors"
                        )}
                      >
                        <GradePill
                          value={r.perCriterion[c.id] || null}
                          size="sm"
                        />
                      </td>
                    ))}
                    <td className="report-data-col border-b px-3 py-2 text-center group-hover:bg-accent/20 transition-colors">
                      <GradePill value={r.subjectAvg || null} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0">
                <tr>
                  <td className="sticky left-0 z-10 bg-muted border-t border-r px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Promedio
                  </td>
                  {subjectCriteria.map((c) => (
                    <td
                      key={c.id}
                      className="report-data-col bg-muted border-t border-r last:border-r-0 px-2 py-2 text-center"
                    >
                      <GradePill
                        value={data.criterionAverages[c.id] || null}
                        size="sm"
                      />
                    </td>
                  ))}
                  <td className="report-data-col bg-muted border-t px-3 py-2 text-center">
                    <GradePill value={data.subjectAverage || null} size="sm" />
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
