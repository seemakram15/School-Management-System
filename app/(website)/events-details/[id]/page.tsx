import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

type EventRow = { id: number; title: string; description: string | null; start_date: string; end_date: string | null };

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("id, title, description, start_date, end_date")
    .eq("id", parseInt(id))
    .eq("status", 1)
    .maybeSingle();

  if (!data) notFound();
  const event = data as unknown as EventRow;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <p className="text-sm font-medium text-primary">
        {formatDate(event.start_date)}{event.end_date ? ` – ${formatDate(event.end_date)}` : ""}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-foreground">{event.title}</h1>
      {event.description && (
        <p className="mt-6 text-muted-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
      )}
    </section>
  );
}
