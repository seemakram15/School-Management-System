"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/DataTable";
import { Trash2 } from "lucide-react";

interface Subscriber {
  id: number;
  email: string;
  created_at: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/site/subscribe");
        setSubscribers(await res.json());
      } catch {
        toast.error("Failed to load subscribers");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const remove = async (id: number) => {
    if (!confirm("Remove this subscriber?")) return;
    try {
      const res = await fetch(`/api/site/subscribe/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setSubscribers(prev => prev.filter(s => s.id !== id));
      toast.success("Subscriber removed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Newsletter Subscribers</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{subscribers.length} total subscribers</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <DataTable
            data={subscribers}
            searchKeys={["email"]}
            columns={[
              { key: "email", label: "Email" },
              { key: "created_at", label: "Subscribed Date" },
            ]}
            rows={subscribers.map(s => ({
              email: s.email,
              created_at: new Date(s.created_at).toLocaleDateString(),
            }))}
            rowActions={subscribers.map(s => (
              <button key={s.id} onClick={() => remove(s.id)} className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-destructive" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ))}
          />
        )}
      </div>
    </div>
  );
}
