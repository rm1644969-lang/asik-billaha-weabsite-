"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store";
import { Search, Smartphone, Zap, CheckCircle2, AlertTriangle, Filter } from "lucide-react";

export default function AdminPaymentsPage() {
  const { smsRecords, orders, settings, saveSettings } = useNexusStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [bkashNum, setBkashNum] = useState(settings.bkashMerchantNumber);
  const [rocketNum, setRocketNum] = useState(settings.rocketMerchantNumber);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveNumbers = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings({
      ...settings,
      bkashMerchantNumber: bkashNum.trim(),
      rocketMerchantNumber: rocketNum.trim()
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const filteredRecords = smsRecords.filter((rec) => {
    const matchesSearch =
      rec.trxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.rawMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.sender.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProvider = providerFilter === "ALL" || rec.provider === providerFilter;

    return matchesSearch && matchesProvider;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Payments &amp; SMS Gateway Stream
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Change bKash/Rocket numbers and inspect real-time audit logs of companion SMS notifications.
          </p>
        </div>
      </div>

      {/* QUICK PAYMENT NUMBER SETTINGS CARD */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-yellow-400/30 bg-[#0e0e0e] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-yellow-400 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-red-500" />
              <span>পেমেন্ট নম্বর পরিবর্তন (bKash &amp; Rocket Numbers)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              এখানে নম্বর পরিবর্তন করে সেভ করলে পুরো ওয়েবসাইট, হোমপেইজ ও চেকআউটে সাথে সাথে নতুন নম্বর আপডেট হয়ে যাবে।
            </p>
          </div>
          {isSaved && (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-yellow-400 text-black shadow-neon-yellow flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>সেভ সম্পন্ন হয়েছে!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveNumbers} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              bKash নম্বর (Personal / Send Money)
            </label>
            <input
              type="text"
              value={bkashNum}
              onChange={(e) => setBkashNum(e.target.value)}
              placeholder="01967922602"
              className="w-full p-3 rounded-xl glass-input text-yellow-400 font-mono font-black text-sm"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Rocket নম্বর (Personal / Send Money)
            </label>
            <input
              type="text"
              value={rocketNum}
              onChange={(e) => setRocketNum(e.target.value)}
              placeholder="01731328169"
              className="w-full p-3 rounded-xl glass-input text-purple-300 font-mono font-black text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-black text-xs shadow-neon-yellow transition-all"
            >
              <span>নম্বর সেভ ও আপডেট করুন 💾</span>
            </button>
          </div>
        </form>
      </div>

      {/* Search & Filter */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between border border-white/10">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search TrxID or raw message text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "bKash", "Nagad"].map((p) => (
            <button
              key={p}
              onClick={() => setProviderFilter(p)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                providerFilter === p
                  ? "bg-purple-600 text-white shadow-neon-purple"
                  : "bg-surface-card text-slate-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* SMS Records Stream */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="pb-3 font-bold">Provider</th>
                <th className="pb-3 font-bold">Parsed TrxID</th>
                <th className="pb-3 font-bold">Amount</th>
                <th className="pb-3 font-bold">Raw SMS Body</th>
                <th className="pb-3 font-bold">Matched Order</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.provider === "bKash"
                        ? "bg-[#D12053]/20 text-[#D12053]"
                        : "bg-[#F7931E]/20 text-[#F7931E]"
                    }`}>
                      {rec.provider}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-white">{rec.trxId}</td>
                  <td className="py-3 font-bold text-emerald-400">৳{rec.amount}</td>
                  <td className="py-3 max-w-xs truncate text-[11px] text-slate-400" title={rec.rawMessage}>
                    {rec.rawMessage}
                  </td>
                  <td className="py-3 font-mono text-purple-300">
                    {rec.matchedOrderId || <span className="text-slate-500 italic">None</span>}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      rec.status === "MATCHED"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                        : "bg-yellow-950 text-yellow-400 border border-yellow-500/30"
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 text-[11px] text-slate-400">
                    {new Date(rec.receivedAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
