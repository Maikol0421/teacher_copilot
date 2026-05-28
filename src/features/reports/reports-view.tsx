"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarRange,
  ChevronRight,
  GraduationCap,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore, selectActiveSchoolYear } from "@/store/app-store";
import { PageHeader } from "@/components/shared/page-header";
import { Callout } from "@/components/shared/callout";
import { EmptyState } from "@/components/shared/empty-state";
import { GroupReport } from "./group-report";
import { SubjectReport } from "./subject-report";
import { CriterionReport } from "./criterion-report";

type Level = "group" | "subject" | "criterion";

export default function ReportsView() {
  const { groups, periods } = useAppStore();
  const activeYear = useAppStore(selectActiveSchoolYear);

  const yearGroups = useMemo(() => {
    if (!activeYear) return [];
    return groups.filter((g) => g.schoolYearId === activeYear.id);
  }, [activeYear, groups]);

  const [groupId, setGroupId] = useState<string>(yearGroups[0]?.id ?? "");
  const [periodId, setPeriodId] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [criterionId, setCriterionId] = useState<string | null>(null);

  // Cuando cambias grupo, resetea drilldown y elige su periodo activo
  const currentGroup = yearGroups.find((g) => g.id === groupId);
  const groupPeriods = periods
    .filter((p) => p.groupId === groupId)
    .sort((a, b) => a.order - b.order);

  // Sincronizar default de periodo cuando cambia el grupo
  const defaultPeriodId =
    currentGroup?.activePeriodId ?? groupPeriods[0]?.id ?? "";

  // Inicializar/limpiar al cambiar grupo
  if (groupId && !periodId && defaultPeriodId) {
    setPeriodId(defaultPeriodId);
  }
  if (groupId && periodId && !groupPeriods.some((p) => p.id === periodId)) {
    setPeriodId(defaultPeriodId);
    setSubjectId(null);
    setCriterionId(null);
  }

  const level: Level = criterionId ? "criterion" : subjectId ? "subject" : "group";

  if (!activeYear) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reportes" />
        <Callout
          tone="warning"
          icon={CalendarRange}
          title="Sin ciclo escolar activo"
          description="Selecciona un ciclo para ver sus reportes."
          action={
            <Button asChild>
              <Link href="/ciclos">Ir a ciclos</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (yearGroups.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reportes" description={`Ciclo ${activeYear.name}`} />
        <EmptyState
          icon={GraduationCap}
          title="Sin grupos en este ciclo"
          description="Crea un grupo para empezar a generar reportes."
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
        title="Reportes"
        description={`Ciclo escolar ${activeYear.name}`}
      />

      {/* Selector de contexto */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="h-3 w-3" /> Grupo
              </label>
              <Select
                value={groupId}
                onValueChange={(v) => {
                  setGroupId(v);
                  setSubjectId(null);
                  setCriterionId(null);
                  const g = yearGroups.find((x) => x.id === v);
                  const nextPeriod =
                    g?.activePeriodId ??
                    periods.find((p) => p.groupId === v)?.id ??
                    "";
                  setPeriodId(nextPeriod);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona grupo" />
                </SelectTrigger>
                <SelectContent>
                  {yearGroups.map((g) => (
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
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <CalendarRange className="h-3 w-3" /> Periodo
                {currentGroup?.activePeriodId === periodId && (
                  <span className="ml-1 text-[10px] text-primary normal-case font-normal">
                    activo
                  </span>
                )}
              </label>
              <Select
                value={periodId}
                onValueChange={(v) => {
                  setPeriodId(v);
                  setSubjectId(null);
                  setCriterionId(null);
                }}
                disabled={groupPeriods.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Periodo" />
                </SelectTrigger>
                <SelectContent>
                  {groupPeriods.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      {currentGroup?.activePeriodId === p.id && (
                        <span className="ml-2 text-[10px] text-primary">
                          · activo
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breadcrumbs si estás en niveles internos */}
      {level !== "group" && (
        <Breadcrumbs
          items={[
            {
              label: currentGroup?.name ?? "Grupo",
              onClick: () => {
                setSubjectId(null);
                setCriterionId(null);
              },
            },
            ...(subjectId
              ? [
                  {
                    label: "Materia",
                    onClick: level === "criterion"
                      ? () => setCriterionId(null)
                      : undefined,
                  },
                ]
              : []),
            ...(criterionId
              ? [{ label: "Criterio" }]
              : []),
          ]}
        />
      )}

      {/* Vistas según nivel */}
      {currentGroup && periodId && level === "group" && (
        <GroupReport
          group={currentGroup}
          periodId={periodId}
          onOpenSubject={(id) => setSubjectId(id)}
        />
      )}
      {currentGroup && periodId && level === "subject" && subjectId && (
        <SubjectReport
          group={currentGroup}
          periodId={periodId}
          subjectId={subjectId}
          onBack={() => setSubjectId(null)}
          onOpenCriterion={(id) => setCriterionId(id)}
        />
      )}
      {currentGroup && periodId && level === "criterion" && subjectId && criterionId && (
        <CriterionReport
          group={currentGroup}
          periodId={periodId}
          subjectId={subjectId}
          criterionId={criterionId}
          onBack={() => setCriterionId(null)}
        />
      )}
    </div>
  );
}

function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; onClick?: () => void }>;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
      <button
        onClick={items[0]?.onClick}
        className="hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-3 w-3" /> Volver al reporte del grupo
      </button>
      {items.slice(1).map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {it.onClick ? (
            <button
              onClick={it.onClick}
              className="hover:text-foreground transition-colors"
            >
              {it.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{it.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
