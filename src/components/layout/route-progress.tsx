"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Barra de progreso global que se muestra arriba al navegar entre rutas.
 * Útil sobre todo en `next dev` donde Next.js compila rutas on-demand y la
 * navegación puede tomar 1-3s. Da feedback visual instantáneo al usuario.
 *
 * - Se activa al hacer click en cualquier <a> / <Link> con destino interno.
 * - Avanza con animación tipo NProgress mientras la nueva ruta se monta.
 * - Se completa al detectar el cambio de `pathname`.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timersRef = useRef<{ tick?: ReturnType<typeof setInterval>; hide?: ReturnType<typeof setTimeout> }>({});

  const start = () => {
    setVisible(true);
    setProgress(8);
    if (timersRef.current.tick) clearInterval(timersRef.current.tick);
    timersRef.current.tick = setInterval(() => {
      setProgress((p) => {
        // Avance log-decreciente: rápido al inicio, lento cerca del 90%.
        const inc = (90 - p) * 0.08;
        const next = Math.min(p + inc, 90);
        return next;
      });
    }, 180);
  };

  const finish = () => {
    if (timersRef.current.tick) clearInterval(timersRef.current.tick);
    setProgress(100);
    if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
    timersRef.current.hide = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 220);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href) return;
      if (target && target !== "_self") return;
      if (href.startsWith("#")) return;
      if (/^https?:\/\//i.test(href)) {
        // Solo internos (mismo origin)
        try {
          const url = new URL(href, window.location.href);
          if (url.origin !== window.location.origin) return;
        } catch {
          return;
        }
      }
      // Si es la misma URL no mostramos progreso.
      try {
        const url = new URL(href, window.location.href);
        if (url.pathname + url.search === window.location.pathname + window.location.search) return;
      } catch {
        // ignore
      }
      start();
    };

    document.addEventListener("click", handler, { capture: true });
    return () => {
      document.removeEventListener("click", handler, { capture: true });
    };
  }, []);

  // Cuando el pathname cambia, asumimos que la nueva ruta ya está montada
  useEffect(() => {
    if (visible) finish();
    return () => {
      if (timersRef.current.tick) clearInterval(timersRef.current.tick);
      if (timersRef.current.hide) clearTimeout(timersRef.current.hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      <div
        className="h-full bg-gradient-to-r from-primary via-primary to-blue-400 shadow-[0_0_10px_hsl(var(--primary)/0.6)]"
        style={{
          width: `${progress}%`,
          transition: "width 220ms ease-out",
        }}
      />
    </div>
  );
}
