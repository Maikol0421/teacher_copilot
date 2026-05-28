"use client";

import { useMemo, useState } from "react";
import {
  CalendarRange,
  Check,
  Loader2,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";

export default function SchoolYearsView() {
  const { schoolYears, groups } = useAppStore();
  const addSchoolYear = useAppStore((s) => s.addSchoolYear);
  const setActiveSchoolYear = useAppStore((s) => s.setActiveSchoolYear);
  const deleteSchoolYear = useAppStore((s) => s.deleteSchoolYear);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 7, 19).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().getFullYear() + 1, 6, 15).toISOString().slice(0, 10)
  );

  const ordered = useMemo(
    () =>
      [...schoolYears].sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ),
    [schoolYears]
  );

  const countGroups = (yearId: string) =>
    groups.filter((g) => g.schoolYearId === yearId).length;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    await addSchoolYear({
      name: name.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isActive: schoolYears.length === 0,
    });
    toast.success("Ciclo creado", { description: name.trim() });
    setName("");
    setOpen(false);
    setSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const r = await deleteSchoolYear(id);
    if (!r.ok) toast.error(r.error);
    else toast.success(`Ciclo "${name}" eliminado`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ciclos escolares"
        description="Cada ciclo agrupa todos tus grupos, materias, periodos y calificaciones de ese año."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Nuevo ciclo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo ciclo escolar</DialogTitle>
                <DialogDescription>
                  Crea un nuevo ciclo para empezar a registrar grupos y calificaciones.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cycle-name">Nombre</Label>
                  <Input
                    id="cycle-name"
                    placeholder="2025-2026"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="cycle-start">Inicio</Label>
                    <Input
                      id="cycle-start"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cycle-end">Fin</Label>
                    <Input
                      id="cycle-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={submitting || !name.trim()}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Crear ciclo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {ordered.length === 0 ? (
        <EmptyState
          icon={CalendarRange}
          title="Aún no hay ciclos escolares"
          description="Crea tu primer ciclo para empezar a registrar grupos y calificaciones."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Crear ciclo
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ordered.map((sy) => {
            const groupCount = countGroups(sy.id);
            return (
              <Card
                key={sy.id}
                className={
                  "relative transition-all hover:shadow-md " +
                  (sy.isActive ? "ring-2 ring-primary/40 border-primary/40" : "")
                }
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Ciclo escolar
                      </p>
                      <p className="text-lg font-semibold tracking-tight mt-0.5">
                        {sy.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {sy.isActive && (
                        <Badge variant="success" className="gap-1">
                          <Check className="h-3 w-3" /> Activo
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!sy.isActive && (
                            <DropdownMenuItem onClick={() => void setActiveSchoolYear(sy.id)}>
                              <Check className="h-4 w-4" /> Marcar como activo
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-600"
                            onClick={() => handleDelete(sy.id, sy.name)}
                          >
                            <Trash2 className="h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarRange className="h-3.5 w-3.5" />
                    {formatDate(sy.startDate)} → {formatDate(sy.endDate)}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Grupos</span>
                    <span className="font-medium tabular-nums">{groupCount}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
