import rawDataset from "@/data/fixtures/dataset.json";
import type { AppDataset } from "@/types/dataset";

const STORAGE_KEY = "gradeflow:mock-db";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function readFromStorage(): AppDataset | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppDataset;
  } catch {
    return null;
  }
}

function writeToStorage(data: AppDataset) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Quota exceeded or private mode — ignore
  }
}

function createInitialDb(): AppDataset {
  return clone(rawDataset as AppDataset);
}

let db: AppDataset = createInitialDb();
let hydratedFromStorage = false;

function ensureClientHydration() {
  if (typeof window === "undefined" || hydratedFromStorage) return;
  hydratedFromStorage = true;
  const stored = readFromStorage();
  if (stored) db = stored;
}

export function getDb(): AppDataset {
  ensureClientHydration();
  return db;
}

export function resetDb() {
  ensureClientHydration();
  db = createInitialDb();
  writeToStorage(db);
}

export function updateDb(updater: (current: AppDataset) => AppDataset) {
  ensureClientHydration();
  db = updater(db);
  writeToStorage(db);
}

export function getFixtureSnapshot(): AppDataset {
  return createInitialDb();
}
