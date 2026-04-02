"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Input, Select, Textarea, FormField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Employee { id: number; name: string; id_card: string; }

const LEAVE_TYPES = ["Sick Leave", "Casual Leave", "Earned Leave", "Maternity Leave", "Other"];

function daysBetween(from: string, to: string) {
  if (!from || !to) return 0;
  const f = new Date(from);
  const t = new Date(to);
  const diff = Math.round((t.getTime() - f.getTime()) / 86400000) + 1;
  return diff > 0 ? diff : 0;
}

export default function LeaveNewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({ employee_id: "", from_date: "", to_date: "", leave_type: "", reason: "" });

  useEffect(() => {
    fetch("/api/employees").then(r => r.json()).then(d => setEmployees(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const totalDays = daysBetween(form.from_date, form.to_date);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalDays <= 0) {
      toast.error("To Date must be on or after From Date");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: parseInt(form.employee_id),
          apply_date: new Date().toISOString().slice(0, 10),
          from_date: form.from_date,
          to_date: form.to_date,
          total_days: totalDays,
          leave_type: form.leave_type || null,
          reason: form.reason || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Leave request submitted");
      router.push("/hrm/leaves");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Leave</h2>
          <p className="text-sm text-muted-foreground">Apply for Leave</p>
        </div>
        <nav className="text-sm text-muted-foreground flex gap-1">
          <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href="/hrm/leaves" className="hover:text-foreground">Leaves</Link>
          <span>/</span>
          <span className="text-foreground">Apply</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4">
          <h3 className="text-base font-semibold text-primary border-b border-border pb-2">Leave Request</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Employee *">
              <Select value={form.employee_id} onChange={set("employee_id")} required>
                <option value="">Pick an employee...</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id_card})</option>)}
              </Select>
            </FormField>
            <FormField label="Leave Type">
              <Select value={form.leave_type} onChange={set("leave_type")}>
                <option value="">Select type...</option>
                {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="From Date *">
              <Input type="date" value={form.from_date} onChange={set("from_date")} required />
            </FormField>
            <FormField label="To Date *">
              <Input type="date" value={form.to_date} onChange={set("to_date")} required />
            </FormField>
          </div>
          {totalDays > 0 && <p className="text-sm text-muted-foreground">Total: {totalDays} day{totalDays > 1 ? "s" : ""}</p>}
          <FormField label="Reason">
            <Textarea value={form.reason} onChange={set("reason")} rows={3} maxLength={500} />
          </FormField>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/hrm/leaves"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading} className="ml-auto">
            {loading ? "Submitting..." : "Apply for Leave"}
          </Button>
        </div>
      </form>
    </div>
  );
}
