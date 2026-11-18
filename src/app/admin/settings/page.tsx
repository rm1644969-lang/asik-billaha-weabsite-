"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store";
import { SiteSettings } from "@/lib/types";
import { Settings, Save, CheckCircle2, Send, CreditCard, Sparkles, Smartphone } from "lucide-react";

export default function AdminSettingsPage() {
  const { settings, saveSettings } = useNexusStore();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(formData);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Toolsbd.com & Payment Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure site branding, bKash & Rocket numbers, Telegram links, and announcement banners.
          </p>
        </div>
      </div>

      {savedAlert && (
        <div className="p-4 rounded-2xl bg-yellow-400 text-black text-xs font-black flex items-center gap-2 shadow-neon-yellow">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Settings saved successfully! Website updated immediately.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        
        {/* Section 1: General Branding */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
          <h3 className="text-base font-black text-white flex items-center gap-2 pb-2 border-b border-white/10">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Site Identity & Hero Copy</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Website Name</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full p-3 rounded-xl glass-input text-white font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Tagline</label>
              <input
                type="text"
                value={formData.siteTagline}
                onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
                className="w-full p-3 rounded-xl glass-input text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Hero Title</label>
            <input
              type="text"
              value={formData.heroTitle}
              onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
              className="w-full p-3 rounded-xl glass-input text-white font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Hero Subtitle</label>
            <textarea
              rows={2}
              value={formData.heroSubtitle}
              onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
              className="w-full p-3 rounded-xl glass-input text-white"
            />
          </div>

          {/* Announcement Ticker */}
          <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-yellow-400">Top Header Announcement Notice</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAnnouncementActive}
                  onChange={(e) => setFormData({ ...formData, isAnnouncementActive: e.target.checked })}
                  className="rounded bg-black border-white/20 text-yellow-400 focus:ring-0"
                />
                <span className="text-white font-bold">Active Banner</span>
              </label>
            </div>
            <input
              type="text"
              value={formData.announcementNotice}
              onChange={(e) => setFormData({ ...formData, announcementNotice: e.target.value })}
              className="w-full p-2.5 rounded-xl glass-input text-white font-semibold"
            />
          </div>
        </div>

        {/* Section 2: Payment Configuration */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
          <h3 className="text-base font-black text-white flex items-center gap-2 pb-2 border-b border-white/10">
            <CreditCard className="w-4 h-4 text-red-500" />
            <span>bKash & Rocket Official Payment Numbers</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* bKash */}
            <div className="p-4 rounded-2xl bg-[#D12053]/15 border border-[#D12053]/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#D12053] text-sm">bKash Account</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#D12053] text-white font-bold">
                  Send Money
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">bKash Mobile Number</label>
                <input
                  type="text"
                  value={formData.bkashMerchantNumber}
                  onChange={(e) => setFormData({ ...formData, bkashMerchantNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-yellow-400 font-mono font-black text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Account Type</label>
                <select
                  value={formData.bkashType}
                  onChange={(e) => setFormData({ ...formData, bkashType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl glass-input text-white"
                >
                  <option value="Personal" className="bg-[#111]">Personal (Send Money)</option>
                  <option value="Merchant" className="bg-[#111]">Merchant (Payment)</option>
                </select>
              </div>
            </div>

            {/* Rocket */}
            <div className="p-4 rounded-2xl bg-[#8C3494]/15 border border-[#8C3494]/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-purple-400 text-sm">Rocket Account</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#8C3494] text-white font-bold">
                  Send Money
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Rocket Mobile Number</label>
                <input
                  type="text"
                  value={formData.rocketMerchantNumber}
                  onChange={(e) => setFormData({ ...formData, rocketMerchantNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-yellow-400 font-mono font-black text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Account Type</label>
                <select
                  value={formData.rocketType}
                  onChange={(e) => setFormData({ ...formData, rocketType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl glass-input text-white"
                >
                  <option value="Personal" className="bg-[#111]">Personal (Send Money)</option>
                  <option value="Merchant" className="bg-[#111]">Merchant (Payment)</option>
                </select>
              </div>
            </div>

          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Payment Instructions Notice (Displayed on Checkout)</label>
            <textarea
              rows={2}
              value={formData.paymentNotice}
              onChange={(e) => setFormData({ ...formData, paymentNotice: e.target.value })}
              className="w-full p-3 rounded-xl glass-input text-white"
            />
          </div>
        </div>

        {/* Section 3: Telegram Community Settings */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
          <h3 className="text-base font-black text-white flex items-center gap-2 pb-2 border-b border-white/10">
            <Send className="w-4 h-4 text-yellow-400" />
            <span>Telegram Community & Support Links</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Telegram Group URL</label>
              <input
                type="text"
                value={formData.telegramGroupUrl}
                onChange={(e) => setFormData({ ...formData, telegramGroupUrl: e.target.value })}
                className="w-full p-2.5 rounded-xl glass-input text-white font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Telegram Channel URL</label>
              <input
                type="text"
                value={formData.telegramChannelUrl}
                onChange={(e) => setFormData({ ...formData, telegramChannelUrl: e.target.value })}
                className="w-full p-2.5 rounded-xl glass-input text-white font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Admin Support Handle</label>
              <input
                type="text"
                value={formData.telegramSupportUsername}
                onChange={(e) => setFormData({ ...formData, telegramSupportUsername: e.target.value })}
                className="w-full p-2.5 rounded-xl glass-input text-yellow-400 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black text-sm shadow-neon-yellow hover:opacity-95 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration Changes</span>
          </button>
        </div>

      </form>

    </div>
  );
}
