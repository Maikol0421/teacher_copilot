/**
 * Utilidades para generar y descargar archivos CSV en el navegador.
 * Compatible con Excel: se agrega BOM UTF-8 para que los acentos no se rompan.
 */

/** Escapa un valor para incluirlo en una celda CSV. */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convierte un arreglo de objetos a una cadena CSV.
 * Las columnas se infieren de las llaves del primer objeto si no se proveen.
 */
export function toCSV<T extends Record<string, unknown>>(
  rows: T[],
  columns?: Array<{ key: keyof T | string; label: string }>
): string {
  if (rows.length === 0) return "";
  const cols =
    columns ??
    (Object.keys(rows[0]).map((k) => ({ key: k, label: k })) as Array<{
      key: string;
      label: string;
    }>);

  const header = cols.map((c) => escapeCell(c.label)).join(",");
  const body = rows
    .map((row) =>
      cols
        .map((c) => escapeCell((row as Record<string, unknown>)[c.key as string]))
        .join(",")
    )
    .join("\r\n");
  return header + "\r\n" + body;
}

/** Dispara la descarga de un CSV con BOM UTF-8 (para Excel). */
export function downloadCSV(filename: string, csv: string) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Slug seguro para nombre de archivo. */
export function slug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
