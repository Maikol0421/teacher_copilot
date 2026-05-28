import { Suspense } from "react";
import CaptureView from "@/features/capture/capture-view";

export const metadata = {
  title: "Capturar calificaciones · GradeFlow",
};

export default function CapturarPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Cargando…</div>}>
      <CaptureView />
    </Suspense>
  );
}
