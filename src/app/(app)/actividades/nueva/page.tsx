import { Suspense } from "react";
import NewActivityView from "@/features/activities/new-activity-view";

export const metadata = {
  title: "Nueva actividad · GradeFlow",
};

export default function NewActivityPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Cargando…</div>}>
      <NewActivityView />
    </Suspense>
  );
}
