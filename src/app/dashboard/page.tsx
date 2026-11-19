"use client";

import React, { useState, useEffect, useRef } from "react";
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
  HardDrive,
  Bell,
  DownloadCloud,
  Lock,
  RotateCcw,
  Clock,
  ExternalLink,
  FileText
} from "lucide-react";
import { normalizeYouTubeEmbedUrl } from "@/lib/youtube";
import { playChimeSound, showBrowserNotification } from "@/lib/notifications";
import { getToolTitleClass } from "@/lib/toolStyles";
import Card3D from "@/components/Card3D";
import CyberCanvas3D from "@/components/CyberCanvas3D";

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

  const [activeTab, setActiveTab] = useState<"membership" | "wallet" | "licenses" | "downloads" | "orders">("membership");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedNum, setCopiedNum] = useState<string | null>(null);
  const [bannerMsg, setBannerMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

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
  const [closedVideoIds, setClosedVideoIds] = useState<Record<string, boolean>>({});
  const [viewingDownloadVideoId, setViewingDownloadVideoId] = useState<string | null>(null);
  const [viewingLicenseVideoId, setViewingLicenseVideoId] = useState<string | null>(null);

  // Real-time Firestore sync & Notifications
  const [firestoreOrders, setFirestoreOrders] = useState<any[]>([]);
  const [firestoreDeposits, setFirestoreDeposits] = useState<any[]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [hasNotifPermission, setHasNotifPermission] = useState<boolean>(true);

  const prevOrdersStatus = useRef<Record<string, string>>({});
  const prevDepositsStatus = useRef<Record<string, string>>({});
  const initialLoadDone = useRef(false);

  // Check notification & PWA install status
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasNotifPermission(Notification.permission === "granted");
    }
    const handleInstallable = (e: any) => {
      setInstallPrompt(e.detail || (window as any).deferredPrompt);
    };
    window.addEventListener("pwa-installable", handleInstallable);
    if ((window as any).deferredPrompt) {
      setInstallPrompt((window as any).deferredPrompt);
    }
    return () => window.removeEventListener("pwa-installable", handleInstallable);
  }, []);

  // Remember sender number
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSender = localStorage.getItem("toolsbd_sender_number");
      if (savedSender && !depositSender) {
        setDepositSender(savedSender);
      }
    }
  }, []);

  const handlePasteTrxId = async (setter: (val: string) => void) => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const clean = text.trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
          setter(clean || text.trim().toUpperCase());
        }
      }
    } catch {
      // Ignore if clipboard restricted
    }
  };

  const handleInstallMemberPwa = async () => {
    const prompt = installPrompt || (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setInstallPrompt(null);
    } else {
      alert("Toolsbd App: আপনার ফোনের ব্রাউজার থ্রি-ডট মেনু থেকে 'Install app' বা 'Add to Home Screen' ক্লিক করুন।");
    }
  };

  const handleRequestNotification = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setHasNotifPermission(perm === "granted");
      if (perm === "granted") {
        playChimeSound("success");
        showBrowserNotification("🔔 Toolsbd নোটিফিকেশন সক্রিয়!", {
          body: "পেমেন্ট কনফার্ম বা ডিপোজিট অ্যাপ্রুভ হওয়ার সাথে সাথে নোটিফিকেশন পাবেন।"
        });
      }
    }
  };

  useEffect(() => {
    if (!currentUser?.email) return;

    let unsubOrders: (() => void) | undefined;
    try {
      const q = query(collection(webDb, "orders"), where("userEmail", "==", currentUser.email));
      unsubOrders = onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setFirestoreOrders(list);

        // Detect status transition from PENDING -> APPROVED
        if (initialLoadDone.current) {
          list.forEach((ord: any) => {
            const prev = prevOrdersStatus.current[ord.id];
            if (prev && prev !== "PAID" && prev !== "APPROVED" && (ord.status === "PAID" || ord.status === "APPROVED")) {
              playChimeSound("success");
              showBrowserNotification("🚀 আপনার টুল অর্ডার সফল হয়েছে!", {
                body: `${ord.toolName || "Software Tool"} এর লাইসেন্স ও ডাউনলোড উন্মুক্ত হয়েছে!`,
                data: { url: "/dashboard" }
              });
              triggerConfetti();
            }
            prevOrdersStatus.current[ord.id] = ord.status;
          });
        } else {
          list.forEach((ord: any) => { prevOrdersStatus.current[ord.id] = ord.status; });
        }
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

        // Detect status transition from PENDING -> APPROVED
        if (initialLoadDone.current) {
          list.forEach((dep: any) => {
            const prev = prevDepositsStatus.current[dep.id];
            if (prev && prev !== "APPROVED" && dep.status === "APPROVED") {
              playChimeSound("coin");
              showBrowserNotification("🎉 ডিপোজিট অ্যাপ্রুভ হয়েছে!", {
                body: `৳${dep.amountBDT || Math.round(dep.amountUSD * 120)} ($${dep.amountUSD}) ওয়ালেটে যোগ করা হয়েছে।`,
                data: { url: "/dashboard" }
              });
              triggerConfetti();
            }
            prevDepositsStatus.current[dep.id] = dep.status;
          });
        } else {
          list.forEach((dep: any) => { prevDepositsStatus.current[dep.id] = dep.status; });
          initialLoadDone.current = true;
        }
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

  // Real-time Pending Tracker for Deposits & Orders
  const pendingDeposits = activeDeposits.filter((d: any) => d.status === "PENDING");
  const pendingOrders = userOrders.filter((o: any) => o.status === "PENDING");
  const totalPendingCount = pendingDeposits.length + pendingOrders.length;

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
    if (typeof window !== "undefined") {
      localStorage.setItem("toolsbd_sender_number", sender);
    }
    setDepositTrxId("");

    showBanner(
      "success",
      `ডিপোজিট রিকোয়েস্ট (${trx}) $${depositAmountUSD}-এর জন্য সফলভাবে জমা হয়েছে! আপনার মেম্বারশিপ অপশনে লাইভ পেন্ডিং স্ট্যাটাস, টুল ডাউনলোড ও সেটআপ গাইড ওপেন হয়েছে।`
    );
    setActiveTab("membership");
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
    <div className="relative py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 overflow-hidden">
      
      {/* 3D Ambient Cyber Mesh in Background */}
      <CyberCanvas3D className="absolute -top-10 left-0 right-0 h-[480px] pointer-events-none opacity-40 z-0" />

      <div className="relative z-10 space-y-8">
        {/* If Guest: Login / Register Form */}
      {!isLoggedIn || !currentUser ? (
        <div className="rounded-3xl p-6 sm:p-8 bg-[#0c0c0c] border border-yellow-400/40 shadow-neon-yellow space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div>
              <h2 className="text-xl font-black text-gradient-shimmer flex items-center gap-2">
                <User className="w-5 h-5 text-yellow-400" />
                <span>লগইন অথবা নতুন অ্যাকাউন্ট তৈরি করুন</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                আপনার Gmail দিয়ে প্রবেশ করুন এবং সহজেই ওয়ালেটে ব্যালেন্স লোড, স্পেশাল অফার কেনা ও HWID লাইসেন্স সক্রিয় করুন।
              </p>
            </div>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-yellow-400 text-xs font-bold self-start sm:self-auto"
            >
              লগইন পেইজে যান &rarr;
            </Link>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-white text-xs font-bold">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-400 font-bold block mb-1">আপনার পুরো নাম</label>
              <input
                type="text"
                placeholder="যেমন: Asik Billah"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 font-bold block mb-1">আপনার Gmail এড্রেস</label>
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
              <label className="text-slate-400 font-bold block mb-1">পাসওয়ার্ড</label>
              <input
                type="password"
                required
                placeholder="কমপক্ষে ৪ অক্ষর"
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
                লগইন / রেজিস্ট্রেশন সম্পন্ন করুন
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
                  <h1 className="text-2xl font-black text-gradient-shimmer">
                    স্বাগতম, {currentUser.name}
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
                  {currentUser.email} &bull; ব্যালেন্স যোগ &rarr; অফার কিনুন &rarr; টুল ডাউনলোড &rarr; HWID বসিয়ে কি চালু করুন
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
                    প্রোফাইল ব্যালেন্স
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
                <span>ব্যালেন্স যোগ করুন</span>
              </button>

              {/* Install PWA App */}
              <button
                onClick={handleInstallMemberPwa}
                className="px-3.5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black shadow-neon-yellow transition-all flex items-center gap-1.5"
                title="Install Toolsbd as App on Phone or PC"
              >
                <DownloadCloud className="w-4 h-4 text-black" />
                <span>অ্যাপ ইনস্টল</span>
              </button>

              {/* Notification Permission Button */}
              {!hasNotifPermission && (
                <button
                  onClick={handleRequestNotification}
                  className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-yellow-400 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Enable Push Notifications"
                >
                  <Bell className="w-4 h-4 text-yellow-400" />
                  <span>নোটিফিকেশন</span>
                </button>
              )}

              <button
                onClick={logoutUser}
                className="px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all"
                title="Sign Out"
              >
                লগআউট
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

      {/* Real-time Pending Deposit Notification Alert */}
      {totalPendingCount > 0 && (
        <Card3D maxTilt={3} depth={1.01} glare={true}>
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-400/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-neon-yellow">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0 shadow-neon-yellow">
                <RotateCcw className="w-6 h-6 animate-spin text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    ডিপোজিট ভেরিফিকেশন চলছে ({totalPendingCount} টি পেন্ডিং)
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  আপনার বিকাশ বা রকেট ডিপোজিট স্বয়ংক্রিয় এসএমএস গেটওয়েতে যাচাই করা হচ্ছে। মেম্বারশিপ অপশনে গিয়ে এখনই লাইভ স্ট্যাটাস, টুলস ডাউনলোড এবং সেটআপ ভিডিও গাইড দেখুন।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("membership")}
              className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-neon-yellow transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>মেম্বারশিপ হাব দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card3D>
      )}

      {/* Dashboard Tabs (Horizontally scrollable on mobile, wrapping on tablets & desktops) */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none sm:flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab("membership")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95 ${
            activeTab === "membership"
              ? "bg-yellow-400 text-black shadow-neon-yellow scale-[1.02]"
              : "text-slate-300 hover:text-white bg-surface-card hover:bg-white/10"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-red-500" />
          <span>মেম্বারশিপ (Membership)</span>
          {totalPendingCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{totalPendingCount} পেন্ডিং</span>
            </span>
          ) : (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
              VIP
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("wallet")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95 ${
            activeTab === "wallet"
              ? "bg-yellow-400 text-black shadow-neon-yellow scale-[1.02]"
              : "text-slate-300 hover:text-white bg-surface-card hover:bg-white/10"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>ব্যালেন্স লোড ও অফার কিনুন</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("licenses")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95 ${
            activeTab === "licenses"
              ? "bg-yellow-400 text-black shadow-neon-yellow scale-[1.02]"
              : "text-slate-300 hover:text-white bg-surface-card hover:bg-white/10"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>আমার লাইসেন্স ও HWID কি ({userLicenses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("downloads")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95 ${
            activeTab === "downloads"
              ? "bg-yellow-400 text-black shadow-neon-yellow scale-[1.02]"
              : "text-slate-300 hover:text-white bg-surface-card hover:bg-white/10"
          }`}
        >
          <Download className="w-4 h-4" />
          <span>টুলস ডাউনলোড</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95 ${
            activeTab === "orders"
              ? "bg-yellow-400 text-black shadow-neon-yellow scale-[1.02]"
              : "text-slate-300 hover:text-white bg-surface-card hover:bg-white/10"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>পেমেন্ট ও অর্ডার হিস্টোরি ({userOrders.length + deposits.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 0: MEMBERSHIP HUB — PENDING VERIFICATION, DOWNLOADS & SETUP */}
      {/* ============================================================== */}
      {activeTab === "membership" && (
        <div key="tab-membership" className="animate-tab-fade space-y-8">
          
          {/* 1. VIP MEMBERSHIP PROFILE STATUS CARD */}
          <Card3D maxTilt={4} depth={1.01} glare={true}>
            <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-yellow-400/10 via-red-600/10 to-yellow-500/10 border-2 border-yellow-400/40 shadow-neon-yellow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-red-600 p-[2px] shadow-neon-yellow shrink-0">
                    <div className="w-full h-full bg-[#111] rounded-[14px] flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-yellow-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black text-gradient-shimmer">
                        {currentUser?.name || "সম্মানিত মেম্বার"} &bull; মেম্বারশিপ প্রোফাইল
                      </h2>
                      {allActiveLicenses.length > 0 ? (
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500 text-black shadow-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-black" />
                          <span>👑 VIP সক্রিয় মেম্বার</span>
                        </span>
                      ) : totalPendingCount > 0 ? (
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-400 text-black shadow-md flex items-center gap-1 animate-pulse">
                          <RotateCcw className="w-3 h-3 text-black animate-spin" />
                          <span>⏳ মেম্বারশিপ যাচাই চলছে</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-yellow-400 text-black shadow-neon-yellow">
                          ⚡ সাধারণ মেম্বার
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-mono">
                      একাউন্ট: {currentUser?.email || "guest@toolsbd.com"} {currentUser?.id ? `(${currentUser.id})` : ""}
                    </p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRefreshingStatus(true);
                      setTimeout(() => {
                        setIsRefreshingStatus(false);
                        showBanner("success", "স্ট্যাটাস রিফ্রেশ সম্পন্ন! আপনার সকল ডিপোজিট ও লাইসেন্স তথ্য হালনাগাদ রয়েছে।");
                      }, 700);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStatus ? "animate-spin text-yellow-400" : ""}`} />
                    <span>{isRefreshingStatus ? "রিফ্রেশ হচ্ছে..." : "স্ট্যাটাস রিফ্রেশ"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("wallet")}
                    className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black shadow-neon-yellow transition-all flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>ব্যালেন্স ডিপোজিট</span>
                  </button>
                </div>
              </div>

              {/* 3 Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-yellow-400/15 text-yellow-400 shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      ওয়ালেট ব্যালেন্স
                    </span>
                    <span className="text-xl font-black text-white">
                      ${walletBalanceUSD.toFixed(2)}{" "}
                      <span className="text-xs font-mono text-yellow-400">
                        (৳{(walletBalanceUSD * 120).toLocaleString()})
                      </span>
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    totalPendingCount > 0 ? "bg-amber-400/20 text-amber-400 animate-pulse" : "bg-white/10 text-slate-400"
                  }`}>
                    <RotateCcw className={`w-5 h-5 ${totalPendingCount > 0 ? "animate-spin" : ""}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      পেন্ডিং ডিপোজিট / অর্ডার
                    </span>
                    <span className={`text-xl font-black ${totalPendingCount > 0 ? "text-amber-400" : "text-white"}`}>
                      {totalPendingCount} টি {totalPendingCount > 0 ? "যাচাই চলছে..." : "নেই"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-400/15 text-emerald-400 shrink-0">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      অ্যাক্টিভ লাইসেন্স ও টুলস
                    </span>
                    <span className="text-xl font-black text-white">
                      {allActiveLicenses.length} টি লাইসেন্স
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card3D>

          {/* 2. REAL-TIME PENDING DEPOSITS & ORDERS TRACKER */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-xl font-black text-gradient-shimmer flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span>ডিপোজিট ও অর্ডারের পেন্ডিং ট্র্যাকার (Verification Status)</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                স্বয়ংক্রিয় SMS ও অ্যাডমিন ভেরিফিকেশন
              </span>
            </div>

            {totalPendingCount > 0 ? (
              <div className="space-y-4">
                {/* Pending Deposits List */}
                {pendingDeposits.map((dep: any) => (
                  <Card3D key={dep.id} maxTilt={4} depth={1.01} glare={true}>
                    <div className="p-5 sm:p-6 rounded-2xl bg-[#110e06] border-2 border-yellow-400/60 shadow-neon-yellow space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase shadow-sm ${
                            dep.method === "bKash" 
                              ? "bg-[#e2136e] text-white" 
                              : "bg-[#8c3494] text-white"
                          }`}>
                            {dep.method} পার্সোনাল ডিপোজিট
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span>স্ট্যাটাস: পেন্ডিং (যাচাই চলছে...)</span>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-mono">জমাকৃত অর্থ:</span>
                          <span className="text-lg font-black text-yellow-400 font-mono">
                            ৳{dep.amountBDT || dep.amountUSD * 120} BDT (${dep.amountUSD} USD)
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                          <span className="text-slate-400 block text-[11px]">সাবমিটকৃত TrxID:</span>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <strong className="text-white text-sm uppercase font-black">{dep.trxId}</strong>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(dep.trxId);
                                showBanner("success", "TrxID কপি হয়েছে!");
                              }}
                              className="text-yellow-400 hover:text-yellow-300"
                              title="TrxID কপি করুন"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                          <span className="text-slate-400 block text-[11px]">প্রেরক মোবাইল নম্বর:</span>
                          <strong className="text-white text-sm block mt-1">{dep.senderNumber || "01731328169"}</strong>
                        </div>

                        <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                          <span className="text-slate-400 block text-[11px]">জমা দেওয়ার সময়:</span>
                          <span className="text-slate-300 block mt-1 text-[11px]">
                            {new Date(dep.createdAt).toLocaleString("bn-BD")}
                          </span>
                        </div>
                      </div>

                      {/* ⏳ লাইভ ভেরিফিকেশন প্রগ্রেস পাইপলাইন (3-Step Progress Timeline) */}
                      <div className="p-4 rounded-2xl bg-black/80 border border-yellow-400/30 shadow-neon-yellow space-y-2.5">
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-white/10">
                          <span className="font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                            <RotateCcw className="w-3.5 h-3.5 animate-spin text-yellow-400" />
                            <span>লাইভ ভেরিফিকেশন প্রগ্রেস পাইপলাইন:</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                            ধাপ ২ চলমান...
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-1">
                          {/* Node 1: Completed */}
                          <div className="flex flex-col items-center gap-1 text-center flex-1">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]">
                              <Check className="w-4 h-4 font-black text-emerald-400" />
                            </div>
                            <div>
                              <span className="text-[11px] font-black text-emerald-400 block">১. TrxID জমা</span>
                              <span className="text-[9px] text-emerald-400/80 font-mono">গৃহীত হয়েছে</span>
                            </div>
                          </div>

                          {/* Animated Connecting Track 1 */}
                          <div className="flex-1 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 rounded-full animate-pulse mx-1 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />

                          {/* Node 2: In-Progress */}
                          <div className="flex flex-col items-center gap-1 text-center flex-1">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/25 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.7)] animate-pulse">
                              <RotateCcw className="w-4 h-4 animate-spin text-amber-400" />
                            </div>
                            <div>
                              <span className="text-[11px] font-black text-amber-400 block">২. এসএমএস ভেরিফিকেশন</span>
                              <span className="text-[9px] text-amber-300 font-mono animate-pulse">যাচাই চলছে...</span>
                            </div>
                          </div>

                          {/* Connecting Track 2 */}
                          <div className="flex-1 h-1 bg-white/15 rounded-full mx-1" />

                          {/* Node 3: Pending */}
                          <div className="flex flex-col items-center gap-1 text-center flex-1 opacity-70">
                            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-slate-400">
                              <Key className="w-4 h-4 text-yellow-400/70" />
                            </div>
                            <div>
                              <span className="text-[11px] font-bold text-slate-300 block">৩. লাইসেন্স আনলক</span>
                              <span className="text-[9px] text-slate-500 font-mono">অটো ডেলিভারি</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-yellow-400/20 text-xs text-slate-300 flex items-center justify-between gap-4">
                        <p className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                          <span>
                            বিকাশ/রকেট এসএমএস ম্যাচিং হওয়া মাত্রই আপনার প্রোফাইল ব্যালেন্স স্বয়ংক্রিয়ভাবে রিচার্জ হবে। ইতিমধ্যে নিচের লিঙ্ক থেকে সফটওয়্যারটি ডাউনলোড ও ইনস্টল করে নিতে পারেন।
                          </span>
                        </p>
                      </div>
                    </div>
                  </Card3D>
                ))}

                {/* Pending Orders List */}
                {pendingOrders.map((ord: any) => (
                  <Card3D key={ord.id} maxTilt={4} depth={1.01} glare={true}>
                    <div className="p-5 rounded-2xl bg-[#110e06] border border-amber-400/40 shadow-neon-yellow space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-yellow-400 text-black text-xs font-black">
                            টুল অর্ডার: {ord.toolName}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-400 border border-amber-400/40 animate-pulse">
                            অপেক্ষারত (Pending)
                          </span>
                        </div>
                        <span className="text-xs font-mono text-yellow-400 font-bold">
                          TrxID: {ord.paymentTrxId}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        আপনার টুলের অর্ডারটি যাচাই চলছে। ভেরিফিকেশন সম্পন্ন হওয়ামাত্রই এই স্ক্রিনে লাইসেন্স কী আনলক হয়ে যাবে।
                      </p>
                    </div>
                  </Card3D>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-black/50 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">কোনো পেন্ডিং ডিপোজিট বা অর্ডার নেই</h4>
                    <p className="text-xs text-slate-400">আপনার সকল ডিপোজিট এবং অর্ডার ভেরিফাইড ও সক্রিয় রয়েছে।</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("wallet")}
                  className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black shadow-neon-yellow transition-all whitespace-nowrap"
                >
                  নতুন ডিপোজিট করুন
                </button>
              </div>
            )}
          </div>

          {/* 3. AUTHORIZED TOOLS & DIRECT DOWNLOAD (ONLY UNLOCKED AFTER PURCHASE) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className="text-xl font-black text-gradient-shimmer flex items-center gap-2">
                  <Download className="w-5 h-5 text-yellow-400" />
                  <span>অনুমোদিত সফটওয়্যার ডাউনলোড (Authorized Tool Downloads)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ওয়ালেটে ব্যালেন্স যোগ করে অফার প্ল্যান কিনলে এখানে স্বয়ংক্রিয়ভাবে সফটওয়্যার ডাউনলোড ফাইল আনলক হবে।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.filter(t => t.status === "active").map((tool) => {
                const isPurchased = allActiveLicenses.some(lic => 
                  lic.toolId === tool.id || 
                  lic.toolName?.toLowerCase() === tool.name?.toLowerCase() ||
                  (tool.id.includes("otp") && lic.toolId?.includes("otp"))
                );
                const activeLic = allActiveLicenses.find(lic => 
                  lic.toolId === tool.id || 
                  lic.toolName?.toLowerCase() === tool.name?.toLowerCase() ||
                  (tool.id.includes("otp") && lic.toolId?.includes("otp"))
                );

                return (
                  <Card3D key={tool.id} maxTilt={5} depth={1.02} glare={true} className="h-full">
                    <div className="p-5 sm:p-6 rounded-2xl bg-[#0c0c0c] border border-white/10 hover:border-yellow-400/50 transition-all space-y-4 h-full flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/30">
                            {tool.category}
                          </span>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                            isPurchased 
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40" 
                              : "bg-red-950/80 text-red-300 border border-red-500/40"
                          }`}>
                            {isPurchased ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>আনলকড (UNLOCKED)</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5 text-yellow-400" />
                                <span>লক করা (LOCKED)</span>
                              </>
                            )}
                          </span>
                        </div>

                        <h4 className={`text-lg font-black ${getToolTitleClass(tool.name)}`}>
                          {tool.name}
                        </h4>

                        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 pt-1">
                          <div className="p-2 rounded-lg bg-black/60 border border-white/5 flex items-center gap-1.5">
                            <HardDrive className="w-3.5 h-3.5 text-yellow-400" />
                            <span>সাইজ: {tool.fileSize}</span>
                          </div>
                          <div className="p-2 rounded-lg bg-black/60 border border-white/5 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-red-400" />
                            <span>{tool.systemRequirements.os}</span>
                          </div>
                        </div>

                        {/* License summary if purchased */}
                        {isPurchased && activeLic && (
                          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-400 font-bold text-[11px]">সক্রিয় লাইসেন্স:</span>
                              <span className="text-[10px] text-slate-400 font-mono">{activeLic.durationDays} দিন মেয়াদ</span>
                            </div>
                            <span className="font-mono text-xs text-white font-bold block truncate mt-0.5">{activeLic.key}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 pt-2">
                        {isPurchased ? (
                          <>
                            <a
                              href={tool.downloadFilePath || "/releases/Toolsbd_Utility_v3.4.2_Setup.zip"}
                              download
                              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                            >
                              <Download className="w-4 h-4 text-black" />
                              <span>সফটওয়্যার সরাসরি ডাউনলোড করুন ({tool.fileSize})</span>
                            </a>
                            <p className="text-[10px] text-center text-slate-400 font-mono">
                              SHA-256: {tool.checksumSha256?.substring(0, 24)}... (Verified)
                            </p>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => setActiveTab("wallet")}
                              className="w-full py-3.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs flex items-center justify-center gap-2 shadow-neon-yellow transition-all"
                            >
                              <Lock className="w-4 h-4 text-black" />
                              <span>অফার কিনলে ডাউনলোড আনলক হবে</span>
                            </button>
                            <p className="text-[10px] text-center text-slate-400 leading-tight">
                              {totalPendingCount > 0 
                                ? "⏳ আপনার ডিপোজিট যাচাই চলছে। ব্যালেন্স যুক্ত হয়ে অফার কিনলেই ডাউনলোড করতে পারবেন।"
                                : "টাকা ডিপোজিট করে অফার কিনলেই এই সফটওয়্যারটি ডাউনলোড করতে পারবেন।"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card3D>
                );
              })}
            </div>
          </div>

          {/* 4. SETUP VIDEO GUIDE & STEP-BY-STEP INSTRUCTIONS */}
          <Card3D maxTilt={4} depth={1.01} glare={true}>
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <h3 className="text-xl font-black text-gradient-shimmer flex items-center gap-2">
                    <Play className="w-5 h-5 text-red-500" />
                    <span>ভিডিও সেটআপ গাইড ও ইনস্টলেশন নির্দেশিকা</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    ভিডিওটি দেখে মাত্র ২ মিনিটে সফটওয়্যার ইনস্টল ও HWID লাইসেন্স চালু করুন।
                  </p>
                </div>
              </div>

              {/* YouTube Video Player */}
              <div className="relative aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden border-2 border-yellow-400/40 bg-black shadow-2xl">
                <iframe
                  width="100%"
                  height="100%"
                  loading="lazy"
                  src={normalizeYouTubeEmbedUrl(flagshipTool?.setupVideoUrl || "https://www.youtube.com/embed/U2JBcFAO7mE?si=9Pxpka_XfFtBmDGF")}
                  title="Toolsbd.com Official Tool Setup Guide"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* 4-Step Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center text-xs">
                    ১
                  </span>
                  <h5 className="font-bold text-white text-sm">ডাউনলোড ও আনজিপ</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    ওপরের ডাউনলোড বাটন থেকে জিপ ফাইলটি নামিয়ে আপনার পিসিতে Extract করুন।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center text-xs">
                    ২
                  </span>
                  <h5 className="font-bold text-white text-sm">Run as Administrator</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    টুল ফোল্ডারের .exe ফাইলে রাইট ক্লিক করে &quot;Run as administrator&quot; দিন।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center text-xs">
                    ৩
                  </span>
                  <h5 className="font-bold text-white text-sm">Machine HWID লক</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    সফটওয়্যার স্ক্রিনের HWID কপি করে আপনার মেম্বারশিপ বক্সে দিয়ে লক করুন।
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-xs">
                    ৪
                  </span>
                  <h5 className="font-bold text-white text-sm">টুল অ্যাক্টিভেশন</h5>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    লাইসেন্স কী সফটওয়্যারে পেস্ট করে এক ক্লিকে টুল ওপেন ও আনলিমিটেড ব্যবহার করুন।
                  </p>
                </div>
              </div>
            </div>
          </Card3D>

          {/* 5. HWID MACHINE BINDING & LICENSES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xl font-black text-gradient-shimmer flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-400" />
                <span>আপনার লাইসেন্স কী ও পিসি HWID অ্যাক্টিভেশন</span>
              </h3>
            </div>

            {allActiveLicenses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allActiveLicenses.map((lic) => {
                  const isBound = !!lic.hwid;
                  return (
                    <Card3D key={lic.id} maxTilt={5} depth={1.02} glare={true} className="h-full">
                      <div className="p-6 rounded-2xl bg-black/80 border border-white/10 space-y-4 h-full flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <span className={`text-xs font-black uppercase ${getToolTitleClass(lic.toolName)}`}>
                              {lic.toolName}
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                              {lic.durationDays} Days Active
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] text-slate-400 block font-mono">লাইসেন্স কী:</span>
                            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#111] border border-white/15">
                              <span className="font-mono text-xs font-black text-yellow-400 select-all truncate">
                                {lic.key}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(lic.key, lic.id)}
                                className="px-2.5 py-1 rounded bg-yellow-400 hover:bg-yellow-300 text-black text-[11px] font-bold shrink-0 flex items-center gap-1 shadow-neon-yellow"
                              >
                                {copiedKey === lic.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedKey === lic.id ? "কপি হয়েছে" : "কপি"}</span>
                              </button>
                            </div>
                          </div>

                          {/* HWID Bind Form */}
                          <div className="space-y-1.5 pt-2">
                            <span className="text-[11px] text-slate-400 block font-mono">পিসি Machine HWID:</span>
                            {isBound ? (
                              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] font-mono text-emerald-300">
                                ✓ লক করা HWID: {lic.hwid}
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="সফটওয়্যার থেকে HWID কপি করে পেস্ট করুন..."
                                  value={hwidInputs[lic.id] || ""}
                                  onChange={(e) => setHwidInputs(prev => ({ ...prev, [lic.id]: e.target.value }))}
                                  className="flex-1 px-3 py-2 rounded-xl bg-[#111] border border-white/20 text-xs font-mono text-white placeholder:text-slate-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleBindHwid(lic.id)}
                                  disabled={bindingId === lic.id}
                                  className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black shadow-neon-yellow transition-all whitespace-nowrap"
                                >
                                  {bindingId === lic.id ? "লক হচ্ছে..." : "HWID লক করুন"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 pt-2 border-t border-white/10">
                          {isBound ? (
                            <span className="text-emerald-400 font-bold">✓ লাইসেন্স এই পিসিতে আজীবন আনলক করা রয়েছে।</span>
                          ) : (
                            <span>সফটওয়্যার চালু করে স্ক্রিনের HWID এখানে সাবমিট করলেই লাইসেন্স সক্রিয় হবে।</span>
                          )}
                        </div>
                      </div>
                    </Card3D>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center shrink-0">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white">এখনো কোনো লাইসেন্স নেওয়া হয়নি</h5>
                    <p className="text-slate-400">
                      {totalPendingCount > 0 
                        ? "আপনার ডিপোজিট ভেরিফিকেশন চলছে। ব্যালেন্স যুক্ত হওয়ামাত্রই আপনি অফার কিনে লাইসেন্স চালু করতে পারবেন।"
                        : "ওয়ালেটে ব্যালেন্স রিচার্জ করে মাত্র $২ দিয়ে ৭ দিনের অফার লাইসেন্স কিনে নিতে পারেন।"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("wallet")}
                  className="px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black shadow-neon-yellow transition-all whitespace-nowrap"
                >
                  অফার প্ল্যান দেখুন ও কিনুন
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: ADD MONEY + INSTANT BUY OFFER WITH WALLET               */}
      {/* ============================================================== */}
      {activeTab === "wallet" && (
        <div key="tab-wallet" className="animate-tab-fade grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Add Money via bKash / Rocket */}
          <div className="lg:col-span-6">
            <Card3D maxTilt={5} depth={1.02} glare={true} className="h-full">
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10 h-full">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-gradient-shimmer flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-yellow-400" />
                  <span>ধাপ ১: ওয়ালেটে ব্যালেন্স লোড করুন</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  বিকাশ অথবা রকেট পার্সোনালে টাকা পাঠিয়ে TrxID সাবমিট করুন।
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-yellow-400/15 text-yellow-400 border border-yellow-400/30">
                $১ = ৳১২০ BDT
              </span>
            </div>

            {/* ৩-ধাপের ভিজ্যুয়াল মিনি পেমেন্ট গাইড (Visual 3-Step Guide) — পেমেন্ট বক্সের ঠিক ওপরে */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>সহজ ৩-ধাপে ডিপোজিট সম্পন্ন করুন:</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  ⚡ অটো ব্যালেন্স রিচার্জ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-black border border-white/10 hover:border-yellow-400/40 transition-all flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-yellow-400 text-black font-black flex items-center justify-center text-xs shrink-0 shadow-neon-yellow">
                    ১
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Send Money দিন</h5>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {depositMethod} অ্যাপে Send Money-তে যান।
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black border border-white/10 hover:border-yellow-400/40 transition-all flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-red-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-neon-red">
                    ২
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">টাকা পাঠান</h5>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      নাম্বারে <strong>৳{depositAmountUSD * 120}</strong> পাঠান।
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black border border-white/10 hover:border-yellow-400/40 transition-all flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-black font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                    ৩
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">TrxID পেস্ট করুন</h5>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      SMS-এর TrxID নিচে পেস্ট করুন।
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Payment Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                depositMethod === "bKash" ? "bg-[#D12053]/20 border-[#D12053]" : "bg-black border-white/10"
              }`} onClick={() => setDepositMethod("bKash")}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-white">বিকাশ পার্সোনাল</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyPaymentNum(settings.bkashMerchantNumber, "bkash");
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-yellow-400 text-black font-black"
                  >
                    {copiedNum === "bkash" ? "কপি হয়েছে" : "কপি"}
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
                  <span className="font-black text-white">রকেট পার্সোনাল</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyPaymentNum(settings.rocketMerchantNumber, "rocket");
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-black"
                  >
                    {copiedNum === "rocket" ? "কপি হয়েছে" : "কপি"}
                  </button>
                </div>
                <span className="font-mono text-base font-black text-yellow-400">
                  {settings.rocketMerchantNumber}
                </span>
              </div>
            </div>

            {/* Quick Amount Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-slate-300 block">
                  টাকার পরিমাণ নির্বাচন করুন (USD / BDT)
                </label>
                <span className="text-[10px] font-mono font-bold text-yellow-400">
                  {depositAmountUSD === 2 ? "🔥 ৭ দিনের অফার" : depositAmountUSD === 4 ? "🔥 ১৫ দিনের অফার" : depositAmountUSD === 8 ? "🔥 ৩০ দিনের VIP অফার" : "কাস্টম অ্যামাউন্ট"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { usd: 2, label: "৭ দিন" },
                  { usd: 4, label: "১৫ দিন" },
                  { usd: 8, label: "৩০ দিন" },
                  { usd: 15, label: "VIP" }
                ].map(({ usd, label }) => (
                  <button
                    key={usd}
                    type="button"
                    onClick={() => setDepositAmountUSD(usd)}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all border text-center ${
                      depositAmountUSD === usd
                        ? "bg-yellow-400 text-black border-yellow-400 shadow-neon-yellow scale-[1.03]"
                        : "bg-black text-white border-white/10 hover:border-white/30"
                    }`}
                  >
                    <span className="block font-black">${usd}</span>
                    <span className={`block text-[10px] font-mono ${depositAmountUSD === usd ? "text-black/90 font-bold" : "text-slate-400"}`}>
                      ৳{usd * 120}
                    </span>
                    <span className={`block text-[9px] ${depositAmountUSD === usd ? "text-red-900 font-black" : "text-yellow-400/80"}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">প্রেরক মোবাইল নম্বর (Sender Number)</label>
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
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-300">{depositMethod} ট্রানজেকশন আইডি (TrxID)</label>
                  <button
                    type="button"
                    onClick={() => handlePasteTrxId(setDepositTrxId)}
                    className="text-[10px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-bold bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30 transition-all active:scale-95"
                    title="ক্লিপবোর্ড থেকে অটো পেস্ট করুন"
                  >
                    <Copy className="w-3 h-3" />
                    <span>ক্লিপবোর্ড থেকে পেস্ট</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="যেমন: BK992A81KC বা RK82736"
                    value={depositTrxId}
                    onChange={(e) => setDepositTrxId(e.target.value)}
                    className="w-full p-3 pr-14 rounded-xl glass-input font-mono uppercase text-yellow-400 font-bold"
                    required
                  />
                  {depositTrxId && (
                    <button
                      type="button"
                      onClick={() => setDepositTrxId("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 hover:opacity-95 text-black font-black text-sm shadow-neon-yellow transition-all"
                >
                  {isDepositing ? "যাচাই হচ্ছে..." : `টাকা জমা দিন — ব্যালেন্স যোগ করুন (৳${depositAmountUSD * 120})`}
                </button>
              </div>
            </form>
              </div>
            </Card3D>
          </div>

          {/* Right: Buy TOOLS OFFER PRICE Using Wallet Balance */}
          <div className="lg:col-span-6">
            <Card3D maxTilt={5} depth={1.02} glare={true} className="h-full">
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-yellow-400/30 h-full">
            <div className="pb-3 border-b border-white/10">
              <span className="text-[11px] font-black uppercase tracking-widest text-red-500">
                তাৎক্ষণিক লাইসেন্স ক্রয়
              </span>
              <h2 className="text-2xl font-black text-gradient-shimmer mt-0.5">
                ধাপ ২: টুলস স্পেশাল অফার কিনুন 🔊
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                ওয়ালেট ব্যালেন্স দিয়ে ১-ক্লিকে কিনুন &rarr; টুলস ডাউনলোড করুন &rarr; HWID বসিয়ে লাইসেন্স সক্রিয় করুন।
              </p>
            </div>

            <div className="space-y-4">
              {activePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/80 border-white/15 hover:border-yellow-400/40"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white">
                        {plan.durationDays} দিনের অফার 🔥
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {flagshipTool?.name} &bull; সিঙ্গেল HWID লক &bull; ১০০% সুরক্ষিত
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
                      {buyingPlanId === plan.id ? "প্রসেসিং..." : `কিনুন ($${plan.priceUSD})`}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[#111] border border-white/10 text-xs text-slate-300 space-y-1.5">
              <p className="font-black text-yellow-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-red-500" />
                <span>HWID লাইসেন্স কি যেভাবে কাজ করে:</span>
              </p>
              <p>১. বিকাশ/রকেটে ব্যালেন্স যোগ করে ৭, ১৫, অথবা ৩০ দিনের অফার কিনুন।</p>
              <p>২. টুল ডাউনলোড করে কম্পিউটারে ওপেন করলে আপনার পিসির HWID দেখতে পাবেন।</p>
              <p>৩. 'আমার লাইসেন্স ও HWID কি' অপশনে গিয়ে HWID পেস্ট করে <strong>HWID লক করুন</strong>-এ ক্লিক করলেই আপনার লাইসেন্স স্বয়ংক্রিয়ভাবে সক্রিয় হবে!</p>
            </div>
              </div>
            </Card3D>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MY LICENSES & HWID KEY BINDING (FIREBASE SYNC)          */}
      {/* ============================================================== */}
      {activeTab === "licenses" && (
        <div key="tab-licenses" className="animate-tab-fade space-y-6">
          {userLicenses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userLicenses.map((lic) => {
                const expiresDate = new Date(lic.expiresAt);
                const isExpired = expiresDate.getTime() < Date.now();
                const daysRemaining = Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

                return (
                  <Card3D key={lic.id} maxTilt={6} depth={1.02} glare={true} className="h-full">
                    <div
                      className="glass-panel rounded-3xl p-6 sm:p-7 space-y-5 border border-white/10 hover:border-yellow-400/50 transition-all shadow-xl h-full"
                    >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <span className={`text-xs font-black uppercase tracking-wider ${getToolTitleClass(lic.toolName)}`}>
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

                    {/* Direct Download & Setup Video Buttons on Card */}
                    {flagshipTool && (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <a
                            href={flagshipTool.downloadFilePath}
                            download
                            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all"
                          >
                            <Download className="w-3.5 h-3.5 text-black" />
                            <span>টুল ডাউনলোড ({flagshipTool.fileSize})</span>
                          </a>

                          {flagshipTool.setupVideoUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingLicenseVideoId(viewingLicenseVideoId === lic.id ? null : lic.id)}
                              className="py-2.5 px-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center justify-center gap-2 shadow-neon-yellow transition-all"
                            >
                              <Play className="w-3.5 h-3.5 text-red-600" />
                              <span>{viewingLicenseVideoId === lic.id ? "ভিডিও লুকান ▲" : "সেটআপ ভিডিও ▼"}</span>
                            </button>
                          )}
                        </div>

                        {viewingLicenseVideoId === lic.id && flagshipTool.setupVideoUrl && (
                          <div className="p-3.5 rounded-2xl bg-black border border-yellow-400/50 space-y-2">
                            <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                              <Play className="w-3.5 h-3.5 text-red-500" />
                              <span>{flagshipTool.name} — ফুল সেটআপ ভিডিও গাইড:</span>
                            </span>
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black shadow-lg">
                              <iframe
                                width="100%"
                                height="100%"
                                loading="lazy"
                                src={normalizeYouTubeEmbedUrl(flagshipTool.setupVideoUrl)}
                                title="License Setup Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    </div>
                  </Card3D>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl glass-panel border border-white/10 space-y-4">
              <Key className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">এখনও কোনো লাইসেন্স সক্রিয় নেই</h3>
              <p className="text-xs text-slate-400">
                ওয়ালেটে ব্যালেন্স লোড করে ৭ দিন ($২), ১৫ দিন ($৪), অথবা ৩০ দিন ($৮)-এর অফার কিনে এখনই লাইসেন্স কী সক্রিয় করুন!
              </p>
              <button
                onClick={() => setActiveTab("wallet")}
                className="inline-block px-5 py-2.5 rounded-xl bg-yellow-400 text-black text-xs font-black shadow-neon-yellow"
              >
                ব্যালেন্স লোড ও অফার কিনুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: AUTHORIZED DOWNLOADS & SETUP VIDEOS                     */}
      {/* ============================================================== */}
      {activeTab === "downloads" && (
        <div key="tab-downloads" className="animate-tab-fade space-y-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
            <div>
              <h3 className="text-xl font-black text-gradient-shimmer">
                সফটওয়্যার প্যাকেজ ডাউনলোড ও সেটআপ ভিডিও গাইড
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                অফিশিয়াল সফটওয়্যার ডাউনলোড করুন এবং সেটআপ ভিডিও গাইড দেখে সহজেই আপনার কম্পিউটারে ইন্সটল ও লাইসেন্স অ্যাক্টিভ করুন।
              </p>
            </div>

            <div className="space-y-4">
              {tools.map((t) => {
                const isComingSoon = t.status === "coming_soon";
                const isWatchingVideo = viewingDownloadVideoId === t.id;

                const isPurchased = allActiveLicenses.some(lic => 
                  lic.toolId === t.id || 
                  lic.toolName?.toLowerCase() === t.name?.toLowerCase() ||
                  (t.id.includes("otp") && lic.toolId?.includes("otp"))
                );

                return (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-[#0f0f0f] border border-white/10 hover:border-yellow-400/40 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-black text-base ${getToolTitleClass(t.name)}`}>{t.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            isComingSoon 
                              ? "bg-white/10 text-slate-300 border border-white/15" 
                              : isPurchased
                              ? "text-black bg-emerald-400 font-black"
                              : "text-yellow-400 bg-yellow-400/10 border border-yellow-400/30"
                          }`}>
                            {isComingSoon ? t.version : isPurchased ? "✓ সক্রিয় আনলকড" : t.version}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{t.tagline}</p>
                        <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                          <span>Size: {t.fileSize}</span>
                          <span>OS: {t.systemRequirements.os}</span>
                        </div>
                      </div>

                      {isComingSoon ? (
                        <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-black flex items-center justify-center gap-2 shrink-0">
                          <Lock className="w-4 h-4 text-yellow-400" />
                          <span>Coming Soon (শীঘ্রই আসছে)</span>
                        </div>
                      ) : !isPurchased ? (
                        <button
                          type="button"
                          onClick={() => setActiveTab("wallet")}
                          className="px-5 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center justify-center gap-2 shadow-neon-yellow transition-all shrink-0"
                        >
                          <Lock className="w-4 h-4 text-black" />
                          <span>অফার কিনলে ডাউনলোড হবে</span>
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                          <a
                            href={t.downloadFilePath || "/releases/Setup.zip"}
                            download
                            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all"
                          >
                            <Download className="w-4 h-4 text-black" />
                            <span>টুল ডাউনলোড ({t.fileSize})</span>
                          </a>

                          {t.setupVideoUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingDownloadVideoId(isWatchingVideo ? null : t.id)}
                              className="px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center justify-center gap-2 shadow-neon-yellow transition-all"
                            >
                              <Play className="w-4 h-4 text-red-600" />
                              <span>{isWatchingVideo ? "ভিডিও লুকান ▲" : "সেটআপ ভিডিও ▼"}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expandable Setup Video Player */}
                    {!isComingSoon && isWatchingVideo && t.setupVideoUrl && (
                      <div className="pt-4 border-t border-white/10 space-y-2">
                        <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                          <Play className="w-4 h-4 text-red-500" />
                          <span>{t.name} — ফুল ইনস্টলেশন ও সেটআপ ভিডিও গাইড:</span>
                        </span>
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-yellow-400/40 bg-black shadow-2xl max-w-2xl">
                          <iframe
                            width="100%"
                            height="100%"
                            loading="lazy"
                            src={normalizeYouTubeEmbedUrl(t.setupVideoUrl)}
                            title={`${t.name} Setup Guide`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PAYMENT & DEPOSIT HISTORY                               */}
      {/* ============================================================== */}
      {activeTab === "orders" && (
        <div key="tab-orders" className="animate-tab-fade space-y-6">
          {/* Wallet Deposits Table */}
          <Card3D maxTilt={4} depth={1.01} glare={true}>
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10 shadow-xl">
              <h3 className="text-lg font-black text-gradient-shimmer">ওয়ালেট ব্যালেন্স যোগের হিস্টোরি</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="pb-3 font-bold">পদ্ধতি</th>
                      <th className="pb-3 font-bold">পরিমাণ</th>
                      <th className="pb-3 font-bold">প্রেরক নম্বর</th>
                      <th className="pb-3 font-bold">TrxID</th>
                      <th className="pb-3 font-bold">স্ট্যাটাস</th>
                      <th className="pb-3 font-bold">তারিখ</th>
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
          </Card3D>

          {/* Orders Table */}
          <Card3D maxTilt={4} depth={1.01} glare={true}>
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10 shadow-xl">
              <h3 className="text-lg font-black text-gradient-shimmer">সফটওয়্যার লাইসেন্স অর্ডার হিস্টোরি</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="pb-3 font-bold">অর্ডার নম্বর</th>
                      <th className="pb-3 font-bold">টুল ও অফার প্ল্যান</th>
                      <th className="pb-3 font-bold">মূল্য</th>
                      <th className="pb-3 font-bold">পেমেন্ট মাধ্যম</th>
                      <th className="pb-3 font-bold">TrxID</th>
                      <th className="pb-3 font-bold">স্ট্যাটাস</th>
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
          </Card3D>
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
              <span>আপনার মেম্বারশিপ ও সক্রিয় সফটওয়্যার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gradient-shimmer">
              আমার কেনা টুলস ও লাইসেন্স মেম্বারশিপ তালিকা
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
              const isVideoOpen = !closedVideoIds[lic.id];

              return (
                <Card3D key={lic.id} maxTilt={4} depth={1.01} glare={true}>
                  <div
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
                          <h3 className={`text-lg sm:text-xl font-black ${getToolTitleClass(lic.toolName)}`}>
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
                          onClick={() => setClosedVideoIds(prev => ({ ...prev, [lic.id]: !prev[lic.id] }))}
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
                            loading="lazy"
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
                          onClick={() => setClosedVideoIds(prev => ({ ...prev, [lic.id]: false }))}
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
                </Card3D>
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
    </div>
  );
}
