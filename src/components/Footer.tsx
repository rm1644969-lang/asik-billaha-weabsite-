"use client";

import React from "react";
import Link from "next/link";
import { Terminal, Send, ShieldCheck, Zap, Mail, ArrowUpRight, Smartphone } from "lucide-react";
import { useNexusStore } from "@/lib/store";

export default function Footer() {
  const { settings } = useNexusStore();

  return (
    <footer className="relative bg-[#050505] border-t border-white/10 pt-16 pb-12 overflow-hidden">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 via-red-600 to-black p-[2px] shadow-neon-yellow">
                <div className="w-full h-full bg-[#0a0a0a] rounded-[9px] flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              <span className="font-black text-2xl tracking-tight text-white">
                Toolsbd<span className="text-red-500">.com</span>
              </span>
            </Link>
            
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              Official automated software licensing platform. Instant bKash &amp; Rocket payment verification and single-PC HWID security protection.
            </p>

            {/* Payment Numbers Highlight */}
            <div className="p-3.5 rounded-xl bg-[#0e0e0e] border border-white/10 space-y-2 max-w-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-red-500" />
                <span>Official Payment Accounts (Personal)</span>
              </span>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-bold">bKash (Send Money):</span>
                <span className="text-yellow-400 font-bold bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  {settings.bkashMerchantNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-bold">Rocket (Send Money):</span>
                <span className="text-red-400 font-bold bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  {settings.rocketMerchantNumber}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SMS Gateway: 100% Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-950/50 border border-yellow-500/40 text-yellow-300 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                <span>HWID Protected</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-yellow-400">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/tools" className="hover:text-yellow-400 transition-colors">
                  Tools Marketplace
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-yellow-400 transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="hover:text-yellow-400 transition-colors">
                  Setup Tutorials
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-yellow-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Area */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-yellow-400">
              Customer Portal
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/dashboard" className="hover:text-red-400 transition-colors">
                  My Active Licenses
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-red-400 transition-colors">
                  Reset HWID Lock
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-red-400 transition-colors">
                  Authorized Downloads
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-red-400 transition-colors">
                  My Account Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Telegram & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-red-500">
              Support & Community
            </h4>
            <div className="space-y-2.5 text-sm">
              <a
                href={settings.telegramGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-card border border-white/10 hover:border-yellow-400 text-slate-200 hover:text-white transition-all group"
              >
                <Send className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Join Telegram VIP</span>
              </a>

              <a
                href={`https://t.me/${settings.telegramSupportUsername.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-card border border-white/10 hover:border-red-500 text-slate-200 hover:text-white transition-all group"
              >
                <Mail className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Admin: {settings.telegramSupportUsername}</span>
              </a>

              <p className="text-[11px] text-slate-400 pt-1">
                Supported: bKash (01967922602) &bull; Rocket (01731328169)
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-yellow-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-yellow-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/faq" className="hover:text-yellow-400 transition-colors">
              License FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
