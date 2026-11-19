"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useNexusStore } from "@/lib/store";
import { Tool, PricePlan, Order } from "@/lib/types";
import { 
  CreditCard, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Smartphone,
  Key,
  Download,
  Clock,
  RotateCcw,
  Wallet,
  Cpu,
  Database
} from "lucide-react";

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={
      <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-yellow-400">Loading Toolsbd.com checkout...</span>
      </div>
    }>
      <CheckoutContent />
    </React.Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { 
    tools, 
    plans, 
    settings, 
    walletBalanceUSD,
    firebaseProjectId,
    currentUser,
    isLoggedIn,
    loginUser,
    registerUser,
    purchaseOfferWithWallet,
    bindHwidToLicense,
    createOrder, 
    submitOrderPayment, 
    simulateIncomingSms,
  } = useNexusStore();

  const toolParam = searchParams.get("tool");
  const planParam = searchParams.get("plan");

  const [selectedTool, setSelectedTool] = useState<Tool>(tools[0]);
  const [selectedPlan, setSelectedPlan] = useState<PricePlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"Wallet" | "bKash" | "Rocket">("bKash");
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  
  // Auth fields if guest
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");

  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [generatedLicense, setGeneratedLicense] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const triggerConfetti = () => {
    if (typeof window !== "undefined") {
      import("canvas-confetti").then((module) => {
        const confetti = module.default;
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FACC15", "#EF4444", "#FFFFFF"],
        });
      }).catch(() => {});
    }
  };

  // HWID binding on Step 3
  const [hwidInput, setHwidInput] = useState("");
  const [hwidBoundStatus, setHwidBoundStatus] = useState<{ bound: boolean; message: string } | null>(null);
  const [isBindingHwid, setIsBindingHwid] = useState(false);

  useEffect(() => {
    if (toolParam) {
      const foundTool = tools.find(t => t.id === toolParam || t.slug === toolParam);
      if (foundTool) setSelectedTool(foundTool);
    }
  }, [toolParam, tools]);

  useEffect(() => {
    const toolPlans = plans.filter(p => p.toolId === selectedTool.id && p.enabled);
    if (planParam) {
      const foundPlan = toolPlans.find(p => p.id === planParam);
      if (foundPlan) {
        setSelectedPlan(foundPlan);
        return;
      }
    }
    if (toolPlans.length > 0) {
      setSelectedPlan(toolPlans[0]);
    }
  }, [selectedTool, planParam, plans]);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ""));
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlan) return;
    setErrorMsg(null);

    // If guest, auto register / sign in
    if (!isLoggedIn) {
      if (!authEmail.trim() || !authEmail.includes("@")) {
        setErrorMsg("Please enter your Gmail address so your license & orders are saved to your account.");
        return;
      }
      if (!authPassword || authPassword.length < 4) {
        setErrorMsg("Please enter a password (at least 4 characters).");
        return;
      }
      const authRes = registerUser(authName || authEmail.split("@")[0], authEmail, authPassword);
      if (!authRes.success) {
        setErrorMsg(authRes.error || "Authentication failed.");
        return;
      }
    }

    if (paymentMethod === "Wallet") {
      if (walletBalanceUSD < selectedPlan.priceUSD) {
        setErrorMsg(`Your profile balance is $${walletBalanceUSD.toFixed(2)}, but this plan is $${selectedPlan.priceUSD}. Please select bKash or Rocket to pay directly.`);
        return;
      }

      setIsSubmitting(true);
      const res = await purchaseOfferWithWallet(selectedTool, selectedPlan);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.error || "Insufficient wallet balance.");
        return;
      }
      triggerConfetti();
      if (res.order) setActiveOrder(res.order);
      if (res.license) setGeneratedLicense(res.license.key);
      setStep(3);
      return;
    }

    const order = createOrder(selectedTool, selectedPlan, paymentMethod);
    setActiveOrder(order);
    setStep(2);
  };

  const handleBindHwidOnSuccess = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetKey = generatedLicense || activeOrder?.licenseKey;
    if (!targetKey || !hwidInput.trim()) return;
    setIsBindingHwid(true);
    const res = await bindHwidToLicense(targetKey, hwidInput.trim());
    setIsBindingHwid(false);
    if (res.success) {
      triggerConfetti();
      setHwidBoundStatus({
        bound: true,
        message: `HWID "${hwidInput.trim()}" activated & ${res.firebaseSynced ? `synced live to Firebase (${firebaseProjectId})` : "saved to registry"}!`
      });
    } else {
      setHwidBoundStatus({ bound: false, message: res.error || "Binding failed" });
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    if (!senderNumber || !trxId) {
      setErrorMsg("Please provide your sender number and transaction ID (TrxID).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      const result = submitOrderPayment(activeOrder.id, trxId, senderNumber);
      setIsSubmitting(false);

      if (result.autoVerified) {
        setGeneratedLicense(result.key || null);
        setStep(3);
      } else {
        setActiveOrder(prev => prev ? ({ ...prev, trxId: trxId.toUpperCase(), senderNumber, notes: "Awaiting SMS verification..." }) : null);
      }
    }, 1000);
  };

  const handleTriggerSimulatedSms = () => {
    if (!activeOrder) return;
    const prefix = paymentMethod === "bKash" ? "BK" : paymentMethod === "Rocket" ? "RK" : "NG";
    const mockTrx = trxId.trim() || `${prefix}${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTrxId(mockTrx);

    const result = simulateIncomingSms(
      paymentMethod as any,
      activeOrder.amount,
      senderNumber || "01731328169",
      mockTrx
    );

    const matchRes = submitOrderPayment(activeOrder.id, mockTrx, senderNumber || "01731328169");
    if (matchRes.autoVerified) {
      setGeneratedLicense(matchRes.key || null);
      setStep(3);
    }
  };

  const currentPaymentNumber = paymentMethod === "bKash" 
    ? settings.bkashMerchantNumber 
    : settings.rocketMerchantNumber;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      
      {/* Checkout Progress Bar */}
      <div className="flex items-center justify-center gap-4 text-xs font-black">
        <div className={`flex items-center gap-2 ${step >= 1 ? "text-yellow-400" : "text-slate-500"}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= 1 ? "bg-yellow-400 text-black shadow-neon-yellow" : "bg-white/10"}`}>
            1
          </span>
          <span>Select License</span>
        </div>
        <div className={`w-12 h-[2px] ${step >= 2 ? "bg-yellow-400" : "bg-white/10"}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? "text-red-500" : "text-slate-500"}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= 2 ? "bg-red-600 text-white shadow-neon-red" : "bg-white/10"}`}>
            2
          </span>
          <span>Pay & Submit TrxID</span>
        </div>
        <div className={`w-12 h-[2px] ${step === 3 ? "bg-white" : "bg-white/10"}`} />
        <div className={`flex items-center gap-2 ${step === 3 ? "text-white" : "text-slate-500"}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center ${step === 3 ? "bg-white text-black font-black" : "bg-white/10"}`}>
            3
          </span>
          <span>Instant License</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STEP 1: PLAN SELECTION                                         */}
      {/* ============================================================== */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Configuration Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
              
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block mb-2">
                  1. Choose Software Tool
                </label>
                <select
                  value={selectedTool.id}
                  onChange={(e) => {
                    const t = tools.find(x => x.id === e.target.value);
                    if (t) setSelectedTool(t);
                  }}
                  className="w-full p-3.5 rounded-xl glass-input text-sm font-bold text-white"
                >
                  {tools.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#111111] text-white">
                      {t.name} ({t.version})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block mb-2">
                  2. Select Subscription Duration
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {plans.filter(p => p.toolId === selectedTool.id && p.enabled).map((p) => {
                    const isSelected = selectedPlan?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlan(p)}
                        className={`cursor-pointer rounded-2xl p-4 border transition-all text-center ${
                          isSelected
                            ? "bg-yellow-400/20 border-yellow-400 shadow-neon-yellow text-white"
                            : "bg-[#111111] border-white/10 hover:border-white/30 text-slate-300"
                        }`}
                      >
                        <span className="text-xs font-black uppercase block text-yellow-400">
                          {p.durationDays} Days 🔥
                        </span>
                        <div className="text-3xl font-black text-white my-1">
                          ${p.priceUSD}
                        </div>
                        <span className="text-[11px] font-mono text-slate-300 block">
                          ৳{p.priceBDT} BDT
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Single HWID Lock
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block mb-2">
                  3. Select Automated Payment Method
                </label>
                {errorMsg && step === 1 && (
                  <div className="mb-3 p-3 rounded-xl bg-red-950/80 border border-red-500 text-white text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-yellow-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Wallet Balance */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Wallet")}
                    className={`p-3.5 rounded-2xl border font-black text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === "Wallet"
                        ? "bg-yellow-400/20 border-yellow-400 text-white shadow-neon-yellow"
                        : "bg-[#111] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-yellow-400" />
                    <span>Wallet (${walletBalanceUSD.toFixed(2)})</span>
                    <span className="text-[10px] text-yellow-400 font-normal">Instant 1-Click</span>
                  </button>

                  {/* bKash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bKash")}
                    className={`p-3.5 rounded-2xl border font-black text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === "bKash"
                        ? "bg-[#D12053]/30 border-[#D12053] text-white shadow-lg"
                        : "bg-[#111] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#D12053]" />
                    <span>bKash Personal</span>
                    <span className="text-[10px] font-mono text-slate-300">01967922602</span>
                  </button>

                  {/* Rocket */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Rocket")}
                    className={`p-3.5 rounded-2xl border font-black text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === "Rocket"
                        ? "bg-[#8C3494]/30 border-[#8C3494] text-white shadow-lg"
                        : "bg-[#111] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-[#8C3494]" />
                    <span>Rocket Personal</span>
                    <span className="text-[10px] font-mono text-slate-300">01731328169</span>
                  </button>
                </div>
              </div>

              {/* 4. Account Profile Gate */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block">
                  4. Your Account (Saves License &amp; Tool Downloads)
                </label>
                {isLoggedIn && currentUser ? (
                  <div className="p-3.5 rounded-2xl bg-black border border-emerald-500/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        ✓
                      </div>
                      <div>
                        <span className="font-bold text-white block">{currentUser.name}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{currentUser.email}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-lg border border-yellow-400/30">
                      Profile Balance: ${walletBalanceUSD.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-black border border-yellow-400/40 space-y-3">
                    <p className="text-xs text-slate-300">
                      Enter your Gmail address &amp; password so your license key and downloads stay permanently saved to your profile:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Your Gmail Address</label>
                        <input
                          type="email"
                          required
                          placeholder="yourname@gmail.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-white text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1 font-bold">Password</label>
                        <input
                          type="password"
                          required
                          placeholder="Minimum 4 characters"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full p-2.5 rounded-xl glass-input text-white text-xs font-medium"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                      <span>Existing account? It will auto-login.</span>
                      <Link href={`/login?redirect=${encodeURIComponent("/checkout")}`} className="text-yellow-400 font-bold hover:underline">
                        Sign In &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10 sticky top-28">
              <h3 className="text-lg font-black text-white pb-3 border-b border-white/10">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Selected Utility:</span>
                  <span className="font-bold text-white">{selectedTool.name}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>License Duration:</span>
                  <span className="font-bold text-yellow-400">{selectedPlan?.durationDays || 7} Days</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Delivery Method:</span>
                  <span className="text-emerald-400 font-bold">Instant Cloud Sync</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Selected Payment:</span>
                  <span className="font-black text-white">{paymentMethod} Personal</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Payable:</span>
                  <div className="text-3xl font-black text-yellow-400 flex items-baseline gap-2">
                    <span>${selectedPlan?.priceUSD || 2}</span>
                    <span className="text-sm text-white font-mono font-bold">
                      (৳{selectedPlan?.priceBDT || 240} BDT)
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-black bg-yellow-400 px-2.5 py-1 rounded-full shadow-neon-yellow">
                  0% Fee
                </span>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full py-4 rounded-xl text-sm font-black text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:opacity-95 shadow-neon-yellow flex items-center justify-center gap-2 transition-all"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-slate-400 text-center space-y-1">
                <p className="flex items-center justify-center gap-1 text-slate-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                  <span>Toolsbd.com Encrypted HWID token generation</span>
                </p>
                <p>100% money-back guarantee if automated activation fails.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: PAYMENT SUBMISSION & COMPANION SMS VERIFICATION         */}
      {/* ============================================================== */}
      {step === 2 && activeOrder && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10 shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs text-yellow-400 font-black uppercase tracking-wider">
                  Order ID: {activeOrder.orderNumber}
                </span>
                <h2 className="text-2xl font-black text-white mt-0.5">
                  Send ৳{activeOrder.amount} via {paymentMethod}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Due:</span>
                <span className="text-2xl font-black text-yellow-400">৳{activeOrder.amount}</span>
              </div>
            </div>

            {/* Payment Number Card */}
            <div className="p-5 rounded-2xl bg-[#111111] border border-yellow-400/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-200 font-bold">
                  {paymentMethod} Personal (Send Money) Number:
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-yellow-400 text-black">
                  Send Money Only
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-black border border-white/15">
                <span className="text-2xl font-mono font-black text-yellow-400 tracking-wider">
                  {currentPaymentNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyNumber(currentPaymentNumber)}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-neon-red"
                >
                  {copiedNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedNumber ? "Copied!" : "Copy Number"}</span>
                </button>
              </div>

              <div className="text-xs text-slate-300 space-y-1 font-medium">
                <p>&bull; Open your <strong>{paymentMethod}</strong> app.</p>
                <p>&bull; Select <strong>Send Money</strong> and send exactly <strong>৳{activeOrder.amount}</strong> to <span className="text-yellow-400 font-bold">{currentPaymentNumber}</span>.</p>
                <p>&bull; Copy the <strong>TrxID</strong> from your confirmation SMS and submit below.</p>
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-white text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-yellow-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-1.5">
                  Your Sender Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 017XXXXXXXX or 019XXXXXXXX"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full p-3.5 rounded-xl glass-input text-sm font-mono text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-1.5">
                  Transaction ID (TrxID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BK992A81KC or RK784B10XQ"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full p-3.5 rounded-xl glass-input text-sm font-mono uppercase text-yellow-400 font-black"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl text-sm font-black text-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:opacity-95 shadow-neon-yellow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-black" />
                    <span>Verifying with Toolsbd Companion SMS Gateway...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Confirm & Verify Payment</span>
                  </>
                )}
              </button>
            </form>

            {/* Testing Helper: Trigger Simulated SMS Sync */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-yellow-400/40 text-xs space-y-2">
              <div className="flex items-center justify-between text-yellow-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-red-500" />
                  <span>Instant SMS Simulator (Test Auto-Activation)</span>
                </span>
                <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded text-white font-black">
                  TEST FEATURE
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Want to test instant auto-delivery without sending real money? Click below to broadcast a simulated merchant SMS for <strong>৳{activeOrder.amount}</strong>. Your license key will unlock immediately!
              </p>
              <button
                type="button"
                onClick={handleTriggerSimulatedSms}
                className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition-all text-center flex items-center justify-center gap-1.5 shadow-neon-red"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Companion SMS & Instantly Unlock License</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-yellow-400 transition-colors"
              >
                &larr; Back to plan selection
              </button>
              <Link href="/dashboard" className="text-yellow-400 hover:underline font-bold">
                View in Dashboard
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: SUCCESS & INSTANT LICENSE DELIVERY                     */}
      {/* ============================================================== */}
      {step === 3 && activeOrder && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-6 border border-yellow-400 shadow-neon-yellow text-center relative overflow-hidden">
            
            <div className="w-16 h-16 rounded-full bg-yellow-400 text-black flex items-center justify-center mx-auto shadow-neon-yellow">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
                Payment Verified Successfully!
              </span>
              <h2 className="text-3xl font-black text-white mt-1">
                Your Toolsbd License is Ready
              </h2>
              <p className="text-sm text-slate-300 mt-2">
                Order <strong>{activeOrder.orderNumber}</strong> for <strong>{activeOrder.toolName}</strong> has been activated for <strong>{activeOrder.planDuration} Days</strong>.
              </p>
            </div>

            {/* License Key Display Card */}
            <div className="p-6 rounded-2xl bg-black border border-yellow-400 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-red-500" />
                  <span>License Activation Key</span>
                </span>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black">
                  Single HWID
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0e0e0e] border border-white/20">
                <span className="font-mono text-base sm:text-lg font-black text-yellow-400 break-all select-all">
                  {generatedLicense || activeOrder.licenseKey || "TBD-OTP-30D-88AF-901B-4E11"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLicense || activeOrder.licenseKey || "");
                    setCopiedKey(true);
                    triggerConfetti();
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center gap-1.5 shrink-0 transition-colors shadow-neon-yellow"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                1. Download the tool below and run it on your PC to see your Hardware ID (HWID).<br />
                2. Paste your HWID in the box below to lock &amp; activate this key directly inside Firebase (<strong>{firebaseProjectId}</strong>).
              </p>
            </div>

            {/* Bind HWID Box right on Success Screen */}
            <div className="p-5 rounded-2xl bg-[#111111] border border-red-500/40 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-yellow-400" />
                  <span>Enter Your PC HWID to Activate Key</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>{firebaseProjectId}</span>
                </span>
              </div>

              {hwidBoundStatus?.bound ? (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{hwidBoundStatus.message}</span>
                </div>
              ) : (
                <form onSubmit={handleBindHwidOnSuccess} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Paste your HWID from downloaded tool..."
                    value={hwidInput}
                    onChange={(e) => setHwidInput(e.target.value)}
                    className="flex-1 p-3 rounded-xl glass-input font-mono text-xs text-white"
                  />
                  <button
                    type="submit"
                    disabled={isBindingHwid}
                    className="px-5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-neon-yellow shrink-0 transition-all"
                  >
                    {isBindingHwid ? "Syncing..." : "Bind HWID & Activate"}
                  </button>
                </form>
              )}
            </div>

            {/* Direct Download & Dashboard Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={selectedTool.downloadFilePath}
                download
                className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:opacity-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-neon-red transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download {selectedTool.name}</span>
              </a>

              <Link
                href="/dashboard"
                className="py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-black text-sm flex items-center justify-center gap-2 border border-white/20 transition-all"
              >
                <span>Open Customer Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-[11px] text-slate-400">
              A copy of your license key has been permanently saved in your Toolsbd.com account.
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
