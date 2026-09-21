import { createClient } from "@/lib/supabase/server";
import {
  GraduationCap, Users, UserCheck, BookOpen,
  CalendarCheck, Trophy, TrendingUp, Clock,
} from "lucide-react";

async function getStats() {
  const supabase = await createClient();
  const [students, employees, exams, events] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", 1),
    supabase.from("employees").select("id", { count: "exact", head: true }).eq("status", 1),
    supabase.from("exams").select("id", { count: "exact", head: true }).eq("status", 1),
    supabase.from("events").select("id, title, start_date").eq("status", 1).gte("end_date", new Date().toISOString().slice(0, 10)).order("start_date").limit(5),
  ]);
  return {
    students: students.count ?? 0,
    employees: employees.count ?? 0,
    exams: exams.count ?? 0,
    events: events.data ?? [],
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total Students", value: stats.students, icon: GraduationCap, color: "bg-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
    { label: "Total Employees", value: stats.employees, icon: Users, color: "bg-green-500", bg: "bg-green-50 dark:bg-green-950" },
    { label: "Active Exams", value: stats.exams, icon: Trophy, color: "bg-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950" },
    { label: "Upcoming Events", value: stats.events.length, icon: CalendarCheck, color: "bg-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(card => (
          <div key={card.label} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 shadow-sm">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color.replace("bg-", "text-")}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{card.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Upcoming Events</h3>
            <a href="/site/events" className="text-xs text-primary hover:underline">View all</a>
          </div>
          <div className="divide-y divide-border">
            {stats.events.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No upcoming events</p>
            ) : (
              stats.events.map((event: { id: number; title: string; start_date: string }) => (
                <div key={event.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
                    <CalendarCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(event.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
            {[
              { label: "Add Student", href: "/students/new", icon: GraduationCap },
              { label: "Take Attendance", href: "/attendance/students", icon: CalendarCheck },
              { label: "Enter Marks", href: "/marks", icon: BookOpen },
              { label: "Add Employee", href: "/hrm/employees/new", icon: UserCheck },
              { label: "View Reports", href: "/reports/student-list", icon: TrendingUp },
              { label: "Notifications", href: "/notifications", icon: Clock },
            ].map(action => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition group"
              >
                <action.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
