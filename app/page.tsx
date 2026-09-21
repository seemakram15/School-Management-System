import Link from "next/link";
import {
  GraduationCap, Users, BookOpen, CalendarCheck, BarChart3,
  CheckCircle2, ArrowRight, Shield, Zap, HeartHandshake,
  Phone, Mail, Building2, ChevronDown, Sparkles, TrendingUp, Award
} from "lucide-react";

const PLANS = [
  {
    name: "Basic",
    price: "2,000",
    period: "/month",
    tagline: "Perfect for small schools",
    max: "Up to 200 students",
    gradient: "from-slate-800 to-slate-900",
    border: "border-slate-700/50",
    badge: null,
    badgeBg: "",
    cta: "Get Started",
    ctaStyle: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
    features: ["Up to 200 students","Attendance tracking","Marks & exam management","Student profiles","Basic reports","Email support"],
  },
  {
    name: "Standard",
    price: "4,000",
    period: "/month",
    tagline: "Most popular choice",
    max: "Up to 500 students",
    gradient: "from-blue-600 to-violet-700",
    border: "border-blue-400/30",
    badge: "Most Popular",
    badgeBg: "bg-white text-blue-600",
    cta: "Get Started",
    ctaStyle: "bg-white text-blue-600 hover:bg-blue-50 font-bold",
    features: ["Up to 500 students","Everything in Basic","HRM & employee management","Leave management","Advanced reports","School public website","Priority email support"],
  },
  {
    name: "Premium",
    price: "8,000",
    period: "/month",
    tagline: "For large institutions",
    max: "Unlimited students",
    gradient: "from-violet-600 to-purple-800",
    border: "border-violet-400/30",
    badge: "Best Value",
    badgeBg: "bg-white text-violet-600",
    cta: "Get Started",
    ctaStyle: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
    features: ["Unlimited students","Everything in Standard","Custom branding","Dedicated account manager","Early feature access","Phone & WhatsApp support"],
  },
];

const FEATURES = [
  { icon: Users,        title: "Student Management",   desc: "Complete profiles, admissions, class assignments and full academic history.",          from: "from-blue-500",   to: "to-cyan-500"   },
  { icon: CalendarCheck,title: "Attendance Tracking",  desc: "Daily attendance for students and staff with instant reports and notifications.",       from: "from-green-500",  to: "to-emerald-500"},
  { icon: BookOpen,     title: "Exams & Marks",        desc: "Set exam rules, record marks, generate result cards and grade reports automatically.",  from: "from-orange-500", to: "to-amber-500"  },
  { icon: BarChart3,    title: "Reports & Analytics",  desc: "Comprehensive dashboards on attendance, performance, and fee collection.",              from: "from-violet-500", to: "to-purple-500" },
  { icon: HeartHandshake,title: "HRM Module",          desc: "Manage employees, shifts, leaves, payroll and designations effortlessly.",             from: "from-rose-500",   to: "to-pink-500"   },
  { icon: Shield,       title: "Role-Based Access",    desc: "Granular permissions — admins, teachers, and staff see only what they need.",           from: "from-teal-500",   to: "to-cyan-600"   },
];

