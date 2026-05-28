import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { RouteProgress } from "@/components/layout/route-progress";

export const metadata: Metadata = {
  title: "GradeFlow — La forma más rápida de registrar calificaciones",
  description:
    "Herramienta moderna para maestros: gestiona grupos, alumnos, actividades y captura calificaciones en segundos.",
  applicationName: "GradeFlow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <RouteProgress />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
