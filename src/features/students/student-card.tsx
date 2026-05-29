import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GradePill } from "@/components/shared/grade-pill";
import { Student } from "@/types";
import { getGradeStatus, gradeStatusLabels } from "@/lib/grades";
import { cn } from "@/lib/utils";
import { studentDetailPath } from "@/lib/routes";

interface StudentCardProps {
  student: Student;
  avg: number;
  variant?: "card" | "row";
}

export function StudentCard({ student, avg, variant = "card" }: StudentCardProps) {
  const status = getGradeStatus(avg);

  if (variant === "row") {
    return (
      <Link
        href={studentDetailPath(student.id)}
        className="grid grid-cols-12 gap-2 items-center px-4 py-3 border-b last:border-b-0 hover:bg-accent/40 transition-colors text-sm"
      >
        <div className="col-span-6 sm:col-span-5 min-w-0">
          <p className="font-medium truncate">{student.fullName}</p>
          <p className="text-xs text-muted-foreground">{student.studentCode}</p>
        </div>
        <div className="hidden sm:block col-span-3 text-muted-foreground text-xs">
          {gradeStatusLabels[status]}
        </div>
        <div className="hidden sm:block col-span-2 text-muted-foreground text-xs">
          {new Date(student.enrolledAt).toLocaleDateString("es-MX", {
            month: "short",
            year: "numeric",
          })}
        </div>
        <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-2">
          <GradePill value={avg} size="sm" />
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    );
  }

  return (
    <Link href={studentDetailPath(student.id)}>
      <div
        className={cn(
          "group flex items-center gap-3 rounded-xl border bg-card p-3 transition-all hover:shadow-md hover:-translate-y-0.5"
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{student.fullName}</p>
          <p className="text-xs text-muted-foreground">{student.studentCode}</p>
        </div>
        <GradePill value={avg} size="sm" />
      </div>
    </Link>
  );
}
