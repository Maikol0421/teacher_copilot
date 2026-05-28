import rawDataset from "@/data/fixtures/dataset.json";
import type { AppDataset } from "@/types/dataset";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

let db: AppDataset = clone(rawDataset as AppDataset);

export function getDb(): AppDataset {
  return db;
}

export function resetDb() {
  db = clone(rawDataset as AppDataset);
}

export function updateDb(updater: (current: AppDataset) => AppDataset) {
  db = updater(db);
}

export function getFixtureSnapshot(): AppDataset {
  return clone(rawDataset as AppDataset);
}
