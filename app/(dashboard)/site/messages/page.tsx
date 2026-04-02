"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Trash2, MailCheck } from "lucide-react";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site/contact");
      setMessages(await res.json());
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    try {
      const res = await fetch(`/api/site/contact/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to update");
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/site/contact/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success("Message deleted");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Contact Messages</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{messages.length} total messages</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <DataTable
            data={messages}
            searchKeys={["name", "email", "subject"]}
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "subject", label: "Subject" },
              { key: "message", label: "Message" },
              { key: "created_at", label: "Date" },
              { key: "is_read", label: "Status" },
            ]}
            rows={messages.map(m => ({
              name: m.name,
              email: m.email,
              subject: m.subject || "-",
              message: m.message.length > 60 ? m.message.slice(0, 60) + "…" : m.message,
              created_at: new Date(m.created_at).toLocaleDateString(),
              is_read: <Badge variant={m.is_read ? "default" : "info"}>{m.is_read ? "Read" : "Unread"}</Badge>,
            }))}
            rowActions={messages.map(m => (
              <div key={m.id} className="flex justify-end gap-1">
                {!m.is_read && (
                  <button onClick={() => markRead(m.id)} className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-foreground" title="Mark Read">
                    <MailCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => remove(m.id)} className="p-1.5 rounded-md hover:bg-muted transition text-muted-foreground hover:text-destructive" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          />
        )}
      </div>
    </div>
  );
}
