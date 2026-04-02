"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export default function LeaveActions({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const setStatus = async (status: 1 | 2) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success(status === 1 ? "Leave approved" : "Leave rejected");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        disabled={loading}
        onClick={() => setStatus(1)}
        className="p-1.5 rounded-md hover:bg-green-100 dark:hover:bg-green-900 transition text-green-600 disabled:opacity-40"
        title="Approve"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={loading}
        onClick={() => setStatus(2)}
        className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition text-red-600 disabled:opacity-40"
        title="Reject"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
