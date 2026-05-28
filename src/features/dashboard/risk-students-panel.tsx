import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { GradePill } from "@/components/shared/grade-pill";

interface RiskStudent {
  id: string;
  name: string;
  avatarUrl?: string; // ignorado, mantenido por compat
  avg: number;
  group: string;
}

export function RiskStudentsPanel({ students }: { students: RiskStudent[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Alumnos en riesgo
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Promedio menor a 7.0
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {students.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="Sin alumnos en riesgo"
            description="Todos tus alumnos van bien."
          />
        ) : (
          students.map((s) => (
            <Link
              key={s.id}
              href={`/alumnos/${s.id}`}
              className="flex items-center gap-3 rounded-lg px-2 py-2 -mx-2 hover:bg-accent/60 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.group}</p>
              </div>
              <GradePill value={s.avg} size="sm" />
            </Link>
          ))
        )}
        {students.length > 0 && (
          <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" asChild>
            <Link href="/reportes">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
