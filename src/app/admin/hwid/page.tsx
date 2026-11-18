"use client";

import React from "react";
import { useNexusStore } from "@/lib/store";
import { Cpu, RefreshCw, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminHwidPage() {
  const { licenses, resetHwid } = useNexusStore();

  const boundLicenses = licenses.filter(l => l.hwid);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Hardware ID (HWID) Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor client machine bindings, audit hardware fingerprint changes, and release locks for customers.
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="pb-3 font-bold">Tool</th>
                <th className="pb-3 font-bold">License Key</th>
                <th className="pb-3 font-bold">User Email</th>
                <th className="pb-3 font-bold">Bound HWID Fingerprint</th>
                <th className="pb-3 font-bold">Last IP</th>
                <th className="pb-3 font-bold">Resets Used</th>
                <th className="pb-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {licenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-semibold text-white">{lic.toolName}</td>
                  <td className="py-3 font-mono font-bold text-cyan-300">{lic.key}</td>
                  <td className="py-3 text-slate-400">{lic.userEmail}</td>
                  <td className="py-3 font-mono text-[11px] text-slate-300">
                    {lic.hwid ? (
                      <span className="p-1 px-2 rounded bg-black/50 border border-white/5 select-all">
                        {lic.hwid}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">No HWID bound yet</span>
                    )}
                  </td>
                  <td className="py-3 font-mono text-slate-400">{lic.lastIpAddress || "127.0.0.1"}</td>
                  <td className="py-3 font-mono">{lic.hwidResetCount} / 1</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => resetHwid(lic.id)}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Release HWID</span>
                    </button>
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
