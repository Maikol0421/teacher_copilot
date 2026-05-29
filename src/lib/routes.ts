/** Rutas estáticas compatibles con `output: "export"` (Firebase Hosting). */
export function groupDetailPath(id: string) {
  return `/grupos/detalle?id=${encodeURIComponent(id)}`;
}

export function studentDetailPath(id: string) {
  return `/alumnos/detalle?id=${encodeURIComponent(id)}`;
}
