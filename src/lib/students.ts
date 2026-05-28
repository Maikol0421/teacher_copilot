import { Student } from "@/types";

/** Construye "Paterno Materno Nombres". Apellido materno opcional. */
export function buildFullName(parts: {
  firstName: string;
  paternalLastName: string;
  maternalLastName?: string;
}): string {
  const { firstName, paternalLastName, maternalLastName } = parts;
  return [
    paternalLastName.trim(),
    (maternalLastName ?? "").trim(),
    firstName.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

/** Etiqueta para mostrar como "APELLIDOS, Nombres" (útil en headers). */
export function displayNameLastFirst(s: Student): string {
  const apellidos = [s.paternalLastName, s.maternalLastName]
    .filter((v) => v && v.trim())
    .join(" ");
  return `${apellidos}, ${s.firstName}`;
}

/** Iniciales del nombre completo (no aplica avatar, pero útil en listas/circulos). */
export function studentInitials(s: Student): string {
  const a = s.paternalLastName?.[0] ?? "";
  const b = s.firstName?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

/** Comparador por apellido paterno → materno → nombres, alfabético (es). */
export function compareByLastName(a: Student, b: Student): number {
  const ka = `${a.paternalLastName} ${a.maternalLastName ?? ""} ${a.firstName}`
    .trim()
    .toLowerCase();
  const kb = `${b.paternalLastName} ${b.maternalLastName ?? ""} ${b.firstName}`
    .trim()
    .toLowerCase();
  return ka.localeCompare(kb, "es", { sensitivity: "base" });
}

/** Devuelve copia ordenada A→Z por apellido. */
export function sortStudentsByLastName<T extends Student>(students: T[]): T[] {
  return [...students].sort(compareByLastName);
}
