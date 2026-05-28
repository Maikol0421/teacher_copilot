"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Criterion, Grade, Student, Subject } from "@/types";
import { calculateStudentAverage } from "@/lib/grades";

interface StatsTabProps {
  students: Student[];
  subjects: Subject[];
  criteria: Criterion[];
  activities: Activity[];
  grades: Grade[];
  distribution: Array<{ range: string; count: number }>;
  color: string;
}

const DIST_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];

export function StatsTab({
  students,
  subjects,
  criteria,
  activities,
  grades,
  distribution,
  color,
}: StatsTabProps) {
  const studentAverages = useMemo(() => {
    return students
      .map((s) => ({
        name: s.firstName,
        avg: calculateStudentAverage(s.id, subjects, criteria, activities, grades),
      }))
      .filter((s) => s.avg > 0)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);
  }, [students, subjects, criteria, activities, grades]);

  const trend = useMemo(() => {
    // Mock evolution timeline based on activities order
    const sorted = [...activities].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    return sorted.slice(-8).map((a, i) => {
      const vals = grades
        .filter((g) => g.activityId === a.id && g.value != null)
        .map((g) => g.value as number);
      const avg = vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : 0;
      return {
        name: `A${i + 1}`,
        avg: Math.round(avg * 10) / 10,
      };
    });
  }, [activities, grades]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Distribución de calificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="range" fontSize={12} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distribution.map((_, i) => (
                    <Cell key={i} fill={DIST_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tendencia del grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} fontSize={12} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: color }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top 10 promedios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={studentAverages} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[0, 10]} fontSize={12} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" fontSize={12} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} width={70} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--popover))",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="avg" fill={color} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
