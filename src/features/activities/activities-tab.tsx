"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityCard } from "./activity-card";
import { Activity, Group, Subject } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppStore } from "@/store/app-store";

interface ActivitiesTabProps {
  group: Group;
  activities: Array<{ activity: Activity; subject: Subject; avg: number }>;
}

export function ActivitiesTab({ group, activities }: ActivitiesTabProps) {
  const { periods, criteria } = useAppStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "past">("all");

  const filtered = activities.filter(({ activity }) => {
    if (query && !activity.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "pending") return new Date(activity.dueDate).getTime() > Date.now();
    if (filter === "past") return new Date(activity.dueDate).getTime() <= Date.now();
    return true;
  });

  // Ordenar de más reciente a más antigua
  const sorted = [...filtered].sort(
    (a, b) =>
      new Date(b.activity.createdAt).getTime() -
      new Date(a.activity.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar actividad…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center rounded-lg border p-0.5 bg-card">
          {(["all", "pending", "past"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "secondary" : "ghost"}
              onClick={() => setFilter(f)}
              className="h-8 text-xs"
            >
              {f === "all" ? "Todas" : f === "pending" ? "Pendientes" : "Vencidas"}
            </Button>
          ))}
        </div>
        <Button asChild className="ml-auto">
          <Link href={`/actividades/nueva?group=${group.id}`}>
            <Plus className="h-4 w-4" /> Nueva
          </Link>
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin actividades"
          description="Crea la primera actividad de este grupo."
          action={
            <Button asChild>
              <Link href={`/actividades/nueva?group=${group.id}`}>
                <Plus className="h-4 w-4" /> Crear actividad
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map(({ activity, subject, avg }) => {
            const period = periods.find((p) => p.id === activity.periodId);
            const criterion = criteria.find((c) => c.id === activity.criterionId);
            return (
              <ActivityCard
                key={activity.id}
                activity={activity}
                subject={subject}
                avg={avg}
                criterionName={criterion?.name}
                periodName={period?.name}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
