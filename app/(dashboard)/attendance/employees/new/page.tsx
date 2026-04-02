"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Employee { id: number; name: string; id_card: string | null; }

export default function EmployeeAttendanceNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState(searchParams.get("date") || new Date().toISOString().split("T")[0]);
  const [present, setPresent] = useState<Record<number, boolean>>({});
  const [step, setStep] = useState<"filter" | "entry">(searchParams.get("date") ? "entry" : "filter");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees?status=1");
      const data: Employee[] = await res.json();

      // Check existing attendance
      const existing = await fetch(`/api/attendance/employees?date=${date}`).then(r => r.json()) as Array<{ employee_id: number; attendance: number }>;
      const existingMap: Record<number, boolean> = {};
      existing.forEach(a => { existingMap[a.employee_id] = a.attendance === 1; });

      setEmployees(data);
      setPresent(existingMap);
      setStep("entry");
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === "entry" && employees.length === 0) fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAll = (val: boolean) => {
    const all: Record<number, boolean> = {};
    employees.forEach(e => { all[e.id] = val; });
    setPresent(all);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/attendance/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendance_date: date,
          employeeIds: employees.map(e => e.id),
          present,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Attendance saved for ${data.count} employees`);
      router.push("/attendance/employees");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error saving attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Employee Attendance</h2>
          <p className="text-sm text-muted-foreground">Add New Attendance</p>
        </div>
        <nav className="text-sm text-muted-foreground flex gap-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/attendance/employees" className="hover:text-foreground">Employee Attendance</Link>
          <span>/</span>
          <span className="text-foreground">Add</span>
        </nav>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
        {step === "filter" && (
          <>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Attendance Date</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <FormField label="Date *" className="w-44">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" required />
              </FormField>
              <Button type="button" onClick={fetchEmployees} disabled={loading}>
                {loading ? "Loading..." : "Entry Attendance"}
              </Button>
            </div>
          </>
        )}

        {step === "entry" && employees.length > 0 && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-center space-y-0.5">
              <p className="text-blue-800 dark:text-blue-200 font-semibold">Attendance Entry for {date}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 border-b border-border w-12">#</th>
                    <th className="text-left p-3 border-b border-border">Name</th>
                    <th className="text-left p-3 border-b border-border w-24">ID Card</th>
                    <th className="p-3 border-b border-border w-40">
                      <div className="flex items-center gap-2">
                        Is Present?
                        <label className="flex items-center gap-1 text-xs font-normal cursor-pointer">
                          <input type="checkbox" className="accent-primary" onChange={e => toggleAll(e.target.checked)} />
                          All
                        </label>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e, i) => (
                    <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 border-b border-border text-muted-foreground">{i + 1}</td>
                      <td className="p-3 border-b border-border font-medium">{e.name}</td>
                      <td className="p-3 border-b border-border text-muted-foreground">{e.id_card ?? "-"}</td>
                      <td className="p-3 border-b border-border">
                        <input
                          type="checkbox"
                          className="accent-primary w-4 h-4"
                          checked={present[e.id] ?? false}
                          onChange={ev => setPresent(p => ({ ...p, [e.id]: ev.target.checked }))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => { setStep("filter"); setEmployees([]); }}>Back</Button>
              <Button type="button" onClick={handleSubmit} disabled={submitting} className="ml-auto">
                {submitting ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
