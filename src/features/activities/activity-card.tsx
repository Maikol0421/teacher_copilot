import { CalendarDays, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Activity, Subject } from "@/types";
import { ActivityTypeBadge } from "./activity-type-badge";
import { GradePill } from "@/components/shared/grade-pill";
import { formatDateShort } from "@/lib/utils";

interface ActivityCardProps {
  activity: Activity;
  subject: Subject;
  avg: number;
  criterionName?: string;
  periodName?: string;
}

export function ActivityCard({
  activity,
  subject,
  avg,
  criterionName,
  periodName,
}: ActivityCardProps) {
  const isPast = new Date(activity.dueDate).getTime() < Date.now();

  return (
    <Card className="p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            <ActivityTypeBadge type={activity.type} />
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${subject.color}1a`,
                color: subject.color,
              }}
            >
              {subject.name}
            </span>
            {criterionName && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {criterionName}
              </span>
            )}
          </div>
          <p className="font-medium text-sm">{activity.name}</p>
        </div>
        {isPast && <GradePill value={avg || null} size="sm" />}
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          {formatDateShort(activity.dueDate)}
        </span>
        {periodName && (
          <span className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px]">
            {periodName}
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          <Clock className="h-3 w-3" />
          {isPast ? "Vencida" : "Pendiente"}
        </span>
      </div>
    </Card>
  );
}
