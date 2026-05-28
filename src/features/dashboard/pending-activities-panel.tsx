import Link from "next/link";
import { ArrowRight, ClipboardList, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { ActivityTypeBadge } from "@/features/activities/activity-type-badge";
import type { ActivityType } from "@/types";

interface PendingItem {
  id: string;
  name: string;
  type: ActivityType;
  groupName: string;
  missing: number;
  total: number;
}

export function PendingActivitiesPanel({ pending }: { pending: PendingItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            Por calificar
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Actividades con calificaciones pendientes
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="¡Estás al día!"
            description="No tienes actividades pendientes de calificar."
          />
        ) : (
          pending.map((p) => {
            const progress = ((p.total - p.missing) / Math.max(p.total, 1)) * 100;
            return (
              <div key={p.id} className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.groupName}</p>
                  </div>
                  <ActivityTypeBadge type={p.type} />
                </div>
                <Progress
                  value={progress}
                  indicatorClassName="bg-amber-500"
                  className="h-1.5"
                />
                <p className="text-[11px] text-muted-foreground">
                  {p.missing} de {p.total} alumnos pendientes
                </p>
              </div>
            );
          })
        )}
        <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link href="/capturar">
            Capturar ahora <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
