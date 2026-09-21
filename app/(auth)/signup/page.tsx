"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  GraduationCap, Loader2, Eye, EyeOff,
  Building2, User, Mail, Phone, Lock,
  ShieldCheck, Zap, HeadphonesIcon,
} from "lucide-react";

const perks = [
  { icon: ShieldCheck, title: "Free 14-day trial", desc: "No payment until approved" },
  { icon: Zap,         title: "Live in minutes",   desc: "School ready instantly"   },
  { icon: HeadphonesIcon, title: "Expert support", desc: "WhatsApp & call support"  },
];

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({ schoolName: "", ownerName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setStep("Creating your account…");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: form.schoolName,
          ownerName: form.ownerName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStep("Signing you in…");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        setError("Account created! Please sign in.");
        router.push("/login");
        return;
      }

      setStep("Almost there…");
      router.push("/plans");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Schoolly</span>
        </Link>

        {/* Hero text */}
        <div className="relative space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-blue-200 text-xs font-medium">Trusted by 500+ schools in Pakistan</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Start managing<br />your school today
            </h2>
            <p className="text-blue-200/70 mt-3 text-base leading-relaxed">
              Join hundreds of schools already using Schoolly to simplify administration and improve outcomes.
            </p>
          </div>

          {/* Perk cards */}
          <div className="space-y-3">
            {perks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative">
          <p className="text-slate-500 text-xs">By creating an account you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Schoolly</span>
          </div>

          <div className="mb-7">
            <h1 className="text-3xl font-extrabold text-slate-900">Create your school</h1>
            <p className="text-slate-500 mt-1.5 text-sm">Fill in the details below to get started</p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* School Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">School Name</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.schoolName}
                  onChange={e => set("schoolName", e.target.value)}
                  required
                  placeholder="Al-Noor Public School"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            {/* Two-col row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={form.ownerName}
                    onChange={e => set("ownerName", e.target.value)}
                    required
                    placeholder="Muhammad Ali"
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Phone <span className="text-slate-400 font-normal text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  required
                  placeholder="admin@yourschool.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                    required
                    placeholder="8+ characters"
                    className="w-full pl-9 pr-9 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={e => set("confirmPassword", e.target.value)}
                    required
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Password strength hint */}
            {form.password.length > 0 && (
              <div className="flex gap-1.5">
                {[1,2,3,4].map(i => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      form.password.length >= i * 3
                        ? i <= 2 ? "bg-red-400" : i === 3 ? "bg-yellow-400" : "bg-green-500"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
                <span className="text-xs text-slate-400 ml-1">
                  {form.password.length < 6 ? "Weak" : form.password.length < 9 ? "Fair" : form.password.length < 12 ? "Good" : "Strong"}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 mt-1"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {step || "Please wait…"}</>
              ) : (
                "Create My School Account →"
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign in
            </Link>
          </p>

          <p className="text-center text-slate-400 text-xs mt-4">
            © {new Date().getFullYear()} Schoolly · Pakistan
          </p>
        </div>
      </div>
    </div>
  );
}
