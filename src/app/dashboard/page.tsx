"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNexusStore } from "@/lib/store";
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
  Database
} from "lucide-react";

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
    bindHwidToLicense
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

  const userLicenses = currentUser 
    ? licenses.filter(l => l.userId === currentUser.id || l.userEmail === currentUser.email)
    : [];
  const userOrders = currentUser 
    ? orders.filter(o => o.userId === currentUser.id || o.userEmail === currentUser.email)
    : [];
  const activePlans = plans.filter(p => p.enabled);
  const flagshipTool = tools[0];

  const handleAuthSubmit = (e: React.FormEvent) => {
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
    const res = registerUser(authName || authEmail.split("@")[0], authEmail, authPassword);
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

  const handleDepositSubmit = async (e: React.FormEvent, instantTest = false) => {
    e.preventDefault();
    const sender = depositSender.trim() || (instantTest ? "01755123456" : "");
    const trx = depositTrxId.trim() || (instantTest ? `${depositMethod === "bKash" ? "BK" : "RK"}${Math.floor(10000000 + Math.random() * 90000000)}` : "");

    if (!sender || !trx) {
      showBanner("error", "Please enter your sender number and TrxID.");
      return;
    }

    setIsDepositing(true);
    const res = await submitWalletDeposit(depositAmountUSD, depositMethod, sender, trx, instantTest);
    setIsDepositing(false);
    setDepositSender("");
    setDepositTrxId("");

    if (instantTest) {
      triggerConfetti();
      showBanner(
        "success",
        `$${depositAmountUSD} (৳${depositAmountUSD * 120}) added to your wallet! ${res.firebaseSynced ? `Synced to Firebase (${firebaseProjectId}).` : "Saved locally (check Firestore rules for cloud sync)."}`
      );
    } else {
      showBanner(
        "success",
        `Deposit request (${trx}) submitted for $${depositAmountUSD}! Wallet will update automatically once verified.`
      );
    }
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
      `Offer purchased! Key ${res.license?.key} generated ${res.firebaseSynced ? `& synced to Firebase (${firebaseProjectId})` : ""}. Now download the tool & enter your HWID below!`
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
        `HWID "${val}" bound to key ${res.license?.key}! ${res.firebaseSynced ? `Live synced to Firebase (${firebaseProjectId} -> hwid_keys & licenses).` : "Saved locally (enable Firestore write rules to sync cloud)."}`
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
            <div className="sm:col-span-3 pt-1 flex items-center justify-between">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-neon-yellow transition-all"
              >
                Sign In / Register Account
              </button>
              <button
                type="button"
                onClick={() => registerUser("Member", "member@gmail.com", "123456")}
                className="text-slate-400 hover:text-white text-xs underline"
              >
                Or 1-Click Demo Sign In
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

            <form onSubmit={(e) => handleDepositSubmit(e, false)} className="space-y-3 text-xs">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black shadow-neon-yellow transition-all"
                >
                  Submit Add Money (৳{depositAmountUSD * 120})
                </button>
                <button
                  type="button"
                  disabled={isDepositing}
                  onClick={(e) => handleDepositSubmit(e, true)}
                  className="py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black shadow-neon-red transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Auto-Add (${depositAmountUSD})</span>
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
                  {deposits.map(dep => (
                    <tr key={dep.id} className="hover:bg-white/5">
                      <td className="py-3 font-bold text-white">{dep.method}</td>
                      <td className="py-3 font-black text-yellow-400">${dep.amountUSD} (৳{dep.amountBDT})</td>
                      <td className="py-3 font-mono">{dep.senderNumber}</td>
                      <td className="py-3 font-mono text-white font-bold">{dep.trxId}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dep.status === "APPROVED"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                            : "bg-yellow-950 text-yellow-400 border border-yellow-500/40"
                        }`}>
                          {dep.status}
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
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === "PAID"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                            : ord.status === "PENDING"
                            ? "bg-yellow-950 text-yellow-400 border border-yellow-500/40"
                            : "bg-red-950 text-red-400 border border-red-500/40"
                        }`}>
                          {ord.status}
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

    </div>
  );
}
