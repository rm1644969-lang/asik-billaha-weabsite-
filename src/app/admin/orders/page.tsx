"use client";

import React, { useState, useEffect } from "react";
import { useNexusStore } from "@/lib/store";
import { webDb } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Search, Filter, CheckCircle2, XCircle, Clock, Check, Key } from "lucide-react";

export default function AdminOrdersPage() {
  const { orders, approveOrderManually, rejectOrderManually } = useNexusStore();
  const [firestoreOrders, setFirestoreOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    try {
      const q = query(collection(webDb, "orders"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setFirestoreOrders(list);
      }, (err) => {
        // Fallback without orderBy if index is building
        const fallbackUnsub = onSnapshot(collection(webDb, "orders"), (snap) => {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setFirestoreOrders(list);
        });
      });
      return () => unsub();
    } catch (e) {
      console.warn("Firestore orders listener notice:", e);
    }
  }, []);

  const combinedOrders = firestoreOrders.length > 0 ? firestoreOrders : orders;

  const filteredOrders = combinedOrders.filter((ord: any) => {
    const matchesSearch =
      (ord.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.userName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.trxId && ord.trxId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || ord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Customer Orders Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search orders, review submitted TrxIDs, and approve pending licenses manually if needed.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between border border-white/10">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, TrxID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {["ALL", "PENDING", "PAID", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? "bg-purple-600 text-white shadow-neon-purple"
                  : "bg-surface-card text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="pb-3 font-bold">Order ID</th>
                <th className="pb-3 font-bold">Customer</th>
                <th className="pb-3 font-bold">Tool & Duration</th>
                <th className="pb-3 font-bold">Method</th>
                <th className="pb-3 font-bold">Amount</th>
                <th className="pb-3 font-bold">TrxID / Sender</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-mono font-bold text-white">{ord.orderNumber}</td>
                  <td className="py-3">
                    <span className="font-semibold text-white block">{ord.userName}</span>
                    <span className="text-[11px] text-slate-400">{ord.userEmail}</span>
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-white">{ord.toolName}</span>
                    <span className="text-[11px] text-cyan-300 block">{ord.planDuration} Days Plan</span>
                  </td>
                  <td className="py-3 font-semibold text-slate-300">{ord.paymentMethod}</td>
                  <td className="py-3 font-bold text-white">৳{ord.amount}</td>
                  <td className="py-3 font-mono">
                    <span className="text-purple-300 block font-bold">{ord.trxId || "Not yet submitted"}</span>
                    {ord.senderNumber && (
                      <span className="text-[10px] text-slate-400">{ord.senderNumber}</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm transition-all"
                        >
                          Approve & Issue
                        </button>
                        <button
                          onClick={() => rejectOrderManually(ord.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white text-[11px] font-bold transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {ord.status === "PAID" && (
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-emerald-400 block">
                          Key Issued
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {ord.paidAt ? new Date(ord.paidAt).toLocaleTimeString() : "Verified"}
                        </span>
                      </div>
                    )}
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