const FAQS = [
  {
    q: "How long does it take to activate my school after payment?",
    a: "Our team manually verifies every payment. Once you submit your transaction ID and screenshot, we activate your school within 24 hours — usually much faster during business hours.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept JazzCash (0303-4063608) and Meezan Bank transfer (Account: 02720104818375, IBAN: PK92MEZN0002720104818375). After sending the payment, upload the screenshot in your portal — that's all you need to do.",
  },
  {
    q: "Can I add multiple admins and teachers for my school?",
    a: "Yes. Once your school is activated you can create unlimited staff accounts — admins, teachers, accountants — each with role-based permissions so people only see what they need.",
  },
  {
    q: "How is my school's data kept private from other schools?",
    a: "Every school's data is fully isolated at the database level using row-level security. No one else — not even us — can accidentally read another school's students, marks, or records.",
  },
  {
    q: "Can teachers mark attendance from a mobile device?",
    a: "Yes. Schoolly is fully responsive and works on any smartphone browser. Teachers can mark student attendance, view timetables, and enter marks without installing an app.",
  },
  {
    q: "How do I generate result cards and progress reports?",
    a: "Go to Exams → Results in your dashboard. After entering marks you can generate printable result cards per student or per class, and download attendance and performance reports in seconds.",
  },
  {
    q: "What happens if I forget my password?",
    a: "Use the 'Forgot password' link on the login page. We'll send a secure reset link to your registered email. If you have trouble, call us on 0303-4063608 and we'll sort it out.",
  },
  {
    q: "Can I upgrade or downgrade my plan later?",
    a: "Yes. Contact us any time and we'll adjust your plan. Upgrades take effect immediately; downgrades apply at the start of your next billing month.",
  },
  {
    q: "Is there a free trial before I pay?",
    a: "We offer a live demo at schoolly.pk/s/preview so you can explore every feature before signing up. If you have questions after the demo, call us and we'll walk you through it personally.",
  },
  {
    q: "What if I face a technical problem after activation?",
    a: "Reach us via WhatsApp or call 0303-4063608 any day 9 am – 9 pm PKT. Premium plan users also get dedicated account manager support. We resolve most issues within a few hours.",
  },
];


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes aurora1 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(60px,-40px) scale(1.15); }
          66%       { transform: translate(-30px,50px) scale(0.9); }
        }
        @keyframes aurora2 {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(-80px,30px) scale(1.2); }
          66%       { transform: translate(40px,-60px) scale(0.85); }
        }
        @keyframes aurora3 {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(50px,40px) scale(1.1); }
        }
        @keyframes aurora4 {
          0%, 100% { transform: translate(0,0) scale(1); }
          40%       { transform: translate(-50px,-30px) scale(1.25); }
          80%       { transform: translate(30px,60px) scale(0.9); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .aurora1 { animation: aurora1 12s ease-in-out infinite; }
        .aurora2 { animation: aurora2 10s ease-in-out infinite; }
        .aurora3 { animation: aurora3 14s ease-in-out infinite; }
        .aurora4 { animation: aurora4  9s ease-in-out infinite; }
        .float   { animation: float 6s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6, #60a5fa);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora1,.aurora2,.aurora3,.aurora4,.float,.shimmer-text { animation: none !important; }
        }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Schoolly</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq"      className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-blue-900/30">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
        {/* Aurora mesh background */}
        <div className="absolute inset-0 bg-slate-950">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

          {/* Aurora blobs */}
          <div className="aurora1 absolute top-[-20%] left-[10%]  w-[600px] h-[600px] rounded-full bg-blue-600/25   blur-[120px]" />
          <div className="aurora2 absolute top-[20%]  right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/20  blur-[100px]" />
          <div className="aurora3 absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-cyan-500/15    blur-[90px]"  />
          <div className="aurora4 absolute top-[50%]  left-[-5%] w-[450px] h-[450px] rounded-full bg-pink-600/15    blur-[110px]" />
          <div className="aurora1 absolute bottom-[-10%] right-[20%] w-[350px] h-[350px] rounded-full bg-indigo-500/20 blur-[80px]" style={{ animationDelay: "-5s" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium text-blue-300 mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Pakistan&apos;s #1 School Management Platform
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight max-w-4xl mx-auto">
            Run your school{" "}
            <span className="shimmer-text">smarter,</span>
            <br />not harder
          </h1>

          <p className="mt-7 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Schoolly gives every school — big or small — a powerful management system.
            Students, teachers, exams, attendance, and reports all in one place.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/s/preview" target="_blank" rel="noopener noreferrer" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-bold shadow-2xl shadow-orange-900/40 hover:shadow-orange-900/60 hover:scale-[1.02] active:scale-95 transition-all">
              View Live Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#pricing" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/15 text-white/80 text-lg font-semibold hover:bg-white/5 hover:border-white/25 active:scale-95 transition-all backdrop-blur-sm">
              View Pricing
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm text-slate-400">
            {[{ icon: CheckCircle2, text: "No setup fee" }, { icon: CheckCircle2, text: "Activate within 24 hrs" }, { icon: CheckCircle2, text: "Full data isolation" }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-green-400" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Floating dashboard mockup */}
          <div className="float relative mt-16 max-w-4xl mx-auto">
            {/* Glow ring */}
            <div className="absolute inset-x-8 -bottom-6 h-20 bg-blue-500/20 blur-2xl rounded-full" />
            <div className="relative rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden bg-slate-900/80 backdrop-blur-md">
              {/* Browser bar */}
              <div className="bg-slate-800/80 border-b border-white/5 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4 bg-slate-700/60 border border-white/5 rounded-md h-6 flex items-center px-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-2" />
                  <span className="text-xs text-slate-400">app.schoolly.pk/dashboard</span>
                </div>
              </div>
              {/* Mock dashboard UI */}
              <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800/90">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  {[
                    { label: "Total Students", val: "348", color: "text-blue-400",   bg: "from-blue-500/20 to-cyan-500/10",   border: "border-blue-500/20"   },
                    { label: "Teachers",        val: "24",  color: "text-green-400",  bg: "from-green-500/20 to-emerald-500/10",border: "border-green-500/20"  },
                    { label: "Active Exams",    val: "6",   color: "text-orange-400", bg: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/20" },
                    { label: "Attendance Today",val: "94%", color: "text-violet-400", bg: "from-violet-500/20 to-purple-500/10",border: "border-violet-500/20" },
                  ].map(c => (
                    <div key={c.label} className={`bg-gradient-to-br ${c.bg} rounded-xl border ${c.border} p-4`}>
                      <p className="text-xs text-slate-500 mb-1">{c.label}</p>
                      <p className={`text-2xl font-bold ${c.color}`}>{c.val}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 bg-slate-800/60 border border-white/5 rounded-xl p-4 h-28 flex items-center">
                    <div className="w-full space-y-2">
                      {[{ label: "Class 10A", w: 92, color: "bg-blue-500" }, { label: "Class 9B", w: 78, color: "bg-violet-500" }, { label: "Class 8A", w: 85, color: "bg-cyan-500" }, { label: "Class 7C", w: 65, color: "bg-orange-500" }].map(r => (
                        <div key={r.label} className="flex items-center gap-2">
                          <div className="text-xs text-slate-500 w-14 shrink-0">{r.label}</div>
                          <div className="flex-1 bg-slate-700/60 rounded-full h-1.5">
                            <div className={`${r.color} h-1.5 rounded-full`} style={{ width: `${r.w}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 w-7 text-right">{r.w}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-800/60 border border-white/5 rounded-xl p-4 h-28 flex flex-col gap-2.5 justify-center">
                    {["Ali Hassan — A+", "Sara Ahmed — A", "Zara Khan — A-"].map(s => (
                      <div key={s} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{s[0]}</div>
                        <span className="text-xs text-slate-400 truncate">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS TICKER ─── */}
      <section className="py-16 border-y border-white/5 bg-slate-900/50 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { val: "500+",    label: "Schools Registered",  icon: Building2,   color: "text-blue-400"   },
              { val: "50,000+", label: "Students Managed",    icon: Users,       color: "text-green-400"  },
              { val: "99.9%",   label: "Uptime Guarantee",    icon: TrendingUp,  color: "text-violet-400" },
              { val: "24 hrs",  label: "Activation Time",     icon: Award,       color: "text-orange-400" },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${s.color} mb-1`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className={`text-3xl sm:text-4xl font-extrabold ${s.color}`}>{s.val}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-28 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Powerful Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white">Everything your school needs</h2>
          <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">One platform to manage every aspect of your school — students, staff, exams, and more.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="group relative bg-slate-900 border border-white/8 rounded-2xl p-7 hover:border-white/15 hover:-translate-y-1 transition-all overflow-hidden">
              {/* Card glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.from} ${f.to} opacity-0 group-hover:opacity-[0.05] transition-opacity rounded-2xl`} />
              <div className={`relative w-13 h-13 w-12 h-12 rounded-xl bg-gradient-to-br ${f.from} ${f.to} flex items-center justify-center mb-5 shadow-lg`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="relative font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="relative text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Simple Pricing
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white">Choose your plan</h2>
            <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">Pay monthly. No hidden fees, no contracts. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map(plan => (
              <div key={plan.name} className={`relative bg-gradient-to-br ${plan.gradient} rounded-2xl border ${plan.border} shadow-xl flex flex-col p-8 ${plan.badge === "Most Popular" ? "ring-2 ring-blue-400/40 scale-[1.03]" : ""}`}>
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold shadow-lg ${plan.badgeBg}`}>
                    {plan.badge}
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-white/60 mt-1">{plan.tagline}</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">Rs. {plan.price}</span>
                    <span className="text-white/50 text-sm">{plan.period}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-white/70">{plan.max}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all active:scale-95 cursor-pointer ${plan.ctaStyle}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-white">Frequently asked questions</h2>
          <p className="mt-3 text-slate-400">Everything you need to know before getting started.</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <details key={i} className="group bg-slate-900 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-colors">
              <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-semibold text-white hover:bg-white/3 transition-colors list-none">
                {faq.q}
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-4" />
              </summary>
              <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-20 mx-4 sm:mx-6 lg:mx-auto max-w-5xl mb-16">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Aurora background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-700 to-purple-800">
            <div className="aurora2 absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
            <div className="aurora3 absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-cyan-400/20 blur-2xl" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

          <div className="relative px-8 sm:px-16 py-16 text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Join 500+ schools across Pakistan
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Ready to modernise your school?
            </h2>
            <p className="text-blue-100/80 text-lg mb-10 max-w-xl mx-auto">
              Save hours every week on admin work. Let your teachers focus on teaching.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white text-lg font-bold shadow-2xl shadow-orange-900/40 active:scale-95 transition-all hover:scale-[1.02]">
              Create your school account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-blue-200/60 text-sm">Setup in minutes · No technical knowledge required</p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 bg-slate-900/50 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg">Schoolly</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Pakistan&apos;s complete school management platform — built for modern institutions.</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-4">Quick Links</p>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing"  className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link href="/login"  className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-4">Contact</p>
              <div className="space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-slate-500" /><span>0303-4063608</span></div>
                <div className="flex items-center gap-2.5"><Mail  className="w-4 h-4 text-slate-500" /><span>seemakram15@gmail.com</span></div>
                <div className="flex items-center gap-2.5"><Building2 className="w-4 h-4 text-slate-500" /><span>Lahore, Pakistan</span></div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <p>© {new Date().getFullYear()} Schoolly. All rights reserved.</p>
            <p>Designed for Pakistani schools 🇵🇰</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
