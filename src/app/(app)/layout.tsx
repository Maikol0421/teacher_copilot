import { AppShell } from "@/components/layout/app-shell";
import { AppDataProvider } from "@/components/providers/app-data-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AppDataProvider>{children}</AppDataProvider>
    </AppShell>
  );
}
