"use client";

import { useTheme } from "next-themes";
import { Bell, Moon, Palette, RotateCcw, Sparkles, Sun, User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppStore, selectTeacher } from "@/store/app-store";
import { initials } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsView() {
  const teacher = useAppStore(selectTeacher);
  const reset = useAppStore((s) => s.reset);
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Configuración" description="Personaliza tu experiencia." />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={teacher.avatarUrl} alt={teacher.name} />
              <AvatarFallback>{initials(teacher.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{teacher.name}</p>
              <p className="text-xs text-muted-foreground">{teacher.school}</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              Cambiar foto
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" defaultValue={teacher.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" defaultValue={teacher.email} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" /> Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "light", label: "Claro", icon: Sun },
              { value: "dark", label: "Oscuro", icon: Moon },
              { value: "system", label: "Sistema", icon: Sparkles },
            ].map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  className={
                    "rounded-xl border-2 p-4 transition-all text-left " +
                    (active
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-foreground/20")
                  }
                >
                  <Icon className="h-4 w-4 mb-2" />
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {opt.value === "system" ? "Sigue al sistema" : "Tema fijo"}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            title="Resumen diario"
            description="Recibe un resumen al final del día."
            defaultChecked
          />
          <ToggleRow
            title="Alertas de riesgo"
            description="Notifícame si un alumno baja su promedio."
            defaultChecked
          />
          <ToggleRow
            title="Cierre de bimestre"
            description="Recordatorios automáticos antes del cierre."
          />
          <ToggleRow
            title="Sonidos al guardar"
            description="Pequeño efecto al guardar una calificación."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-600">
            <RotateCcw className="h-4 w-4" /> Zona de demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 justify-between">
            <div>
              <p className="text-sm font-medium">Restablecer datos mock</p>
              <p className="text-xs text-muted-foreground">
                Regenera grupos, alumnos y calificaciones de prueba.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                void reset().then(() =>
                  toast.success("Datos restaurados desde JSON")
                );
              }}
            >
              <RotateCcw className="h-4 w-4" /> Restablecer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
