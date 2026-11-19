"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Terminal,
  Home,
  Layers,
  Tag,
  ShoppingCart,
  LayoutDashboard,
  Tv,
  HelpCircle,
  MessageSquare,
  Send,
  Shield,
  Wallet,
  Menu,
  X,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  User
} from "lucide-react";
import { useNexusStore } from "@/lib/store";
import Footer from "@/components/Footer";
import CyberCursor from "@/components/CyberCursor";
import MouseParticles from "@/components/MouseParticles";
import CuteRobotCompanion from "@/components/CuteRobotCompanion";
import CyberCanvas3D from "@/components/CyberCanvas3D";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, walletBalanceUSD, currentUser, isLoggedIn, logoutUser } = useNexusStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Admin panel already has its own dedicated full-fledged layout
  if (pathname.startsWith("/admin")) {
    return <div className="min-h-screen bg-[#050505]">{children}</div>;
  }

  const navItems = [
    { name: "হোম", href: "/", icon: Home },
    { name: "টুলস মার্কেটপ্লেস", href: "/tools", icon: Layers },
    { name: "অফার প্রাইসিং ($২+)", href: "/pricing", icon: Tag, badge: "$২+", highlight: true },
    { name: "চেকআউট", href: "/checkout", icon: ShoppingCart },
    { name: "আমার ড্যাশবোর্ড", href: "/dashboard", icon: LayoutDashboard, badge: "HWID" },
    { name: "ভিডিও গাইড", href: "/tutorials", icon: Tv },
    { name: "প্রশ্নোত্তর", href: "/faq", icon: HelpCircle },
    { name: "যোগাযোগ", href: "/contact", icon: MessageSquare },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname === path || (path !== "/" && pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070707] text-white selection:bg-yellow-400 selection:text-black">
      
      {/* 1. MOBILE TOP HEADER (VISIBLE BELOW lg) */}
      <header className="lg:hidden sticky top-0 z-40 h-14 px-4 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-yellow-400 hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 via-red-600 to-black p-[1.5px] shadow-neon-yellow">
              <div className="w-full h-full bg-[#0a0a0a] rounded-[6px] flex items-center justify-center">
                <Terminal className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="font-black text-lg tracking-tight text-white">
              Toolsbd<span className="text-red-500">.com</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-2.5 py-1.5 rounded-lg bg-yellow-400/15 border border-yellow-400/40 text-yellow-400 text-xs font-black font-mono flex items-center gap-1 hover:bg-yellow-400/25 transition-all"
          >
            <Wallet className="w-3 h-3" />
            <span>${walletBalanceUSD.toFixed(2)}</span>
          </Link>
          <Link
            href="/admin"
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-black shadow-neon-yellow hover:opacity-95 transition-all"
          >
            এডমিন
          </Link>
        </div>
      </header>

      {/* 3. MAIN BODY CONTAINER: LEFT SIDEBAR + RIGHT CONTENT */}
      <div className="flex-1 flex relative">

        {/* Mobile Backdrop Overlay */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          />
        )}

        {/* ============================================================== */}
        {/* LEFT VERTICAL DASHBOARD SIDEBAR (DESKTOP + MOBILE DRAWER)      */}
        {/* ============================================================== */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-50 lg:z-30
            h-screen bg-[#0a0a0a]/95 backdrop-blur-2xl border-r border-white/10
            flex flex-col justify-between transition-all duration-300 shrink-0
            ${collapsed ? "lg:w-20" : "w-64"}
            ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Top Brand + Nav Links */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* Brand Header + Collapse Button */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 group min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 via-red-600 to-black p-[2px] shadow-neon-yellow shrink-0 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-[#0a0a0a] rounded-[9px] flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-yellow-400" />
                  </div>
                </div>
                {!collapsed && (
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-lg tracking-tight text-white">
                        Toolsbd<span className="text-red-500">.com</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest block">
                      BD #1 Tools Platform
                    </span>
                  </div>
                )}
              </Link>

              {/* Close button on mobile */}
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Desktop Collapse Toggle */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-white/5 transition-colors"
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* User Account / Profile status */}
            {!collapsed && (
              isLoggedIn && currentUser ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <div className="truncate min-w-0">
                    <span className="font-bold text-white block truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">{currentUser.email}</span>
                  </div>
                  <button
                    onClick={logoutUser}
                    className="text-[10px] font-bold text-slate-400 hover:text-red-400 shrink-0 ml-2"
                  >
                    লগআউট
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/40 text-yellow-400 text-xs font-black transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>লগইন / রেজিস্টার</span>
                </Link>
              )
            )}

            {/* Wallet Widget in Sidebar */}
            {!collapsed ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block p-3.5 rounded-2xl bg-gradient-to-br from-[#131313] to-black border border-yellow-400/30 hover:border-yellow-400 transition-all group shadow-md"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-yellow-400" />
                    <span>ওয়ালেট ব্যালেন্স</span>
                  </span>
                  <span className="text-[10px] font-black text-yellow-400 group-hover:text-white flex items-center gap-0.5 bg-yellow-400/10 px-2 py-0.5 rounded-md border border-yellow-400/30">
                    <PlusCircle className="w-3 h-3 text-yellow-400" />
                    <span>টাকা যোগ</span>
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-yellow-400 font-mono tracking-tight">
                    ${walletBalanceUSD.toFixed(2)}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    ৳{(walletBalanceUSD * 120).toLocaleString()} BDT
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                href="/dashboard"
                title={`Wallet Balance: $${walletBalanceUSD.toFixed(2)}`}
                className="flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-yellow-400/10 border border-white/10 hover:border-yellow-400 transition-all text-yellow-400"
              >
                <Wallet className="w-5 h-5" />
              </Link>
            )}

            {/* Navigation Links */}
            <div className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  ড্যাশবোর্ড ও নেভিগেশন
                </p>
              )}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.name : undefined}
                      className={`relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-neon-yellow font-black scale-[1.01]"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? "text-black" : "text-yellow-400"}`} />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </div>

                      {!collapsed && item.badge && (
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm ${
                            active
                              ? "bg-black text-yellow-400"
                              : item.highlight
                              ? "bg-red-600 text-white animate-pulse"
                              : "bg-white/10 text-slate-300"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Active indicator bar */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-black" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Pricing Badge / Banner in Sidebar */}
            {!collapsed && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 via-red-500/10 to-transparent border border-yellow-500/20 text-xs">
                <div className="flex items-center gap-1.5 font-black text-yellow-400 text-[11px] mb-1">
                  <Flame className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                  <span>স্পেশাল অফার</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  ৭ দিন: <strong>$২</strong> &bull; ১৫ দিন: <strong>$৪</strong> &bull; ৩০ দিন: <strong>$৮</strong>
                </p>
                <Link
                  href="/pricing"
                  className="mt-2 text-[10px] font-black text-yellow-400 hover:underline flex items-center gap-1"
                >
                  <span>প্ল্যান বেছে নিন</span>
                  <Zap className="w-3 h-3" />
                </Link>
              </div>
            )}

          </div>

          {/* Bottom Sidebar Action Buttons */}
          <div className="p-4 border-t border-white/10 space-y-2 bg-[#080808]">
            
            {/* Telegram VIP Button */}
            <a
              href={settings.telegramGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="টেলিগ্রাম ভিআইপি"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black text-white bg-red-950/80 hover:bg-red-600 border border-red-500/60 transition-all shadow-neon-red active:scale-95"
            >
              <Send className="w-4 h-4 text-red-400 shrink-0" />
              {!collapsed && <span>টেলিগ্রাম ভিআইপি</span>}
            </a>

            {/* Owner Admin Panel Button */}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              title="অনার এডমিন প্যানেল"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:opacity-95 shadow-neon-yellow transition-all active:scale-95"
            >
              <Shield className="w-4 h-4 shrink-0" />
              {!collapsed && <span>অনার এডমিন</span>}
            </Link>

            {!collapsed && (
              <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-semibold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>বিকাশ ও রকেট অটো: ২৪/৭ চালু</span>
              </div>
            )}
          </div>
        </aside>

        {/* ============================================================== */}
        {/* RIGHT MAIN CONTENT AREA                                        */}
        {/* ============================================================== */}
        <div className="flex-1 min-w-0 flex flex-col relative">
          {/* Global Ambient 3D Cyber Canvas across all website pages */}
          <CyberCanvas3D className="fixed inset-0 pointer-events-none opacity-30 z-0" />
          <main className="flex-1 pb-16 lg:pb-0 relative z-10">{children}</main>
          <Footer />
        </div>

      </div>

      {/* 4. MOBILE BOTTOM QUICK NAVIGATION DOCK (VISIBLE ON SMALL SCREENS) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around text-[10px] font-bold">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            isActive("/") ? "text-yellow-400" : "text-slate-400 hover:text-white"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>হোম</span>
        </Link>
        <Link
          href="/tools"
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            isActive("/tools") ? "text-yellow-400" : "text-slate-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>টুলস</span>
        </Link>
        <Link
          href="/pricing"
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            isActive("/pricing") ? "text-yellow-400" : "text-slate-400 hover:text-white"
          }`}
        >
          <Tag className="w-4 h-4 text-red-500" />
          <span className="text-yellow-400 font-black">অফার ($২)</span>
        </Link>
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            isActive("/dashboard") ? "text-yellow-400" : "text-slate-400 hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>ড্যাশবোর্ড</span>
        </Link>
        <Link
          href="/admin"
          className={`flex flex-col items-center gap-1 p-1 transition-colors ${
            isActive("/admin") ? "text-yellow-400" : "text-slate-400 hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>এডমিন</span>
        </Link>
      </nav>

      {/* Interactive Global Cyber Cursor */}
      <CyberCursor />

      {/* Website-wide Cyber Sparkle Mouse Particles */}
      <MouseParticles />

      {/* Interactive Floating Cute Cyber Robot Assistant */}
      <CuteRobotCompanion />

    </div>
  );
}
