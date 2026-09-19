"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Clock, CheckCircle2, XCircle, GraduationCap, LogOut, RefreshCw } from "lucide-react";

export default function PendingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [adminNotes, setAdminNotes] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [school, setSchool] = useState<{ name: string } | null>(null);

  async function checkStatus() {
    setChecking(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: profileData } = await supabase
      .from("users")
      .select("school_id")
      .eq("id", user.id)
      .single();

    const profile = profileData as { school_id: string | null } | null;
    if (!profile?.school_id) { router.push("/plans"); return; }

    const [schoolRes, subRes] = await Promise.all([
      supabase.from("schools").select("name").eq("id", profile.school_id).single(),
      supabase.from("subscriptions").select("status, admin_notes").eq("school_id", profile.school_id).order("created_at", { ascending: false }).limit(1).single(),
    ]);

    const schoolData = schoolRes.data as { name: string } | null;
    const subData = subRes.data as { status: "pending" | "approved" | "rejected"; admin_notes: string | null } | null;
    setSchool(schoolData);
    setStatus(subData?.status ?? "pending");
    setAdminNotes(subData?.admin_notes ?? null);
    setChecking(false);

    if (subData?.status === "approved") {
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  }

  useEffect(() => { checkStatus(); }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="w-full max-w-lg text-center">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-12">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white">Schoolly</span>
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-10">
        {checking ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
            <p className="text-slate-400">Checking your status…</p>
          </div>
        ) : status === "approved" ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">You&apos;re approved! 🎉</h2>
            <p className="text-slate-400">
              <strong className="text-white">{school?.name}</strong> is now active.
              Redirecting you to the dashboard…
            </p>
            <div className="w-8 h-8 rounded-full border-4 border-green-500/30 border-t-green-500 animate-spin mt-2" />
          </div>
        ) : status === "rejected" ? (
          <div className="flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Payment not verified</h2>
            <p className="text-slate-400 leading-relaxed">
              We could not verify your payment for <strong className="text-white">{school?.name}</strong>.
            </p>
            {adminNotes && (
              <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-left">
                <strong>Note from our team:</strong> {adminNotes}
              </div>
            )}
            <p className="text-slate-500 text-sm">Please re-submit your payment or contact us at <a href="tel:03034063608" className="text-blue-400">0303-4063608</a></p>
            <Link
              href="/payment"
              className="mt-2 px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition-all active:scale-95"
            >
              Re-submit Payment
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-10 h-10 text-blue-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Application under review</h2>
            <p className="text-slate-400 leading-relaxed">
              Thank you! We received your payment for <strong className="text-white">{school?.name ?? "your school"}</strong>.
              Our team will verify it within <strong className="text-white">24 hours</strong> and activate your account.
            </p>

            <div className="w-full mt-2 space-y-3">
              {[
                { step: "Account created", done: true },
                { step: "Plan selected", done: true },
                { step: "Payment submitted", done: true },
                { step: "Payment verified", done: false },
                { step: "School activated", done: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-green-500" : "bg-white/10"}`}>
                    {s.done ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <span className="w-2 h-2 rounded-full bg-slate-600 block" />}
                  </div>
                  <span className={s.done ? "text-green-400" : "text-slate-500"}>{s.step}</span>
                </div>
              ))}
            </div>

            <p className="text-slate-500 text-xs mt-2">Questions? Call us: <a href="tel:03034063608" className="text-blue-400 font-medium">0303-4063608</a></p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={checkStatus}
          disabled={checking}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
          Check status
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
