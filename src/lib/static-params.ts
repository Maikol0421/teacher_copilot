import dataset from "@/data/fixtures/dataset.json";
import type { AppDataset } from "@/types/dataset";

/** IDs de grupos del JSON mock — usados en `generateStaticParams` para Firebase Hosting. */
export function getGroupStaticParams() {
  const data = dataset as AppDataset;
  return data.groups.map((g) => ({ id: g.id }));
}

/** IDs de alumnos del JSON mock — usados en `generateStaticParams` para Firebase Hosting. */
export function getStudentStaticParams() {
  const data = dataset as AppDataset;
  return data.students.map((s) => ({ id: s.id }));
}
