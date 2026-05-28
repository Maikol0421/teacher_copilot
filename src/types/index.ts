// ────────────────────────────────────────────────────────────────────────
// Jerarquía del dominio:
//
//   Teacher (User)
//   └── SchoolYear (ciclo escolar)
//       └── Group
//           ├── Subject (materia)   — cada una con activePeriodId
//           ├── Period  (periodo)   — bimestre, trimestre, etc.
//           ├── Criterion (criterio de evaluación) por (subjectId, periodId)
//           │   └── ∑ weight = 100
//           ├── Student
//           └── Activity → Grade
// ────────────────────────────────────────────────────────────────────────

export type ActivityType =
  | "tarea"
  | "examen"
  | "trabajo"
  | "participacion"
  | "exposicion";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  school: string;
}

export interface SchoolYear {
  id: string;
  teacherId: string;
  name: string;            // ej. "2025-2026"
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface Group {
  id: string;
  teacherId: string;
  schoolYearId: string;
  name: string;
  grade: string;
  level: "primaria" | "secundaria";
  color: string;
  /** Periodo activo del grupo. Aplica a TODAS las materias. */
  activePeriodId: string | null;
  createdAt: string;
}

export interface Subject {
  id: string;
  teacherId: string;
  groupId: string;
  name: string;
  code: string;
  color: string;
  order: number;
  createdAt: string;
}

export interface Period {
  id: string;
  teacherId: string;
  groupId: string;
  name: string;            // ej. "Bimestre 1", "Trimestre 2"
  startDate: string;
  endDate: string;
  order: number;
  createdAt: string;
}

export interface Criterion {
  id: string;
  teacherId: string;
  groupId: string;
  subjectId: string;
  periodId: string;
  name: string;            // ej. "Examen", "Tareas", "Participación"
  weight: number;          // 0-100, suma total por (subject, period) debe ser 100
  order: number;
  createdAt: string;
}

export interface Student {
  id: string;
  teacherId: string;
  groupId: string;
  firstName: string;          // Nombres (uno o más)
  paternalLastName: string;   // Apellido paterno (obligatorio)
  maternalLastName: string;   // Apellido materno (opcional, puede ser "")
  /** Derivado: "Paterno Materno Nombres" */
  fullName: string;
  studentCode: string;
  enrolledAt: string;
}

export interface Activity {
  id: string;
  teacherId: string;
  groupId: string;
  subjectId: string;
  periodId: string;
  criterionId: string;
  name: string;
  type: ActivityType;
  dueDate: string;
  maxScore: number;
  description?: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  teacherId: string;
  studentId: string;
  activityId: string;
  value: number | null;
  updatedAt: string;
}

export interface Notification {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  type: "info" | "warning" | "success";
}

// ────────────────────────────────────────────────────────────────────────
// Helpers / view-models
// ────────────────────────────────────────────────────────────────────────

export interface CriteriaValidation {
  total: number;
  isValid: boolean;        // total === 100
  missing: number;         // 100 - total (puede ser negativo si excede)
  count: number;
}
