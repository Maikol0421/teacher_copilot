"use client";

import { useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
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
import { Group, Period, Subject } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

interface Props {
  group: Group;
  subjects: Subject[];
  periods: Period[];
}

const SUBJECT_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ec4899", "#f97316", "#22c55e", "#a855f7",
];

export function SubjectsEditor({ group, subjects, periods: _periods }: Props) {
  const addSubject = useAppStore((s) => s.addSubject);
  const deleteSubject = useAppStore((s) => s.deleteSubject);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await addSubject({
      groupId: group.id,
      name: name.trim(),
      code: code.trim() || name.slice(0, 3).toUpperCase(),
      color,
      order: subjects.length,
    });
    toast.success("Materia agregada");
    setName("");
    setCode("");
    setOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const r = await deleteSubject(id);
    if (!r.ok) toast.error(r.error);
    else toast.success(`"${name}" eliminada`);
  };

  return (
    <div className="space-y-3">
      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Sin materias"
          description="Agrega al menos una materia para continuar."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Agregar materia
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg border bg-card/60 p-2.5"
              >
                <div
                  className="h-9 w-9 rounded-md grid place-items-center text-white font-semibold text-xs shrink-0"
                  style={{ backgroundColor: s.color }}
                >
                  {s.code}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Código: {s.code}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 shrink-0 text-muted-foreground hover:text-rose-600",
                    subjects.length === 1 && "opacity-40 cursor-not-allowed"
                  )}
                  disabled={subjects.length === 1}
                  onClick={() => handleDelete(s.id, s.name)}
                  aria-label="Eliminar materia"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4" /> Agregar materia
          </Button>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva materia</DialogTitle>
            <DialogDescription>
              Cada materia tendrá sus propios criterios por periodo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject-name">Nombre</Label>
              <Input
                id="subject-name"
                placeholder="Ej. Matemáticas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject-code">Código corto</Label>
              <Input
                id="subject-code"
                placeholder="MAT"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <p className="text-xs text-muted-foreground">
                Se usa como etiqueta en tablas y reportes.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={
                      "h-7 w-7 rounded-md transition-transform " +
                      (color === c
                        ? "ring-2 ring-offset-2 ring-foreground"
                        : "hover:scale-110")
                    }
                    style={{ backgroundColor: c }}
                  />
                ))}
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
