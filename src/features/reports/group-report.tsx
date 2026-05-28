"use client";

import { useMemo } from "react";
import { ChevronRight, Download, MoveHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { calculateStudentSubjectPeriodAverage } from "@/lib/grades";
import { sortStudentsByLastName } from "@/lib/students";
import { Group } from "@/types";
import { GradePill } from "@/components/shared/grade-pill";
import { cn } from "@/lib/utils";
import { downloadCSV, slug, toCSV } from "@/lib/csv";

interface Props {
  group: Group;
  periodId: string;
  onOpenSubject: (subjectId: string) => void;
}

export function GroupReport({ group, periodId, onOpenSubject }: Props) {
  const { students, subjects, criteria, activities, grades, periods } =
    useAppStore();

  const period = periods.find((p) => p.id === periodId);
  const groupSubjects = useMemo(
    () =>
      [...subjects.filter((s) => s.groupId === group.id)].sort(
        (a, b) => a.order - b.order
      ),
    [subjects, group.id]
  );

  const groupStudents = useMemo(
    () => sortStudentsByLastName(students.filter((s) => s.groupId === group.id)),
    [students, group.id]
  );

  // Promedio (alumno, materia, periodo)
  const data = useMemo(() => {
    const rows = groupStudents.map((st) => {
      const perSubject: Record<string, number> = {};
      groupSubjects.forEach((sub) => {
        perSubject[sub.id] = calculateStudentSubjectPeriodAverage(
          st.id,
          sub.id,
          periodId,
          criteria,
          activities,
          grades
        );
      });
      const valid = Object.values(perSubject).filter((v) => v > 0);
      const general = valid.length
        ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10
        : 0;
      return { student: st, perSubject, general };
    });

    // Promedio por materia
    const subjectAverages: Record<string, number> = {};
    groupSubjects.forEach((sub) => {
      const vals = rows.map((r) => r.perSubject[sub.id]).filter((v) => v > 0);
      subjectAverages[sub.id] = vals.length
        ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
        : 0;
    });

    // Promedio del grupo
    const generals = rows.map((r) => r.general).filter((v) => v > 0);
    const groupAvg = generals.length
      ? Math.round((generals.reduce((a, b) => a + b, 0) / generals.length) * 10) / 10
      : 0;

    return { rows, subjectAverages, groupAvg };
  }, [groupStudents, groupSubjects, periodId, criteria, activities, grades]);

  const handleExport = () => {
    if (data.rows.length === 0) {
      toast.error("Sin alumnos para exportar");
      return;
    }
    const csvRows = data.rows.map((r) => {
      const row: Record<string, string | number> = {
        apellidoPaterno: r.student.paternalLastName,
        apellidoMaterno: r.student.maternalLastName ?? "",
        nombres: r.student.firstName,
        matricula: r.student.studentCode,
      };
      groupSubjects.forEach((sub) => {
        row[sub.name] = r.perSubject[sub.id]
          ? r.perSubject[sub.id].toFixed(2)
          : "";
      });
      row["Promedio general"] = r.general ? r.general.toFixed(2) : "";
      return row;
    });
    // Fila final: promedio por materia
    const footer: Record<string, string | number> = {
      apellidoPaterno: "PROMEDIO MATERIA",
      apellidoMaterno: "",
      nombres: "",
      matricula: "",
    };
    groupSubjects.forEach((sub) => {
      footer[sub.name] = data.subjectAverages[sub.id]
        ? data.subjectAverages[sub.id].toFixed(2)
        : "";
    });
    footer["Promedio general"] = data.groupAvg
      ? data.groupAvg.toFixed(2)
      : "";

    const cols = [
      { key: "apellidoPaterno", label: "Apellido paterno" },
      { key: "apellidoMaterno", label: "Apellido materno" },
      { key: "nombres", label: "Nombres" },
      { key: "matricula", label: "Matrícula" },
      ...groupSubjects.map((s) => ({ key: s.name, label: s.name })),
      { key: "Promedio general", label: "Promedio general" },
    ];

    const csv = toCSV([...csvRows, footer], cols);
    downloadCSV(
      `gradeflow-grupo-${slug(group.name)}-${slug(period?.name ?? "")}`,
      csv
    );
    toast.success("Reporte exportado", { description: `${data.rows.length} alumnos` });
  };

  if (groupStudents.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          Este grupo aún no tiene alumnos.
        </CardContent>
      </Card>
    );
  }

  if (groupSubjects.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          Este grupo aún no tiene materias.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0">
          <CardTitle>Reporte del grupo</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {group.name} · {period?.name} · {data.rows.length} alumnos ·{" "}
            {groupSubjects.length} materias
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 hidden md:block">
            Toca el nombre de una materia para ver el detalle por criterios.
          </p>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <div className="md:text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Promedio del grupo
            </p>
            <GradePill value={data.groupAvg || null} size="lg" />
          </div>
          <Button variant="outline" onClick={handleExport} size="sm" className="md:h-9 md:px-4 md:text-sm">
            <Download className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="md:hidden flex items-center justify-center gap-1.5 px-3 py-1.5 border-t bg-muted/40 text-[10px] text-muted-foreground">
          <MoveHorizontal className="h-3 w-3" />
          <span>Desliza para ver cada materia</span>
        </div>
        <div className="overflow-x-auto scrollbar-thin border-t report-scroll">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="sticky left-0 z-20 bg-muted border-b border-r px-3 py-2 text-left font-medium text-xs text-muted-foreground uppercase tracking-wider w-[180px] min-w-[180px]">
                  Alumno
                </th>
                {groupSubjects.map((sub) => (
                  <th
                    key={sub.id}
                    className="report-data-col bg-muted border-b border-r last:border-r-0 px-2 py-2 text-center font-medium align-bottom"
                    style={{ minWidth: 110 }}
                  >
                    <button
                      onClick={() => onOpenSubject(sub.id)}
                      className="group flex flex-col items-center gap-1 w-full hover:text-primary transition-colors"
                    >
                      <span
                        className="h-6 w-6 rounded-md grid place-items-center text-white text-[10px] font-semibold"
                        style={{ backgroundColor: sub.color }}
                      >
                        {sub.code}
                      </span>
                      <span className="text-[11px] text-center line-clamp-2 leading-tight">
                        {sub.name}
                      </span>
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </th>
                ))}
                <th className="report-data-col bg-muted border-b px-3 py-2 text-center font-medium text-xs text-muted-foreground uppercase tracking-wider min-w-[80px]">
                  General
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
                  {groupSubjects.map((sub) => {
                    const v = r.perSubject[sub.id];
                    return (
                      <td
                        key={sub.id}
                        className={cn(
                          "report-data-col border-b border-r last:border-r-0 px-2 py-2 text-center",
                          "group-hover:bg-accent/20 transition-colors"
                        )}
                      >
                        <GradePill value={v || null} size="sm" />
                      </td>
                    );
                  })}
                  <td className="report-data-col border-b px-3 py-2 text-center group-hover:bg-accent/20 transition-colors">
                    <GradePill value={r.general || null} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0">
              <tr>
                <td className="sticky left-0 z-10 bg-muted border-t border-r px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Promedio
                </td>
                {groupSubjects.map((sub) => (
                  <td
                    key={sub.id}
                    className="report-data-col bg-muted border-t border-r last:border-r-0 px-2 py-2 text-center"
                  >
                    <GradePill
                      value={data.subjectAverages[sub.id] || null}
                      size="sm"
                    />
                  </td>
                ))}
                <td className="report-data-col bg-muted border-t px-3 py-2 text-center">
                  <GradePill value={data.groupAvg || null} size="sm" />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
