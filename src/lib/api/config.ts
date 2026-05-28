/** `mock` = JSON locales + latencia simulada. `real` = backend HTTP (futuro). */
export const API_MODE = process.env.NEXT_PUBLIC_API_MODE ?? "mock";

export const USE_MOCK_API = API_MODE !== "real";

/** Latencia base simulada en ms (lecturas). */
export const API_READ_DELAY_MS = Number(
  process.env.NEXT_PUBLIC_API_READ_DELAY_MS ?? 350
);

/** Latencia en escrituras (create/update/delete). */
export const API_WRITE_DELAY_MS = Number(
  process.env.NEXT_PUBLIC_API_WRITE_DELAY_MS ?? 200
);

/** URL base del backend real — usar cuando API_MODE=real */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.gradeflow.mx/v1";
