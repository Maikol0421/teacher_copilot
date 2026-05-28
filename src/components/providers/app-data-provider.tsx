"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s) => s.hydrate);
  const loading = useAppStore((s) => s.loading);
  const initialized = useAppStore((s) => s.initialized);
  const error = useAppStore((s) => s.error);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4">
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
        <Button onClick={() => void hydrate()}>Reintentar</Button>
      </div>
    );
  }

  if (loading || !initialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Cargando datos…</p>
      </div>
    );
  }

  return <>{children}</>;
}
