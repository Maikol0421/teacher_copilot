import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GradePill } from "@/components/shared/grade-pill";
import { Group } from "@/types";
import { groupDetailPath } from "@/lib/routes";

interface GroupRowProps {
  group: Group;
  avg: number;
  studentsCount: number;
  subjectsCount: number;
}

export function GroupRow({ group, avg, studentsCount, subjectsCount }: GroupRowProps) {
  return (
    <Link
      href={groupDetailPath(group.id)}
      className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b last:border-b-0 hover:bg-accent/40 transition-colors text-sm"
    >
      <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
        <div
          className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-white font-semibold text-xs"
          style={{ backgroundColor: group.color }}
        >
          {group.name.split(" ")[0]}
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{group.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {group.grade}° · {group.level}
          </p>
        </div>
      </div>
      <div className="hidden sm:block col-span-2 text-muted-foreground capitalize">{group.level}</div>
      <div className="hidden sm:block col-span-2 text-muted-foreground">{studentsCount} alumnos</div>
      <div className="hidden sm:block col-span-2 text-muted-foreground">{subjectsCount} materias</div>
      <div className="hidden sm:flex col-span-1 items-center justify-end gap-1">
        <GradePill value={avg} size="sm" />
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
