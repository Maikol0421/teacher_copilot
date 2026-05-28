/**
 * Genera src/data/fixtures/dataset.json desde el seed determinístico.
 * Ejecutar cuando quieras refrescar los JSON mock: npm run generate:fixtures
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { seedMockData } from "../src/mock/seed";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "src", "data", "fixtures");
const outFile = join(outDir, "dataset.json");

mkdirSync(outDir, { recursive: true });
const data = seedMockData();
writeFileSync(outFile, JSON.stringify(data, null, 2), "utf-8");

console.log(`✓ Fixtures generados: ${outFile}`);
console.log(
  `  ${data.groups.length} grupos · ${data.students.length} alumnos · ${data.grades.length} calificaciones`
);
