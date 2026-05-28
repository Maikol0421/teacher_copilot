"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import type { AppDataset } from "@/types/dataset";
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

export type StoreResult = { ok: true } | { ok: false; error: string };

interface AppState extends AppDataset {
  initialized: boolean;
  loading: boolean;
  error: string | null;

  /** Carga inicial desde JSON mock (hoy) o backend (futuro). */
  hydrate: () => Promise<void>;
  reset: () => Promise<void>;

  addSchoolYear: (
    sy: Omit<SchoolYear, "id" | "teacherId" | "createdAt">
  ) => Promise<string>;
  updateSchoolYear: (id: string, patch: Partial<SchoolYear>) => Promise<void>;
  setActiveSchoolYear: (id: string) => Promise<void>;
  deleteSchoolYear: (id: string) => Promise<StoreResult>;

  addGroup: (g: Omit<Group, "id" | "teacherId" | "createdAt">) => Promise<string>;
  updateGroup: (id: string, patch: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  setGroupActivePeriod: (groupId: string, periodId: string) => Promise<void>;

  addSubject: (
    s: Omit<Subject, "id" | "teacherId" | "createdAt">
  ) => Promise<string>;
  updateSubject: (id: string, patch: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<StoreResult>;

  addPeriod: (p: Omit<Period, "id" | "teacherId" | "createdAt">) => Promise<string>;
  updatePeriod: (id: string, patch: Partial<Period>) => Promise<void>;
  deletePeriod: (id: string) => Promise<StoreResult>;

  saveCriteria: (input: {
    groupId: string;
    subjectId: string;
    periodId: string;
    items: Array<{ id?: string; name: string; weight: number }>;
  }) => Promise<StoreResult>;

  addStudent: (
    s: Omit<Student, "id" | "teacherId" | "fullName" | "enrolledAt">
  ) => Promise<StoreResult>;
  updateStudent: (id: string, patch: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  addActivity: (
    a: Omit<Activity, "id" | "teacherId" | "createdAt">
  ) => Promise<string>;
  updateActivity: (id: string, patch: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  upsertGrade: (input: {
    studentId: string;
    activityId: string;
    value: number | null;
  }) => void;

  markAllNotificationsRead: () => Promise<void>;
}

const emptyTeacher: Teacher = {
  id: "",
  name: "",
  email: "",
  avatarUrl: "",
  school: "",
};

const emptyDataset: AppDataset = {
  teacher: emptyTeacher,
  schoolYears: [],
  groups: [],
  subjects: [],
  periods: [],
  criteria: [],
  students: [],
  activities: [],
  grades: [],
  notifications: [],
};

function applyDataset(data: AppDataset): Partial<AppState> {
  return {
    ...data,
    initialized: true,
    loading: false,
    error: null,
  };
}

function mergeGrade(state: AppState, grade: Grade): Grade[] {
  const idx = state.grades.findIndex(
    (g) => g.studentId === grade.studentId && g.activityId === grade.activityId
  );
  if (idx >= 0) {
    const next = [...state.grades];
    next[idx] = grade;
    return next;
  }
  return [...state.grades, grade];
}

export const useAppStore = create<AppState>((set, get) => ({
  ...emptyDataset,
  initialized: false,
  loading: false,
  error: null,

  hydrate: async () => {
    if (get().loading) return;
    if (get().initialized) return;
    set({ loading: true, error: null });
    try {
      const data = await api.fetchBootstrap();
      set(applyDataset(data));
    } catch {
      set({
        loading: false,
        error: "No se pudieron cargar los datos. Intenta de nuevo.",
      });
    }
  },

  reset: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.resetBootstrap();
      set(applyDataset(data));
    } catch {
      set({ loading: false, error: "No se pudo restaurar los datos." });
    }
  },

  addSchoolYear: async (sy) => {
    const r = await api.createSchoolYear(sy);
    if (!r.ok) return "";
    set((s) => ({
      schoolYears: sy.isActive
        ? [...s.schoolYears.map((x) => ({ ...x, isActive: false })), r.data]
        : [...s.schoolYears, r.data],
    }));
    return r.data.id;
  },

  updateSchoolYear: async (id, patch) => {
    const r = await api.updateSchoolYear(id, patch);
    if (!r.ok) return;
    set((s) => ({
      schoolYears: s.schoolYears.map((x) => (x.id === id ? r.data : x)),
    }));
  },

  setActiveSchoolYear: async (id) => {
    const r = await api.setActiveSchoolYear(id);
    if (!r.ok) return;
    set({ schoolYears: r.data });
  },

  deleteSchoolYear: async (id) => {
    const r = await api.deleteSchoolYear(id);
    if (!r.ok) return { ok: false, error: r.error };
    set((s) => ({ schoolYears: s.schoolYears.filter((x) => x.id !== id) }));
    return { ok: true };
  },

  addGroup: async (g) => {
    const r = await api.createGroup(g);
    if (!r.ok) return "";
    set((s) => ({ groups: [...s.groups, r.data] }));
    return r.data.id;
  },

  updateGroup: async (id, patch) => {
    const r = await api.updateGroup(id, patch);
    if (!r.ok) return;
    set((s) => ({
      groups: s.groups.map((x) => (x.id === id ? r.data : x)),
    }));
  },

  setGroupActivePeriod: async (groupId, periodId) => {
    const r = await api.setGroupActivePeriod(groupId, periodId);
    if (!r.ok) return;
    set((s) => ({
      groups: s.groups.map((g) => (g.id === groupId ? r.data : g)),
    }));
  },

  deleteGroup: async (id) => {
    const r = await api.deleteGroup(id);
    if (!r.ok) return;
    const data = await api.fetchBootstrap();
    set(applyDataset(data));
  },

  addSubject: async (subject) => {
    const r = await api.createSubject(subject);
    if (!r.ok) return "";
    set((s) => ({ subjects: [...s.subjects, r.data] }));
    return r.data.id;
  },

  updateSubject: async (id, patch) => {
    const r = await api.updateSubject(id, patch);
    if (!r.ok) return;
    set((s) => ({
      subjects: s.subjects.map((x) => (x.id === id ? r.data : x)),
    }));
  },

  deleteSubject: async (id) => {
    const r = await api.deleteSubject(id);
    if (!r.ok) return { ok: false, error: r.error };
    const data = await api.fetchBootstrap();
    set(applyDataset(data));
    return { ok: true };
  },

  addPeriod: async (period) => {
    const r = await api.createPeriod(period);
    if (!r.ok) return "";
    const data = await api.fetchBootstrap();
    set(applyDataset(data));
    return r.data.id;
  },

  updatePeriod: async (id, patch) => {
    const r = await api.updatePeriod(id, patch);
    if (!r.ok) return;
    set((s) => ({
      periods: s.periods.map((x) => (x.id === id ? r.data : x)),
    }));
  },

  deletePeriod: async (id) => {
    const r = await api.deletePeriod(id);
    if (!r.ok) return { ok: false, error: r.error };
    const data = await api.fetchBootstrap();
    set(applyDataset(data));
    return { ok: true };
  },

  saveCriteria: async (input) => {
    const r = await api.saveCriteria(input);
    if (!r.ok) return { ok: false, error: r.error };
    set((s) => ({
      criteria: [
        ...s.criteria.filter(
          (c) =>
            !(c.subjectId === input.subjectId && c.periodId === input.periodId)
        ),
        ...r.data,
      ],
    }));
    return { ok: true };
  },

  addStudent: async (input) => {
    const r = await api.createStudent(input);
    if (!r.ok) return { ok: false, error: r.error };
    set((s) => ({ students: [...s.students, r.data] }));
    return { ok: true };
  },

  updateStudent: async (id, patch) => {
    const r = await api.updateStudent(id, patch);
    if (!r.ok) return;
    set((s) => ({
      students: s.students.map((x) => (x.id === id ? r.data : x)),
    }));
  },

  deleteStudent: async (id) => {
    const r = await api.deleteStudent(id);
    if (!r.ok) return;
    set((s) => ({
      students: s.students.filter((x) => x.id !== id),
      grades: s.grades.filter((g) => g.studentId !== id),
    }));
  },

  addActivity: async (activity) => {
    const r = await api.createActivity(activity);
    if (!r.ok) return "";
    set((s) => ({ activities: [r.data, ...s.activities] }));
    return r.data.id;
  },

  updateActivity: async (id, patch) => {
    const r = await api.updateActivity(id, patch);
    if (!r.ok) return;
    set((s) => ({
      activities: s.activities.map((x) => (x.id === id ? r.data : x)),
    }));
  },

  deleteActivity: async (id) => {
    const r = await api.deleteActivity(id);
    if (!r.ok) return;
    set((s) => ({
      activities: s.activities.filter((x) => x.id !== id),
      grades: s.grades.filter((g) => g.activityId !== id),
    }));
  },

  upsertGrade: (input) => {
    set((state) => {
      const existingIdx = state.grades.findIndex(
        (g) => g.studentId === input.studentId && g.activityId === input.activityId
      );
      const updatedAt = new Date().toISOString();
      if (existingIdx >= 0) {
        const next = [...state.grades];
        next[existingIdx] = {
          ...next[existingIdx],
          value: input.value,
          updatedAt,
        };
        void api.upsertGrade(input);
        return { grades: next };
      }
      const created: Grade = {
        id: `grade-${input.activityId}-${input.studentId}`,
        teacherId: state.teacher.id,
        studentId: input.studentId,
        activityId: input.activityId,
        value: input.value,
        updatedAt,
      };
      void api.upsertGrade(input);
      return { grades: [...state.grades, created] };
    });
  },

  markAllNotificationsRead: async () => {
    const list = await api.markAllNotificationsRead();
    set({ notifications: list });
  },
}));

export const selectTeacher = (s: AppState): Teacher => s.teacher;
export const selectSchoolYears = (s: AppState): SchoolYear[] => s.schoolYears;
export const selectActiveSchoolYear = (s: AppState): SchoolYear | undefined =>
  s.schoolYears.find((y) => y.isActive);
export const selectGroups = (s: AppState): Group[] => s.groups;
export const selectStudents = (s: AppState): Student[] => s.students;
export const selectSubjects = (s: AppState): Subject[] => s.subjects;
export const selectPeriods = (s: AppState): Period[] => s.periods;
export const selectCriteria = (s: AppState): Criterion[] => s.criteria;
export const selectActivities = (s: AppState): Activity[] => s.activities;
export const selectGrades = (s: AppState): Grade[] => s.grades;
export const selectNotifications = (s: AppState): Notification[] =>
  s.notifications;

export const selectGroupsInActiveYear = (s: AppState): Group[] => {
  const active = s.schoolYears.find((y) => y.isActive);
  if (!active) return [];
  return s.groups.filter((g) => g.schoolYearId === active.id);
};

export const isGroupConfigured = (
  groupId: string,
  subjects: Subject[],
  periods: Period[]
): boolean =>
  subjects.some((s) => s.groupId === groupId) &&
  periods.some((p) => p.groupId === groupId);
