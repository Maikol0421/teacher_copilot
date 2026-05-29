"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import GroupDetailView from "@/features/groups/group-detail-view";
import { Button } from "@/components/ui/button";

function GroupDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
        <p className="text-sm text-muted-foreground">
          No se indicó qué grupo quieres ver.
        </p>
        <Button asChild>
          <Link href="/grupos">Volver a grupos</Link>
        </Button>
      </div>
    );
  }

  return <GroupDetailView groupId={id} />;
}

export default function GroupDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Cargando grupo…</p>
        </div>
      }
    >
      <GroupDetailContent />
    </Suspense>
  );
}
