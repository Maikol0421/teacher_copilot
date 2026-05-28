"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarRange,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore, selectActiveSchoolYear } from "@/store/app-store";
import { calculateGroupAverage } from "@/lib/grades";
import { GroupCard } from "./group-card";
import { GroupRow } from "./group-row";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

const GROUP_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899",
  "#06b6d4", "#ef4444", "#22c55e", "#f97316", "#a855f7",
];

export default function GroupsView() {
  const router = useRouter();
  const { groups, students, subjects, periods, criteria, activities, grades } =
    useAppStore();
  const activeYear = useAppStore(selectActiveSchoolYear);
  const addGroup = useAppStore((s) => s.addGroup);

  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("6");
  const [level, setLevel] = useState<"primaria" | "secundaria">("primaria");
  const [color, setColor] = useState(GROUP_COLORS[0]);

  const rows = useMemo(() => {
    if (!activeYear) return [];
    return groups
      .filter((g) => g.schoolYearId === activeYear.id)
      .map((g) => {
        const gs = students.filter((s) => s.groupId === g.id);
        const gSubs = subjects.filter((s) => s.groupId === g.id);
        const gPers = periods.filter((p) => p.groupId === g.id);
        return {
          group: g,
          avg: calculateGroupAverage(gs, gSubs, criteria, activities, grades),
          studentsCount: gs.length,
          subjectsCount: gSubs.length,
          periodsCount: gPers.length,
          isConfigured: gSubs.length > 0 && gPers.length > 0,
        };
      });
  }, [activeYear, groups, students, subjects, periods, criteria, activities, grades]);

  const filtered = rows.filter((r) =>
    r.group.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleCreate = async () => {
    if (!activeYear || !name.trim()) return;
    setSubmitting(true);
    const id = await addGroup({
      schoolYearId: activeYear.id,
      name: name.trim(),
      grade,
      level,
      color,
      activePeriodId: null,
    });
    setSubmitting(false);
    if (!id) {
      toast.error("No se pudo crear el grupo");
      return;
    }
    toast.success("Grupo creado", {
      description: "Ahora configura sus materias y periodos.",
    });
    setDialogOpen(false);
    setName("");
    router.push(`/grupos/${id}`);
  };

  if (!activeYear) {
    return (
      <div className="space-y-6">
        <PageHeader title="Grupos" />
        <EmptyState
          icon={CalendarRange}
          title="Selecciona un ciclo escolar"
          description="Para administrar grupos primero debes tener un ciclo escolar activo."
          action={
            <Button asChild>
              <Link href="/ciclos">
                <CalendarRange className="h-4 w-4" /> Administrar ciclos
              </Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grupos"
        description={`Ciclo escolar ${activeYear.name}`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Nuevo grupo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo grupo</DialogTitle>
                <DialogDescription>
                  Después de crearlo deberás configurar sus materias y periodos
                  antes de agregar alumnos.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="group-name">Nombre</Label>
                  <Input
                    id="group-name"
                    placeholder="Ej. 6° A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nivel</Label>
                    <Select
                      value={level}
                      onValueChange={(v) => setLevel(v as "primaria" | "secundaria")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primaria">Primaria</SelectItem>
                        <SelectItem value="secundaria">Secundaria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Grado</Label>
                    <Select value={grade} onValueChange={setGrade}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["1", "2", "3", "4", "5", "6"].map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}°
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Color identificador</Label>
                  <div className="flex flex-wrap gap-2">
                    {GROUP_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={
                          "h-8 w-8 rounded-lg transition-transform " +
                          (color === c
                            ? "ring-2 ring-offset-2 ring-foreground scale-110"
                            : "hover:scale-105")
                        }
                        style={{ backgroundColor: c }}
                        aria-label={`Color ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={!name.trim() || submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Crear y configurar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar grupo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="hidden sm:flex items-center rounded-lg border p-0.5 bg-card">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("grid")}
            className="h-8 gap-1.5"
          >
            <LayoutGrid className="h-4 w-4" /> Cards
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("list")}
            className="h-8 gap-1.5"
          >
            <List className="h-4 w-4" /> Tabla
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "No se encontraron grupos" : "Aún no tienes grupos en este ciclo"}
          description={
            query
              ? "Prueba con otro nombre."
              : "Crea tu primer grupo para empezar."
          }
          action={
            !query && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" /> Crear grupo
              </Button>
            )
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <GroupCard
              key={r.group.id}
              group={r.group}
              avg={r.avg}
              studentsCount={r.studentsCount}
              subjectsCount={r.subjectsCount}
              isConfigured={r.isConfigured}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/40">
            <div className="col-span-5">Grupo</div>
            <div className="col-span-2">Nivel</div>
            <div className="col-span-2">Alumnos</div>
            <div className="col-span-2">Materias</div>
            <div className="col-span-1 text-right">Promedio</div>
          </div>
          {filtered.map((r) => (
            <GroupRow
              key={r.group.id}
              group={r.group}
              avg={r.avg}
              studentsCount={r.studentsCount}
              subjectsCount={r.subjectsCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
