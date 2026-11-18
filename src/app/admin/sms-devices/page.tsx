"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store";
import { Smartphone, ShieldCheck, RefreshCw, Key, Zap, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminSmsDevicesPage() {
  const { smsDevices, simulateIncomingSms } = useNexusStore();
  const [testAlert, setTestAlert] = useState<string | null>(null);

  const device = smsDevices[0];

  const handleTestTrigger = () => {
    const res = simulateIncomingSms("bKash", 350, "01755123456");
    setTestAlert(`Simulated SMS sent! TrxID: ${res.record.trxId} logged into gateway.`);
    setTimeout(() => setTestAlert(null), 4000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            SMS Companion Phone Devices
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your Android phone running the merchant SMS sync app.
          </p>
        </div>

        <button
          onClick={handleTestTrigger}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-neon-cyan transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Zap className="w-4 h-4" />
          <span>Send Test Sync Heartbeat</span>
        </button>
      </div>

      {testAlert && (
        <div className="p-4 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{testAlert}</span>
        </div>
      )}

      {/* Device Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Phone Details */}
        <div className="lg:col-span-7">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{device?.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{device?.model}</p>
                </div>
              </div>

              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-card border border-white/5 space-y-1">
                <span className="text-slate-400">Battery Level</span>
                <p className="font-bold text-white text-sm">{device?.batteryLevel}%</p>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-card border border-white/5 space-y-1">
                <span className="text-slate-400">Last Heartbeat</span>
                <p className="font-bold text-cyan-400 text-sm">{device?.lastHeartbeat}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-card border border-white/5 space-y-1">
                <span className="text-slate-400">Total SMS Parsed</span>
                <p className="font-bold text-purple-300 text-sm">{device?.totalSmsProcessed}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-400 block font-semibold">Device API Provisioning Secret:</span>
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between font-mono text-cyan-300">
                <span>{device?.secretPreview}</span>
                <span className="text-[10px] text-slate-500 uppercase">HMAC-SHA256</span>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture & Security Highlights */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10 text-xs">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Android Companion Architecture</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">
              The companion Kotlin application monitors authorized incoming merchant payment SMS messages exclusively (bKash & Nagad).
            </p>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">&bull;</span>
                <span>Extracts TrxID and Amount via Regex patterns.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">&bull;</span>
                <span>Calculates HMAC-SHA256 signature using Android Keystore.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">&bull;</span>
                <span>Uses WorkManager for reliable retry queues during network blips.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">&bull;</span>
                <span>Zero collection of user OTPs, contacts or personal text messages.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
