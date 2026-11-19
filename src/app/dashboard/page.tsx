"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useNexusStore } from "@/lib/store";
import { webDb } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { 
  User, 
  Key, 
  Download, 
  CreditCard, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Check, 
  Wallet, 
  PlusCircle, 
  Cpu, 
  Flame, 
  Sparkles, 
  AlertCircle, 
  Database,
  Play,
  ArrowRight,
  ShieldCheck,
  Zap,
  HardDrive
} from "lucide-react";
import { normalizeYouTubeEmbedUrl } from "@/lib/youtube";

export default function UserDashboardPage() {
  const { 
    licenses, 
    orders, 
    tools, 
    plans,
    settings,
    walletBalanceUSD,
    deposits,
    firebaseProjectId,
    currentUser,
    isLoggedIn,
    loginUser,
    registerUser,
    logoutUser,
    submitWalletDeposit,
    purchaseOfferWithWallet,
    bindHwidToLicense,
    saveWalletBalance
  } = useNexusStore();

  const [activeTab, setActiveTab] = useState<"wallet" | "licenses" | "downloads" | "orders">("wallet");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedNum, setCopiedNum] = useState<string | null>(null);
  const [bannerMsg, setBannerMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auth fields if not signed in
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Add Money form state
  const [depositAmountUSD, setDepositAmountUSD] = useState<number>(2);
  const [depositMethod, setDepositMethod] = useState<"bKash" | "Rocket">("bKash");
  const [depositSender, setDepositSender] = useState("");
  const [depositTrxId, setDepositTrxId] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  // HWID input map per license
  const [hwidInputs, setHwidInputs] = useState<Record<string, string>>({});
  const [bindingId, setBindingId] = useState<string | null>(null);
  const [buyingPlanId, setBuyingPlanId] = useState<string | null>(null);
  const [openVideoModal, setOpenVideoModal] = useState<string | null>(null);

  // Real-time Firestore sync
  const [firestoreOrders, setFirestoreOrders] = useState<any[]>([]);
  const [firestoreDeposits, setFirestoreDeposits] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser?.email) return;

    let unsubOrders: (() => void) | undefined;
    try {
      const q = query(collection(webDb, "orders"), where("userEmail", "==", currentUser.email));
      unsubOrders = onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setFirestoreOrders(list);
      });
    } catch (e) {
      console.warn("Orders listener notice:", e);
    }

    let unsubDeposits: (() => void) | undefined;
    try {
      const qDep = query(collection(webDb, "wallet_deposits"), where("userEmail", "==", currentUser.email));
      unsubDeposits = onSnapshot(qDep, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setFirestoreDeposits(list);
      });
    } catch (e) {
      console.warn("Deposits listener notice:", e);
    }

    // 3. Listen to real-time wallet balance changes
    let unsubUser: (() => void) | undefined;
    try {
      unsubUser = onSnapshot(doc(webDb, "users", currentUser.email.toLowerCase()), (snap) => {
        if (snap.exists()) {
          const u = snap.data();
          if (typeof u.walletBalanceUSD === "number") {
            saveWalletBalance(u.walletBalanceUSD);
          }
        }
      });
    } catch (e) {
      console.warn("User balance listener notice:", e);
    }

    return () => {
      if (unsubOrders) unsubOrders();
      if (unsubDeposits) unsubDeposits();
      if (unsubUser) unsubUser();
    };
  }, [currentUser?.email]);

  const userLicenses = currentUser 
    ? licenses.filter(l => l.userId === currentUser.id || l.userEmail === currentUser.email)
    : [];
  const userOrders = firestoreOrders.length > 0 
    ? firestoreOrders 
    : (currentUser ? orders.filter(o => o.userId === currentUser.id || o.userEmail === currentUser.email) : []);
  const activeDeposits = firestoreDeposits.length > 0 ? firestoreDeposits : deposits;

  // Merge direct licenses with any paid/approved orders having a licenseKey
  const paidOrdersWithLicense = userOrders.filter(o => (o.status === "PAID" || o.status === "APPROVED") && o.licenseKey);
  const allActiveLicenses = [...userLicenses];
  for (const ord of paidOrdersWithLicense) {
    if (!allActiveLicenses.some(l => l.key === ord.licenseKey || l.orderId === ord.id)) {
      const expires = new Date();
      expires.setDate(expires.getDate() + (ord.planDuration || 7));
      allActiveLicenses.push({
        id: `lic-${ord.id}`,
        key: ord.licenseKey,
        keyHash: `hash_${ord.licenseKey}`,
        toolId: ord.toolId,
        toolName: ord.toolName,
        userId: ord.userId,
        userEmail: ord.userEmail,
        orderId: ord.id,
        durationDays: ord.planDuration || 7,
        status: "ACTIVE",
        hwid: undefined,
        hwidResetCount: 0,
        maxDevices: 1,
        activationsCount: 0,
        createdAt: ord.createdAt,
        expiresAt: expires.toISOString()
      });
    }
  }

  const activePlans = plans.filter(p => p.enabled);
  const flagshipTool = tools[0];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authEmail.trim() || !authEmail.includes("@")) {
      setAuthError("Please enter a valid Gmail address.");
      return;
    }
    if (!authPassword || authPassword.length < 4) {
      setAuthError("Password must be at least 4 characters.");
      return;
    }
    const res = await registerUser(authName || authEmail.split("@")[0], authEmail, authPassword);
    if (!res.success) {
      setAuthError(res.error || "Authentication failed.");
    }
  };

  const showBanner = (type: "success" | "error", text: string) => {
    setBannerMsg({ type, text });
    setTimeout(() => setBannerMsg(null), 5500);
  };

  const triggerConfetti = () => {
    if (typeof window !== "undefined") {
      import("canvas-confetti").then((module) => {
        const confetti = module.default;
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FACC15", "#EF4444", "#FFFFFF"],
        });
      }).catch(() => {});
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    triggerConfetti();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyPaymentNum = (num: string, label: string) => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ""));
    setCopiedNum(label);
    setTimeout(() => setCopiedNum(null), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sender = depositSender.trim();
    const trx = depositTrxId.trim().toUpperCase();

    if (!sender || !trx) {
      showBanner("error", "দয়া করে সেন্ডার নম্বর এবং বিকাশ/রকেট TrxID লিখুন।");
      return;
    }

    setIsDepositing(true);
    const res = await submitWalletDeposit(depositAmountUSD, depositMethod, sender, trx, false);
    setIsDepositing(false);
    setDepositSender("");
    setDepositTrxId("");

    showBanner(
      "success",
      `ডিপোজিট রিকোয়েস্ট (${trx}) $${depositAmountUSD}-এর জন্য জমা হয়েছে! অ্যাডমিন প্যানেল থেকে ভেরিফাই করলেই আপনার প্রোফাইল ব্যালেন্সে যুক্ত হবে।`
    );
  };

  const handleBuyWithWallet = async (planId: string) => {
    const plan = activePlans.find(p => p.id === planId);
    if (!plan || !flagshipTool) return;

    setBuyingPlanId(planId);
    const res = await purchaseOfferWithWallet(flagshipTool, plan);
    setBuyingPlanId(null);

    if (!res.success) {
      showBanner("error", res.error || "Could not complete purchase.");
      return;
    }

    triggerConfetti();
    showBanner(
      "success",
      `Offer purchased successfully! Key: ${res.license?.key}. Download the tool below and enter your PC HWID to activate.`
    );
    setActiveTab("licenses");
  };

  const handleBindHwid = async (licenseId: string) => {
    const val = hwidInputs[licenseId]?.trim();
    if (!val) {
      showBanner("error", "Please paste your PC HWID from the downloaded tool first.");
      return;
    }
    setBindingId(licenseId);
    const res = await bindHwidToLicense(licenseId, val);
    setBindingId(null);

    if (res.success) {
      triggerConfetti();
      showBanner(
        "success",
        `HWID successfully activated for license key: ${res.license?.key}. Software is now unlocked on this PC!`
      );
      setHwidInputs(prev => ({ ...prev, [licenseId]: "" }));
    } else {
      showBanner("error", res.error || "Failed to bind HWID.");
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* If Guest: Login / Register Form */}
      {!isLoggedIn || !currentUser ? (
        <div className="rounded-3xl p-6 sm:p-8 bg-[#0c0c0c] border border-yellow-400/40 shadow-neon-yellow space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <User className="w-5 h-5 text-yellow-400" />
                <span>Sign In or Register with Gmail</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Sign in with your Gmail to save wallet balance, purchase software offers, and unlock HWID license keys.
              </p>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-yellow-400 text-xs font-bold self-start sm:self-auto"
            >
              Sign In Existing Account &rarr;
            </Link>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-white text-xs font-bold">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Your Full Name</label>
              <input
                type="text"
                placeholder="e.g. Asik Billah"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 font-bold block mb-1">Your Gmail Address</label>
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 font-bold block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Minimum 4 characters"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-white"
              />
            </div>
            <div className="sm:col-span-3 pt-1">
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-neon-yellow transition-all"
              >
                Sign In / Register Account
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Welcome & Wallet Balance Banner */
        <div className="relative rounded-3xl p-[1px] bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-600 shadow-neon-yellow overflow-hidden">
          <div className="rounded-3xl bg-[#0c0c0c]/95 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 backdrop-blur-xl border border-white/10">
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-red-600 p-[2px] shadow-neon-yellow shrink-0">
                <div className="w-full h-full bg-[#111] rounded-[14px] flex items-center justify-center">
                  <User className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-white">
                    Welcome, {currentUser.name}
                  </h1>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-400 text-black shadow-neon-yellow">
                    Toolsbd.com
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>Firebase: {firebaseProjectId}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-medium">
                  {currentUser.email} &bull; Add Money &rarr; Buy Offer &rarr; Download Tool &rarr; Enter HWID for Key
                </p>
              </div>
            </div>

            {/* Wallet Balance Box */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="px-5 py-3 rounded-2xl bg-black border border-yellow-400/50 shadow-neon-yellow flex items-center gap-3">
                <div className="p-2 rounded-xl bg-yellow-400/15 text-yellow-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Profile Balance
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-yellow-400">
                      ${walletBalanceUSD.toFixed(2)}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      (৳{(walletBalanceUSD * 120).toLocaleString()})
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("wallet")}
                className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-neon-red transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Money</span>
              </button>

              <button
                onClick={logoutUser}
                className="px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Alert Banner */}
      {bannerMsg && (
        <div className={`p-4 rounded-2xl text-xs font-black flex items-center gap-2.5 shadow-lg ${
          bannerMsg.type === "success"
            ? "bg-yellow-400 text-black shadow-neon-yellow"
            : "bg-red-950 border border-red-500 text-white shadow-neon-red"
        }`}>
          {bannerMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-yellow-400" />
          )}
          <span>{bannerMsg.text}</span>
        </div>
      )}

      {/* Dashboard Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("wallet")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "wallet"
              ? "bg-yellow-400 text-black shadow-neon-yellow"
              : "text-slate-300 hover:text-white bg-surface-card"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Add Money & Buy Offer</span>
        </button>

        <button
          onClick={() => setActiveTab("licenses")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "licenses"
              ? "bg-yellow-400 text-black shadow-neon-yellow"
              : "text-slate-300 hover:text-white bg-surface-card"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>My Licenses & HWID Key ({userLicenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("downloads")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "downloads"
              ? "bg-yellow-400 text-black shadow-neon-yellow"
              : "text-slate-300 hover:text-white bg-surface-card"
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Download Tool</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeTab === "orders"
              ? "bg-yellow-400 text-black shadow-neon-yellow"
              : "text-slate-300 hover:text-white bg-surface-card"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>History ({userOrders.length + deposits.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ADD MONEY + INSTANT BUY OFFER WITH WALLET               */}
      {/* ============================================================== */}
      {activeTab === "wallet" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Add Money via bKash / Rocket */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-yellow-400" />
                  <span>Step 1: Add Money to Wallet</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Send money via bKash or Rocket Personal and submit TrxID.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-yellow-400/15 text-yellow-400 border border-yellow-400/30">
                $1 = ৳120 BDT
              </span>
            </div>

            {/* Official Payment Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                depositMethod === "bKash" ? "bg-[#D12053]/20 border-[#D12053]" : "bg-black border-white/10"
              }`} onClick={() => setDepositMethod("bKash")}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-white">bKash Personal</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyPaymentNum(settings.bkashMerchantNumber, "bkash");
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-yellow-400 text-black font-black"
                  >
                    {copiedNum === "bkash" ? "Copied" : "Copy"}
                  </button>
                </div>
                <span className="font-mono text-base font-black text-yellow-400">
                  {settings.bkashMerchantNumber}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                depositMethod === "Rocket" ? "bg-[#8C3494]/25 border-[#8C3494]" : "bg-black border-white/10"
              }`} onClick={() => setDepositMethod("Rocket")}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-white">Rocket Personal</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyPaymentNum(settings.rocketMerchantNumber, "rocket");
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-black"
                  >
                    {copiedNum === "rocket" ? "Copied" : "Copy"}
                  </button>
                </div>
                <span className="font-mono text-base font-black text-yellow-400">
                  {settings.rocketMerchantNumber}
                </span>
              </div>
            </div>

            {/* Quick Amount Pills */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-300 block">
                Select Deposit Amount (USD / BDT)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 4, 8, 15].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmountUSD(amt)}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                      depositAmountUSD === amt
                        ? "bg-yellow-400 text-black border-yellow-400 shadow-neon-yellow"
                        : "bg-black text-white border-white/10 hover:border-white/30"
                    }`}
                  >
                    ${amt}
                    <span className={`block text-[10px] font-mono ${depositAmountUSD === amt ? "text-black/80" : "text-slate-400"}`}>
                      ৳{amt * 120}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Sender Mobile Number</label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={depositSender}
                  onChange={(e) => setDepositSender(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input font-mono text-white"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">{depositMethod} Transaction ID (TrxID)</label>
                <input
                  type="text"
                  placeholder="e.g. BK992A81KC"
                  value={depositTrxId}
                  onChange={(e) => setDepositTrxId(e.target.value)}
                  className="w-full p-3 rounded-xl glass-input font-mono uppercase text-yellow-400 font-bold"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:opacity-95 text-black font-black text-sm shadow-neon-yellow transition-all"
                >
                  {isDepositing ? "জমা হচ্ছে..." : `টাকা জমা দিন — Submit Add Money (৳${depositAmountUSD * 120})`}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Buy TOOLS OFFER PRICE Using Wallet Balance */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-yellow-400/30">
            <div className="pb-3 border-b border-white/10">
              <span className="text-[11px] font-black uppercase tracking-widest text-red-500">
                Instant Activation from Wallet
              </span>
              <h2 className="text-2xl font-black text-white mt-0.5">
                Step 2: Buy TOOLS OFFER PRICE 🔊
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Buy with 1 click using your Wallet Balance &rarr; Download Tool &rarr; Enter HWID to lock &amp; claim your key in Firebase!
              </p>
            </div>

            <div className="space-y-4">
              {activePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    plan.isPopular
                      ? "bg-yellow-400/10 border-yellow-400 shadow-neon-yellow"
                      : "bg-black/80 border-white/15 hover:border-white/30"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white">
                        {plan.durationDays} DAYS OFFER 🔥
                      </span>
                      {plan.isPopular && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {flagshipTool?.name} &bull; Single HWID Lock &bull; Firebase Sync
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-2xl font-black text-yellow-400 block leading-none">
                        ${plan.priceUSD}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ৳{plan.priceBDT} BDT
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={buyingPlanId === plan.id}
                      onClick={() => handleBuyWithWallet(plan.id)}
                      className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black shadow-neon-yellow transition-all shrink-0"
                    >
                      {buyingPlanId === plan.id ? "Processing..." : `Buy Now ($${plan.priceUSD})`}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[#111] border border-white/10 text-xs text-slate-300 space-y-1.5">
              <p className="font-black text-yellow-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-red-500" />
                <span>How HWID Key Generation Works:</span>
              </p>
              <p>1. Add Money via bKash/Rocket &amp; buy the 7, 15, or 30 Days offer above.</p>
              <p>2. Download the tool and open it on your PC to see your Hardware ID (HWID).</p>
              <p>3. Go to <strong>My Licenses &amp; HWID Key</strong>, paste your HWID, and click <strong>Bind HWID</strong> — your key activates instantly in Firebase!</p>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MY LICENSES & HWID KEY BINDING (FIREBASE SYNC)          */}
      {/* ============================================================== */}
      {activeTab === "licenses" && (
        <div className="space-y-6">
          {userLicenses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userLicenses.map((lic) => {
                const expiresDate = new Date(lic.expiresAt);
                const isExpired = expiresDate.getTime() < Date.now();
                const daysRemaining = Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                return (
                  <div
                    key={lic.id}
                    className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5 border border-white/10 hover:border-yellow-400/50 transition-all shadow-xl"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <span className="text-xs font-black text-yellow-400 uppercase tracking-wider">
                          {lic.toolName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            lic.status === "ACTIVE" && !isExpired
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                              : "bg-red-950 text-red-400 border border-red-500/40"
                          }`}>
                            {isExpired ? "EXPIRED" : lic.status}
                          </span>
                          <span className="text-xs text-slate-300 font-mono font-bold">
                            {lic.durationDays} Days Offer
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block font-medium">Remaining:</span>
                        <span className="text-lg font-black text-yellow-400">
                          {daysRemaining} Days
                        </span>
                      </div>
                    </div>

                    {/* Key Box */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                        Your License Key:
                      </span>
                      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black border border-white/15">
                        <span className="font-mono text-sm font-black text-yellow-400 break-all select-all">
                          {lic.key}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(lic.key, lic.id)}
                          className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center gap-1 shrink-0 transition-colors shadow-neon-yellow"
                        >
                          {copiedKey === lic.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === lic.id ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>

                    {/* HWID Binding / Claim Box */}
                    <div className="p-4 rounded-2xl bg-[#090909] border border-yellow-400/30 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 font-black flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-red-500" />
                          <span>HWID Hardware Binding (Firebase Sync)</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Resets: {lic.hwidResetCount} / 1
                        </span>
                      </div>

                      {lic.hwid ? (
                        <>
                          <div className="font-mono text-[11px] text-emerald-400 break-all p-2.5 rounded-lg bg-black border border-emerald-500/30">
                            BOUND HWID: {lic.hwid} (Permanently locked to this PC)
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-400">
                              Expires: {expiresDate.toLocaleDateString()}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">
                              ● Permanent Machine License Active
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2.5">
                          <p className="text-[11px] text-slate-300">
                            Download the tool first, copy your PC&apos;s HWID, and paste it below to activate your key in Firebase:
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              placeholder="Paste your PC HWID (e.g. BFEBFBFF-000906EA)"
                              value={hwidInputs[lic.id] || ""}
                              onChange={(e) => setHwidInputs(prev => ({ ...prev, [lic.id]: e.target.value }))}
                              className="flex-1 p-2.5 rounded-xl glass-input font-mono text-xs text-white"
                            />
                            <button
                              type="button"
                              disabled={bindingId === lic.id}
                              onClick={() => handleBindHwid(lic.id)}
                              className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-neon-yellow shrink-0 transition-all"
                            >
                              {bindingId === lic.id ? "Syncing..." : "Bind HWID & Activate"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Direct Download Button on Card */}
                    {flagshipTool && (
                      <a
                        href={flagshipTool.downloadFilePath}
                        download
                        className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Download className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Download {flagshipTool.name} ({flagshipTool.fileSize})</span>
                      </a>
                    )}

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl glass-panel border border-white/10 space-y-4">
              <Key className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No active licenses yet</h3>
              <p className="text-xs text-slate-400">
                Add money to your wallet and purchase the 7-Day ($2), 15-Day ($4), or 30-Day ($8) offer to unlock your key!
              </p>
              <button
                onClick={() => setActiveTab("wallet")}
                className="inline-block px-5 py-2.5 rounded-xl bg-yellow-400 text-black text-xs font-black shadow-neon-yellow"
              >
                Add Money & Buy Offer
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: AUTHORIZED DOWNLOADS                                    */}
      {/* ============================================================== */}
      {activeTab === "downloads" && (
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
            <div>
              <h3 className="text-xl font-black text-white">
                Authorized Software Package Download
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Download the tool, extract, run to view your HWID, then paste your HWID in the &ldquo;My Licenses&rdquo; tab to activate.
              </p>
            </div>

            <div className="space-y-4">
              {tools.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0f0f0f] border border-white/10 hover:border-yellow-400/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-base">{t.name}</h4>
                      <span className="text-[10px] font-bold text-black bg-yellow-400 px-2 py-0.5 rounded font-mono">
                        {t.version}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{t.tagline}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                      <span>Size: {t.fileSize}</span>
                      <span>OS: {t.systemRequirements.os}</span>
                    </div>
                  </div>

                  <a
                    href={t.downloadFilePath}
                    download
                    className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-neon-red transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Tool ({t.fileSize})</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PAYMENT & DEPOSIT HISTORY                               */}
      {/* ============================================================== */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Wallet Deposits Table */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
            <h3 className="text-lg font-black text-white">Wallet Add Money History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="pb-3 font-bold">Method</th>
                    <th className="pb-3 font-bold">Amount</th>
                    <th className="pb-3 font-bold">Sender</th>
                    <th className="pb-3 font-bold">TrxID</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {activeDeposits.map(dep => (
                    <tr key={dep.id} className="hover:bg-white/5">
                      <td className="py-3 font-bold text-white">{dep.method}</td>
                      <td className="py-3 font-black text-yellow-400">${dep.amountUSD} (৳{dep.amountBDT})</td>
                      <td className="py-3 font-mono">{dep.senderNumber}</td>
                      <td className="py-3 font-mono text-white font-bold">{dep.trxId}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 ${
                          dep.status === "APPROVED"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                            : "bg-amber-950 text-amber-400 border border-amber-500/40 animate-pulse"
                        }`}>
                          {dep.status === "APPROVED" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>সফল (APPROVED)</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                              <span>পেন্ডিং (যাচাই চলছে...)</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 text-[11px]">{new Date(dep.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders Table */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
            <h3 className="text-lg font-black text-white">Tool License Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="pb-3 font-bold">Order ID</th>
                    <th className="pb-3 font-bold">Tool & Plan</th>
                    <th className="pb-3 font-bold">Amount</th>
                    <th className="pb-3 font-bold">Method</th>
                    <th className="pb-3 font-bold">TrxID</th>
                    <th className="pb-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {userOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono font-bold text-white">{ord.orderNumber}</td>
                      <td className="py-3">
                        <span className="font-bold text-white">{ord.toolName}</span>
                        <span className="text-[11px] text-yellow-400 block font-semibold">{ord.planDuration} Days</span>
                      </td>
                      <td className="py-3 font-black text-yellow-400">৳{ord.amount}</td>
                      <td className="py-3 font-bold text-white">{ord.paymentMethod}</td>
                      <td className="py-3 font-mono text-white font-bold">{ord.trxId || "Pending"}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 ${
                          ord.status === "PAID" || ord.status === "APPROVED"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                            : ord.status === "PENDING"
                            ? "bg-amber-950 text-amber-400 border border-amber-500/40 animate-pulse"
                            : "bg-red-950 text-red-400 border border-red-500/40"
                        }`}>
                          {ord.status === "PAID" || ord.status === "APPROVED" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>সফল (APPROVED)</span>
                            </>
                          ) : ord.status === "PENDING" ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                              <span>পেন্ডিং (যাচাই চলছে...)</span>
                            </>
                          ) : (
                            <span>{ord.status}</span>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION: ACTIVE TOOL MEMBERSHIPS & DOWNLOAD CONTROL (ALWAYS VISIBLE) */}
      {/* ============================================================== */}
      <section id="memberships" className="pt-10 border-t border-white/10 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-yellow-400 mb-1">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>আপনার মেম্বারশিপ ও অ্যাক্টিভ সফটওয়্যার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              আমার কেনা টুলস ও লাইসেন্স মেম্বারশিপ (Active Tool Memberships)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              টুলস ডাউনলোড করে সফটওয়্যার ওপেন করে আপনার Machine HWID দিলে পারমানেন্ট লাইসেন্স কী পেয়ে যাবেন।
            </p>
          </div>

          <Link
            href="/tools"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-yellow-400 hover:text-black text-yellow-400 text-xs font-bold transition-all self-start sm:self-auto border border-white/15"
          >
            নতুন টুল বা অফার কিনুন &rarr;
          </Link>
        </div>

        {/* Memberships Cards List */}
        {allActiveLicenses.length > 0 ? (
          <div className="space-y-6">
            {allActiveLicenses.map((lic) => {
              const matchedTool = tools.find(t => t.id === lic.toolId || t.name === lic.toolName) || flagshipTool;
              const expiresDate = new Date(lic.expiresAt);
              const isExpired = expiresDate.getTime() < Date.now();
              const daysRemaining = Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
              const isVideoOpen = openVideoModal === lic.id;

              return (
                <div
                  key={lic.id}
                  className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#14120a] via-[#0d0c07] to-[#070707] border-2 border-yellow-400/50 shadow-neon-yellow space-y-6"
                >
                  
                  {/* Top Bar of Membership Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-400/15 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shrink-0">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-black text-white">
                            {lic.toolName}
                          </h3>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white shadow-neon-red">
                            {matchedTool?.version || "v3.0 PRO"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 font-medium">
                          {lic.durationDays} Days Access Plan &bull; {lic.userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                        lic.status === "ACTIVE" && !isExpired
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/50 shadow-neon-yellow"
                          : "bg-red-950 text-red-400 border border-red-500/50"
                      }`}>
                        {isExpired ? "EXPIRED" : "● MEMBERSHIP ACTIVE"}
                      </span>
                      <span className="text-xs font-mono font-bold text-yellow-400 bg-black/80 px-3 py-1 rounded-xl border border-white/15">
                        {daysRemaining} Days Left
                      </span>
                    </div>
                  </div>

                  {/* 3 Interactive Blocks: 1. Tool Download, 2. Video Guide, 3. HWID & License */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* BLOCK 1: DIRECT TOOL DOWNLOAD */}
                    <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <Download className="w-4 h-4" />
                          <span>১. সফটওয়্যার ফাইল ডাউনলোড</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {matchedTool?.fileSize || "28.4 MB"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        সফটওয়্যার জিপ ফাইলটি ডাউনলোড করে আনজিপ করুন এবং <strong>Run as Administrator</strong> হিসেবে রান করুন।
                      </p>

                      <a
                        href={matchedTool?.downloadFilePath || "/releases/Setup.zip"}
                        download
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                      >
                        <Download className="w-4 h-4 text-black" />
                        <span>টুল ফাইল ডাউনলোড করুন ({matchedTool?.fileSize || "28.4 MB"})</span>
                      </a>

                      <div className="pt-1 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                        <span>OS: {matchedTool?.systemRequirements?.os || "Windows 10/11"}</span>
                        <span className="text-emerald-400">100% Virus-Free</span>
                      </div>
                    </div>

                    {/* BLOCK 2: SETUP VIDEO & INSTRUCTIONS */}
                    <div className="p-5 rounded-2xl bg-[#0e0e0e] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                          <Play className="w-4 h-4 text-red-500" />
                          <span>২. সেটাপ ভিডিও ও গাইড</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setOpenVideoModal(isVideoOpen ? null : lic.id)}
                          className="text-[11px] font-bold text-yellow-400 hover:underline"
                        >
                          {isVideoOpen ? "ভিডিও লুকান ▲" : "ভিডিও দেখুন ▼"}
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        টুল কীভাবে চালু ও অ্যাক্টিভ করতে হয় তার সম্পূর্ণ টিউটোরিয়াল ভিডিও গাইড।
                      </p>

                      {isVideoOpen && matchedTool?.setupVideoUrl && (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-yellow-400/40 shadow-lg mt-2">
                          <iframe
                            src={normalizeYouTubeEmbedUrl(matchedTool.setupVideoUrl)}
                            title="Setup Guide Video"
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}

                      {!isVideoOpen && (
                        <button
                          type="button"
                          onClick={() => setOpenVideoModal(lic.id)}
                          className="w-full py-3.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                        >
                          <Play className="w-4 h-4 text-yellow-400" />
                          <span>সেটআপ ভিডিও প্লে করুন</span>
                        </button>
                      )}

                      <ol className="list-decimal list-inside text-[11px] text-slate-400 space-y-0.5 pt-1">
                        <li>টুল ওপেন করে Machine HWID কপি করুন</li>
                        <li>ডানের ঘরে HWID দিয়ে লাইসেন্স নিন</li>
                        <li>সফটওয়্যারে লাইসেন্স কী পেস্ট করে লগইন করুন</li>
                      </ol>
                    </div>

                    {/* BLOCK 3: HWID FIRST -> GET LICENSE KEY */}
                    <div className="p-5 rounded-2xl bg-[#0a0a0a] border-2 border-yellow-400 text-left space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-red-500" />
                          <span>৩. HWID দিয়ে লাইসেন্স নেওয়া</span>
                        </span>
                        <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-black">
                          {lic.hwid ? "LOCKED" : "HWID REQUIRED"}
                        </span>
                      </div>

                      {lic.hwid ? (
                        <div className="space-y-3">
                          <span className="text-[11px] text-slate-300 font-bold block">
                            আপনার পারমানেন্ট লাইসেন্স কী (License Key):
                          </span>
                          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-black border border-yellow-400/50">
                            <span className="font-mono text-xs sm:text-sm font-black text-yellow-400 break-all select-all">
                              {lic.key}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(lic.key, lic.id)}
                              className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center gap-1 shrink-0 transition-colors shadow-neon-yellow"
                            >
                              {copiedKey === lic.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedKey === lic.id ? "কপি হয়েছে" : "কপি"}</span>
                            </button>
                          </div>

                          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-400 font-mono space-y-0.5">
                            <span className="block font-bold">✓ Machine HWID Locked:</span>
                            <span className="block break-all">{lic.hwid}</span>
                          </div>

                          <p className="text-[11px] text-slate-400">
                            সফটওয়্যারে এই লাইসেন্স কী পেস্ট করে <strong>Login</strong> বাটনে চাপলেই টুল লাইফটাইম আনলক হয়ে যাবে।
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <p className="text-xs text-yellow-300 font-bold">
                            ⚠️ টুলস ডাউনলোড করে ওপেন করে আপনার Machine HWID দিন:
                          </p>
                          <p className="text-[11px] text-slate-400">
                            সফটওয়্যার ওপেন করলেই স্ক্রিনে আপনার ইউনিক Machine HWID দেখতে পাবেন। সেটি নিচে দিন:
                          </p>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Machine HWID দিন (যেমন: AGY-E42D-475A-B6D8-A901)"
                              value={hwidInputs[lic.id] || ""}
                              onChange={(e) => setHwidInputs(prev => ({ ...prev, [lic.id]: e.target.value }))}
                              className="w-full p-2.5 rounded-xl glass-input font-mono text-xs text-white font-black uppercase"
                            />
                            <button
                              type="button"
                              disabled={bindingId === lic.id}
                              onClick={() => handleBindHwid(lic.id)}
                              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-black text-xs shadow-neon-yellow transition-all flex items-center justify-center gap-1.5"
                            >
                              <Zap className="w-4 h-4" />
                              <span>{bindingId === lic.id ? "লক ও এক্টিভেট হচ্ছে..." : "HWID সাবমিট করে লাইসেন্স কী নিন 🔒"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0b0b0b] border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center mx-auto text-yellow-400">
              <Key className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-white">
              আপনার এখনো কোনো অ্যাক্টিভ টুল মেম্বারশিপ নেই
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              আমাদের জনপ্রিয় <strong>FAST OTP — FB Auto Resender Pro</strong> টুলটি কিনলে আপনি এখানে সরাসরি সফটওয়্যার ডাউনলোড, সেটআপ ভিডিও এবং HWID দিয়ে লাইসেন্স নেওয়ার সুবিধা পাবেন।
            </p>
            <div className="pt-2">
              <Link
                href="/tools/otp-testing-utility#plans"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-neon-yellow transition-all"
              >
                <Zap className="w-4 h-4 text-black" />
                <span>অফার প্ল্যান দেখুন ও টুল কিনুন ($২ — $৮)</span>
              </Link>
            </div>
          </div>
        )}

      </section>

    </div>
  );
}
