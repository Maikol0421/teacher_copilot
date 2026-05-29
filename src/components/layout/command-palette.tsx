"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  PenSquare,
  Settings2,
  User,
  Users,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  useAppStore,
  selectGroups,
  selectStudents,
} from "@/store/app-store";
import { groupDetailPath, studentDetailPath } from "@/lib/routes";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const groups = useAppStore(selectGroups);
  const students = useAppStore(selectStudents);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar alumnos, grupos, páginas…" />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>
        <CommandGroup heading="Páginas">
          <CommandItem onSelect={() => go("/dashboard")}>
            <LayoutDashboard /> Dashboard
            <CommandShortcut>D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/grupos")}>
            <Users /> Grupos
            <CommandShortcut>G</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/capturar")}>
            <PenSquare /> Capturar calificaciones
            <CommandShortcut>C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/actividades/nueva")}>
            <ClipboardList /> Nueva actividad
          </CommandItem>
          <CommandItem onSelect={() => go("/reportes")}>
            <BarChart3 /> Reportes
          </CommandItem>
          <CommandItem onSelect={() => go("/configuracion")}>
            <Settings2 /> Configuración
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Grupos">
          {groups.slice(0, 6).map((g) => (
            <CommandItem key={g.id} onSelect={() => go(groupDetailPath(g.id))}>
              <GraduationCap style={{ color: g.color }} /> {g.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />
        <CommandGroup heading="Alumnos">
          {students.slice(0, 6).map((s) => (
            <CommandItem
              key={s.id}
              onSelect={() => go(studentDetailPath(s.id))}
              value={`${s.fullName} ${s.studentCode}`}
            >
              <User /> {s.fullName}
              <CommandShortcut>{s.studentCode}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
