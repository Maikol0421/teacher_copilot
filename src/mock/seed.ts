import {
  Activity,
  ActivityType,
  Criterion,
  Grade,
  Group,
  Notification,
  Period,
  SchoolYear,
  Student,
  Subject,
  Teacher,
} from "@/types";
import { buildFullName } from "@/lib/students";

const FIRST_NAMES = [
  "Sofía", "Mateo", "Valentina", "Santiago", "Isabella", "Sebastián",
  "Camila", "Emiliano", "Renata", "Diego", "Regina", "Leonardo",
  "Ximena", "Daniel", "Victoria", "Adrián", "Romina", "Maximiliano",
  "Mariana", "Andrés", "Andrea", "Iker", "Paulina", "Joaquín",
  "Fernanda", "Bruno", "Daniela", "Tadeo", "Luciana", "Gael",
  "Constanza", "Liam", "Ariana", "Patricio", "Aitana", "Thiago",
];

const LAST_NAMES = [
  "García", "Rodríguez", "Martínez", "López", "Hernández", "González",
  "Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera",
  "Gómez", "Díaz", "Reyes", "Cruz", "Morales", "Ortiz",
  "Gutiérrez", "Chávez", "Ramos", "Ruiz", "Mendoza", "Aguilar",
  "Vásquez", "Castillo", "Jiménez", "Romero", "Herrera", "Vargas",
];

const SUBJECTS_CATALOG = [
  { name: "Matemáticas", code: "MAT", color: "#3b82f6" },
  { name: "Español", code: "ESP", color: "#ef4444" },
  { name: "Ciencias Naturales", code: "CIE", color: "#10b981" },
  { name: "Historia", code: "HIS", color: "#f59e0b" },
  { name: "Geografía", code: "GEO", color: "#8b5cf6" },
  { name: "Inglés", code: "ING", color: "#06b6d4" },
  { name: "Educación Física", code: "EDF", color: "#ec4899" },
  { name: "Arte", code: "ART", color: "#f97316" },
];

const GROUPS_DATA = [
  { name: "6° A", grade: "6", level: "primaria" as const, color: "#3b82f6" },
  { name: "6° B", grade: "6", level: "primaria" as const, color: "#10b981" },
  { name: "5° A", grade: "5", level: "primaria" as const, color: "#f59e0b" },
];

const ACTIVITY_NAMES: Record<string, string[]> = {
  examen: [
    "Examen bimestral",
    "Examen mensual",
    "Examen de unidad",
    "Diagnóstico inicial",
  ],
  tarea: [
    "Tarea de fracciones",
    "Ejercicios de comprensión lectora",
    "Resumen capítulo 4",
    "Cuestionario unidad 2",
    "Mapa conceptual",
  ],
  trabajo: [
    "Proyecto trimestral",
    "Trabajo en equipo",
    "Investigación documental",
    "Portafolio de evidencias",
  ],
  participacion: [
    "Participación en clase",
    "Lectura en voz alta",
    "Debate guiado",
  ],
  exposicion: [
    "Exposición final",
    "Presentación de tema",
    "Maqueta interactiva",
  ],
};

