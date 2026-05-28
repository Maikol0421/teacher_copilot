import { Badge } from "@/components/ui/badge";
import { ActivityType } from "@/types";
import {
  BookOpenText,
  ClipboardCheck,
  GraduationCap,
  MessageSquareText,
  Presentation,
} from "lucide-react";

const CONFIG: Record<
  ActivityType,
  { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  tarea: {
    label: "Tarea",
    icon: ClipboardCheck,
    classes:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30",
  },
  examen: {
    label: "Examen",
    icon: GraduationCap,
    classes:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30",
  },
  trabajo: {
    label: "Trabajo",
    icon: BookOpenText,
    classes:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  participacion: {
    label: "Participación",
    icon: MessageSquareText,
    classes:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  },
  exposicion: {
    label: "Exposición",
    icon: Presentation,
    classes:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
  },
};

export function ActivityTypeBadge({
  type,
  showIcon = true,
}: {
  type: ActivityType;
  showIcon?: boolean;
}) {
  const c = CONFIG[type];
  const Icon = c.icon;
  return (
    <Badge
      variant="outline"
      className={`gap-1 border ${c.classes} font-medium`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {c.label}
    </Badge>
  );
}
