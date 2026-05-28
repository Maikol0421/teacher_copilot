import { USE_MOCK_API } from "./config";
import * as mockApi from "./mock";
import * as realApi from "./real";

/**
 * Capa de API unificada.
 *
 * - Hoy: `mock` lee/escribe JSON en memoria (fixtures en src/data/fixtures/).
 * - Mañana: cambia `NEXT_PUBLIC_API_MODE=real` e implementa src/lib/api/real/.
 *
 * Los componentes y el store deben usar `api.*`, nunca importar el JSON directo.
 */
export const api: typeof mockApi = USE_MOCK_API
  ? mockApi
  : (realApi as unknown as typeof mockApi);

export type ApiClient = typeof mockApi;

export { USE_MOCK_API, API_MODE, API_BASE_URL } from "./config";
export type { ApiResult, ApiListResponse, ApiItemResponse } from "./types";
