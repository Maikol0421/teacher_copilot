"use client";

import { useState, useMemo, useEffect } from "react";
import { BookOpen, Search, Sliders } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Criterion,
  Grade,
  Group,
  Period,
  Student,
  Subject,
} from "@/types";
import { GradeTable } from "./grade-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { sortStudentsByLastName } from "@/lib/students";

interface GradesTabProps {
  group: Group;
  students: Student[];
  subjects: Subject[];
  periods: Period[];
  criteria: Criterion[];
  activities: Activity[];
  grades: Grade[];
}

export function GradesTab({
  group,
  students,
  subjects,
  periods,
  criteria,
  activities,
  grades,
}: GradesTabProps) {
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>(
    subjects[0]?.id ?? ""
  );

  // Periodo activo del grupo (por defecto)
  const initialPeriod = group.activePeriodId ?? periods[0]?.id ?? "";
  const [periodFilter, setPeriodFilter] = useState<string>(initialPeriod);

  useEffect(() => {
    if (group.activePeriodId) {
      setPeriodFilter(group.activePeriodId);
    } else if (periods.length > 0) {
      setPeriodFilter(periods[0].id);
    }
  }, [group.activePeriodId, periods]);

  const filteredStudents = sortStudentsByLastName(
    students.filter((s) => s.fullName.toLowerCase().includes(query.toLowerCase()))
  );

  // Actividades filtradas por (materia, periodo)
  const filteredActivities = useMemo(
    () =>
      activities
        .filter(
          (a) => a.subjectId === subjectFilter && a.periodId === periodFilter
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
    [activities, subjectFilter, periodFilter]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alumno…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Materia" />
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
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Periodo" />
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

      {filteredActivities.length === 0 ? (
        <EmptyState
          icon={Sliders}
          title="Sin actividades"
          description="No hay actividades para esta materia en el periodo seleccionado."
        />
      ) : (
        <GradeTable
          students={filteredStudents}
          activities={filteredActivities}
          subjects={subjects}
          grades={grades}
          criteria={criteria}
        />
      )}
    </div>
  );
}
