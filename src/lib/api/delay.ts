import { API_READ_DELAY_MS, API_WRITE_DELAY_MS } from "./config";

export async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withReadDelay<T>(fn: () => T): Promise<T> {
  await delay(API_READ_DELAY_MS);
  return fn();
}

export async function withWriteDelay<T>(fn: () => T): Promise<T> {
  await delay(API_WRITE_DELAY_MS);
  return fn();
}
