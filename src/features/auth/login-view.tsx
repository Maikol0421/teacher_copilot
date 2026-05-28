"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, Loader2, Mail, Lock, Sparkles, Zap, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("ana.martinez@gradeflow.mx");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Bienvenida, Ana", {
      description: "Iniciando sesión…",
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Left: form */}
      <div className="flex flex-col p-6 lg:p-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">GradeFlow</span>
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm space-y-8 animate-slide-up">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Hola de nuevo</h1>
              <p className="mt-2 text-muted-foreground">
                Inicia sesión para empezar a registrar calificaciones rápidamente.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@escuela.mx"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Entrando…
                  </>
                ) : (
                  <>
                    Entrar <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Demo: cualquier credencial funciona — datos son mock.
              </p>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              ¿Aún no tienes cuenta?{" "}
              <a className="text-primary font-medium hover:underline" href="#">
                Solicita una invitación
              </a>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} GradeFlow · Todos los derechos reservados
        </p>
      </div>

      {/* Right: branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary via-primary to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -left-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          La forma más rápida de registrar calificaciones
        </div>

        <div className="relative z-10 space-y-8 max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">
            Captura calificaciones <span className="opacity-80">en segundos</span>, no en horas.
          </h2>
          <div className="space-y-4 text-sm">
            <Feature
              icon={Zap}
              title="Captura ultra rápida"
              description="Tabla tipo Airtable en escritorio, vertical optimizado en móvil."
            />
            <Feature
              icon={BookOpen}
              title="Todo lo que necesitas"
              description="Grupos, alumnos, actividades, promedios y reportes claros."
            />
            <Feature
              icon={Sparkles}
              title="Diseño limpio"
              description="Inspirado en Notion, Linear y Airtable. Para que enseñes sin fricción."
            />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 w-8 rounded-full border-2 border-primary bg-white/20"
                style={{
                  backgroundImage: `url(https://api.dicebear.com/7.x/notionists/svg?seed=teacher${i})`,
                  backgroundSize: "cover",
                }}
              />
            ))}
          </div>
          <p className="text-white/80">+1,200 maestros ya lo usan en sus aulas.</p>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15 backdrop-blur-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-white/70 text-xs">{description}</p>
      </div>
    </div>
  );
}
