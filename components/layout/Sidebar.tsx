"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  CalendarCheck, Briefcase, UserCheck, FileText, Settings, ChevronDown,
  School, Trophy, BarChart3, Bell, LogOut, Shield, Building2,
} from "lucide-react";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
};

const nav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  {
    label: "Administration",
    icon: <Shield className="w-4 h-4" />,
    children: [
      { label: "Academic Years", href: "/academic-years" },
      { label: "Users", href: "/users" },
      { label: "Roles", href: "/roles" },
    ],
  },
  {
    label: "Academic",
    icon: <School className="w-4 h-4" />,
    children: [
      { label: "Classes", href: "/academic/classes" },
      { label: "Sections", href: "/academic/sections" },
      { label: "Subjects", href: "/academic/subjects" },
    ],
  },
  { label: "Students", href: "/students", icon: <GraduationCap className="w-4 h-4" /> },
  { label: "Teachers", href: "/teachers", icon: <Users className="w-4 h-4" /> },
  {
    label: "Attendance",
    icon: <CalendarCheck className="w-4 h-4" />,
    children: [
      { label: "Student Attendance", href: "/attendance/students" },
      { label: "Employee Attendance", href: "/attendance/employees" },
    ],
  },
  {
    label: "Exams",
    icon: <Trophy className="w-4 h-4" />,
    children: [
      { label: "Exam List", href: "/exams" },
      { label: "Grade Setup", href: "/exams/grades" },
      { label: "Exam Rules", href: "/exams/rules" },
    ],
  },
  {
    label: "Marks & Results",
    icon: <BookOpen className="w-4 h-4" />,
    children: [
      { label: "Enter Marks", href: "/marks" },
      { label: "Results", href: "/results" },
      { label: "Promotion", href: "/promotion" },
    ],
  },
  {
    label: "HRM",
    icon: <Briefcase className="w-4 h-4" />,
    children: [
      { label: "Employees", href: "/hrm/employees" },
      { label: "Leave Requests", href: "/hrm/leaves" },
    ],
  },
  {
    label: "Reports",
    icon: <BarChart3 className="w-4 h-4" />,
    children: [
      { label: "Student List", href: "/reports/student-list" },
      { label: "Student Attendance", href: "/reports/student-attendance" },
      { label: "Employee List", href: "/reports/employee-list" },
      { label: "Employee Attendance", href: "/reports/employee-attendance" },
    ],
  },
  {
    label: "Website",
    icon: <Building2 className="w-4 h-4" />,
    children: [
      { label: "Sliders", href: "/site/sliders" },
      { label: "Events", href: "/site/events" },
      { label: "Testimonials", href: "/site/testimonials" },
      { label: "Class Profiles", href: "/site/classes" },
    ],
  },
  { label: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  function toggle(label: string) {
    setOpenMenus(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  function isGroupActive(children: { href: string }[]) {
    return children.some(c => isActive(c.href));
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[hsl(var(--sidebar-border))]">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">CloudSchool</p>
          <p className="text-xs text-white/50 leading-tight">Management System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-3 px-2">
        {nav.map(item => (
          <div key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5",
                  isActive(item.href)
                    ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggle(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5",
                    item.children && isGroupActive(item.children)
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform",
                      openMenus.includes(item.label) || (item.children && isGroupActive(item.children)) ? "rotate-180" : ""
                    )}
                  />
                </button>
                {(openMenus.includes(item.label) || (item.children && isGroupActive(item.children))) && item.children && (
                  <div className="ml-4 mb-1 border-l border-white/10 pl-3 space-y-0.5">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-2 py-2 rounded-md text-xs font-medium transition-colors",
                          isActive(child.href)
                            ? "bg-[hsl(var(--sidebar-accent))] text-white"
                            : "text-white/60 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[hsl(var(--sidebar-border))] px-4 py-3">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
