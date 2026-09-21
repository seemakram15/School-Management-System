"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  CalendarCheck, Briefcase, UserCheck, FileText, Settings, ChevronDown,
  School, Trophy, BarChart3, Bell, LogOut, Shield, Building2, DollarSign, X,
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
    label: "Fees",
    icon: <DollarSign className="w-4 h-4" />,
    children: [
      { label: "Fee Dashboard", href: "/fees" },
      { label: "Fee Types", href: "/fees/types" },
      { label: "Fee Structures", href: "/fees/structures" },
      { label: "Invoices", href: "/fees/invoices" },
      { label: "Collect Fee", href: "/fees/collect" },
      { label: "Generate Invoices", href: "/fees/invoices/generate" },
      { label: "Reports", href: "/fees/reports" },
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
      { label: "About Content", href: "/site/about" },
      { label: "Services", href: "/site/services" },
      { label: "Statistics", href: "/site/statistics" },
      { label: "Gallery", href: "/site/gallery" },
      { label: "FAQs", href: "/site/faq" },
      { label: "Timeline", href: "/site/timeline" },
      { label: "Messages", href: "/site/messages" },
      { label: "Subscribers", href: "/site/subscribers" },
      { label: "Site Settings", href: "/site/settings" },
    ],
  },
  { label: "Settings", href: "/settings", icon: <Settings className="w-4 h-4" /> },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
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

  const isOpen = (label: string, children?: { href: string }[]) =>
    openMenus.includes(label) || (children ? isGroupActive(children) : false);

  return (
    <aside
      className="flex flex-col w-64 h-full min-h-screen shrink-0 text-[hsl(var(--sidebar-foreground))]"
      style={{ background: "var(--gradient-sidebar)" }}
    >
      {/* Brand */}
      <div className="flex items-center border-b border-white/8">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 flex-1 px-5 py-5 hover:bg-white/5 transition-colors group"
        >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-primary)" }}
        >
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight text-white">Schoolly</p>
          <p className="text-[11px] text-white/40 leading-tight mt-0.5">Management System</p>
        </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 mr-3 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-4 px-3 space-y-0.5">
        {nav.map(item => (
          <div key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "text-white shadow-lg"
                    : "text-white/60 hover:bg-white/8 hover:text-white/90"
                )}
                style={isActive(item.href) ? { background: "var(--gradient-primary)", boxShadow: "0 2px 12px rgba(37,99,235,.4)" } : undefined}
              >
                <span className={cn("shrink-0 transition-transform duration-200", isActive(item.href) ? "scale-110" : "")}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ) : (
              <>
                <button
                  onClick={() => toggle(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    item.children && isGroupActive(item.children)
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/8 hover:text-white/90"
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-300 text-white/40",
                      isOpen(item.label, item.children) ? "rotate-180 text-white/70" : ""
                    )}
                  />
                </button>

                {isOpen(item.label, item.children) && item.children && (
                  <div className="submenu-enter ml-3 mt-0.5 mb-1 border-l-2 border-white/10 pl-3 space-y-0.5">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                          isActive(child.href)
                            ? "text-white"
                            : "text-white/50 hover:bg-white/8 hover:text-white/85"
                        )}
                        style={isActive(child.href) ? { background: "linear-gradient(90deg,rgba(37,99,235,.25),rgba(79,70,229,.15))", borderLeft: "2px solid #3b82f6" } : undefined}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200",
                          isActive(child.href) ? "bg-blue-400 shadow-sm shadow-blue-400/50" : "bg-white/20"
                        )} />
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
      <div className="border-t border-white/8 px-3 py-3">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:bg-red-500/15 hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
