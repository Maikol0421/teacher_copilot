"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, Plus, Star, Trash2 } from "lucide-react";
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
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/app-store";
import { Group, Period } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";
import { cn, formatDate } from "@/lib/utils";

interface Props {
  group: Group;
  periods: Period[];
}

export function PeriodsEditor({ group, periods }: Props) {
  const addPeriod = useAppStore((s) => s.addPeriod);
  const deletePeriod = useAppStore((s) => s.deletePeriod);
  const setGroupActivePeriod = useAppStore((s) => s.setGroupActivePeriod);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
  );

  const handleCreate = async () => {
    if (!name.trim()) return;
    await addPeriod({
      groupId: group.id,
      name: name.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      order: periods.length,
    });
    toast.success("Periodo agregado");
    setName("");
    setOpen(false);
  };

  const handleDelete = async (id: string, label: string) => {
    const r = await deletePeriod(id);
    if (!r.ok) toast.error(r.error);
    else toast.success(`"${label}" eliminado`);
  };

  const handleSetActive = async (periodId: string, periodName: string) => {
    await setGroupActivePeriod(group.id, periodId);
    toast.success(`"${periodName}" es el periodo activo`);
  };

  const suggestNext = () => {
    const idx = periods.length + 1;
    setName(`Bimestre ${idx}`);
  };

  return (
    <div className="space-y-3">
      {periods.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Sin periodos"
          description="Agrega al menos un periodo (bimestre, trimestre, etc.)."
          action={
            <Button
              onClick={() => {
                suggestNext();
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Agregar periodo
            </Button>
          }
        />
      ) : (
        <>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Toca la estrella para marcar el periodo activo del grupo.
          </p>
          <div className="space-y-2">
            {periods.map((p, i) => {
              const isActive = group.activePeriodId === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-2.5 transition-colors",
                    isActive
                      ? "bg-primary/5 border-primary/40"
                      : "bg-card/60"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => !isActive && handleSetActive(p.id, p.name)}
                    className={cn(
                      "h-9 w-9 rounded-md grid place-items-center shrink-0 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    aria-label={
                      isActive ? "Periodo activo" : "Marcar como activo"
                    }
                  >
                    {isActive ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Star className="h-4 w-4" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      {isActive && (
                        <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                          Activo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(p.startDate)} → {formatDate(p.endDate)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 shrink-0 text-muted-foreground hover:text-rose-600",
                      periods.length === 1 && "opacity-40 cursor-not-allowed"
                    )}
                    disabled={periods.length === 1}
                    onClick={() => handleDelete(p.id, p.name)}
                    aria-label="Eliminar periodo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              suggestNext();
              setOpen(true);
            }}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4" /> Agregar periodo
          </Button>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo periodo</DialogTitle>
            <DialogDescription>
              Cada periodo tendrá su propio conjunto de criterios por materia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="period-name">Nombre</Label>
              <Input
                id="period-name"
                placeholder="Bimestre 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="period-start">Inicio</Label>
                <Input
                  id="period-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="period-end">Fin</Label>
                <Input
                  id="period-end"
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
            <Button onClick={handleCreate} disabled={!name.trim()}>
              <Plus className="h-4 w-4" /> Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
