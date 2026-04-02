import { createClient } from "@/lib/supabase/server";
import { PublicShell } from "@/components/website/PublicShell";

type Faq = { id: number; question: string; answer: string };

export default async function FaqPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer")
    .eq("status", 1)
    .order("order");

  const faqs = (data ?? []) as unknown as Faq[];

  return (
    <PublicShell>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-foreground text-center mb-10">Frequently Asked Questions</h1>
        {faqs.length === 0 ? (
          <p className="text-center text-muted-foreground">No FAQs yet.</p>
        ) : (
          <div className="space-y-3">
            {faqs.map(f => (
              <details key={f.id} className="bg-card rounded-xl border border-border shadow-sm p-5 group">
                <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                  {f.question}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
