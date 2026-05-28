import {
  Activity,
  Criterion,
  Grade,
  Group,
  Notification,
  Period,
  SchoolYear,
  Student,
  Subject,
  Teacher,
} from "@/types";

/** Dataset completo de la app — mismo shape que devolverá el backend real. */
export interface AppDataset {
  teacher: Teacher;
  schoolYears: SchoolYear[];
  groups: Group[];
  subjects: Subject[];
  periods: Period[];
  criteria: Criterion[];
  students: Student[];
  activities: Activity[];
  grades: Grade[];
  notifications: Notification[];
}
