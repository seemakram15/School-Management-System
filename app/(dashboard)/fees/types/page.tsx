import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function FeeTypesPage() {
  const supabase = await createClient();
  const { data: types } = await supabase
    .from("fee_types")
    .select("id, name, description, status")
    .order("name");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fee Types</h2>
          <p className="text-sm text-muted-foreground">Manage fee categories (Tuition, Transport, etc.)</p>
        </div>
        <Link href="/fees/types/new"><Button size="sm">+ Add New</Button></Link>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["#", "Name", "Description", "Status", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(types ?? []).length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No fee types yet. Add one to get started.</td></tr>
            ) : (types ?? []).map((t: any, i: number) => (
              <tr key={t.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.description || "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={t.status === 1 ? "success" : "default"}>{t.status === 1 ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/fees/types/${t.id}/edit`} className="text-primary text-xs hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
