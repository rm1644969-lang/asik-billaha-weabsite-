"use client";

import React, { useState } from "react";
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
  X
} from "lucide-react";
import { useNexusStore } from "@/lib/store";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { settings, smsDevices } = useNexusStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeDevice = smsDevices.find(d => d.status === "ONLINE");

  const menuItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Tools Management", href: "/admin/tools", icon: Layers },
    { name: "Price Plans", href: "/admin/plans", icon: Tag },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Payments & SMS Log", href: "/admin/payments", icon: CreditCard },
    { name: "License Control", href: "/admin/licenses", icon: Key },
    { name: "HWID Management", href: "/admin/hwid", icon: Cpu },
    { name: "Tutorials & Videos", href: "/admin/tutorials", icon: Tv },
    { name: "SMS Companion Device", href: "/admin/sms-devices", icon: Smartphone },
    { name: "Website & Payment Config", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/admin" && pathname !== "/admin") return false;
    return pathname === path || (path !== "/admin" && pathname.startsWith(path));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row">
      
      {/* Mobile Sidebar Toggle Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-yellow-400" />
          <span className="font-black text-sm text-white">Toolsbd.com Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-300 hover:text-white bg-white/5"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-yellow-400" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col justify-between p-4 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="space-y-6">
          
          {/* Admin Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
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
                  OWNER CONSOLE
                </span>
              </div>
            </Link>
          </div>

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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
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
        <div className="pt-4 border-t border-white/10 space-y-2">
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
