import {
  Activity,
  Criterion,
  CriteriaValidation,
  Grade,
  Student,
  Subject,
} from "@/types";
import { average, roundTo } from "./utils";

export const PASSING_GRADE = 6;
export const RISK_GRADE = 7;

export type GradeStatus = "approved" | "risk" | "failed" | "empty";

export function getGradeStatus(grade: number | null | undefined): GradeStatus {
  if (grade === null || grade === undefined || Number.isNaN(grade)) return "empty";
  if (grade < PASSING_GRADE) return "failed";
  if (grade < RISK_GRADE) return "risk";
  return "approved";
}

export const gradeStatusStyles: Record<GradeStatus, string> = {
  approved:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  risk: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  failed:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
  empty:
    "bg-muted/60 text-muted-foreground border-transparent dark:bg-muted/40",
};

export const gradeStatusLabels: Record<GradeStatus, string> = {
  approved: "Aprobado",
  risk: "En riesgo",
  failed: "Reprobado",
  empty: "Sin calificar",
};

// ────────────────────────────────────────────────────────────────────────
// Validación de criterios
// ────────────────────────────────────────────────────────────────────────

export function validateCriteria(
  items: Array<{ weight: number; name?: string }>
): CriteriaValidation {
  const total = items.reduce((acc, it) => acc + (Number(it.weight) || 0), 0);
  return {
    total,
    isValid: Math.round(total) === 100 && items.length > 0,
    missing: 100 - total,
    count: items.length,
  };
}

// ────────────────────────────────────────────────────────────────────────
// Promedio del alumno en (materia, periodo) usando criterios ponderados
//   1. Por cada criterio: promedio simple de actividades del criterio
//   2. Aplicar peso del criterio
//   3. Solo cuentan criterios con al menos una actividad calificada
// ────────────────────────────────────────────────────────────────────────

export function calculateStudentSubjectPeriodAverage(
  studentId: string,
  subjectId: string,
  periodId: string,
  criteria: Criterion[],
  activities: Activity[],
  grades: Grade[]
): number {
  const periodCriteria = criteria.filter(
    (c) => c.subjectId === subjectId && c.periodId === periodId
  );
  if (periodCriteria.length === 0) return 0;

  let weightedSum = 0;
  let weightUsed = 0;

  for (const crit of periodCriteria) {
    const critActivities = activities.filter(
      (a) => a.criterionId === crit.id
    );
    const critGrades = critActivities
      .map((a) =>
        grades.find((g) => g.activityId === a.id && g.studentId === studentId)
      )
      .filter((g): g is Grade => !!g && g.value !== null && g.value !== undefined);

    if (critGrades.length === 0) continue;

    const critAvg = average(critGrades.map((g) => g.value as number));
    weightedSum += critAvg * (crit.weight / 100);
    weightUsed += crit.weight / 100;
  }

  if (weightUsed === 0) return 0;
  return roundTo(weightedSum / weightUsed);
}

// Promedio del alumno en una materia (todos los periodos, ponderando los que tengan datos)
export function calculateStudentSubjectAverage(
  studentId: string,
  subjectId: string,
  criteria: Criterion[],
  activities: Activity[],
  grades: Grade[]
): number {
  const periodsForSubject = Array.from(
    new Set(criteria.filter((c) => c.subjectId === subjectId).map((c) => c.periodId))
  );
  const values = periodsForSubject
    .map((pId) =>
      calculateStudentSubjectPeriodAverage(
        studentId,
        subjectId,
        pId,
        criteria,
        activities,
        grades
      )
    )
    .filter((v) => v > 0);
  return roundTo(average(values));
}

// Promedio general del alumno (promedio de todas sus materias)
export function calculateStudentAverage(
  studentId: string,
  subjects: Subject[],
  criteria: Criterion[],
  activities: Activity[],
  grades: Grade[]
): number {
  const studentGroupSubjects = subjects.filter((s) =>
    activities.some((a) => a.subjectId === s.id && a.groupId === s.groupId)
  );

  const subjectAverages = subjects.map((s) =>
    calculateStudentSubjectAverage(studentId, s.id, criteria, activities, grades)
  );
  const nonZero = subjectAverages.filter((a) => a > 0);
  if (nonZero.length === 0) {
    // Fallback: average de calificaciones crudas si aún no hay criterios completos
    const own = grades
      .filter((g) => g.studentId === studentId && g.value != null)
      .map((g) => g.value as number);
    return roundTo(average(own));
  }
  return roundTo(average(nonZero));
}

export function calculateGroupAverage(
  students: Student[],
  subjects: Subject[],
  criteria: Criterion[],
  activities: Activity[],
  grades: Grade[]
): number {
  const averages = students.map((s) =>
    calculateStudentAverage(s.id, subjects, criteria, activities, grades)
  );
  const nonZero = averages.filter((a) => a > 0);
  return roundTo(average(nonZero));
}

export function calculateActivityAverage(activityId: string, grades: Grade[]) {
  const values = grades
    .filter((g) => g.activityId === activityId)
    .map((g) => g.value)
    .filter((v): v is number => v !== null && v !== undefined);
  return roundTo(average(values));
}

export function getRiskStudents(
  students: Student[],
  subjects: Subject[],
  criteria: Criterion[],
  activities: Activity[],
  grades: Grade[]
) {
  return students
    .map((s) => ({
      student: s,
      avg: calculateStudentAverage(s.id, subjects, criteria, activities, grades),
    }))
    .filter((s) => s.avg > 0 && s.avg < RISK_GRADE)
    .sort((a, b) => a.avg - b.avg);
}

export function getGradeDistribution(grades: Grade[]) {
  const buckets = {
    "0-6": 0,
    "6-7": 0,
    "7-8": 0,
    "8-9": 0,
    "9-10": 0,
  };
  for (const g of grades) {
    const v = g.value;
    if (v === null || v === undefined) continue;
    if (v < 6) buckets["0-6"]++;
    else if (v < 7) buckets["6-7"]++;
    else if (v < 8) buckets["7-8"]++;
    else if (v < 9) buckets["8-9"]++;
    else buckets["9-10"]++;
  }
  return Object.entries(buckets).map(([range, count]) => ({ range, count }));
}
