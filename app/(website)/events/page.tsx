import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

type EventRow = { id: number; title: string; description: string | null; start_date: string; end_date: string | null };

export default async function EventsListPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, description, start_date, end_date")
    .eq("status", 1)
    .order("start_date", { ascending: false });

  const events = (data ?? []) as unknown as EventRow[];

  return (
    <>
      <section className="bg-[hsl(var(--sidebar))] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">Events</h1>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto">Stay up to date with what&apos;s happening at our school.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {events.length === 0 ? (
          <p className="text-center text-muted-foreground">No events scheduled right now.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {events.map(e => (
              <Link key={e.id} href={`/events-details/${e.id}`} className="bg-card rounded-xl border border-border shadow-sm p-5 hover:shadow-md transition">
                <p className="text-xs font-medium text-primary">
                  {formatDate(e.start_date)}{e.end_date ? ` – ${formatDate(e.end_date)}` : ""}
                </p>
                <h3 className="mt-1 font-semibold text-foreground">{e.title}</h3>
                {e.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{e.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
