"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import StudentProfileView from "@/features/students/student-profile-view";
import { Button } from "@/components/ui/button";

function StudentDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
        <p className="text-sm text-muted-foreground">
          No se indicó qué alumno quieres ver.
        </p>
        <Button asChild>
          <Link href="/grupos">Ir a grupos</Link>
        </Button>
      </div>
    );
  }

  return <StudentProfileView studentId={id} />;
}

export default function StudentDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Cargando alumno…</p>
        </div>
      }
    >
      <StudentDetailContent />
    </Suspense>
  );
}
