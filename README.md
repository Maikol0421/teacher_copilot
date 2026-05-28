# GradeFlow

> La forma más rápida y limpia de registrar calificaciones.

GradeFlow es una POC (Proof of Concept) **frontend-only** para una herramienta web pensada para maestros de primaria y secundaria. El foco principal es ofrecer la captura de calificaciones más rápida y agradable del mercado, con una UI moderna inspirada en Notion, Linear, Google Classroom y Airtable.

> ⚠️ **Esta versión usa exclusivamente datos mock locales.** No hay backend, no hay APIs reales. La arquitectura está preparada para conectar APIs en el futuro reemplazando la capa de `mock/` y `lib/api`.

---

## Stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** estricto
- **TailwindCSS** + **shadcn/ui** + **lucide-react**
- **Zustand** para estado global mock
- **Recharts** para visualizaciones
- **next-themes** para dark mode
- **sonner** para toasts

## Cómo iniciar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Por defecto, la app entra al login. Cualquier credencial funciona (se simula). Después aterriza en el dashboard.

## Deploy en Firebase Hosting

Este proyecto está configurado para **export estático** de Next.js (`output: 'export'`), compatible con Firebase Hosting igual que tus apps Vite/React.

> **Diferencia con Vite:** en Vite usas `"public": "dist"` y un rewrite a `index.html` porque es SPA pura. Next.js genera una carpeta `out/` con HTML por ruta, así que **no** se usa el rewrite `** → index.html`.

### 1. Prerrequisitos

```bash
npm install -g firebase-tools
firebase login
```

### 2. Configurar proyecto Firebase

Copia el ejemplo y pon tu project ID:

```bash
cp .firebaserc.example .firebaserc
# Edita .firebaserc → reemplaza TU-PROJECT-ID-DE-FIREBASE
```

O crea el proyecto en [Firebase Console](https://console.firebase.google.com/) y luego:

```bash
firebase use --add
```

### 3. Build + deploy

```bash
npm run deploy
```

Esto ejecuta `next build` (genera la carpeta `out/`) y luego `firebase deploy --only hosting`.

### Archivos de deploy

| Archivo | Propósito |
|---------|-----------|
| `firebase.json` | Hosting apunta a `out/` |
| `.firebaserc.example` | Plantilla del project ID |
| `next.config.mjs` | `output: "export"` + imágenes sin optimizar |

### Notas

- Las rutas dinámicas (`/grupos/[id]`, `/alumnos/[id]`) se pre-generan con los IDs del mock seed al hacer build.
- Si creas grupos/alumnos nuevos en runtime, esos IDs no tendrán HTML estático (la POC guarda todo en memoria y se pierde al recargar).
- Para SSR completo de Next.js sin export estático, usa **Firebase App Hosting** en lugar de Hosting clásico.

## Deploy automático con GitHub Actions

Cada push a `main` dispara build + deploy a Firebase Hosting (workflow en `.github/workflows/firebase-hosting.yml`).

### 1. Genera un token de Firebase (solo una vez)

En tu máquina local, con la CLI ya logueada:

```bash
firebase login:ci
```

Copia el token que imprime en consola (empieza con `1//...`).

### 2. Agrega el secret en GitHub

1. Abre tu repo: https://github.com/Maikol0421/teacher_copilot  
2. **Settings** → **Secrets and variables** → **Actions**  
3. **New repository secret**  
4. Nombre: `FIREBASE_TOKEN`  
5. Valor: pega el token del paso anterior  

### 3. Sube el workflow al repo

```bash
git add .github/workflows/firebase-hosting.yml
git commit -m "Add GitHub Actions deploy to Firebase Hosting"
git push origin main
```

### 4. Verifica

- Ve a la pestaña **Actions** en GitHub y revisa que el workflow "Deploy to Firebase Hosting" termine en verde.  
- Tu sitio quedará en: https://teacher-app-71041.web.app  

También puedes lanzar un deploy manual desde **Actions** → **Deploy to Firebase Hosting** → **Run workflow**.

> **Importante:** el Project ID en Firebase es `teacher-app-71041` (no `teacher-app`). El workflow ya usa ese ID.

## Estructura

```
src/
├── app/                # Rutas (App Router)
│   ├── (auth)/login    # Login
│   └── (app)/          # App protegida (sidebar + topbar)
│       ├── dashboard/
│       ├── grupos/
│       │   └── [id]/
│       ├── alumnos/[id]/
│       ├── capturar/
│       ├── actividades/nueva/
│       ├── reportes/
│       └── configuracion/
├── components/         # Componentes UI compartidos
│   ├── ui/             # Primitivos shadcn/ui
│   └── layout/         # Sidebar, Topbar
├── features/           # Componentes por dominio
│   ├── dashboard/
│   ├── groups/
│   ├── students/
│   ├── activities/
│   ├── capture/
│   └── reports/
├── hooks/              # Custom hooks (use-mobile, etc.)
├── lib/                # Utilidades + helpers
├── mock/               # Generadores de datos fake realistas
├── store/              # Zustand stores
└── types/              # Tipos compartidos
```

## Páginas

1. **Login** — Pantalla minimalista con branding.
2. **Dashboard** — KPIs, gráficas, alumnos en riesgo, actividades pendientes.
3. **Grupos** — Cards con color identificador, promedio y conteo.
4. **Detalle de grupo** — Tabs: Alumnos · Actividades · Calificaciones · Estadísticas.
5. **Perfil de alumno** — Promedio, historial, materias, gráficas.
6. **Nueva actividad** — Formulario para tarea/examen/trabajo/etc.
7. **Capturar calificaciones** ⭐ — Tabla tipo Airtable en desktop, captura vertical optimizada en mobile.
8. **Reportes** — Charts con promedios y distribución.
9. **Configuración** — Tema, perfil, preferencias.

## Captura de calificaciones (la pantalla estrella)

- **Desktop**: tabla tipo Excel/Airtable con edición inline, navegación por teclado (`Enter` baja, `Tab` avanza), colores automáticos (rojo/amarillo/verde), sticky header, búsqueda y autoguardado simulado con toast.
- **Mobile**: captura vertical de una calificación a la vez, input grande, botones de navegación con el pulgar.

## Preparado para APIs

La app usa una **capa de API** (`src/lib/api/`) que hoy lee JSON locales y mañana puede apuntar al backend real sin tocar la UI.

```
src/
├── data/fixtures/dataset.json   ← datos mock prearmados (editable)
├── lib/api/
│   ├── index.ts                 ← exporta `api` (mock o real según env)
│   ├── mock/                    ← simula GET/POST/PATCH con latencia
│   └── real/                    ← stubs para conectar backend HTTP
└── store/app-store.ts           ← cache React; llama a `api.*`
```

### Modo mock (default)

```bash
# Regenerar JSON desde el generador determinístico
npm run generate:fixtures
```

Variables opcionales en `.env.local`:

```env
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_API_READ_DELAY_MS=350
NEXT_PUBLIC_API_WRITE_DELAY_MS=200
```

### Migrar a API real

1. Implementa cada función en `src/lib/api/real/` (misma firma que `mock/`).
2. Define `NEXT_PUBLIC_API_MODE=real` y `NEXT_PUBLIC_API_BASE_URL=https://tu-api.com/v1`.
3. El store y los componentes **no cambian**.

## Licencia

POC interna — solo uso demostrativo.
