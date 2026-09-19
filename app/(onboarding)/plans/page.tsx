"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

const PLANS = [
  {
    id: 1,
    name: "Basic",
    price: "2,000",
    max: "Up to 200 students",
    tagline: "Perfect for small schools",
    color: "border-slate-600 hover:border-slate-400",
    selectedColor: "border-blue-500 ring-2 ring-blue-500/30",
    badge: null,
    features: [
      "Up to 200 students",
      "Attendance tracking",
      "Marks & exam management",
      "Student profiles",
      "Basic reports",
      "Email support",
    ],
  },
  {
    id: 2,
    name: "Standard",
    price: "4,000",
    max: "Up to 500 students",
    tagline: "Most popular choice",
    color: "border-blue-500 hover:border-blue-400",
    selectedColor: "border-blue-400 ring-2 ring-blue-400/40",
    badge: "Most Popular",
    features: [
      "Up to 500 students",
      "Everything in Basic",
      "HRM & employee management",
      "Leave management",
      "Advanced reports",
      "School public website",
      "Priority email support",
    ],
  },
  {
    id: 3,
    name: "Premium",
    price: "8,000",
    max: "Unlimited students",
    tagline: "For large institutions",
    color: "border-violet-500 hover:border-violet-400",
    selectedColor: "border-violet-400 ring-2 ring-violet-400/40",
    badge: "Best Value",
    features: [
      "Unlimited students",
      "Everything in Standard",
      "Custom branding",
      "Dedicated account manager",
      "Early feature access",
      "Phone & WhatsApp support",
    ],
  },
];

export default function PlansPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(2); // default Standard
  const [loading, setLoading] = useState(false);

  function handleContinue() {
    if (!selected) return;
    setLoading(true);
    // Pass selected plan via session storage
    sessionStorage.setItem("selectedPlanId", String(selected));
    const plan = PLANS.find(p => p.id === selected)!;
    sessionStorage.setItem("selectedPlanName", plan.name);
    sessionStorage.setItem("selectedPlanPrice", plan.price);
    router.push("/payment");
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Choose your plan</h1>
        <p className="text-slate-400 mt-3 text-lg">Select a plan that fits your school&apos;s size and needs.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {PLANS.map(plan => {
          const isSelected = selected === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={`relative text-left bg-white/5 backdrop-blur rounded-2xl border-2 p-6 transition-all cursor-pointer ${isSelected ? plan.selectedColor + " bg-white/10" : plan.color}`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white ${plan.badge === "Most Popular" ? "bg-blue-600" : "bg-violet-600"}`}>
                  {plan.badge}
                </div>
              )}

              {/* Selected check */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-6 h-6 text-blue-400" />
                </div>
              )}

              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{plan.tagline}</p>

              <div className="mb-4">
                <span className="text-3xl font-extrabold text-white">Rs. {plan.price}</span>
                <span className="text-slate-400 text-sm">/month</span>
                <p className="text-slate-300 text-xs mt-1">{plan.max}</p>
              </div>

              <ul className="space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg shadow-xl shadow-orange-900/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Please wait…</>
          ) : (
            <>Continue to Payment <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </div>
    </div>
  );
}
