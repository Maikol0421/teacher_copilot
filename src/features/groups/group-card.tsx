import Link from "next/link";
import { groupDetailPath } from "@/lib/routes";
import { AlertCircle, ArrowRight, BookOpen, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { GradePill } from "@/components/shared/grade-pill";
import { Group } from "@/types";
import { cn } from "@/lib/utils";

interface GroupCardProps {
  group: Group;
  avg: number;
  studentsCount: number;
  subjectsCount: number;
  isConfigured?: boolean;
  compact?: boolean;
}

export function GroupCard({
  group,
  avg,
  studentsCount,
  subjectsCount,
  isConfigured = true,
  compact,
}: GroupCardProps) {
  return (
    <Link href={groupDetailPath(group.id)} className="group">
      <Card
        className={cn(
          "relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5",
          "border-l-4"
        )}
        style={{ borderLeftColor: group.color }}
      >
        <div
          className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity"
          style={{
            background: `radial-gradient(circle at top right, ${group.color}, transparent 60%)`,
          }}
        />
        <div className={cn("relative p-4", !compact && "p-5")}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold tracking-tight truncate">{group.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {group.level} · grado {group.grade}
              </p>
            </div>
            {isConfigured ? (
              <GradePill value={avg || null} size={compact ? "sm" : "md"} />
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30">
                <AlertCircle className="h-3 w-3" /> Sin configurar
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {studentsCount} alumnos
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {subjectsCount} materias
            </span>
          </div>

          {!compact && (
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {isConfigured ? "Promedio grupal" : "Falta materias o periodos"}
              </span>
              <span className="font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Abrir <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
