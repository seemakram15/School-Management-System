"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function StudentStatusToggle({ id, initialStatus }: { id: number; initialStatus: boolean }) {
  const [active, setActive] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !active }),
      });
      if (!res.ok) throw new Error("Failed");
      setActive(a => !a);
      toast.success(`Student ${!active ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${active ? "bg-green-500" : "bg-red-400"} disabled:opacity-50`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${active ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );
}
