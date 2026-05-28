import { cn } from "@/lib/utils";
import { getGradeStatus, gradeStatusStyles } from "@/lib/grades";

interface GradePillProps {
  value: number | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GradePill({ value, size = "md", className }: GradePillProps) {
  const status = getGradeStatus(value);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border font-semibold tabular-nums",
        gradeStatusStyles[status],
        size === "sm" && "h-6 min-w-[2.25rem] px-1.5 text-xs",
        size === "md" && "h-7 min-w-[2.5rem] px-2 text-sm",
        size === "lg" && "h-9 min-w-[3rem] px-2.5 text-base",
        className
      )}
    >
      {value == null ? "—" : value.toFixed(1)}
    </span>
  );
}
