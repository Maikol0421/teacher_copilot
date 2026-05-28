"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  Moon,
  Search,
  Sun,
  User,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppStore, selectNotifications, selectTeacher } from "@/store/app-store";
import { CommandPalette } from "./command-palette";
import { formatRelativeTime, initials } from "@/lib/utils";

export function Topbar() {
  const teacher = useAppStore(selectTeacher);
  const notifications = useAppStore(selectNotifications);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 md:gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
      <div className="md:hidden flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <span className="font-bold text-sm">G</span>
        </div>
        <span className="font-semibold">GradeFlow</span>
      </div>

      <div className="hidden md:flex flex-1 max-w-md">
        <button
          onClick={() => setPaletteOpen(true)}
          className="group flex w-full items-center gap-2 rounded-lg border border-input bg-background/60 hover:bg-accent transition-colors px-3 py-1.5 text-sm text-muted-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Buscar alumnos, grupos, actividades…</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setPaletteOpen(true)}
          aria-label="Buscar"
        >
          <Search className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Cambiar tema"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Notificaciones" className="relative">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b p-3">
              <div>
                <p className="text-sm font-semibold">Notificaciones</p>
                <p className="text-xs text-muted-foreground">
                  {unread > 0 ? `${unread} sin leer` : "Estás al día"}
                </p>
              </div>
              {unread > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7">
                  Marcar leídas
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 && (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  No tienes notificaciones.
                </p>
              )}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex gap-3 border-b p-3 last:border-b-0 hover:bg-accent/40 transition-colors"
                >
                  <div
                    className={
                      "mt-1 h-2 w-2 shrink-0 rounded-full " +
                      (n.read
                        ? "bg-muted-foreground/30"
                        : n.type === "warning"
                          ? "bg-amber-500"
                          : n.type === "success"
                            ? "bg-emerald-500"
                            : "bg-primary")
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={teacher.avatarUrl} alt={teacher.name} />
                <AvatarFallback>{initials(teacher.name)}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col leading-tight text-left">
                <span className="text-xs font-medium">{teacher.name}</span>
                <span className="text-[10px] text-muted-foreground">{teacher.school}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/configuracion">
                <User className="h-4 w-4" /> Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/configuracion">
                <Settings2 className="h-4 w-4" /> Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Sparkles className="h-4 w-4" /> Novedades
              <Badge variant="success" className="ml-auto text-[10px]">Nuevo</Badge>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-rose-600 focus:text-rose-600"
              onSelect={() => router.push("/login")}
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
