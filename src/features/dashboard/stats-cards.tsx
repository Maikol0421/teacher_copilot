import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendPositive?: boolean;
  tone?: "primary" | "emerald" | "violet" | "amber";
}

const TONES: Record<NonNullable<Stat["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className={cn("grid h-9 w-9 place-items-center rounded-lg", TONES[stat.tone ?? "primary"])}>
                <Icon className="h-4 w-4" />
              </div>
              {stat.trend && (
                <span
                  className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded-full",
                    stat.trendPositive === false
                      ? "text-rose-600 bg-rose-50 dark:bg-rose-500/10"
                      : stat.trendPositive
                        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
                        : "text-muted-foreground bg-muted"
                  )}
                >
                  {stat.trend}
                </span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
