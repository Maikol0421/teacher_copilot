export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

export interface ApiListResponse<T> {
  data: T[];
  meta?: { total: number };
}

export interface ApiItemResponse<T> {
  data: T;
}
