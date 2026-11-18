"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store";
import { PricePlan } from "@/lib/types";
import { Plus, Edit2, Trash2, Tag, Check, X } from "lucide-react";

export default function AdminPlansPage() {
  const { plans, tools, savePlans } = useNexusStore();
  const [editingPlan, setEditingPlan] = useState<PricePlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<Partial<PricePlan>>({
    toolId: tools[0]?.id || "",
    name: "7 DAYS OFFER 🔥",
    durationDays: 7,
    priceUSD: 2,
    originalPriceUSD: 4,
    priceBDT: 240,
    originalPriceBDT: 480,
    currency: "USD",
    isPopular: false,
    enabled: true,
    features: ["Single HWID Lock", "High Priority API Route"]
  });

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      id: `plan-${Date.now()}`,
      toolId: tools[0]?.id || "",
      name: "7 DAYS OFFER 🔥",
      durationDays: 7,
      priceUSD: 2,
      originalPriceUSD: 4,
      priceBDT: 240,
      originalPriceBDT: 480,
      currency: "USD",
      isPopular: false,
      enabled: true,
      features: ["Single HWID Lock", "Full Feature Access", "Telegram Support"]
    });
    setIsCreating(true);
  };

  const handleOpenEdit = (plan: PricePlan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tool = tools.find(t => t.id === formData.toolId);
    if (isCreating) {
      const newPlan = {
        ...formData,
        id: `plan-${Date.now()}`,
        toolName: tool ? tool.name : "Utility",
      } as PricePlan;
      savePlans([...plans, newPlan]);
      setIsCreating(false);
    } else if (editingPlan) {
      const updated = plans.map(p => {
        if (p.id === editingPlan.id) {
          return {
            ...p,
            ...formData,
            toolName: tool ? tool.name : p.toolName,
          } as PricePlan;
        }
        return p;
      });
      savePlans(updated);
      setEditingPlan(null);
    }
  };

  const handleDelete = (planId: string) => {
    if (confirm("Delete this price plan?")) {
      savePlans(plans.filter(p => p.id !== planId));
    }
  };

  const handleToggle = (planId: string) => {
    savePlans(plans.map(p => p.id === planId ? { ...p, enabled: !p.enabled } : p));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Subscription & Price Plans
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure 7-Day, 15-Day, and 30-Day packages, pricing in BDT, discounts, and assign to specific tools.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-neon-purple transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plan</span>
        </button>
      </div>

      {/* Plans Table */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="pb-3 font-bold">Plan Name</th>
                <th className="pb-3 font-bold">Tool</th>
                <th className="pb-3 font-bold">Duration</th>
                <th className="pb-3 font-bold">Price (BDT)</th>
                <th className="pb-3 font-bold">Popular</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-bold text-white">{plan.name}</td>
                  <td className="py-3 text-cyan-300 font-medium">{plan.toolName || plan.toolId}</td>
                  <td className="py-3 font-mono">{plan.durationDays} Days</td>
                  <td className="py-3 font-black text-yellow-400">
                    ${plan.priceUSD} <span className="text-slate-300 font-mono font-normal">(৳{plan.priceBDT})</span>
                  </td>
                  <td className="py-3">
                    {plan.isPopular ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-950 text-pink-300 border border-pink-500/30">
                        Popular
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Normal</span>
                    )}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggle(plan.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        plan.enabled
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {plan.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {(isCreating || editingPlan) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 border border-purple-500/30 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {isCreating ? "Add Price Plan" : `Edit: ${editingPlan?.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingPlan(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Target Software Tool</label>
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
                <label className="font-bold text-slate-300 block mb-1">Plan Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-white"
                  placeholder="e.g. Starter Trial (7 Days)"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Days</label>
                  <input
                    type="number"
                    required
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl glass-input text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-yellow-400 block mb-1">Price (USD $)</label>
                  <input
                    type="number"
                    required
                    value={formData.priceUSD}
                    onChange={(e) => {
                      const usd = Number(e.target.value);
                      setFormData({ ...formData, priceUSD: usd, priceBDT: usd * 120 });
                    }}
                    className="w-full p-2.5 rounded-xl glass-input text-yellow-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Price (BDT ৳)</label>
                  <input
                    type="number"
                    required
                    value={formData.priceBDT}
                    onChange={(e) => setFormData({ ...formData, priceBDT: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl glass-input text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded bg-black/40 border-white/20 text-purple-600 focus:ring-0"
                  />
                  <span className="font-bold text-white">Mark as Popular</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="rounded bg-black/40 border-white/20 text-purple-600 focus:ring-0"
                  />
                  <span className="font-bold text-white">Enabled</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingPlan(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-neon-purple"
                >
                  Save Plan
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
