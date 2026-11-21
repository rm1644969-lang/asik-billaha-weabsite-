"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useNexusStore } from "@/lib/store";
import { Tool, PricePlan, Order } from "@/lib/types";
import { webDb } from "@/lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Download, 
  RotateCcw, 
  Wallet, 
  Play, 
  Clock, 
  ExternalLink,
  MessageCircle,
  HelpCircle
} from "lucide-react";
import { playChimeSound, showBrowserNotification } from "@/lib/notifications";
import { normalizeYouTubeEmbedUrl } from "@/lib/youtube";

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={
      <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-yellow-400">চেকআউট পেজ লোড হচ্ছে...</span>
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
    currentUser, 
    isLoggedIn, 
    registerUser, 
    purchaseOfferWithWallet, 
    createOrder, 
    submitOrderPayment, 
  } = useNexusStore();

  const toolParam = searchParams.get("tool");
  const planParam = searchParams.get("plan");

  const [selectedTool, setSelectedTool] = useState<Tool>(tools[0] || {
    id: "tool-otp",
    name: "TikTok OTP Resender Pro",
    slug: "tiktok-otp-resender-pro",
    description: "স্বয়ংক্রিয় ও দ্রুত ওটিপি রিসেন্ডার টুল।",
    version: "v3.0",
    category: "Utility",
    downloadFileName: "TikTok_OTP_Resender_Pro.zip",
    downloadFilePath: "/releases/Setup.zip",
    fileSize: "28.5 MB",
    systemRequirements: { os: "Windows 10/11", ram: "4 GB", disk: "100 MB" },
    features: ["স্বয়ংক্রিয় OTP বাইপাস", "অটো পিসি বাইন্ডিং", "লাইফটাইম আপডেট"],
    isPopular: true,
    enabled: true,
    setupVideoUrl: "https://www.youtube.com/embed/U2JBcFAO7mE",
    rating: 5,
    totalUsers: 1200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [selectedPlan, setSelectedPlan] = useState<PricePlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bKash" | "Nagad" | "Rocket" | "Wallet">("bKash");
  
  // Checkout view states: 'form', 'pending', or 'success'
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
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Auto-load remembered email
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("toolsbd_customer_email");
      if (saved && !customerEmail) {
        setCustomerEmail(saved);
      }
    }
  }, []);

  // Sync tool from URL params
  useEffect(() => {
    if (toolParam && tools.length > 0) {
      const foundTool = tools.find(t => t.id === toolParam || t.slug === toolParam);
      if (foundTool) setSelectedTool(foundTool);
    }
  }, [toolParam, tools]);

  // Sync plan from URL params
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

  // Real-time Firestore auto-listener for pending orders
  useEffect(() => {
    if (!activeOrder?.id || !isPending) return;

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
            showBrowserNotification("পেমেন্ট সফল হয়েছে!", {
              body: "আপনার লাইসেন্স কী ও ডাউনলোড লিঙ্ক প্রস্তুত!"
            });
            triggerConfetti();
          }
        }
      });
    } catch (e) {
      console.warn("Firestore snapshot notice:", e);
    }

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
            showBrowserNotification("পেমেন্ট সফল হয়েছে!", {
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

  const triggerConfetti = () => {
    if (typeof window !== "undefined") {
      import("canvas-confetti").then((module) => {
        const confetti = module.default;
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FACC15", "#10B981", "#FFFFFF"],
        });
      }).catch(() => {});
    }
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ""));
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handlePasteTrxId = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const clean = text.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
          setTrxId(clean || text.trim().toUpperCase());
        }
      }
    } catch {
      // Ignored
    }
  };

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
          setErrorMsg("অর্ডারটি এখনো যাচাই করা হচ্ছে। অনুগ্রহ করে আর কিছুক্ষণ অপেক্ষা করুন।");
          setTimeout(() => setErrorMsg(null), 4000);
        }
      }
    } catch (e) {
      // Ignored
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Wallet Purchase
  const handleWalletPurchase = async () => {
    if (!selectedPlan) return;
    setErrorMsg(null);

    if (!isLoggedIn) {
      if (!customerEmail.trim() || !customerEmail.includes("@")) {
        setErrorMsg("দয়া করে আপনার ইমেইল এড্রেসটি লিখুন যাতে লাইসেন্স সেভ থাকে।");
        return;
      }
      registerUser(customerEmail.split("@")[0], customerEmail, "123456");
    }

    if (walletBalanceUSD < selectedPlan.priceUSD) {
      setErrorMsg(`আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই (বর্তমান ব্যালেন্স: $${walletBalanceUSD.toFixed(2)})। বিকাশ বা নগদ দিয়ে পেমেন্ট করুন।`);
      return;
    }

    setIsSubmitting(true);
    const res = await purchaseOfferWithWallet(selectedTool, selectedPlan);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "ওয়ালেট থেকে পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে।");
      return;
    }

    triggerConfetti();
    if (res.order) setActiveOrder(res.order);
    if (res.license) setGeneratedLicense(res.license.key);
    setIsSuccess(true);
  };

  // Manual Gateway Payment Submit (bKash / Nagad / Rocket)
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setErrorMsg(null);

    const emailToUse = customerEmail.trim() || currentUser?.email || "";
    if (!emailToUse || !emailToUse.includes("@")) {
      setErrorMsg("দয়া করে একটি সঠিক ইমেইল এড্রেস লিখুন।");
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("toolsbd_customer_email", emailToUse);
    }

    if (!trxId.trim()) {
      setErrorMsg("টাকা পাঠানোর পর মেসেজে প্রাপ্ত Transaction ID (TrxID) লিখুন।");
      return;
    }

    if (!isLoggedIn) {
      await registerUser(emailToUse.split("@")[0], emailToUse, "123456");
    }

    setIsSubmitting(true);

    const order = createOrder(selectedTool, selectedPlan, paymentMethod as "bKash" | "Nagad" | "Rocket");
    setActiveOrder(order);

    setTimeout(() => {
      const result = submitOrderPayment(order.id, trxId.trim().toUpperCase(), senderNumber.trim() || "01967922602");
      setIsSubmitting(false);

      if (result.autoVerified) {
        setGeneratedLicense(result.key || null);
        triggerConfetti();
        setIsSuccess(true);
      } else {
        setIsPending(true);
      }
    }, 1200);
  };

  const currentPaymentNumber = paymentMethod === "bKash" 
    ? settings.bkashMerchantNumber 
    : paymentMethod === "Nagad"
    ? (settings.nagadMerchantNumber || "01967922602")
    : settings.rocketMerchantNumber;

  const currentPaymentColor = paymentMethod === "bKash" 
    ? "text-[#E2136E]" 
    : paymentMethod === "Nagad"
    ? "text-[#F7941D]"
    : "text-[#A855F7]";

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {isSuccess 
            ? "পেমেন্ট সফল হয়েছে" 
            : isPending 
            ? "পেমেন্ট যাচাই করা হচ্ছে" 
            : "চেকআউট ও পেমেন্ট"}
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          {isSuccess 
            ? "আপনার লাইসেন্স কী ও ডাউনলোড ফাইল নিচে দেওয়া হলো।" 
            : isPending 
            ? "আপনার পেমেন্ট তথ্য জমা হয়েছে। যাচাই হওয়ামাত্রই লাইসেন্স প্রদান করা হবে।" 
            : "প্যাকেজ নির্বাচন করুন এবং বিকাশ, নগদ বা রকেটে পেমেন্ট করুন।"}
        </p>
      </div>

      {/* VIEW 1: CLEAN MODERN CHECKOUT FORM */}
      {!isSuccess && !isPending && selectedPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Order Summary & Package Selection */}
          <div className="lg:col-span-5 rounded-2xl bg-[#0f1219] border border-slate-800 p-5 sm:p-6 space-y-5">
            <div>
              <span className="text-[11px] font-semibold text-yellow-400 uppercase tracking-wider block mb-1">
                নির্বাচিত টুল
              </span>
              <h2 className="text-lg font-bold text-white">
                {selectedTool.name}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {selectedTool.description}
              </p>
            </div>

            {/* Package selector */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">
                প্যাকেজ নির্বাচন করুন:
              </label>

              <div className="space-y-2">
                {plans.filter(p => p.toolId === selectedTool.id && p.enabled).map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-yellow-400/10 border-yellow-400 text-white shadow-sm"
                          : "bg-[#141824] border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm block text-white">
                          {plan.durationDays} দিনের লাইসেন্স
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {plan.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-base block text-yellow-400">
                          ৳{plan.priceBDT}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ${plan.priceUSD} USD
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* What is included */}
            <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 space-y-2 text-xs text-slate-300">
              <span className="font-semibold text-white block text-xs">
                প্যাকেজের সাথে যা পাচ্ছেন:
              </span>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>তাত্ক্ষণিক লাইসেন্স কী (পিসির সাথে অটো-লক)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>সফটওয়্যার সরাসরি ডাউনলোড ফাইল (.zip)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>ভিডিও সেটআপ ও ইনস্টলেশন গাইড</span>
                </li>
              </ul>
            </div>

            {/* Total payable amount */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">মোট প্রদেয় মূল্য:</span>
                <span className="text-xs text-slate-500 font-mono">(${selectedPlan.priceUSD} USD)</span>
              </div>
              <span className="text-2xl font-black text-yellow-400">
                ৳{selectedPlan.priceBDT} <span className="text-xs font-normal text-slate-300">BDT</span>
              </span>
            </div>
          </div>

          {/* Right Column: Payment Methods & Inputs */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0f1219] border border-slate-800 p-5 sm:p-6 space-y-6">
            
            {/* Step 1: Payment Method */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                ১. পেমেন্ট মাধ্যম বেছে নিন:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bKash")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === "bKash"
                      ? "bg-[#E2136E]/20 border-[#E2136E] text-white shadow-sm ring-1 ring-[#E2136E]"
                      : "bg-[#141824] border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <span className="font-bold text-sm block text-[#E2136E]">বিকাশ</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Send Money</span>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Nagad")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === "Nagad"
                      ? "bg-[#F7941D]/20 border-[#F7941D] text-white shadow-sm ring-1 ring-[#F7941D]"
                      : "bg-[#141824] border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <span className="font-bold text-sm block text-[#F7941D]">নগদ</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Send Money</span>
                </button>

                {/* Rocket */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Rocket")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === "Rocket"
                      ? "bg-[#8C3494]/25 border-[#8C3494] text-white shadow-sm ring-1 ring-[#8C3494]"
                      : "bg-[#141824] border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <span className="font-bold text-sm block text-purple-400">রকেট</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Send Money</span>
                </button>

                {/* Wallet */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Wallet")}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === "Wallet"
                      ? "bg-yellow-400/20 border-yellow-400 text-white shadow-sm ring-1 ring-yellow-400"
                      : "bg-[#141824] border-slate-800 hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <span className="font-bold text-sm block text-yellow-400">ওয়ালেট</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">${walletBalanceUSD.toFixed(2)}</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/80 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 2A: Wallet Direct Purchase */}
            {paymentMethod === "Wallet" && (
              <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">আপনার বর্তমান ওয়ালেট ব্যালেন্স:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">${walletBalanceUSD.toFixed(2)} USD</span>
                </div>

                {!isLoggedIn && (
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      আপনার ইমেইল (লাইসেন্স সেভ থাকবে):
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full p-3 rounded-xl bg-black border border-slate-700 text-sm text-white"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleWalletPurchase}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold text-black bg-yellow-400 hover:bg-yellow-300 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin text-black" />
                      <span>প্রসেসিং হচ্ছে...</span>
                    </>
                  ) : (
                    <span>ওয়ালেট থেকে কিনুন (${selectedPlan.priceUSD} USD)</span>
                  )}
                </button>
              </div>
            )}

            {/* Step 2B: bKash / Nagad / Rocket Payment Flow */}
            {(paymentMethod === "bKash" || paymentMethod === "Nagad" || paymentMethod === "Rocket") && (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                
                {/* Payment Instructions Box */}
                <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">
                      {paymentMethod} অ্যাপ থেকে <strong>Send Money</strong> করুন:
                    </span>
                    <span className="text-xs font-bold text-yellow-400">
                      পরিমাণ: ৳{selectedPlan.priceBDT}
                    </span>
                  </div>

                  {/* Clean Copyable Phone Number */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black border border-slate-700">
                    <span className="font-mono text-lg font-bold text-white tracking-wider select-all">
                      {currentPaymentNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(currentPaymentNumber)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedNumber ? "কপি হয়েছে" : "কপি"}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    টাকা পাঠানোর পর বিকাশ/নগদ/রকেট থেকে যে ফিরতি এসএমএস পাবেন, সেখান থেকে <strong>Transaction ID (TrxID)</strong> কপি করে নিচের বক্সে দিন।
                  </p>
                </div>

                {/* Form Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      ১. আপনার ইমেইল এড্রেস:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="example@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full p-3 rounded-xl bg-black border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        ২. ট্রানজেকশন আইডি (TrxID):
                      </label>
                      <button
                        type="button"
                        onClick={handlePasteTrxId}
                        className="text-[11px] text-yellow-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>ক্লিপবোর্ড থেকে পেস্ট</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: BK928471 বা 9J4K8L2M1P"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="w-full p-3 rounded-xl bg-black border border-slate-700 font-mono uppercase text-sm text-yellow-400 font-bold placeholder:text-slate-500 focus:border-yellow-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-black bg-yellow-400 hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin text-black" />
                      <span>যাচাই করা হচ্ছে...</span>
                    </>
                  ) : (
                    <span>পেমেন্ট নিশ্চিত করুন</span>
                  )}
                </button>

                {/* Support Note */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>নিরাপদ ও তাৎক্ষণিক ভেরিফিকেশন</span>
                  </span>
                  <a
                    href={settings.telegramGroupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-yellow-400 text-[11px] flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>সাহায্য প্রয়োজন?</span>
                  </a>
                </div>

              </form>
            )}

          </div>

        </div>
      )}

      {/* VIEW 2: PENDING VERIFICATION SCREEN */}
      {isPending && activeOrder && (
        <div className="max-w-xl mx-auto rounded-2xl bg-[#0f1219] border border-slate-800 p-6 sm:p-8 space-y-6 text-center">
          
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7 animate-pulse text-amber-400" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              পেমেন্ট যাচাই করা হচ্ছে
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              আপনার {paymentMethod} TrxID (<strong className="text-white font-mono">{trxId.trim().toUpperCase()}</strong>) সফলভাবে জমা হয়েছে।
            </p>
          </div>

          {/* Clean Order Details Box */}
          <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 text-xs text-left space-y-2.5 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>অর্ডার নম্বর:</span>
              <strong className="text-white">{activeOrder.orderNumber}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>টুল ও মেয়াদ:</span>
              <strong className="text-white">{selectedTool.name} ({selectedPlan?.durationDays} দিন)</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>মূল্য:</span>
              <strong className="text-emerald-400">৳{selectedPlan?.priceBDT} BDT</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>TrxID:</span>
              <strong className="text-yellow-400 uppercase">{trxId.trim().toUpperCase()}</strong>
            </div>
            <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
              <span>বর্তমান অবস্থা:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>যাচাই চলছে (Pending)</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            সাধারণত ১ থেকে ২ মিনিটের মধ্যে এটি নিশ্চিত হয়ে যায়। পেমেন্ট কনফার্ম হওয়ামাত্রই এই স্ক্রিনে স্বয়ংক্রিয়ভাবে লাইসেন্স কী ও ডাউনলোড ফাইল উন্মুক্ত হবে।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              onClick={handleManualCheckOrder}
              disabled={isCheckingStatus}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isCheckingStatus ? "animate-spin text-yellow-400" : ""}`} />
              <span>{isCheckingStatus ? "চেক হচ্ছে..." : "স্ট্যাটাস চেক করুন"}</span>
            </button>

            <Link
              href="/dashboard"
              className="py-2.5 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>ড্যাশবোর্ডে যান</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href={settings.telegramGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 text-slate-300" />
              <span>সাপোর্ট</span>
            </a>
          </div>

        </div>
      )}

      {/* VIEW 3: INSTANT SUCCESS SCREEN */}
      {isSuccess && (
        <div className="max-w-xl mx-auto rounded-2xl bg-[#0f1219] border border-slate-800 p-6 sm:p-8 space-y-6 text-center">
          
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              পেমেন্ট সফল হয়েছে!
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              <strong className="text-white">{selectedTool.name}</strong> ({selectedPlan?.durationDays || 7} দিন) এর লাইসেন্স তৈরি হয়েছে।
            </p>
          </div>

          {/* License Key Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#141824] border border-slate-700 text-left space-y-2">
            <span className="text-xs font-semibold text-yellow-400 block">
              আপনার লাইসেন্স কী (License Key):
            </span>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-black border border-slate-800">
              <span className="font-mono text-sm sm:text-base font-bold text-yellow-400 break-all select-all">
                {generatedLicense || activeOrder?.licenseKey || "AT-82K1-99FA-310B-7CE9"}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedLicense || activeOrder?.licenseKey || "");
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? "কপি হয়েছে" : "কপি করুন"}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              💡 <strong>সহজ নিয়ম:</strong> টুলটি ডাউনলোড করে ওপেন করুন এবং লাইসেন্স কী দিন — এটি স্বয়ংক্রিয়ভাবে আপনার পিসির সাথে যুক্ত (Auto-Bind) হয়ে যাবে।
            </p>
          </div>

          {/* Software Download Button */}
          <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">টুল ডাউনলোড ফাইল:</span>
              <span className="text-slate-400 font-mono">{selectedTool.fileSize || "28.5 MB"}</span>
            </div>

            <a
              href={selectedTool.downloadFilePath || "/releases/Setup.zip"}
              download
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-black" />
              <span>সফটওয়্যার ডাউনলোড করুন ({selectedTool.downloadFileName || "Fast_OTP_v3.0_Pro_Setup.zip"})</span>
            </a>
          </div>

          {/* Video Setup Guide */}
          {selectedTool.setupVideoUrl && (
            <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 text-left space-y-2">
              <span className="text-xs font-semibold text-white block">
                সেটআপ ভিডিও নির্দেশিকা:
              </span>
              <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={normalizeYouTubeEmbedUrl(selectedTool.setupVideoUrl)}
                  title={`${selectedTool.name} Setup Video Guide`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/dashboard"
              className="py-3 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>আমার ড্যাশবোর্ডে যান</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href={settings.telegramGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>টেলিগ্রাম সাপোর্ট</span>
            </a>
          </div>

        </div>
      )}

    </div>
  );
}
