"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Terminal, 
  Send, 
  Shield, 
  Menu, 
  X, 
  User, 
  Sparkles,
  Zap
} from "lucide-react";
import { useNexusStore } from "@/lib/store";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { settings, currentUser, isLoggedIn } = useNexusStore();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Tools", href: "/tools" },
    { name: "Pricing", href: "/pricing" },
    { name: "Tutorials", href: "/tutorials" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && pathname !== "/") return false;
    return pathname.startsWith(path);
  };

  const isAdminArea = pathname.startsWith("/admin");

  return (
    <>
      {/* Announcement Bar in Yellow, Red & Black */}
      {settings.isAnnouncementActive && (
        <div className="bg-gradient-to-r from-red-950 via-black to-yellow-950 border-b border-yellow-500/30 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 text-yellow-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>{settings.announcementNotice}</span>
          <a 
            href={settings.telegramChannelUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline font-bold text-white hover:text-yellow-400 transition-colors ml-1"
          >
            Join Telegram
          </a>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070707]/90 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo - Toolsbd.com */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 via-red-600 to-black p-[2px] shadow-neon-yellow group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#0a0a0a] rounded-[9px] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-yellow-400 group-hover:text-red-400 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white group-hover:text-yellow-400 transition-colors">
                  Toolsbd<span className="text-red-500">.com</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                  BD #1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Automated Software Tools & Licenses
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Telegram Button */}
            <a
              href={settings.telegramGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white bg-red-950/60 border border-red-500/40 hover:bg-red-900/70 hover:border-red-400 transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-red-400" />
              <span>Telegram VIP</span>
            </a>

            {/* User Dashboard / Login / Admin Switcher */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-surface-card border border-white/10 hover:border-yellow-400/50 hover:bg-yellow-950/30 transition-all"
                >
                  <User className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="max-w-[120px] truncate">{currentUser?.name || "Dashboard"}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-surface-card border border-white/10 hover:border-yellow-400/50 hover:bg-yellow-950/30 transition-all"
                >
                  <User className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Sign In</span>
                </Link>
              )}

              {(currentUser?.role === "admin" || isAdminArea) && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black transition-all shadow-md ${
                    isAdminArea
                      ? "bg-yellow-400 text-black shadow-neon-yellow"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:opacity-95 hover:shadow-neon-yellow"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-yellow-400" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-yellow-500/30 px-4 pt-3 pb-6 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    isActive(link.href)
                      ? "text-yellow-400 bg-yellow-400/10 border border-yellow-400/30"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <a
                href={settings.telegramGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-bold text-white bg-red-950/70 border border-red-500/40"
              >
                <Send className="w-4 h-4 text-red-400" />
                <span>Join Official Telegram</span>
              </a>

              <div className="flex gap-2">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-slate-200 bg-surface-card border border-white/10"
                >
                  <User className="w-4 h-4 text-yellow-400" />
                  <span>{isLoggedIn ? "Dashboard" : "Sign In"}</span>
                </Link>
                {(currentUser?.role === "admin" || isAdminArea) && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-black bg-yellow-400 text-black shadow-neon-yellow"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
