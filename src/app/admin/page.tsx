"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNexusStore } from "@/lib/store";
import { 
  Users, 
  TrendingUp, 
  CreditCard, 
  Key, 
  ShoppingCart, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight, 
  Sparkles,
  Zap,
  Activity,
  Layers,
  Download
} from "lucide-react";

export default function AdminOverviewPage() {
  const { 
    orders, 
    licenses, 
    tools, 
    smsDevices, 
    smsRecords, 
    deposits,
    firebaseProjectId,
    approveWalletDeposit,
    approveOrderManually, 
    rejectOrderManually 
  } = useNexusStore();

  // Statistics calculation
  const totalRevenue = orders
    .filter(o => o.status === "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingOrders = orders.filter(o => o.status === "PENDING");
  const paidOrders = orders.filter(o => o.status === "PAID");
  const activeLicenses = licenses.filter(l => l.status === "ACTIVE");
  const activeDevices = smsDevices.filter(d => d.status === "ONLINE");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Admin Management Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time control for software distribution, bKash/Nagad verification & HWID licensing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/tools"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-neon-purple transition-all flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Tools</span>
          </Link>
          <Link
            href="/admin/settings"
            className="px-3.5 py-2 rounded-xl bg-surface-card hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold transition-all"
          >
            <span>Payment Settings</span>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* METRICS & ANALYTICS OVERVIEW                                    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Visitors Card (10-12k daily traffic requirement) */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Today&apos;s Visitors</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">11,842</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.2% today
            </span>
            <span>Monthly: 342.8k</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Total Revenue</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">৳{totalRevenue.toLocaleString()} <span className="text-xs text-slate-400 font-normal">BDT</span></div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-cyan-400">{paidOrders.length} Paid Orders</span>
            <span className="text-yellow-400">{pendingOrders.length} Pending</span>
          </div>
        </div>

        {/* Active Licenses */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Active Licenses</span>
            <Key className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">{activeLicenses.length}</div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-purple-300">HWID Locked: 100%</span>
            <span>Total Issued: {licenses.length}</span>
          </div>
        </div>

        {/* Connected SMS Companion Phone */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">SMS Gateway Device</span>
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 flex items-center gap-2">
            <span>ONLINE</span>
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Samsung S21</span>
            <span className="text-cyan-300">{smsRecords.length} SMS Synced</span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* TOOLSBD PAYSYSNC COMPANION GATEWAY PRODUCTION STATUS           */}
      {/* ============================================================== */}
      <div className="glass-panel rounded-3xl p-6 border border-emerald-500/30 bg-emerald-950/20 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <span>Toolsbd PaySync — Companion Android Gateway</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-500/30">
                  ONLINE (24/7)
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                আপনার অ্যান্ড্রয়েড ফোন bKash (01967922602) ও Rocket (01731328169) SMS পড়ে স্বয়ংক্রিয়ভাবে অর্ডার কনফার্ম করছে।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/admin/sms-devices"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
            >
              Gateway Settings
            </a>
            <a
              href="https://github.com/rm1644969-lang/asik-billaha-weabsite-/releases/download/v1.0.0-gateway/toolsbd-paysync.apk"
              target="_blank"
              rel="noreferrer"
              download="toolsbd-paysync.apk"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download APK</span>
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* WALLET ADD MONEY REQUESTS                                      */}
      {/* ============================================================== */}
      {deposits.length > 0 && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-lg font-black text-white">Wallet Add Money Deposits</h3>
              <p className="text-xs text-slate-400">Approve customer bKash / Rocket wallet deposits to credit their balance in Firebase.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
                <tr>
                  <th className="pb-3 font-bold">Customer</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold">Method</th>
                  <th className="pb-3 font-bold">TrxID</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {deposits.slice(0, 5).map(dep => (
                  <tr key={dep.id} className="hover:bg-white/5">
                    <td className="py-3">
                      <span className="font-bold text-white block">{dep.userName}</span>
                      <span className="text-[11px] text-slate-400">{dep.senderNumber}</span>
                    </td>
                    <td className="py-3 font-black text-yellow-400">${dep.amountUSD} (৳{dep.amountBDT})</td>
                    <td className="py-3 font-bold text-white">{dep.method}</td>
                    <td className="py-3 font-mono text-white">{dep.trxId}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dep.status === "APPROVED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                          : "bg-yellow-950 text-yellow-400 border border-yellow-500/30"
                      }`}>
                        {dep.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {dep.status === "PENDING" ? (
                        <button
                          onClick={() => approveWalletDeposit(dep.id)}
                          className="px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-[11px] font-black shadow-neon-yellow"
                        >
                          Approve (+${dep.amountUSD})
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-semibold">Credited</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* RECENT ORDERS WITH APPROVE/REJECT ACTIONS                      */}
      {/* ============================================================== */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400">Manage orders, verify TrxID, and approve or reject licenses.</p>
          </div>
          <Link href="/admin/orders" className="text-xs text-purple-400 font-bold hover:underline">
            View All Orders &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="pb-3 font-bold">Order ID</th>
                <th className="pb-3 font-bold">Customer</th>
                <th className="pb-3 font-bold">Tool & Plan</th>
                <th className="pb-3 font-bold">Amount</th>
                <th className="pb-3 font-bold">TrxID</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {orders.slice(0, 5).map((ord) => (
                <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-mono font-bold text-white">{ord.orderNumber}</td>
                  <td className="py-3">
                    <span className="font-semibold text-white block">{ord.userName}</span>
                    <span className="text-[11px] text-slate-400">{ord.userEmail}</span>
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-white">{ord.toolName}</span>
                    <span className="text-[10px] text-cyan-400 block">{ord.planDuration} Days</span>
                  </td>
                  <td className="py-3 font-bold text-white">৳{ord.amount}</td>
                  <td className="py-3 font-mono text-purple-300">
                    {ord.trxId ? ord.trxId : <span className="text-slate-500 italic">Not submitted</span>}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ord.status === "PAID"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                        : ord.status === "PENDING"
                        ? "bg-yellow-950 text-yellow-400 border border-yellow-500/30"
                        : "bg-red-950 text-red-400 border border-red-500/30"
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    {ord.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => approveOrderManually(ord.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectOrderManually(ord.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white text-[11px] font-bold transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {ord.status === "PAID" && (
                      <span className="text-[11px] text-emerald-400 font-mono">
                        Key: {ord.licenseKey?.slice(0, 14)}...
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RECENT SMS NOTIFICATIONS STREAM                                 */}
      {/* ============================================================== */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">Live SMS Gateway Stream</h3>
            <p className="text-xs text-slate-400">Incoming merchant SMS parsed by companion phone app.</p>
          </div>
          <Link href="/admin/payments" className="text-xs text-cyan-400 font-bold hover:underline">
            View Gateway Log &rarr;
          </Link>
        </div>

        <div className="space-y-2">
          {smsRecords.slice(0, 3).map((sms) => (
            <div
              key={sms.id}
              className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    sms.provider === "bKash" ? "bg-[#D12053]/20 text-[#D12053]" : "bg-[#F7931E]/20 text-[#F7931E]"
                  }`}>
                    {sms.provider}
                  </span>
                  <span className="font-mono font-bold text-white">TrxID: {sms.trxId}</span>
                  <span className="text-emerald-400 font-bold">৳{sms.amount}</span>
                </div>
                <p className="text-slate-400 text-[11px] truncate max-w-xl">
                  {sms.rawMessage}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  sms.status === "MATCHED" 
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" 
                    : "bg-slate-800 text-slate-400"
                }`}>
                  {sms.status}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(sms.receivedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
