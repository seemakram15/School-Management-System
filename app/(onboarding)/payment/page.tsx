"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Phone, Building2, Upload, CheckCircle2, Loader2, ArrowLeft,
  FileImage, X, CreditCard
} from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [planId, setPlanId] = useState<string>("2");
  const [planName, setPlanName] = useState("Standard");
  const [planPrice, setPlanPrice] = useState("4,000");
  const [method, setMethod] = useState<"jazzcash" | "meezan">("jazzcash");
  const [txId, setTxId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    const id = sessionStorage.getItem("selectedPlanId");
    const name = sessionStorage.getItem("selectedPlanName");
    const price = sessionStorage.getItem("selectedPlanPrice");
    if (id) setPlanId(id);
    if (name) setPlanName(name);
    if (price) setPlanPrice(price);
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { setError("Please upload an image file (JPG, PNG, etc.)"); return; }
    if (f.size > 5 * 1024 * 1024) { setError("Image must be under 5MB"); return; }
    setFile(f);
    setError("");
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  function removeFile() {
    setFile(null);
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!txId.trim()) { setError("Please enter your Transaction ID"); return; }
    if (!file) { setError("Please upload your payment screenshot"); return; }

    setLoading(true);
    setUploadProgress("Uploading screenshot…");

    // Upload screenshot
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/api/upload/screenshot", { method: "POST", body: formData });
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      setError(uploadData.error ?? "Screenshot upload failed. Please try again.");
      setLoading(false);
      setUploadProgress("");
      return;
    }

    setUploadProgress("Submitting payment details…");

    // Create subscription
    const subRes = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId: Number(planId),
        paymentMethod: method,
        transactionId: txId.trim(),
        screenshotUrl: uploadData.url,
      }),
    });

    const subData = await subRes.json();
    if (!subRes.ok) {
      setError(subData.error ?? "Failed to submit payment. Please try again.");
      setLoading(false);
      setUploadProgress("");
      return;
    }

    router.push("/pending");
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to plans
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">Complete your payment</h1>
        <p className="text-slate-400 mt-2">
          You selected <span className="text-white font-semibold">{planName}</span> — <span className="text-orange-400 font-bold">Rs. {planPrice}/month</span>
        </p>
      </div>

      {/* Payment methods display */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div
          onClick={() => setMethod("jazzcash")}
          className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${method === "jazzcash" ? "border-orange-500 bg-orange-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Phone className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="font-bold text-white">JazzCash</p>
              {method === "jazzcash" && <span className="text-xs text-orange-400">Selected</span>}
            </div>
          </div>
          <p className="text-2xl font-mono font-bold text-orange-400">0303-4063608</p>
          <p className="text-xs text-slate-400 mt-1">Account: Waseem Akram</p>
        </div>

        <div
          onClick={() => setMethod("meezan")}
          className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${method === "meezan" ? "border-green-500 bg-green-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="font-bold text-white">Meezan Bank</p>
              {method === "meezan" && <span className="text-xs text-green-400">Selected</span>}
            </div>
          </div>
          <p className="text-sm font-mono text-slate-300">02720104818375</p>
          <p className="text-xs text-slate-400 mt-0.5">IBAN: PK92MEZN0002720104818375</p>
          <p className="text-xs text-slate-400">Waseem Akram · New Anarkali, Lahore</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8">
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">Transaction ID / Reference Number</label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={txId}
                onChange={e => { setTxId(e.target.value); setError(""); }}
                required
                placeholder="e.g. JAZZ-20261234567 or MEZN-987654"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Found in your JazzCash/bank SMS or transaction history</p>
          </div>

          {/* Screenshot upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">Payment Screenshot</label>
            {filePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <img src={filePreview} alt="Screenshot" className="w-full max-h-52 object-contain bg-black/20" />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm px-3 py-2 flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-slate-300 truncate">{file?.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto shrink-0" />
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
              >
                <Upload className="w-10 h-10 text-slate-500 group-hover:text-blue-400 mx-auto mb-3 transition-colors" />
                <p className="text-slate-300 text-sm font-medium">Click to upload screenshot</p>
                <p className="text-slate-500 text-xs mt-1">JPG, PNG or WebP · Max 5MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-900/30"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {uploadProgress || "Submitting…"}</>
            ) : (
              "Submit Payment & Activate School"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
