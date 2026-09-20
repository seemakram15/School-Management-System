import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FeeStructuresPage() {
  const supabase = await createClient();
  const { data: structures } = await supabase
    .from("fee_structures")
    .select("id, amount, frequency, due_day, fee_types(name), i_classes(name), academic_years(title)")
    .order("id");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fee Structures</h2>
          <p className="text-sm text-muted-foreground">Define fee amounts per class and academic year</p>
        </div>
        <Link href="/fees/structures/new"><Button size="sm">+ Add New</Button></Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["Fee Type", "Class", "Academic Year", "Amount (PKR)", "Frequency", "Due Day", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(structures ?? []).length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No structures defined yet</td></tr>
            ) : (structures ?? []).map((s: any) => (
              <tr key={s.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{s.fee_types?.name}</td>
                <td className="px-4 py-3">{s.i_classes?.name}</td>
                <td className="px-4 py-3">{s.academic_years?.title}</td>
                <td className="px-4 py-3 font-mono">PKR {Number(s.amount).toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{s.frequency?.replace("_", " ")}</td>
                <td className="px-4 py-3">{s.due_day}th</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/fees/structures/${s.id}/edit`} className="text-primary text-xs hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
