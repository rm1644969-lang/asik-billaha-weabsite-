"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store";
import { Search, Smartphone, Zap, CheckCircle2, AlertTriangle, Filter } from "lucide-react";

export default function AdminPaymentsPage() {
  const { smsRecords, orders } = useNexusStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("ALL");

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
            Payments & SMS Gateway Stream
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of SMS notifications received and verified by your companion Android phone.
          </p>
        </div>
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
