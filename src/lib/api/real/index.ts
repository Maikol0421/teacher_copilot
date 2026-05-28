/**
 * Cliente HTTP real — implementar al conectar backend.
 * @see src/lib/api/mock/index.ts para las firmas de referencia
 */
import type { AppDataset } from "@/types/dataset";
import { API_BASE_URL } from "../config";

function notImplemented(name: string): never {
  throw new Error(
    `[API real] ${name} no implementado. Edita src/lib/api/real/ o usa NEXT_PUBLIC_API_MODE=mock`
  );
}

export async function fetchBootstrap(): Promise<AppDataset> {
  const res = await fetch(`${API_BASE_URL}/bootstrap`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Error ${res.status} cargando datos`);
  return res.json();
}

export async function resetBootstrap(): Promise<AppDataset> {
  notImplemented("POST /bootstrap/reset");
}

export async function fetchTeacher() {
  notImplemented("GET /teacher/me");
}

export async function fetchSchoolYears() {
  notImplemented("GET /school-years");
}

export async function createSchoolYear(
  _input: Parameters<typeof import("../mock").createSchoolYear>[0]
) {
  notImplemented("POST /school-years");
}

export async function setActiveSchoolYear(_id: string) {
  notImplemented("PATCH /school-years/:id/active");
}

export async function deleteSchoolYear(_id: string) {
  notImplemented("DELETE /school-years/:id");
}

export async function fetchGroups(_schoolYearId?: string) {
  notImplemented("GET /groups");
}

export async function createGroup(
  _input: Parameters<typeof import("../mock").createGroup>[0]
) {
  notImplemented("POST /groups");
}

export async function updateGroup(
  _id: string,
  _patch: Parameters<typeof import("../mock").updateGroup>[1]
) {
  notImplemented("PATCH /groups/:id");
}

export async function setGroupActivePeriod(_groupId: string, _periodId: string) {
  notImplemented("PATCH /groups/:id/active-period");
}

export async function deleteGroup(_id: string) {
  notImplemented("DELETE /groups/:id");
}

export async function fetchSubjects(_groupId?: string) {
  notImplemented("GET /subjects");
}

export async function createSubject(
  _input: Parameters<typeof import("../mock").createSubject>[0]
) {
  notImplemented("POST /subjects");
}

export async function deleteSubject(_id: string) {
  notImplemented("DELETE /subjects/:id");
}

export async function fetchPeriods(_groupId?: string) {
  notImplemented("GET /periods");
}

export async function createPeriod(
  _input: Parameters<typeof import("../mock").createPeriod>[0]
) {
  notImplemented("POST /periods");
}

export async function deletePeriod(_id: string) {
  notImplemented("DELETE /periods/:id");
}

export async function fetchCriteria(
  _filters?: Parameters<typeof import("../mock").fetchCriteria>[0]
) {
  notImplemented("GET /criteria");
}

export async function saveCriteria(
  _input: Parameters<typeof import("../mock").saveCriteria>[0]
) {
  notImplemented("PUT /criteria");
}

export async function fetchStudents(_groupId?: string) {
  notImplemented("GET /students");
}

export async function createStudent(
  _input: Parameters<typeof import("../mock").createStudent>[0]
) {
  notImplemented("POST /students");
}

export async function deleteStudent(_id: string) {
  notImplemented("DELETE /students/:id");
}

export async function fetchActivities(
  _filters?: Parameters<typeof import("../mock").fetchActivities>[0]
) {
  notImplemented("GET /activities");
}

export async function createActivity(
  _input: Parameters<typeof import("../mock").createActivity>[0]
) {
  notImplemented("POST /activities");
}

export async function deleteActivity(_id: string) {
  notImplemented("DELETE /activities/:id");
}

export async function fetchGrades(
  _filters?: Parameters<typeof import("../mock").fetchGrades>[0]
) {
  notImplemented("GET /grades");
}

export async function upsertGrade(
  _input: Parameters<typeof import("../mock").upsertGrade>[0]
) {
  notImplemented("PUT /grades");
}

export async function fetchNotifications() {
  notImplemented("GET /notifications");
}

export async function markAllNotificationsRead() {
  notImplemented("PATCH /notifications/read-all");
}
