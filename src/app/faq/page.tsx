"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store";
import { ChevronDown, Sparkles, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Card3D from "@/components/Card3D";
import CyberCanvas3D from "@/components/CyberCanvas3D";

export default function FaqPage() {
  const { faqs, settings } = useNexusStore();
  const [openId, setOpenId] = useState<string | null>("faq-1");

  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12 overflow-hidden">
      
      {/* 3D Ambient Cyber Canvas Background */}
      <CyberCanvas3D className="absolute -top-10 left-0 right-0 h-[480px] pointer-events-none opacity-40 z-0" />

      <div className="relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>সহায়তা ও সাধারণ জিজ্ঞাসা</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gradient-shimmer">
            সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQ)
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            বিকাশ ও রকেট স্বয়ংক্রিয় পেমেন্ট ভেরিফিকেশন, HWID লাইসেন্স সক্রিয়করণ এবং যেকোনো সমস্যা সমাধানের নিয়মাবলী।
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl glass-panel border border-white/10 overflow-hidden transition-all hover:border-yellow-400/30"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {faq.category}
                    </span>
                    <span className="text-base font-bold text-white">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-cyan-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-300 leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still need help CTA */}
        <Card3D maxTilt={6} depth={1.03} glare={true}>
          <div className="rounded-3xl p-8 bg-surface-card border border-white/10 text-center space-y-4 shadow-xl">
            <h3 className="text-xl font-bold text-white">অন্য কোনো প্রশ্ন বা সমস্যা আছে?</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              যেকোনো পেমেন্ট জটিলতা বা লাইসেন্স রিসেটের জন্য আমাদের টেলিগ্রাম সাপোর্ট চ্যানেল ২৪/৭ সক্রিয় রয়েছে।
            </p>
            <a
              href={settings.telegramGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-yellow-500 text-black text-xs font-black shadow-neon-yellow hover:opacity-95 transition-all"
            >
              <Send className="w-4 h-4 text-black" />
              <span>টেলিগ্রামে কথা বলুন</span>
            </a>
          </div>
        </Card3D>
      </div>

    </div>
  );
}
