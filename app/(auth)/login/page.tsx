"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GraduationCap, Loader2, Eye, EyeOff, Mail, Lock, CheckCircle2, Users, BarChart3, BookOpen } from "lucide-react";

const features = [
  { icon: Users, text: "Manage students & staff effortlessly" },
  { icon: BarChart3, text: "Real-time attendance & grade tracking" },
  { icon: BookOpen, text: "Complete academic year management" },
];

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-12">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Schoolly</span>
        </Link>

        {/* Center content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Pakistan&apos;s smartest<br />school platform
            </h2>
            <p className="text-blue-200/70 mt-3 text-base leading-relaxed max-w-sm">
              Everything you need to run a modern school — from admissions to results, all in one place.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-300" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Stat chips */}
          <div className="flex gap-3 flex-wrap">
            {[["500+", "Schools"], ["50K+", "Students"], ["99.9%", "Uptime"]].map(([val, label]) => (
              <div key={label} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-white font-bold text-lg leading-none">{val}</p>
                <p className="text-slate-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <div className="relative border-t border-white/10 pt-6">
          <p className="text-slate-400 text-sm italic">&ldquo;Schoolly transformed how we manage our 1,200 students.&rdquo;</p>
          <p className="text-slate-500 text-xs mt-1.5">— Principal, Lahore Grammar School</p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Schoolly</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-1.5">Sign in to your school dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  required
                  placeholder="admin@yourschool.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : "Sign in to Dashboard"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-slate-400">New to Schoolly?</span>
            </div>
          </div>

          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
          >
            Create a school account
          </Link>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {["Secure Login", "Data Protected", "24/7 Support"].map(t => (
              <div key={t} className="flex items-center gap-1 text-xs text-slate-400">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                {t}
              </div>
            ))}
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">
            © {new Date().getFullYear()} Schoolly. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
