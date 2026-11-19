"use client";

import React, { useState } from "react";
import { useNexusStore, generateToolLicenseKey } from "@/lib/store";
import { syncLicenseToFirestore } from "@/lib/firebase";
import { License } from "@/lib/types";
import { Key, Plus, RefreshCw, Ban, CheckCircle2, Copy, Check, X, ShieldAlert } from "lucide-react";

export default function AdminLicensesPage() {
  const { licenses, tools, saveLicenses, resetHwid } = useNexusStore();
  const [isCreating, setIsCreating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form for manual creation
  const [formData, setFormData] = useState({
    toolId: tools[0]?.id || "",
    customerEmail: "user@example.com",
    durationDays: 30,
  });

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    const tool = tools.find(t => t.id === formData.toolId);
    const generatedKey = generateToolLicenseKey();

    const expires = new Date();
    expires.setDate(expires.getDate() + formData.durationDays);

    const newLic: License = {
      id: `lic-${Date.now()}`,
      key: generatedKey,
      keyHash: "hash_" + generatedKey,
      toolId: formData.toolId,
      toolName: tool ? tool.name : "FAST OTP — FB Auto Resender Pro",
      userId: `user-manual-${Date.now()}`,
      userEmail: formData.customerEmail,
      orderId: `ord-manual-${Date.now()}`,
      durationDays: formData.durationDays,
      status: "ACTIVE",
      hwidResetCount: 0,
      maxDevices: 1,
      activationsCount: 0,
      createdAt: new Date().toISOString(),
      expiresAt: expires.toISOString()
    };

    saveLicenses([newLic, ...licenses]);
    syncLicenseToFirestore(newLic);
    setIsCreating(false);
  };

  const handleToggleStatus = (licId: string, currentStatus: "ACTIVE" | "EXPIRED" | "BANNED" | "REVOKED") => {
    const nextStatus = currentStatus === "ACTIVE" ? "BANNED" : "ACTIVE";
    saveLicenses(licenses.map(l => l.id === licId ? { ...l, status: nextStatus } : l));
  };

  const handleExtend = (licId: string, days: number) => {
    saveLicenses(licenses.map(l => {
      if (l.id === licId) {
        const curExp = new Date(l.expiresAt);
        curExp.setDate(curExp.getDate() + days);
        return { ...l, expiresAt: curExp.toISOString() };
      }
      return l;
    }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            License Control & Key Generation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create custom licenses manually, ban abusive keys, reset machine HWID locks, or extend durations.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-neon-purple transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Manual License</span>
        </button>
      </div>

      {/* Licenses Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="pb-3 font-bold">License Key</th>
                <th className="pb-3 font-bold">Tool</th>
                <th className="pb-3 font-bold">Customer Email</th>
                <th className="pb-3 font-bold">Bound HWID</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Expires</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {licenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-300">{lic.key}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(lic.key);
                          setCopiedKey(lic.id);
                          setTimeout(() => setCopiedKey(null), 2000);
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedKey === lic.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-white">{lic.toolName}</td>
                  <td className="py-3 text-slate-300">{lic.userEmail}</td>
                  <td className="py-3 font-mono text-[11px]">
                    {lic.hwid ? (
                      <span className="text-slate-300 truncate max-w-[140px] block" title={lic.hwid}>
                        {lic.hwid.slice(0, 16)}...
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Unbound</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      lic.status === "ACTIVE"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-950 text-red-400 border border-red-500/30"
                    }`}>
                      {lic.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    {new Date(lic.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right space-x-1.5">
                    <button
                      onClick={() => resetHwid(lic.id)}
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-400 text-[10px] font-semibold"
                      title="Reset HWID Lock"
                    >
                      Reset HWID
                    </button>
                    <button
                      onClick={() => handleExtend(lic.id, 7)}
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-purple-300 text-[10px] font-semibold"
                      title="Add 7 Days"
                    >
                      +7d
                    </button>
                    <button
                      onClick={() => handleToggleStatus(lic.id, lic.status)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold ${
                        lic.status === "ACTIVE"
                          ? "bg-red-950/60 hover:bg-red-900 text-red-300"
                          : "bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300"
                      }`}
                    >
                      {lic.status === "ACTIVE" ? "Ban Key" : "Unban"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Generation Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 border border-purple-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Generate Custom License</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Select Tool</label>
                <select
                  value={formData.toolId}
                  onChange={(e) => setFormData({ ...formData, toolId: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-white"
                >
                  {tools.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#0b0f29] text-white">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Customer Email</label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Validity (Days)</label>
                <input
                  type="number"
                  required
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl glass-input text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-neon-purple"
                >
                  Issue Key Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
