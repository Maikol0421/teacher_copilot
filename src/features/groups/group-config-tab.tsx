"use client";

import { BookOpen, CalendarClock, Sliders } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Criterion, Group, Period, Subject } from "@/types";
import { SubjectsEditor } from "./editors/subjects-editor";
import { PeriodsEditor } from "./editors/periods-editor";
import { CriteriaEditor } from "./editors/criteria-editor";

interface GroupConfigTabProps {
  group: Group;
  subjects: Subject[];
  periods: Period[];
  criteria: Criterion[];
}

export function GroupConfigTab({
  group,
  subjects,
  periods,
  criteria,
}: GroupConfigTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> Materias
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Mínimo 1 materia. Todas las materias comparten el periodo activo
              del grupo.
            </p>
          </CardHeader>
          <CardContent>
            <SubjectsEditor
              group={group}
              subjects={subjects}
              periods={periods}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Periodos
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Bimestres, trimestres o como prefieras. El periodo activo del
              grupo se marca con la estrella.
            </p>
          </CardHeader>
          <CardContent>
            <PeriodsEditor group={group} periods={periods} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" /> Criterios de evaluación
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Define cuánto pesa cada criterio por materia y periodo. Deben sumar
            exactamente 100% para guardarse.
          </p>
        </CardHeader>
        <CardContent>
          <CriteriaEditor
            group={group}
            subjects={subjects}
            periods={periods}
            criteria={criteria}
          />
        </CardContent>
      </Card>
    </div>
  );
}
