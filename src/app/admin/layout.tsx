"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Layers, 
  Tag, 
  ShoppingCart, 
  CreditCard, 
  Key, 
  Cpu, 
  Tv,
  Settings, 
  Smartphone, 
  ArrowLeft, 
  ShieldCheck, 
  Send,
  Menu,
  X,
  Database,
  Volume2,
  VolumeX,
  Bell,
  DownloadCloud,
  CheckCircle2
} from "lucide-react";
import { useNexusStore } from "@/lib/store";
import { webDb } from "@/lib/firebase";
import { collection, query, onSnapshot, limit, orderBy } from "firebase/firestore";
import { playChimeSound, showBrowserNotification } from "@/lib/notifications";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { settings, smsDevices } = useNexusStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [recentAlert, setRecentAlert] = useState<{ id: string; type: "order" | "deposit"; title: string; subtitle: string; link: string } | null>(null);

  const seenOrderIds = useRef<Set<string>>(new Set());
  const seenDepositIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);

  // Listen for PWA install prompt
  useEffect(() => {
    const handleInstallable = (e: any) => {
      setInstallPrompt(e.detail || (window as any).deferredPrompt);
    };
    window.addEventListener("pwa-installable", handleInstallable);
    if ((window as any).deferredPrompt) {
      setInstallPrompt((window as any).deferredPrompt);
    }
    return () => window.removeEventListener("pwa-installable", handleInstallable);
  }, []);

  const handleInstallAdminPwa = async () => {
    const prompt = installPrompt || (window as any).deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstallPrompt(null);
      }
    } else {
      alert("Admin PWA: আপনার ব্রাউজারের থ্রি-ডট (Menu) থেকে 'Install App' বা 'Add to Home Screen' ক্লিক করুন।");
    }
  };

  // Real-time Push & Sound Alerts for New Orders & Deposits
  useEffect(() => {
    // Request notification permission if not yet granted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    let unsubOrders: (() => void) | undefined;
    let unsubDeposits: (() => void) | undefined;

    try {
      const qOrders = query(collection(webDb, "orders"), limit(25));
      unsubOrders = onSnapshot(qOrders, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const docData = change.doc.data();
          const docId = change.doc.id;

          if (initialLoadDone.current) {
            if (change.type === "added" && !seenOrderIds.current.has(docId)) {
              // Trigger Alert
              if (soundEnabled) playChimeSound("alert");
              showBrowserNotification("🔔 New Tool Order!", {
                body: `${docData.toolName || "Software Tool"} ($${docData.amountUSD || docData.amount || 2}) from ${docData.userEmail || "Customer"}`,
                data: { url: "/admin/orders" }
              });
              setRecentAlert({
                id: docId,
                type: "order",
                title: "🔔 New Order Placed!",
                subtitle: `${docData.toolName || "Tool"} — $${docData.amountUSD || docData.amount} (${docData.userEmail || "Customer"})`,
                link: "/admin/orders"
              });
            }
          }
          seenOrderIds.current.add(docId);
        });
      });

      const qDeposits = query(collection(webDb, "wallet_deposits"), limit(25));
      unsubDeposits = onSnapshot(qDeposits, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const docData = change.doc.data();
          const docId = change.doc.id;

          if (initialLoadDone.current) {
            if (change.type === "added" && !seenDepositIds.current.has(docId)) {
              if (soundEnabled) playChimeSound("coin");
              showBrowserNotification("💰 New Wallet Deposit!", {
                body: `৳${docData.amountBDT || Math.round(docData.amountUSD * 120)} from ${docData.userEmail || "Customer"} (TrxID: ${docData.trxId || "N/A"})`,
                data: { url: "/admin/payments" }
              });
              setRecentAlert({
                id: docId,
                type: "deposit",
                title: "💰 New Deposit Request!",
                subtitle: `৳${docData.amountBDT || 240} via ${docData.method || "bKash"} (TrxID: ${docData.trxId || "..."})`,
                link: "/admin/payments"
              });
            }
          }
          seenDepositIds.current.add(docId);
        });
        initialLoadDone.current = true;
      });
    } catch (e) {
      console.warn("Admin alerts listener notice:", e);
    }

    return () => {
      if (unsubOrders) unsubOrders();
      if (unsubDeposits) unsubDeposits();
    };
  }, [soundEnabled]);

  const activeDevice = smsDevices.find(d => d.status === "ONLINE");

  const menuItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Tools Management", href: "/admin/tools", icon: Layers },
    { name: "Price Plans", href: "/admin/plans", icon: Tag },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Payments & SMS Log", href: "/admin/payments", icon: CreditCard },
    { name: "License Control", href: "/admin/licenses", icon: Key },
    { name: "HWID Management", href: "/admin/hwid", icon: Cpu },
    { name: "Dual Firebase & Scaling", href: "/admin/scaling", icon: Database },
    { name: "Tutorials & Videos", href: "/admin/tutorials", icon: Tv },
    { name: "SMS Companion Device", href: "/admin/sms-devices", icon: Smartphone },
    { name: "Website & Payment Config", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/admin" && pathname !== "/admin") return false;
    return pathname === path || (path !== "/admin" && pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row relative">
      
      {/* Floating Real-time Admin Alert Toast */}
      {recentAlert && (
        <div className="fixed top-4 right-4 z-50 max-w-sm rounded-2xl p-4 bg-[#141414] border-2 border-yellow-400 shadow-neon-yellow flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-yellow-400">{recentAlert.title}</h4>
            <p className="text-xs text-slate-200">{recentAlert.subtitle}</p>
            <Link
              href={recentAlert.link}
              onClick={() => setRecentAlert(null)}
              className="inline-block pt-1 text-xs font-bold text-red-400 hover:text-red-300 underline"
            >
              এখনই চেক করুন &rarr;
            </Link>
          </div>
          <button
            onClick={() => setRecentAlert(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Sidebar Toggle Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-yellow-400" />
          <span className="font-black text-sm text-white">Toolsbd Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg text-xs font-bold ${soundEnabled ? "text-yellow-400 bg-yellow-400/10" : "text-slate-500 bg-white/5"}`}
            title={soundEnabled ? "Sound Alert On" : "Sound Muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-white/5"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-yellow-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay (Tap outside to close drawer) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-35 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col justify-between p-4 transition-transform duration-300 overflow-y-auto
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="space-y-4">
          
          {/* Admin Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-red-600 p-[2px]">
                <div className="w-full h-full bg-[#0a0a0a] rounded-[6px] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
              <div>
                <span className="font-black text-sm text-white block">
                  Toolsbd<span className="text-red-500">.com</span>
                </span>
                <span className="text-[10px] text-yellow-400 font-mono font-bold">
                  ADMIN CONSOLE
                </span>
              </div>
            </Link>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playChimeSound("alert");
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                soundEnabled ? "text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20" : "text-slate-500 hover:text-slate-400"
              }`}
              title={soundEnabled ? "Sound Alerts: ON" : "Sound Alerts: MUTED"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Install Admin PWA Button */}
          <button
            onClick={handleInstallAdminPwa}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-red-950/80 to-black border border-red-500/50 hover:border-red-400 text-left transition-all group"
          >
            <div className="flex items-center gap-2">
              <DownloadCloud className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-xs font-black text-white block">Install Admin App</span>
                <span className="text-[10px] text-slate-400 block">PWA Control Center</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">
              PWA
            </span>
          </button>

          {/* SMS Device Status Quick Widget */}
          <div className="p-3 rounded-xl bg-black border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-300 flex items-center gap-1 font-semibold">
                <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
                <span>SMS Gateway:</span>
              </span>
              <span className="flex items-center gap-1 font-black text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate font-mono">
              bKash &bull; Rocket Sync Active
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-yellow-400 text-black shadow-neon-yellow font-black"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-black" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Footer / Return to Store */}
        <div className="pt-3 border-t border-white/10 space-y-1.5">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Website</span>
          </Link>
          <a
            href={settings.telegramGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/40 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Telegram Channel</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
