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
  ChevronRight
} from "lucide-react";
import { useNexusStore } from "@/lib/store";
import Footer from "@/components/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, walletBalanceUSD } = useNexusStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Admin panel already has its own dedicated left sidebar layout
  if (pathname.startsWith("/admin")) {
    return <div className="min-h-screen bg-[#050505]">{children}</div>;
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Tools", href: "/tools", icon: Layers },
    { name: "Offer Pricing", href: "/pricing", icon: Tag, badge: "$2+" },
    { name: "Checkout", href: "/checkout", icon: ShoppingCart },
    { name: "My Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: "HWID" },
    { name: "Tutorials", href: "/tutorials", icon: Tv },
    { name: "FAQ", href: "/faq", icon: HelpCircle },
    { name: "Contact", href: "/contact", icon: MessageSquare },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname === path || (path !== "/" && pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070707] text-white">
      
      {/* Top Announcement Bar */}
      {settings.isAnnouncementActive && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-red-950 via-black to-yellow-950 border-b border-yellow-500/30 text-[11px] sm:text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 text-yellow-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
          <span className="truncate">{settings.announcementNotice}</span>
          <a
            href={settings.telegramChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-black text-white hover:text-yellow-400 transition-colors shrink-0 ml-1"
          >
            Join Telegram
          </a>
        </div>
      )}

      {/* Mobile Top Header (Only visible below lg) */}
      <header className="lg:hidden sticky top-[33px] z-40 h-16 px-4 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-yellow-400 hover:bg-white/10"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 via-red-600 to-black p-[1.5px]">
              <div className="w-full h-full bg-[#0a0a0a] rounded-[6px] flex items-center justify-center">
                <Terminal className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
            <span className="font-black text-lg text-white">
              Toolsbd<span className="text-red-500">.com</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-2.5 py-1.5 rounded-lg bg-yellow-400/15 border border-yellow-400/40 text-yellow-400 text-xs font-black font-mono"
          >
            ${walletBalanceUSD.toFixed(2)}
          </Link>
          <Link
            href="/admin"
            className="px-2.5 py-1.5 rounded-lg bg-yellow-400 text-black text-xs font-black"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Main Body Shell: Left Sidebar + Right Content */}
      <div className="flex-1 flex relative">

        {/* Mobile Backdrop */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* ============================================================== */}
        {/* LEFT VERTICAL DASHBOARD SIDEBAR                                */}
        {/* ============================================================== */}
        <aside
          className={`
            fixed lg:sticky top-0 lg:top-[33px] left-0 z-50 lg:z-30
            h-screen lg:h-[calc(100vh-33px)]
            bg-[#0a0a0a]/95 backdrop-blur-2xl border-r border-white/10
            flex flex-col justify-between transition-all duration-300 shrink-0
            ${collapsed ? "lg:w-20" : "w-64"}
            ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          {/* Top Brand + Nav Links */}
          <div className="p-4 space-y-5 overflow-y-auto flex-1">
            
            {/* Brand Header + Collapse Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
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
                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider block">
                      BD #1 Tools Hub
                    </span>
                  </div>
                )}
              </Link>

              {/* Close button on mobile */}
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Collapse toggle on desktop */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-white/5 transition-colors"
                title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Wallet Mini Card inside Left Sidebar */}
            {!collapsed && (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block p-3.5 rounded-2xl bg-gradient-to-br from-[#141414] to-black border border-yellow-400/30 hover:border-yellow-400 transition-all group shadow-md"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-yellow-400" />
                    <span>Wallet Balance</span>
                  </span>
                  <span className="text-[10px] font-black text-red-400 group-hover:text-yellow-400 flex items-center gap-0.5">
                    <PlusCircle className="w-3 h-3" />
                    Add
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-yellow-400 font-mono">
                    ${walletBalanceUSD.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ৳{(walletBalanceUSD * 120).toLocaleString()}
                  </span>
                </div>
              </Link>
            )}

            {/* Vertical Navigation Menu */}
            <div className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Navigation Menu
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
                      className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? "bg-yellow-400 text-black shadow-neon-yellow font-black"
                          : "text-slate-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${active ? "text-black" : "text-yellow-400/80"}`} />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!collapsed && item.badge && (
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            active
                              ? "bg-black text-yellow-400"
                              : "bg-red-600/90 text-white"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

          </div>

          {/* Bottom Sidebar Action Buttons */}
          <div className="p-4 border-t border-white/10 space-y-2 bg-[#080808]">
            
            {/* Telegram VIP */}
            <a
              href={settings.telegramGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Telegram VIP"
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black text-white bg-red-950/80 hover:bg-red-600 border border-red-500/50 transition-all shadow-sm`}
            >
              <Send className="w-4 h-4 text-red-400 shrink-0" />
              {!collapsed && <span>Telegram VIP</span>}
            </a>

            {/* Owner Admin Panel */}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              title="Owner Admin Panel"
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:opacity-95 shadow-neon-yellow transition-all`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Owner Admin</span>}
            </Link>

            {!collapsed && (
              <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>bKash &amp; Rocket Auto: Online</span>
              </div>
            )}
          </div>
        </aside>

        {/* ============================================================== */}
        {/* RIGHT MAIN CONTENT AREA                                        */}
        {/* ============================================================== */}
        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>

      </div>
    </div>
  );
}
