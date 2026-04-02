import { createClient } from "@/lib/supabase/server";
import { PublicShell } from "@/components/website/PublicShell";

type TimelineItem = { id: number; year: string; title: string; description: string | null };

export default async function TimelinePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("timeline_items")
    .select("id, year, title, description")
    .eq("status", 1)
    .order("order");

  const items = (data ?? []) as unknown as TimelineItem[];

  return (
    <PublicShell>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-foreground text-center mb-10">Our History</h1>
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground">No timeline entries yet.</p>
        ) : (
          <div className="border-l-2 border-border ml-3">
            {items.map(item => (
              <div key={item.id} className="relative pl-8 pb-10 last:pb-0">
                <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                <p className="text-sm font-bold text-primary">{item.year}</p>
                <h3 className="mt-1 font-semibold text-foreground">{item.title}</h3>
                {item.description && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
