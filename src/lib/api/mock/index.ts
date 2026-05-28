import { buildFullName } from "@/lib/students";
import type { AppDataset } from "@/types/dataset";
import type {
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
import type { ApiResult } from "../types";
import { withReadDelay, withWriteDelay } from "../delay";
import { getDb, resetDb, updateDb } from "./db";

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

function fail(error: string, status = 400): ApiResult<never> {
  return { ok: false, error, status };
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

/** GET /bootstrap — carga inicial de toda la app (equivalente a varios GET en prod). */
export async function fetchBootstrap(): Promise<AppDataset> {
  return withReadDelay(() => structuredClone(getDb()));
}

/** POST /bootstrap/reset — restaura datos del JSON original. */
export async function resetBootstrap(): Promise<AppDataset> {
  return withWriteDelay(() => {
    resetDb();
    return structuredClone(getDb());
  });
}

// ── Teacher ──────────────────────────────────────────────────────────────────

/** GET /teacher/me */
export async function fetchTeacher(): Promise<Teacher> {
  return withReadDelay(() => getDb().teacher);
}

// ── School years ─────────────────────────────────────────────────────────────

/** GET /school-years */
export async function fetchSchoolYears(): Promise<SchoolYear[]> {
  return withReadDelay(() => getDb().schoolYears);
}

/** POST /school-years */
export async function createSchoolYear(
  input: Omit<SchoolYear, "id" | "teacherId" | "createdAt">
): Promise<ApiResult<SchoolYear>> {
  return withWriteDelay(() => {
    const db = getDb();
    const created: SchoolYear = {
      ...input,
      id: newId("sy"),
      teacherId: db.teacher.id,
      createdAt: new Date().toISOString(),
    };
    updateDb((d) => ({
      ...d,
      schoolYears: [
        ...d.schoolYears.map((x) =>
          input.isActive ? { ...x, isActive: false } : x
        ),
        created,
      ],
    }));
    return ok(created);
  });
}

/** PATCH /school-years/:id/active */
export async function setActiveSchoolYear(id: string): Promise<ApiResult<SchoolYear[]>> {
  return withWriteDelay(() => {
    updateDb((d) => ({
      ...d,
      schoolYears: d.schoolYears.map((x) => ({
        ...x,
        isActive: x.id === id,
      })),
    }));
    return ok(getDb().schoolYears);
  });
}

/** PATCH /school-years/:id */
export async function updateSchoolYear(
  id: string,
  patch: Partial<SchoolYear>
): Promise<ApiResult<SchoolYear>> {
  return withWriteDelay(() => {
    let updated: SchoolYear | undefined;
    updateDb((d) => ({
      ...d,
      schoolYears: d.schoolYears.map((x) => {
        if (x.id !== id) return x;
        updated = { ...x, ...patch };
        return updated;
      }),
    }));
    if (!updated) return fail("Ciclo escolar no encontrado.", 404);
    return ok(updated);
  });
}

/** DELETE /school-years/:id */
export async function deleteSchoolYear(id: string): Promise<ApiResult<null>> {
  return withWriteDelay(() => {
    const db = getDb();
    if (db.groups.some((g) => g.schoolYearId === id)) {
      return fail("No puedes eliminar un ciclo con grupos asignados.");
    }
    updateDb((d) => ({
      ...d,
      schoolYears: d.schoolYears.filter((x) => x.id !== id),
    }));
    return ok(null);
  });
}

// ── Groups ───────────────────────────────────────────────────────────────────

/** GET /groups?schoolYearId= */
export async function fetchGroups(schoolYearId?: string): Promise<Group[]> {
  return withReadDelay(() => {
    const groups = getDb().groups;
    return schoolYearId
      ? groups.filter((g) => g.schoolYearId === schoolYearId)
      : groups;
  });
}

/** POST /groups */
export async function createGroup(
  input: Omit<Group, "id" | "teacherId" | "createdAt">
): Promise<ApiResult<Group>> {
  return withWriteDelay(() => {
    const created: Group = {
      ...input,
      id: newId("group"),
      teacherId: getDb().teacher.id,
      createdAt: new Date().toISOString(),
    };
    updateDb((d) => ({ ...d, groups: [...d.groups, created] }));
    return ok(created);
  });
}

/** PATCH /groups/:id */
export async function updateGroup(
  id: string,
  patch: Partial<Group>
): Promise<ApiResult<Group>> {
  return withWriteDelay(() => {
    let updated: Group | undefined;
    updateDb((d) => ({
      ...d,
      groups: d.groups.map((g) => {
        if (g.id !== id) return g;
        updated = { ...g, ...patch };
        return updated;
      }),
    }));
    if (!updated) return fail("Grupo no encontrado.", 404);
    return ok(updated);
  });
}

/** PATCH /groups/:id/active-period */
export async function setGroupActivePeriod(
  groupId: string,
  periodId: string
): Promise<ApiResult<Group>> {
  return updateGroup(groupId, { activePeriodId: periodId });
}

/** DELETE /groups/:id */
export async function deleteGroup(id: string): Promise<ApiResult<null>> {
  return withWriteDelay(() => {
    updateDb((d) => {
      const subjectIds = d.subjects.filter((x) => x.groupId === id).map((x) => x.id);
      const activityIds = d.activities.filter((x) => x.groupId === id).map((x) => x.id);
      const studentIds = d.students.filter((x) => x.groupId === id).map((x) => x.id);
      return {
        ...d,
        groups: d.groups.filter((x) => x.id !== id),
        subjects: d.subjects.filter((x) => x.groupId !== id),
        periods: d.periods.filter((x) => x.groupId !== id),
        criteria: d.criteria.filter((x) => x.groupId !== id),
        students: d.students.filter((x) => x.groupId !== id),
        activities: d.activities.filter((x) => !activityIds.includes(x.id)),
        grades: d.grades.filter(
          (x) =>
            !activityIds.includes(x.activityId) && !studentIds.includes(x.studentId)
        ),
      };
    });
    return ok(null);
  });
}

// ── Subjects ─────────────────────────────────────────────────────────────────

export async function fetchSubjects(groupId?: string): Promise<Subject[]> {
  return withReadDelay(() => {
    const subjects = getDb().subjects;
    return groupId ? subjects.filter((s) => s.groupId === groupId) : subjects;
  });
}

export async function createSubject(
  input: Omit<Subject, "id" | "teacherId" | "createdAt">
): Promise<ApiResult<Subject>> {
  return withWriteDelay(() => {
    const created: Subject = {
      ...input,
      id: newId("subject"),
      teacherId: getDb().teacher.id,
      createdAt: new Date().toISOString(),
    };
    updateDb((d) => ({ ...d, subjects: [...d.subjects, created] }));
    return ok(created);
  });
}

export async function updateSubject(
  id: string,
  patch: Partial<Subject>
): Promise<ApiResult<Subject>> {
  return withWriteDelay(() => {
    let updated: Subject | undefined;
    updateDb((d) => ({
      ...d,
      subjects: d.subjects.map((x) => {
        if (x.id !== id) return x;
        updated = { ...x, ...patch };
        return updated;
      }),
    }));
    if (!updated) return fail("Materia no encontrada.", 404);
    return ok(updated);
  });
}

export async function deleteSubject(id: string): Promise<ApiResult<null>> {
  return withWriteDelay(() => {
    const db = getDb();
    const subject = db.subjects.find((s) => s.id === id);
    if (!subject) return fail("Materia no encontrada.", 404);
    const remaining = db.subjects.filter(
      (s) => s.groupId === subject.groupId && s.id !== id
    );
    if (remaining.length === 0) {
      return fail("No puedes eliminar la última materia del grupo.");
    }
    updateDb((d) => ({
      ...d,
      subjects: d.subjects.filter((x) => x.id !== id),
      criteria: d.criteria.filter((x) => x.subjectId !== id),
      activities: d.activities.filter((x) => x.subjectId !== id),
      grades: d.grades.filter(
        (x) => !db.activities.some((a) => a.id === x.activityId && a.subjectId === id)
      ),
    }));
    return ok(null);
  });
}

// ── Periods ──────────────────────────────────────────────────────────────────

export async function fetchPeriods(groupId?: string): Promise<Period[]> {
  return withReadDelay(() => {
    const periods = getDb().periods;
    return groupId ? periods.filter((p) => p.groupId === groupId) : periods;
  });
}

export async function createPeriod(
  input: Omit<Period, "id" | "teacherId" | "createdAt">
): Promise<ApiResult<Period>> {
  return withWriteDelay(() => {
    const db = getDb();
    const id = newId("period");
    const created: Period = {
      ...input,
      id,
      teacherId: db.teacher.id,
      createdAt: new Date().toISOString(),
    };
    updateDb((d) => {
      const group = d.groups.find((g) => g.id === input.groupId);
      const groups =
        group && !group.activePeriodId
          ? d.groups.map((g) =>
              g.id === input.groupId ? { ...g, activePeriodId: id } : g
            )
          : d.groups;
      return { ...d, groups, periods: [...d.periods, created] };
    });
    return ok(created);
  });
}

export async function updatePeriod(
  id: string,
  patch: Partial<Period>
): Promise<ApiResult<Period>> {
  return withWriteDelay(() => {
    let updated: Period | undefined;
    updateDb((d) => ({
      ...d,
      periods: d.periods.map((x) => {
        if (x.id !== id) return x;
        updated = { ...x, ...patch };
        return updated;
      }),
    }));
    if (!updated) return fail("Periodo no encontrado.", 404);
    return ok(updated);
  });
}

export async function deletePeriod(id: string): Promise<ApiResult<null>> {
  return withWriteDelay(() => {
    const db = getDb();
    const period = db.periods.find((p) => p.id === id);
    if (!period) return fail("Periodo no encontrado.", 404);
    const remaining = db.periods.filter(
      (p) => p.groupId === period.groupId && p.id !== id
    );
    if (remaining.length === 0) {
      return fail("No puedes eliminar el último periodo del grupo.");
    }
    updateDb((d) => ({
      ...d,
      periods: d.periods.filter((x) => x.id !== id),
      criteria: d.criteria.filter((x) => x.periodId !== id),
      activities: d.activities.filter((x) => x.periodId !== id),
      groups: d.groups.map((g) =>
        g.id === period.groupId && g.activePeriodId === id
          ? { ...g, activePeriodId: remaining[0]?.id ?? null }
          : g
      ),
    }));
    return ok(null);
  });
}

// ── Criteria ───────────────────────────────────────────────────────────────────

export async function fetchCriteria(filters?: {
  groupId?: string;
  subjectId?: string;
  periodId?: string;
}): Promise<Criterion[]> {
  return withReadDelay(() => {
    let list = getDb().criteria;
    if (filters?.groupId) list = list.filter((c) => c.groupId === filters.groupId);
    if (filters?.subjectId) list = list.filter((c) => c.subjectId === filters.subjectId);
    if (filters?.periodId) list = list.filter((c) => c.periodId === filters.periodId);
    return list;
  });
}

/** PUT /criteria?subjectId=&periodId= — reemplaza el set completo */
export async function saveCriteria(input: {
  groupId: string;
  subjectId: string;
  periodId: string;
  items: Array<{ id?: string; name: string; weight: number }>;
}): Promise<ApiResult<Criterion[]>> {
  return withWriteDelay(() => {
    const total = input.items.reduce((acc, it) => acc + (it.weight || 0), 0);
    if (Math.round(total) !== 100) {
      return fail(`Los criterios deben sumar 100% (actualmente ${total}%).`);
    }
    if (input.items.length === 0) {
      return fail("Debes tener al menos un criterio.");
    }
    if (input.items.some((it) => !it.name.trim())) {
      return fail("Todos los criterios deben tener nombre.");
    }

    const now = new Date().toISOString();
    const teacherId = getDb().teacher.id;
    const created: Criterion[] = input.items.map((it, idx) => ({
      id: it.id ?? newId("crit"),
      teacherId,
      groupId: input.groupId,
      subjectId: input.subjectId,
      periodId: input.periodId,
      name: it.name.trim(),
      weight: it.weight,
      order: idx,
      createdAt: now,
    }));

    updateDb((d) => ({
      ...d,
      criteria: [
        ...d.criteria.filter(
          (c) =>
            !(
              c.subjectId === input.subjectId && c.periodId === input.periodId
            )
        ),
        ...created,
      ],
    }));

    return ok(created);
  });
}

// ── Students ───────────────────────────────────────────────────────────────────

export async function fetchStudents(groupId?: string): Promise<Student[]> {
  return withReadDelay(() => {
    const students = getDb().students;
    return groupId ? students.filter((s) => s.groupId === groupId) : students;
  });
}

export async function createStudent(
  input: Omit<Student, "id" | "teacherId" | "fullName" | "enrolledAt">
): Promise<ApiResult<Student>> {
  return withWriteDelay(() => {
    const db = getDb();
    const groupSubjects = db.subjects.filter((s) => s.groupId === input.groupId);
    const groupPeriods = db.periods.filter((p) => p.groupId === input.groupId);
    if (groupSubjects.length === 0 || groupPeriods.length === 0) {
      return fail(
        "Antes de agregar alumnos, configura al menos 1 materia y 1 periodo."
      );
    }
    if (!input.paternalLastName?.trim()) {
      return fail("El apellido paterno es obligatorio.");
    }
    if (!input.firstName?.trim()) {
      return fail("El nombre del alumno es obligatorio.");
    }

    const created: Student = {
      id: newId("student"),
      teacherId: db.teacher.id,
      groupId: input.groupId,
      firstName: input.firstName.trim(),
      paternalLastName: input.paternalLastName.trim(),
      maternalLastName: (input.maternalLastName ?? "").trim(),
      fullName: buildFullName({
        firstName: input.firstName,
        paternalLastName: input.paternalLastName,
        maternalLastName: input.maternalLastName,
      }),
      studentCode: input.studentCode,
      enrolledAt: new Date().toISOString(),
    };

    updateDb((d) => ({ ...d, students: [...d.students, created] }));
    return ok(created);
  });
}

export async function updateStudent(
  id: string,
  patch: Partial<Student>
): Promise<ApiResult<Student>> {
  return withWriteDelay(() => {
    let updated: Student | undefined;
    updateDb((d) => ({
      ...d,
      students: d.students.map((x) => {
        if (x.id !== id) return x;
        const merged = { ...x, ...patch };
        const nameTouched =
          patch.firstName !== undefined ||
          patch.paternalLastName !== undefined ||
          patch.maternalLastName !== undefined;
        updated = {
          ...merged,
          fullName: nameTouched
            ? buildFullName({
                firstName: merged.firstName,
                paternalLastName: merged.paternalLastName,
                maternalLastName: merged.maternalLastName,
              })
            : merged.fullName,
        };
        return updated;
      }),
    }));
    if (!updated) return fail("Alumno no encontrado.", 404);
    return ok(updated);
  });
}

export async function deleteStudent(id: string): Promise<ApiResult<null>> {
  return withWriteDelay(() => {
    updateDb((d) => ({
      ...d,
      students: d.students.filter((x) => x.id !== id),
      grades: d.grades.filter((g) => g.studentId !== id),
    }));
    return ok(null);
  });
}

// ── Activities ───────────────────────────────────────────────────────────────

export async function fetchActivities(filters?: {
  groupId?: string;
  subjectId?: string;
  criterionId?: string;
}): Promise<Activity[]> {
  return withReadDelay(() => {
    let list = getDb().activities;
    if (filters?.groupId) list = list.filter((a) => a.groupId === filters.groupId);
    if (filters?.subjectId) list = list.filter((a) => a.subjectId === filters.subjectId);
    if (filters?.criterionId) list = list.filter((a) => a.criterionId === filters.criterionId);
    return list;
  });
}

export async function createActivity(
  input: Omit<Activity, "id" | "teacherId" | "createdAt">
): Promise<ApiResult<Activity>> {
  return withWriteDelay(() => {
    const created: Activity = {
      ...input,
      id: newId("activity"),
      teacherId: getDb().teacher.id,
      createdAt: new Date().toISOString(),
    };
    updateDb((d) => ({ ...d, activities: [created, ...d.activities] }));
    return ok(created);
  });
}

export async function updateActivity(
  id: string,
  patch: Partial<Activity>
): Promise<ApiResult<Activity>> {
  return withWriteDelay(() => {
    let updated: Activity | undefined;
    updateDb((d) => ({
      ...d,
      activities: d.activities.map((x) => {
        if (x.id !== id) return x;
        updated = { ...x, ...patch };
        return updated;
      }),
    }));
    if (!updated) return fail("Actividad no encontrada.", 404);
    return ok(updated);
  });
}

export async function deleteActivity(id: string): Promise<ApiResult<null>> {
  return withWriteDelay(() => {
    updateDb((d) => ({
      ...d,
      activities: d.activities.filter((x) => x.id !== id),
      grades: d.grades.filter((g) => g.activityId !== id),
    }));
    return ok(null);
  });
}

// ── Grades ───────────────────────────────────────────────────────────────────

export async function fetchGrades(filters?: {
  activityId?: string;
  studentId?: string;
}): Promise<Grade[]> {
  return withReadDelay(() => {
    let list = getDb().grades;
    if (filters?.activityId) list = list.filter((g) => g.activityId === filters.activityId);
    if (filters?.studentId) list = list.filter((g) => g.studentId === filters.studentId);
    return list;
  });
}

/** PUT /grades — upsert de una calificación (autoguardado) */
export async function upsertGrade(input: {
  studentId: string;
  activityId: string;
  value: number | null;
}): Promise<ApiResult<Grade>> {
  // Autoguardado: sin delay perceptible en mock
  const db = getDb();
  const existing = db.grades.find(
    (g) => g.studentId === input.studentId && g.activityId === input.activityId
  );
  const updatedAt = new Date().toISOString();

  if (existing) {
    const next: Grade = { ...existing, value: input.value, updatedAt };
    updateDb((d) => ({
      ...d,
      grades: d.grades.map((g) =>
        g.studentId === input.studentId && g.activityId === input.activityId ? next : g
      ),
    }));
    return ok(next);
  }

  const created: Grade = {
    id: `grade-${input.activityId}-${input.studentId}`,
    teacherId: db.teacher.id,
    studentId: input.studentId,
    activityId: input.activityId,
    value: input.value,
    updatedAt,
  };
  updateDb((d) => ({ ...d, grades: [...d.grades, created] }));
  return ok(created);
}

// ── Notifications ────────────────────────────────────────────────────────────

export async function fetchNotifications(): Promise<Notification[]> {
  return withReadDelay(() => getDb().notifications);
}

export async function markAllNotificationsRead(): Promise<Notification[]> {
  return withWriteDelay(() => {
    updateDb((d) => ({
      ...d,
      notifications: d.notifications.map((n) => ({ ...n, read: true })),
    }));
    return getDb().notifications;
  });
}
