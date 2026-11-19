"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useNexusStore, generateToolLicenseKey } from "@/lib/store";
import { Tool, PricePlan, Order } from "@/lib/types";
import { webDb } from "@/lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { 
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
  RotateCcw,
  Wallet,
  Cpu,
  Database,
  Send,
  Zap,
  HelpCircle
} from "lucide-react";
import { playChimeSound, showBrowserNotification } from "@/lib/notifications";

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={
      <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-yellow-400">Loading Toolsbd.com express checkout...</span>
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
    orders,
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
  } = useNexusStore();

  const toolParam = searchParams.get("tool");
  const planParam = searchParams.get("plan");

  const [selectedTool, setSelectedTool] = useState<Tool>(tools[0]);
  const [selectedPlan, setSelectedPlan] = useState<PricePlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bKash" | "Rocket" | "Wallet">("bKash");
  
  // Checkout view state: 'form', 'pending', or 'success'
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  
  // User input fields
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || "");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  
  // UI indicators
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [generatedLicense, setGeneratedLicense] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // HWID binding on success
  const [hwidInput, setHwidInput] = useState("");
  const [hwidBoundStatus, setHwidBoundStatus] = useState<{ bound: boolean; message: string } | null>(null);
  const [isBindingHwid, setIsBindingHwid] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const handleManualCheckOrder = async () => {
    if (!activeOrder?.id) return;
    setIsCheckingStatus(true);
    try {
      const snap = await getDoc(doc(webDb, "orders", activeOrder.id));
      if (snap.exists()) {
        const ord = snap.data();
        if (ord.status === "PAID" || ord.status === "APPROVED") {
          setActiveOrder(prev => prev ? { ...prev, status: "PAID", licenseKey: ord.licenseKey || prev.licenseKey } : null);
          setGeneratedLicense(ord.licenseKey || null);
          setIsPending(false);
          setIsSuccess(true);
          triggerConfetti();
        } else {
          setErrorMsg("অর্ডারটি এখনো PENDING রয়েছে। বিকাশ/রকেট মেসেজ বা অ্যাডমিন এপ্রুভালের জন্য অপেক্ষা করুন।");
          setTimeout(() => setErrorMsg(null), 4000);
        }
      }
    } catch (e) {
      // Ignored
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Real-time Firestore & Local auto-listen: The second SMS gateway or Admin approves, transition to SUCCESS!
  useEffect(() => {
    if (!activeOrder?.id || !isPending) return;

    // 1. Direct Firestore Snapshot Listener (Zero polling latency!)
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(doc(webDb, "orders", activeOrder.id), (docSnap) => {
        if (docSnap.exists()) {
          const ord = docSnap.data();
          if (ord.status === "PAID" || ord.status === "APPROVED") {
            setActiveOrder(prev => prev ? { ...prev, status: "PAID", licenseKey: ord.licenseKey || prev.licenseKey } : null);
            setGeneratedLicense(ord.licenseKey || null);
            setIsPending(false);
            setIsSuccess(true);
            playChimeSound("success");
            showBrowserNotification("🎉 পেমেন্ট সফল হয়েছে!", {
              body: "আপনার লাইসেন্স কী ও ডাউনলোড লিঙ্ক প্রস্তুত!"
            });
            triggerConfetti();
          }
        }
      });
    } catch (e) {
      console.warn("Firestore snapshot listener notice:", e);
    }

    // 2. High-reliability fallback polling interval (every 2.5s)
    const interval = setInterval(async () => {
      try {
        const snap = await getDoc(doc(webDb, "orders", activeOrder.id));
        if (snap.exists()) {
          const ord = snap.data();
          if (ord.status === "PAID" || ord.status === "APPROVED") {
            setActiveOrder(prev => prev ? { ...prev, status: "PAID", licenseKey: ord.licenseKey || prev.licenseKey } : null);
            setGeneratedLicense(ord.licenseKey || null);
            setIsPending(false);
            setIsSuccess(true);
            playChimeSound("success");
            showBrowserNotification("🎉 পেমেন্ট সফল হয়েছে!", {
              body: "আপনার লাইসেন্স কী ও ডাউনলোড লিঙ্ক প্রস্তুত!"
            });
            triggerConfetti();
          }
        }
      } catch (err) {
        // Ignored
      }
    }, 2500);

    return () => {
      if (unsub) unsub();
      clearInterval(interval);
    };
  }, [activeOrder?.id, isPending]);

  // Sync email when user logs in
  useEffect(() => {
    if (currentUser?.email && !customerEmail) {
      setCustomerEmail(currentUser.email);
    }
  }, [currentUser, customerEmail]);

  // Sync tool from URL
  useEffect(() => {
    if (toolParam) {
      const foundTool = tools.find(t => t.id === toolParam || t.slug === toolParam);
      if (foundTool) setSelectedTool(foundTool);
    }
  }, [toolParam, tools]);

  // Sync plan from URL
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

  const triggerConfetti = () => {
    if (typeof window !== "undefined") {
      import("canvas-confetti").then((module) => {
        const confetti = module.default;
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#FACC15", "#EF4444", "#FFFFFF"],
        });
      }).catch(() => {});
    }
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ""));
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // 1-Click Wallet Purchase
  const handleWalletPurchase = async () => {
    if (!selectedPlan) return;
    setErrorMsg(null);

    // Auto auth if guest
    if (!isLoggedIn) {
      if (!customerEmail.trim() || !customerEmail.includes("@")) {
        setErrorMsg("দয়া করে আপনার Gmail এড্রেসটি দিন যাতে লাইসেন্স ও অর্ডার হিস্টোরি আপনার একাউন্টে সেভ থাকে।");
        return;
      }
      registerUser(customerEmail.split("@")[0], customerEmail, "123456");
    }

    if (walletBalanceUSD < selectedPlan.priceUSD) {
      setErrorMsg(`আপনার প্রোফাইল ব্যালেন্স $${walletBalanceUSD.toFixed(2)}, কিন্তু এই প্ল্যানের মূল্য $${selectedPlan.priceUSD}। অনুগ্রহ করে bKash বা Rocket সিলেক্ট করে পেমেন্ট করুন।`);
      return;
    }

    setIsSubmitting(true);
    const res = await purchaseOfferWithWallet(selectedTool, selectedPlan);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "ওয়ালেট থেকে ব্যালেন্স কাটতে সমস্যা হয়েছে।");
      return;
    }

    triggerConfetti();
    if (res.order) setActiveOrder(res.order);
    if (res.license) setGeneratedLicense(res.license.key);
    setIsSuccess(true);
  };

  // Direct Express Payment (bKash / Rocket)
  const handleExpressPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setErrorMsg(null);

    const emailToUse = customerEmail.trim() || currentUser?.email || "";
    if (!emailToUse || !emailToUse.includes("@")) {
      setErrorMsg("আপনার জিমেইল এড্রেস (Gmail) দিন যাতে লাইসেন্স কী ও ডাউনলোড লিঙ্ক আপনার একাউন্টে সেভ থাকে।");
      return;
    }

    if (!trxId.trim()) {
      setErrorMsg("টাকা পাঠানোর পর প্রাপ্ত TrxID (ট্রানজেকশন আইডি) বক্সে দিন।");
      return;
    }

    // Auto-create account if not logged in (Synced to Firestore for all devices)
    if (!isLoggedIn) {
      await registerUser(emailToUse.split("@")[0], emailToUse, "123456");
    }

    setIsSubmitting(true);

    // 1. Create Order
    const order = createOrder(selectedTool, selectedPlan, paymentMethod as "bKash" | "Rocket");
    setActiveOrder(order);

    // 2. Submit Payment TrxID
    setTimeout(() => {
      const result = submitOrderPayment(order.id, trxId.trim().toUpperCase(), senderNumber.trim() || "01731328169");
      setIsSubmitting(false);

      if (result.autoVerified) {
        setGeneratedLicense(result.key || null);
        triggerConfetti();
        setIsSuccess(true);
      } else {
        // Real order: Pending verification by Admin or automated SMS match
        setIsPending(true);
      }
    }, 1200);
  };

  // HWID Machine Lock Handler on Success Screen
  const handleBindHwid = async (e: React.FormEvent) => {
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
        message: `আপনার PC HWID (${hwidInput.trim()}) সফলভাবে লক ও অ্যাক্টিভ করা হয়েছে! কোনো রিসেট ছাড়াই এটি আজীবন চলবে।`
      });
    } else {
      setHwidBoundStatus({ bound: false, message: res.error || "HWID লক করতে সমস্যা হয়েছে।" });
    }
  };

  const currentPaymentNumber = paymentMethod === "bKash" 
    ? settings.bkashMerchantNumber 
    : settings.rocketMerchantNumber;

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      
      {/* Top Breadcrumb / Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/40 text-yellow-400 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Toolsbd.com Instant Checkout</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {isSuccess 
            ? "🎉 লাইসেন্স কনফার্মেশন ও টুল ডাউনলোড" 
            : isPending 
            ? "⏳ পেমেন্ট ভেরিফিকেশন চলছে..."
            : "টুল কিনুন ও লাইসেন্স পান (Instant Delivery)"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          {isSuccess 
            ? "আপনার পেমেন্ট সফল হয়েছে! নিচে দেওয়া লাইসেন্স কী ও ডাউনলোড লিঙ্ক ব্যবহার করে টুল চালু করুন।"
            : isPending
            ? "আপনার পেমেন্ট তথ্য জমা হয়েছে। এসএমএস গেটওয়ে TrxID ম্যাচ করলেই লাইসেন্স স্বয়ংক্রিয়ভাবে প্রদান করা হবে।"
            : "bKash বা Rocket-এ টাকা পাঠিয়ে TrxID সাবমিট করলেই তাৎক্ষণিক লাইসেন্স পেয়ে যাবেন।"
          }
        </p>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: ONE-PAGE ULTRA FAST CHECKOUT (NO COMPLICATED STEPS)     */}
      {/* ============================================================== */}
      {!isSuccess && !isPending && selectedPlan && (
        <div className="glass-panel rounded-3xl p-5 sm:p-8 space-y-7 border border-white/10 shadow-2xl">
          
          {/* 1. PLAN SELECTOR PILLS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                <span>১. আপনার পছন্দের অফার প্ল্যানটি বেছে নিন:</span>
              </label>
              <span className="text-xs text-slate-400 font-mono">
                Tool: <strong className="text-white">{selectedTool.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plans.filter(p => p.toolId === selectedTool.id && p.enabled).map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative rounded-2xl p-4 border text-left transition-all ${
                      isSelected
                        ? "bg-gradient-to-b from-[#1c180e] to-[#121008] border-2 border-yellow-400 shadow-neon-yellow scale-[1.02]"
                        : "bg-[#111111] border-white/10 hover:border-yellow-400/40 text-slate-300"
                    }`}
                  >
                    {plan.isPopular && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-600 text-white border border-yellow-300">
                        ★ Most Popular
                      </span>
                    )}
                    <span className="text-xs font-black uppercase block text-yellow-400">
                      {plan.name}
                    </span>
                    <div className="flex items-baseline gap-1.5 my-1">
                      <span className="text-2xl font-black text-white leading-none">
                        ${plan.priceUSD}
                      </span>
                      <span className="text-xs font-mono font-bold text-yellow-400">
                        (৳{plan.priceBDT} BDT)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-normal">
                      ✓ Single PC Permanent Lock
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. PAYMENT METHOD SELECTION TABS */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block">
              ২. পেমেন্ট মাধ্যম বেছে নিন:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* bKash */}
              <button
                type="button"
                onClick={() => setPaymentMethod("bKash")}
                className={`p-3.5 rounded-2xl border font-black text-xs flex items-center justify-between sm:justify-center sm:flex-col gap-2 transition-all ${
                  paymentMethod === "bKash"
                    ? "bg-[#D12053]/25 border-[#D12053] text-white shadow-lg ring-1 ring-[#D12053]"
                    : "bg-[#111111] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#D12053] shrink-0" />
                  <span className="text-sm font-black text-white">bKash Personal</span>
                </div>
                <span className="text-xs font-mono text-yellow-400 font-bold">{settings.bkashMerchantNumber}</span>
              </button>

              {/* Rocket */}
              <button
                type="button"
                onClick={() => setPaymentMethod("Rocket")}
                className={`p-3.5 rounded-2xl border font-black text-xs flex items-center justify-between sm:justify-center sm:flex-col gap-2 transition-all ${
                  paymentMethod === "Rocket"
                    ? "bg-[#8C3494]/25 border-[#8C3494] text-white shadow-lg ring-1 ring-[#8C3494]"
                    : "bg-[#111111] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#8C3494] shrink-0" />
                  <span className="text-sm font-black text-white">Rocket Personal</span>
                </div>
                <span className="text-xs font-mono text-yellow-400 font-bold">{settings.rocketMerchantNumber}</span>
              </button>

              {/* Wallet */}
              <button
                type="button"
                onClick={() => setPaymentMethod("Wallet")}
                className={`p-3.5 rounded-2xl border font-black text-xs flex items-center justify-between sm:justify-center sm:flex-col gap-2 transition-all ${
                  paymentMethod === "Wallet"
                    ? "bg-yellow-400/25 border-yellow-400 text-white shadow-neon-yellow ring-1 ring-yellow-400"
                    : "bg-[#111111] border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span className="text-sm font-black text-white">Wallet Balance</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">${walletBalanceUSD.toFixed(2)} USD</span>
              </button>
            </div>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500 text-white text-xs flex items-center gap-2.5 shadow-neon-red">
              <AlertCircle className="w-4 h-4 shrink-0 text-yellow-400" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* 3A. WALLET DIRECT BUY BUTTON (IF WALLET SELECTED) */}
          {paymentMethod === "Wallet" && (
            <div className="p-5 rounded-2xl bg-black border border-yellow-400/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Current Wallet Balance:</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">${walletBalanceUSD.toFixed(2)} USD</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Plan Cost:</span>
                  <span className="text-2xl font-black text-yellow-400 font-mono">${selectedPlan.priceUSD} USD</span>
                </div>
              </div>

              {!isLoggedIn && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    আপনার Gmail এড্রেস (অ্যাকাউন্টে লাইসেন্স সেভ থাকবে):
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-3 rounded-xl glass-input text-sm text-white font-medium"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleWalletPurchase}
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl text-sm font-black text-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:opacity-95 shadow-neon-yellow flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-black" />
                    <span>প্রোফাইল থেকে ব্যালেন্স কাটছে...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-black" />
                    <span>⚡ ১-ক্লিকে ওয়ালেট থেকে কিনুন (${selectedPlan.priceUSD})</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                <span>তাত্ক্ষণিক লাইসেন্স কী ও ডাউনলোড ফাইল প্রদান করা হবে।</span>
              </div>
            </div>
          )}

          {/* 3B. BKASH / ROCKET DIRECT PAYMENT DETAILS (VISIBLE RIGHT HERE!) */}
          {(paymentMethod === "bKash" || paymentMethod === "Rocket") && (
            <form onSubmit={handleExpressPaymentSubmit} className="space-y-5">
              
              {/* Payment Number Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#111111] border border-yellow-400/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white">
                      Send Money
                    </span>
                    <span className="text-xs text-white font-bold">
                      {paymentMethod} Personal নাম্বারে <strong>৳{selectedPlan.priceBDT} BDT</strong> পাঠান:
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    অটো কনফার্মেশন: ৩০-৪৫ সেকেন্ড
                  </span>
                </div>

                {/* Big Copyable Number */}
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-black border border-white/20">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-yellow-400 tracking-wider select-all">
                    {currentPaymentNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(currentPaymentNumber)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-neon-red shrink-0"
                  >
                    {copiedNumber ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedNumber ? "কপি হয়েছে!" : "নাম্বার কপি করুন"}</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-300 space-y-1">
                  <p>&bull; আপনার {paymentMethod} অ্যাপ ওপেন করে <strong>Send Money</strong> সিলেক্ট করুন।</p>
                  <p>&bull; উপরোক্ত নাম্বারে <strong>৳{selectedPlan.priceBDT}</strong> পাঠিয়ে কনফার্মেশন মেসেজের <strong>TrxID</strong> নিচে দিন।</p>
                </div>
              </div>

              {/* Direct Input Fields (Only 2 Simple Fields!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>১. আপনার Gmail এড্রেস:</span>
                    <span className="text-[10px] text-yellow-400 lowercase font-mono">লাইসেন্স সেভ থাকবে</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-3.5 rounded-xl glass-input text-sm text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>২. Transaction ID (TrxID):</span>
                    <span className="text-[10px] text-emerald-400 font-mono">SMS থেকে কপি করুন</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: BK992A81KC বা RK82736"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full p-3.5 rounded-xl glass-input text-sm font-mono uppercase text-yellow-400 font-black tracking-wider"
                  />
                </div>
              </div>

              {/* Big Glowing Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl text-sm sm:text-base font-black text-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:opacity-95 shadow-neon-yellow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-black" />
                    <span>এসএমএস ভেরিফাই হচ্ছে... (দয়া করে অপেক্ষা করুন)</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-black" />
                    <span>⚡ পেমেন্ট ভেরিফাই ও লাইসেন্স কী নিন (Instant Delivery)</span>
                  </>
                )}
              </button>

            </form>
          )}

          {/* Bottom Security Assurance */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>১০০% নিরাপদ ও স্বয়ংক্রিয় bKash/Rocket ডেলিভারি</span>
            </span>
            <a
              href={settings.telegramGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:underline flex items-center gap-1 font-bold"
            >
              <Send className="w-3.5 h-3.5" />
              <span>সাহায্য প্রয়োজন? টেলিগ্রাম সাপোর্ট</span>
            </a>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW: ORDER PENDING REAL-TIME ADMIN & SMS GATEWAY VERIFICATION  */}
      {/* ============================================================== */}
      {isPending && activeOrder && (
        <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-7 border-2 border-yellow-400/50 shadow-neon-yellow text-center relative overflow-hidden bg-[#0c0c0c]">
          
          <div className="w-16 h-16 rounded-2xl bg-yellow-400/15 border border-yellow-400/40 text-yellow-400 flex items-center justify-center mx-auto shadow-neon-yellow">
            <RotateCcw className="w-8 h-8 animate-spin text-yellow-400" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>স্ট্যাটাস: পেন্ডিং (যাচাই চলছে...) — PENDING</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              পেমেন্ট ভেরিফিকেশন অপেক্ষারত (Awaiting Verification)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg mx-auto">
              আপনার {paymentMethod} TrxID (<strong className="text-white font-mono">{trxId.trim().toUpperCase()}</strong>) সিস্টেমে যুক্ত হয়েছে। বিকাশ/রকেট মেসেজ ম্যাচিং অথবা অ্যাডমিন কনফার্মেশন হওয়ামাত্রই এই স্ক্রিনে স্বয়ংক্রিয়ভাবে লাইসেন্স ডেলিভারি হয়ে যাবে।
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14120a] border border-yellow-400/30 text-xs text-left space-y-2.5 font-mono max-w-md mx-auto">
            <div className="flex justify-between text-slate-400">
              <span>Order Number:</span>
              <strong className="text-white font-bold">{activeOrder.orderNumber}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tool &amp; Plan:</span>
              <strong className="text-yellow-400">{selectedTool.name} ({selectedPlan?.durationDays} Days)</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Payable Amount:</span>
              <strong className="text-emerald-400 font-bold">৳{selectedPlan?.priceBDT} BDT (${selectedPlan?.priceUSD})</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Submitted TrxID:</span>
              <strong className="text-white uppercase font-black">{trxId.trim().toUpperCase()}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Current Status:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>PENDING</span>
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#090909] border border-white/10 text-xs text-slate-300 space-y-1 max-w-lg mx-auto text-left">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>রিয়েল-টাইম অটো লাইসেন্স আপডেট:</span>
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              স্বয়ংক্রিয় SMS গেটওয়ে থেকে আপনার পেমেন্ট কনফার্ম হওয়া মাত্রই এই পেইজটি রিলোড ছাড়াই সাথে সাথে লাইসেন্স এবং ডাউনলোড স্ক্রিনে চলে যাবে।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-xl mx-auto">
            <button
              onClick={handleManualCheckOrder}
              disabled={isCheckingStatus}
              className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-white/10"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isCheckingStatus ? "animate-spin text-yellow-400" : ""}`} />
              <span>{isCheckingStatus ? "চেক হচ্ছে..." : "এখনই চেক করুন"}</span>
            </button>

            <Link
              href="/dashboard"
              className="py-3 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-neon-yellow transition-all"
            >
              <span>ড্যাশবোর্ডে যান</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href={settings.telegramGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-neon-red transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>টেলিগ্রাম সাপোর্ট</span>
            </a>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: INSTANT SUCCESS, DIRECT DOWNLOAD & HWID BINDING        */}
      {/* ============================================================== */}
      {isSuccess && (
        <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-7 border-2 border-yellow-400 shadow-neon-yellow text-center relative overflow-hidden">
          
          <div className="w-16 h-16 rounded-full bg-yellow-400 text-black flex items-center justify-center mx-auto shadow-neon-yellow">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
              পেমেন্ট কনফার্মেশন সম্পন্ন!
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
              আপনার লাইসেন্স প্রস্তুত
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg mx-auto">
              {selectedTool.name} ({selectedPlan?.durationDays || 7} Days Access) এর অফিশিয়াল লাইসেন্স সফলভাবে জেনারেট হয়েছে।
            </p>
          </div>

          {/* 1. STEP 1: DOWNLOAD TOOL ZIP ARCHIVE */}
          <div className="p-5 rounded-2xl bg-[#0c180e] border border-emerald-500/50 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                <span>ধাপ ১: টুলস ডাউনলোড করে সফটওয়্যার ওপেন করুন</span>
              </span>
              <span className="text-xs font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                {selectedTool.fileSize || "28.4 MB"}
              </span>
            </div>

            <a
              href={selectedTool.downloadFilePath || "/releases/Setup.zip"}
              download
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Download className="w-5 h-5 text-black" />
              <span>টুল ডাউনলোড করুন ({selectedTool.downloadFileName || "Fast_OTP_v3.0_Pro_Setup.zip"})</span>
            </a>

            <p className="text-[11px] text-slate-300">
              ডাউনলোড করার পর জিপ ফাইলটি আনজিপ করুন এবং <strong>Run as Administrator</strong> হিসেবে সফটওয়্যারটি ওপেন করুন। ওপেন করলে সফটওয়্যার উইন্ডোর ভেতর আপনার কম্পিউটারের <strong>Machine HWID</strong> দেখতে পাবেন।
            </p>
          </div>

          {/* 2. STEP 2: HWID FIRST — USER ENTERS HWID BEFORE GETTING LICENSE */}
          <div className="p-5 rounded-2xl bg-[#121212] border border-yellow-400/60 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-red-500" />
                <span>ধাপ ২: সফটওয়্যার ওপেন করে আপনার Machine HWID দিন</span>
              </span>
              <span className="text-[10px] text-yellow-300 font-mono font-bold">
                আগে HWID দিন &rarr; তারপর লাইসেন্স পাবেন
              </span>
            </div>

            {hwidBoundStatus?.bound ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{hwidBoundStatus.message}</span>
              </div>
            ) : (
              <form onSubmit={handleBindHwid} className="space-y-2.5">
                <label className="text-xs text-slate-300 block font-semibold">
                  টুলস ডাউনলোড করে ওপেন করার পর সফটওয়্যারে দেখানো Machine HWID টি এখানে দিন:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    placeholder="যেমন: AGY-E42D-475A-B6D8-A901"
                    value={hwidInput}
                    onChange={(e) => setHwidInput(e.target.value)}
                    className="flex-1 p-3 rounded-xl glass-input font-mono text-xs text-white font-black uppercase"
                  />
                  <button
                    type="submit"
                    disabled={isBindingHwid}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-black text-xs shadow-neon-yellow shrink-0 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isBindingHwid ? "ভেরিফাই হচ্ছে..." : "HWID সাবমিট করে লাইসেন্স কী নিন 🔒"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  ⚠️ নোট: HWID দেওয়ার সাথে সাথেই লাইসেন্স কী আপনার কম্পিউটারের হার্ডওয়্যারের সাথে আজীবনের জন্য লক হয়ে যাবে।
                </p>
              </form>
            )}
          </div>

          {/* 3. STEP 3: REVEALED LICENSE ACTIVATION KEY (SHOWN AFTER HWID IS SUBMITTED) */}
          <div className={`p-5 rounded-2xl text-left space-y-3 transition-all ${
            hwidBoundStatus?.bound 
              ? "bg-black border-2 border-yellow-400 shadow-neon-yellow" 
              : "bg-[#0a0a0a] border border-white/10 opacity-70"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-red-500" />
                <span>ধাপ ৩: আপনার অ্যাক্টিভেটেড লাইসেন্স কী (License Key)</span>
              </span>
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black">
                {hwidBoundStatus?.bound ? "● Locked to your PC" : "Locked until HWID"}
              </span>
            </div>

            {hwidBoundStatus?.bound ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#111111] border border-yellow-400/50">
                  <span className="font-mono text-base sm:text-xl font-black text-yellow-400 break-all select-all">
                    {generatedLicense || activeOrder?.licenseKey || "TBD-OTP-30D-88AF-901B-4E11"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedLicense || activeOrder?.licenseKey || "");
                      setCopiedKey(true);
                      triggerConfetti();
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center gap-1.5 shrink-0 transition-all shadow-neon-yellow"
                  >
                    {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey ? "কপি হয়েছে!" : "কপি করুন"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium">
                  ✓ সফটওয়্যারে গিয়ে এই লাইসেন্স কী পেস্ট করে <strong>&quot;LOGIN &amp; ACTIVATE AUTO TOOL&quot;</strong> বাটনে চাপলেই টুল ফুল ওপেন হয়ে যাবে।
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-slate-400 text-xs flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <span>
                  লাইসেন্স কী দেখতে প্রথমে ওপরের <strong>ধাপ ২</strong>-এ আপনার টুলের Machine HWID দিন। HWID সাবমিট করার সাথে সাথেই আপনার এক্সক্লুসিভ লাইসেন্স কী এখানে আনলক হবে।
                </span>
              </div>
            )}
          </div>

          {/* Quick Action Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/dashboard"
              className="py-3.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-sm flex items-center justify-center gap-2 shadow-neon-yellow transition-all"
            >
              <span>আমার ড্যাশবোর্ডে যান (My Account)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={settings.telegramGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-neon-red transition-all"
            >
              <Send className="w-4 h-4" />
              <span>অফিসিয়াল টেলিগ্রাম সাপোর্ট</span>
            </a>
          </div>

        </div>
      )}

    </div>
  );
}
