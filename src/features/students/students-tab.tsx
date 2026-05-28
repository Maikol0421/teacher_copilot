"use client";

import { useState } from "react";
import { LayoutGrid, List, Loader2, Plus, Search, Users } from "lucide-react";
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
import { useAppStore } from "@/store/app-store";
import { Group, Student } from "@/types";
import { StudentCard } from "./student-card";
import { EmptyState } from "@/components/shared/empty-state";
import { sortStudentsByLastName } from "@/lib/students";

interface StudentsTabProps {
  group: Group;
  students: Array<{ student: Student; avg: number }>;
}

export function StudentsTab({ group, students }: StudentsTabProps) {
  const addStudent = useAppStore((s) => s.addStudent);

  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paternalLastName, setPaternalLastName] = useState("");
  const [maternalLastName, setMaternalLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [studentCode, setStudentCode] = useState("");

  // Orden A→Z por apellido + filtro
  const sorted = sortStudentsByLastName(
    students.map((s) => s.student)
  ).map((stu) => students.find((x) => x.student.id === stu.id)!);

  const filtered = sorted.filter((s) =>
    s.student.fullName.toLowerCase().includes(query.toLowerCase())
  );

  const handleCreate = async () => {
    if (!paternalLastName.trim() || !firstName.trim()) return;
    setSubmitting(true);
    const r = await addStudent({
      groupId: group.id,
      firstName: firstName.trim(),
      paternalLastName: paternalLastName.trim(),
      maternalLastName: maternalLastName.trim(),
      studentCode:
        studentCode.trim() ||
        `${group.grade}-${(students.length + 1).toString().padStart(3, "0")}`,
    });
    setSubmitting(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    toast.success("Alumno agregado", {
      description: `${paternalLastName} ${maternalLastName} ${firstName}`.trim(),
    });
    setPaternalLastName("");
    setMaternalLastName("");
    setFirstName("");
    setStudentCode("");
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alumno…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center rounded-lg border p-0.5 bg-card">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("grid")}
              className="h-8"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Agregar alumno
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo alumno</DialogTitle>
                <DialogDescription>
                  Agrega un alumno a {group.name}. El apellido paterno es
                  obligatorio.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="paternal-last-name">
                    Apellido paterno <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="paternal-last-name"
                    placeholder="Ej. Hernández"
                    value={paternalLastName}
                    onChange={(e) => setPaternalLastName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maternal-last-name">
                    Apellido materno{" "}
                    <span className="text-muted-foreground text-xs">
                      (opcional)
                    </span>
                  </Label>
                  <Input
                    id="maternal-last-name"
                    placeholder="Ej. López"
                    value={maternalLastName}
                    onChange={(e) => setMaternalLastName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="first-name">
                    Nombre(s) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="first-name"
                    placeholder="Ej. María Fernanda"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="student-code">Matrícula (opcional)</Label>
                  <Input
                    id="student-code"
                    placeholder={`Ej. ${group.grade}-${(students.length + 1)
                      .toString()
                      .padStart(3, "0")}`}
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!paternalLastName.trim() || !firstName.trim() || submitting}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Agregar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={query ? "Sin resultados" : "Aún no hay alumnos en este grupo"}
          description={
            query
              ? "Prueba con otro término."
              : "Agrega tu primer alumno para empezar a calificar."
          }
          action={
            !query && (
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> Agregar alumno
              </Button>
            )
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(({ student, avg }) => (
            <StudentCard key={student.id} student={student} avg={avg} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/40">
            <div className="col-span-5">Alumno</div>
            <div className="col-span-3">Estado</div>
            <div className="col-span-2">Inscrito</div>
            <div className="col-span-2 text-right">Promedio</div>
          </div>
          {filtered.map(({ student, avg }) => (
            <StudentCard key={student.id} student={student} avg={avg} variant="row" />
          ))}
        </div>
      )}
    </div>
  );
}
