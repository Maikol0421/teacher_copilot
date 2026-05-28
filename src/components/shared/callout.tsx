import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-900 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/30",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30",
  danger:
    "border-rose-200 bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/30",
};

const ICON_TONES: Record<Tone, string> = {
  info: "text-blue-600 dark:text-blue-300",
  success: "text-emerald-600 dark:text-emerald-300",
  warning: "text-amber-600 dark:text-amber-300",
  danger: "text-rose-600 dark:text-rose-300",
};

interface CalloutProps {
  tone?: Tone;
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function Callout({
  tone = "info",
  icon: Icon,
  title,
  description,
  action,
  className,
}: CalloutProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-4",
        TONES[tone],
        className
      )}
    >
      {Icon && (
        <div className={cn("shrink-0", ICON_TONES[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm">{title}</p>}
        {description && (
          <p className="text-sm opacity-90 mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
