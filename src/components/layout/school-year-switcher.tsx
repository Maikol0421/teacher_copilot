"use client";

import Link from "next/link";
import { CalendarRange, Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStore, selectSchoolYears, selectActiveSchoolYear } from "@/store/app-store";
import { cn } from "@/lib/utils";

interface Props {
  collapsed: boolean;
}

export function SchoolYearSwitcher({ collapsed }: Props) {
  const years = useAppStore(selectSchoolYears);
  const active = useAppStore(selectActiveSchoolYear);
  const setActive = useAppStore((s) => s.setActiveSchoolYear);

  const sorted = [...years].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={120}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="mx-auto grid h-9 w-9 place-items-center rounded-lg border bg-card hover:bg-accent transition-colors"
              aria-label={`Ciclo activo: ${active?.name ?? "ninguno"}`}
            >
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Ciclo: {active?.name ?? "ninguno"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "w-full flex items-center gap-2 rounded-lg border bg-card hover:bg-accent transition-colors px-2.5 py-1.5 text-left"
          )}
        >
          <div className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary shrink-0">
            <CalendarRange className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-none">
              Ciclo activo
            </p>
            <p className="text-xs font-medium truncate mt-0.5">
              {active?.name ?? "Sin ciclo activo"}
            </p>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Cambiar ciclo</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sorted.map((y) => (
          <DropdownMenuItem
            key={y.id}
            onSelect={() => {
              if (!y.isActive) {
                setActive(y.id);
                toast.success(`Ciclo activo: ${y.name}`);
              }
            }}
            className="justify-between"
          >
            <span className="font-medium">{y.name}</span>
            {y.isActive && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        {sorted.length === 0 && (
          <p className="px-2 py-2 text-xs text-muted-foreground">
            Aún no hay ciclos.
          </p>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/ciclos">
            <Plus className="h-4 w-4" /> Administrar ciclos
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
