"use client";
import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

interface Subject { name: string; code: string; type: string; }
interface Attendance { attendance_date: string; attendance: number; }
interface MarkResult { exam: string; subject: string; total_marks: number; is_absent: boolean; }

const STATUS_LABEL: Record<number, string> = { 1: "Present", 0: "Absent", 2: "Late" };
const STATUS_COLOR: Record<number, string> = { 1: "text-green-600 dark:text-green-400", 0: "text-red-500", 2: "text-yellow-500" };

export default function StudentTabs({ registrationId, children }: { registrationId: number; children: React.ReactNode }) {
  const [tab, setTab] = useState<"profile" | "subjects" | "attendance" | "marks">("profile");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [marks, setMarks] = useState<MarkResult[]>([]);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(["profile"]));

  const loadTab = async (t: "subjects" | "attendance" | "marks") => {
    if (loadedTabs.has(t)) return;
    try {
      if (t === "subjects") {
        const res = await fetch(`/api/students/${registrationId}/subjects`);
        const d = await res.json();
        setSubjects(Array.isArray(d) ? d : []);
      } else if (t === "attendance") {
        const res = await fetch(`/api/students/${registrationId}/attendance`);
        const d = await res.json();
        setAttendance(Array.isArray(d) ? d : []);
      } else if (t === "marks") {
        const res = await fetch(`/api/students/${registrationId}/marks`);
        const d = await res.json();
        setMarks(Array.isArray(d) ? d : []);
      }
      setLoadedTabs(s => new Set([...s, t]));
    } catch { /* ignore */ }
  };

  const switchTab = (t: typeof tab) => {
    setTab(t);
    if (t !== "profile") loadTab(t);
  };

  const tabClass = (t: typeof tab) =>
    `px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="flex border-b border-border overflow-x-auto">
        <button className={tabClass("profile")} onClick={() => switchTab("profile")}>Profile</button>
        <button className={tabClass("subjects")} onClick={() => switchTab("subjects")}>Subjects</button>
        <button className={tabClass("attendance")} onClick={() => switchTab("attendance")}>Attendance</button>
        <button className={tabClass("marks")} onClick={() => switchTab("marks")}>Marks & Result</button>
      </div>

      <div className="p-5">
        {tab === "profile" && children}

        {tab === "subjects" && (
          <div>
            {!loadedTabs.has("subjects") ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : subjects.length === 0 ? (
              <p className="text-muted-foreground text-sm">No subjects assigned.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 border-b border-border">Name</th>
                    <th className="text-left p-2 border-b border-border">Code</th>
                    <th className="text-left p-2 border-b border-border">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/20">
                      <td className="p-2">{s.name}</td>
                      <td className="p-2 font-mono text-xs">{s.code}</td>
                      <td className="p-2 capitalize">{s.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "attendance" && (
          <div>
            {!loadedTabs.has("attendance") ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : attendance.length === 0 ? (
              <p className="text-muted-foreground text-sm">No attendance records.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 border-b border-border">Date</th>
                    <th className="text-left p-2 border-b border-border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/20">
                      <td className="p-2">{formatDate(a.attendance_date)}</td>
                      <td className={`p-2 font-medium ${STATUS_COLOR[a.attendance] ?? ""}`}>
                        {STATUS_LABEL[a.attendance] ?? a.attendance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "marks" && (
          <div>
            {!loadedTabs.has("marks") ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : marks.length === 0 ? (
              <p className="text-muted-foreground text-sm">No marks records.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 border-b border-border">Exam</th>
                    <th className="text-left p-2 border-b border-border">Subject</th>
                    <th className="text-left p-2 border-b border-border">Total Marks</th>
                    <th className="text-left p-2 border-b border-border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.map((m, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/20">
                      <td className="p-2">{m.exam}</td>
                      <td className="p-2">{m.subject}</td>
                      <td className="p-2 font-semibold">{m.is_absent ? "—" : m.total_marks}</td>
                      <td className={`p-2 ${m.is_absent ? "text-red-500" : "text-green-600 dark:text-green-400"}`}>
                        {m.is_absent ? "Absent" : "Present"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
