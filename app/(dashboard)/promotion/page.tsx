import { createClient } from "@/lib/supabase/server";

export default async function PromotionPage() {
  const supabase = await createClient();
  const { data: yearsRaw } = await supabase.from("academic_years").select("id, title").order("start_date", { ascending: false });
  const { data: classesRaw } = await supabase.from("i_classes").select("id, name").order("numeric_value");
  const years = (yearsRaw ?? []) as { id: number; title: string }[];
  const classes = (classesRaw ?? []) as { id: number; name: string }[];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Student Promotion</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Promote students to the next class/year</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <form className="space-y-5" action="/api/promotion" method="POST">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">From Academic Year</label>
            <select name="from_year_id" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select year</option>
              {(years ?? []).map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">To Academic Year</label>
            <select name="to_year_id" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select year</option>
              {(years ?? []).map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">From Class</label>
            <select name="from_class_id" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select class</option>
              {(classes ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">To Class</label>
            <select name="to_class_id" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select class</option>
              {(classes ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition">
            Promote Students
          </button>
        </form>
      </div>
    </div>
  );
}