// PRNG determinista para datos reproducibles
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let rand = mulberry32(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

import type { AppDataset } from "@/types/dataset";

export type MockDataset = AppDataset;

export function seedMockData(): AppDataset {
  rand = mulberry32(42);

  const teacher: Teacher = {
    id: "teacher-1",
    name: "Profra. Ana Martínez",
    email: "ana.martinez@gradeflow.mx",
    avatarUrl:
      "https://api.dicebear.com/7.x/notionists/svg?seed=Ana&backgroundColor=b6e3f4",
    school: "Colegio Reforma",
  };

  // Ciclos escolares: uno activo + uno previo (lectura)
  const schoolYears: SchoolYear[] = [
    {
      id: "sy-2024",
      teacherId: teacher.id,
      name: "2024-2025",
      startDate: new Date(2024, 7, 19).toISOString(),
      endDate: new Date(2025, 6, 15).toISOString(),
      isActive: false,
      createdAt: daysAgo(420),
    },
    {
      id: "sy-2025",
      teacherId: teacher.id,
      name: "2025-2026",
      startDate: new Date(2025, 7, 18).toISOString(),
      endDate: new Date(2026, 6, 14).toISOString(),
      isActive: true,
      createdAt: daysAgo(60),
    },
  ];

  const activeYearId = "sy-2025";

  const groups: Group[] = [];
  const subjects: Subject[] = [];
  const periods: Period[] = [];
  const criteria: Criterion[] = [];
  const students: Student[] = [];
  const activities: Activity[] = [];
  const grades: Grade[] = [];

  GROUPS_DATA.forEach((g, gi) => {
    const groupId = `group-${gi + 1}`;

    // Periodos del grupo: 5 bimestres
    const periodNames = ["Bimestre 1", "Bimestre 2", "Bimestre 3", "Bimestre 4", "Bimestre 5"];
    const groupPeriods: Period[] = periodNames.map((name, idx) => ({
      id: `period-${groupId}-${idx + 1}`,
      teacherId: teacher.id,
      groupId,
      name,
      startDate: new Date(2025, 7 + idx * 2, 1).toISOString(),
      endDate: new Date(2025, 7 + idx * 2 + 2, 0).toISOString(),
      order: idx,
      createdAt: daysAgo(50),
    }));
    periods.push(...groupPeriods);

    // El periodo activo del grupo: el 3° (Bimestre 3)
    const activePeriodIdx = 2;
    const activePeriod = groupPeriods[activePeriodIdx];

    groups.push({
      id: groupId,
      teacherId: teacher.id,
      schoolYearId: activeYearId,
      name: g.name,
      grade: g.grade,
      level: g.level,
      color: g.color,
      activePeriodId: activePeriod.id,
      createdAt: daysAgo(randInt(30, 55)),
    });

    // Materias del grupo: 5
    const groupSubjects = pickN(SUBJECTS_CATALOG.slice(0, 6), 5).map((s, idx) => {
      const subjectId = `subject-${groupId}-${idx + 1}`;
      subjects.push({
        id: subjectId,
        teacherId: teacher.id,
        groupId,
        name: s.name,
        code: s.code,
        color: s.color,
        order: idx,
        createdAt: daysAgo(45),
      });
      return { id: subjectId, ...s };
    });

    // Criterios por (materia × periodo) que sumen 100
    const CRITERIA_TEMPLATES: Array<{ name: string; weight: number }[]> = [
      [
        { name: "Examen", weight: 40 },
        { name: "Tareas", weight: 30 },
        { name: "Trabajos", weight: 20 },
        { name: "Participación", weight: 10 },
      ],
      [
        { name: "Examen", weight: 50 },
        { name: "Tareas", weight: 25 },
        { name: "Exposiciones", weight: 15 },
        { name: "Participación", weight: 10 },
      ],
      [
        { name: "Examen", weight: 35 },
        { name: "Trabajos", weight: 30 },
        { name: "Tareas", weight: 25 },
        { name: "Participación", weight: 10 },
      ],
    ];

    groupSubjects.forEach((subj, si) => {
      groupPeriods.forEach((per) => {
        const tpl = CRITERIA_TEMPLATES[si % CRITERIA_TEMPLATES.length];
        tpl.forEach((c, ci) => {
          criteria.push({
            id: `crit-${subj.id}-${per.id}-${ci + 1}`,
            teacherId: teacher.id,
            groupId,
            subjectId: subj.id,
            periodId: per.id,
            name: c.name,
            weight: c.weight,
            order: ci,
            createdAt: daysAgo(40),
          });
        });
      });
    });

    // Alumnos (18–28)
    const studentCount = randInt(18, 28);
    for (let s = 0; s < studentCount; s++) {
      const studentId = `student-${groupId}-${s + 1}`;
      const firstName = pick(FIRST_NAMES);
      const paternalLastName = pick(LAST_NAMES);
      // 90% tienen apellido materno
      const maternalLastName = rand() < 0.9 ? pick(LAST_NAMES) : "";
      students.push({
        id: studentId,
        teacherId: teacher.id,
        groupId,
        firstName,
        paternalLastName,
        maternalLastName,
        fullName: buildFullName({ firstName, paternalLastName, maternalLastName }),
        studentCode: `${g.grade}${g.level[0].toUpperCase()}-${(s + 1)
          .toString()
          .padStart(3, "0")}`,
        enrolledAt: daysAgo(randInt(40, 70)),
      });
    }

    // Actividades por materia (en el periodo activo del grupo + algunas en periodos anteriores)
    const groupStudentIds = students.filter((st) => st.groupId === groupId).map((s) => s.id);

    groupSubjects.forEach((subj) => {
      // Actividades repartidas entre periodos: bimestres 1, 2 (pasados) y 3 (parcialmente)
      [0, 1, 2].forEach((perIdx) => {
        const period = groupPeriods[perIdx];
        const subjectCriteria = criteria.filter(
          (c) => c.subjectId === subj.id && c.periodId === period.id
        );
        const activitiesPerCriterion = perIdx === 2 ? 1 : 2; // periodo actual menos cargado
        subjectCriteria.forEach((crit) => {
          for (let a = 0; a < activitiesPerCriterion; a++) {
            const typeMap: Record<string, ActivityType> = {
              Examen: "examen",
              Tareas: "tarea",
              Trabajos: "trabajo",
              Exposiciones: "exposicion",
              Participación: "participacion",
            };
            const type = typeMap[crit.name] ?? "tarea";
            const isPast = perIdx < 2 || (perIdx === 2 && rand() > 0.4);
            const activityId = `activity-${crit.id}-${a + 1}`;
            activities.push({
              id: activityId,
              teacherId: teacher.id,
              groupId,
              subjectId: subj.id,
              periodId: period.id,
              criterionId: crit.id,
              name: pick(ACTIVITY_NAMES[type] ?? ["Actividad"]),
              type,
              dueDate: isPast
                ? daysAgo(randInt(1, 60))
                : daysFromNow(randInt(1, 12)),
              maxScore: 10,
              createdAt: daysAgo(randInt(15, 60)),
            });

            // Calificaciones si la actividad ya pasó
            if (isPast) {
              const groupSkill = (gi % 3) === 0 ? 8.5 : (gi % 3) === 1 ? 7.5 : 6.5;
              for (const studentId of groupStudentIds) {
                if (rand() < 0.08) continue;
                const studentBias = (parseInt(studentId.slice(-2), 10) % 5) - 2;
                const noise = (rand() - 0.5) * 3;
                const raw = groupSkill + studentBias * 0.5 + noise;
                const value = Math.max(4, Math.min(10, Math.round(raw * 10) / 10));
                grades.push({
                  id: `grade-${activityId}-${studentId}`,
                  teacherId: teacher.id,
                  studentId,
                  activityId,
                  value,
                  updatedAt: daysAgo(randInt(0, 30)),
                });
              }
            }
          }
        });
      });
    });
  });

  const notifications: Notification[] = [
    {
      id: "n-1",
      teacherId: teacher.id,
      title: "5 actividades por calificar",
      description: "Tienes pendientes en 6° A y 5° A.",
      createdAt: daysAgo(0),
      read: false,
      type: "warning",
    },
    {
      id: "n-2",
      teacherId: teacher.id,
      title: "Cierre de bimestre",
      description: "Faltan 8 días para cerrar el bimestre actual.",
      createdAt: daysAgo(1),
      read: false,
      type: "info",
    },
    {
      id: "n-3",
      teacherId: teacher.id,
      title: "Promedio mejoró en 6° B",
      description: "El grupo subió 0.4 puntos esta semana.",
      createdAt: daysAgo(2),
      read: true,
      type: "success",
    },
  ];

  return {
    teacher,
    schoolYears,
    groups,
    subjects,
    periods,
    criteria,
    students,
    activities,
    grades,
    notifications,
  };
}
