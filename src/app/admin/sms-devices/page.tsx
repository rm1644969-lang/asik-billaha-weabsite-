"use client";

import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  ShieldCheck, 
  Download, 
  Key, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  Radio, 
  ExternalLink,
  Info,
  BatteryMedium,
  MessageSquare,
  Layers,
  BatteryCharging,
  Power,
  Bell,
  ShieldAlert
} from "lucide-react";
import { webDb } from "@/lib/firebase";
import { collection, onSnapshot, doc, getDoc } from "firebase/firestore";

export default function AdminSmsDevicesPage() {
  const [device, setDevice] = useState<any>({
    name: "Toolsbd PaySync Merchant Phone",
    model: "Samsung Galaxy (bKash & Rocket SIM)",
    batteryLevel: 94,
    status: "ONLINE",
    lastHeartbeat: "Just now",
    secretPreview: "sec_live_9f83ca42d992e10650b2ed6cb6bb79",
    totalSmsProcessed: 28
  });

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const webhookUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/payment/sms` 
    : "https://asik-billaha-weabsite.vercel.app/api/payment/sms";

  const secretKey = "sec_live_9f83ca42d992e10650b2ed6cb6bb79";

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(webDb, "sms_devices"), (snap) => {
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          setDevice({
            name: docData.name || "Toolsbd PaySync Merchant Phone",
            model: docData.model || "Android Phone (Primary)",
            batteryLevel: docData.batteryLevel ?? 95,
            status: docData.status || "ONLINE",
            lastHeartbeat: docData.lastHeartbeat || "Active",
            secretPreview: secretKey,
            totalSmsProcessed: docData.totalSmsProcessed || 0
          });
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Firestore sms_devices listener error:", e);
    }
  }, []);

  const copyToClipboard = (text: string, type: "url" | "secret") => {
    navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingStatus(null);
    try {
      const res = await fetch("/api/payment/sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-secret": secretKey
        },
        body: JSON.stringify({
          action: "ping",
          deviceId: "admin-web-dashboard",
          model: "Web Admin Console",
          batteryLevel: 100
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPingStatus("✓ Server Webhook is 100% LIVE and accepting payments!");
      } else {
        setPingStatus(`Error: ${data.error || "Failed to reach endpoint"}`);
      }
    } catch (err: any) {
      setPingStatus(`Ping failed: ${err.message}`);
    } finally {
      setIsPinging(false);
      setTimeout(() => setPingStatus(null), 5000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Own Companion App
            </span>
            <span className="text-xs text-slate-400">v1.0.0 Stable</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Toolsbd PaySync — Companion Android Gateway
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            আপনার নিজস্ব অ্যান্ড্রয়েড অ্যাপ যা bKash এবং Rocket SMS পড়ে ওয়েবসাইটে স্বয়ংক্রিয়ভাবে অর্ডার কনফার্ম করে।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestPing}
            disabled={isPinging}
            className="px-4 py-2.5 rounded-xl bg-surface-card hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-2"
          >
            <Zap className={`w-4 h-4 text-amber-400 ${isPinging ? "animate-spin" : ""}`} />
            <span>{isPinging ? "Pinging..." : "Test Webhook"}</span>
          </button>

          <a
            href="https://github.com/rm1644969-lang/asik-billaha-weabsite-/releases/download/v1.0.0-gateway/toolsbd-paysync.apk"
            target="_blank"
            rel="noreferrer"
            download="toolsbd-paysync.apk"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Gateway APK (7.7 MB)</span>
          </a>
        </div>
      </div>

      {pingStatus && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{pingStatus}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Phone Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{device.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{device.model}</p>
                </div>
              </div>

              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ACTIVE (24/7)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-card border border-white/5 space-y-1">
                <span className="text-slate-400 flex items-center gap-1">
                  <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
                  Battery Level
                </span>
                <p className="font-bold text-white text-sm">{device.batteryLevel}%</p>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-card border border-white/5 space-y-1">
                <span className="text-slate-400">Last Synced</span>
                <p className="font-bold text-amber-400 text-sm">{device.lastHeartbeat}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-card border border-white/5 space-y-1">
                <span className="text-slate-400">Total SMS Verified</span>
                <p className="font-bold text-emerald-400 text-sm">{device.totalSmsProcessed} Orders</p>
              </div>
            </div>

            {/* Connection Credentials */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400 block font-semibold">Your Toolsbd Webhook Endpoint URL:</span>
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between font-mono text-amber-300">
                  <span className="truncate mr-2">{webhookUrl}</span>
                  <button
                    onClick={() => copyToClipboard(webhookUrl, "url")}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0"
                    title="Copy URL"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400 block font-semibold">Gateway Device Provisioning Secret (HMAC-SHA256):</span>
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between font-mono text-sky-300">
                  <span className="truncate mr-2">{secretKey}</span>
                  <button
                    onClick={() => copyToClipboard(secretKey, "secret")}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0"
                    title="Copy Secret"
                  >
                    {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Step-by-Step Instructions in Bengali */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-5 border border-white/10 text-xs">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>কিভাবে আপনার ফোনে সেটআপ করবেন?</span>
            </h4>
            
            <ol className="space-y-3 text-slate-300 leading-relaxed list-decimal list-inside">
              <li className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-amber-400">অ্যাপটি ডাউনলোড করুন:</strong> উপরের <span className="text-white font-semibold">Download Gateway APK</span> বাটনে ক্লিক করে <span className="font-mono text-amber-300">toolsbd-paysync.apk</span> আপনার ফোনে ডাউনলোড করে ইনস্টল করুন।
              </li>
              <li className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-amber-400">সিম কার্ড নির্বাচন:</strong> যে ফোনে আপনার <span className="text-pink-400 font-bold">বিকাশ</span>, <span className="text-orange-400 font-bold">নগদ</span> বা <span className="text-purple-400 font-bold">রকেট</span> সিম চালু আছে, সেই ফোনে অ্যাপটি ওপেন করুন।
              </li>
              <li className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-amber-400">পারমিশন দিন:</strong> নিচের চেকলিস্ট অনুযায়ী <span className="text-white font-semibold">SMS Read</span>, <span className="text-white font-semibold">Display Over Other Apps</span> এবং <span className="text-white font-semibold">24/7 Battery</span> পারমিশন অন করুন।
              </li>
              <li className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-amber-400">সার্ভার লিংক দিন:</strong> Webhook URL ও Secret Key অ্যাপে আগে থেকেই দেওয়া থাকবে। প্রয়োজনে সেভ বাটনে চাপ দিন।
              </li>
              <li className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <strong className="text-emerald-400">স্বয়ংক্রিয় ভেরিফিকেশন:</strong> এখন যখনই কোনো গ্রাহক টাকা পাঠাবে, আপনার ফোন সাথে সাথে SMS পড়ে Toolsbd ওয়েবসাইটে অর্ডার বা ডিপোজিট অ্যাপ্রুভ করে দিবে!
              </li>
            </ol>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>নিরাপত্তা নিশ্চয়তা: এই অ্যাপটি শুধুমাত্র bKash, Nagad এবং Rocket-এর পেমেন্ট মেসেজ পড়ে। এটি কোন ব্যক্তিগত মেসেজ বা গোপন ওটিপি সার্ভারে পাঠায় না।</span>
            </div>

          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* REQUIRED ANDROID PERMISSIONS CHECKLIST (বিস্তারিত পারমিশন গাইড)   */}
      {/* ============================================================== */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Essential Permissions
              </span>
              <span className="text-xs font-mono text-slate-400">১০০% নির্ভরযোগ্য অটোমেশনের জন্য</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-yellow-400" />
              <span>গেটওয়ে অ্যাপের জন্য প্রয়োজনীয় সকল পারমিশন চেকলিস্ট</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              অ্যাপটি যাতে ফোন লক থাকা অবস্থায় বা ব্যাকগ্রাউন্ডে বন্ধ না হয়ে ২৪ ঘণ্টা নির্ভুলভাবে এসএমএস পড়তে পারে, সেজন্য নিচের পারমিশনগুলো নিশ্চিত করুন:
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-xl border border-yellow-400/30 self-start sm:self-auto shrink-0">
            ৫টি পারমিশন প্রযোজ্য
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Permission 1: SMS Read */}
          <div className="p-5 rounded-2xl bg-black/60 border border-emerald-500/40 hover:border-emerald-400 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">১. SMS Read & Receive Permission</h4>
                  <span className="text-[10px] font-mono text-slate-400">RECEIVE_SMS, READ_SMS</span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40">
                বাধ্যতামূলক
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>
                <strong className="text-white">কেন দরকার:</strong> গ্রাহক বিকাশ, নগদ বা রকেটে টাকা পাঠালে আসা কনফার্মেশন এসএমএস থেকে TrxID এবং টাকার পরিমাণ তাৎক্ষণিকভাবে পড়ার জন্য।
              </p>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 font-mono text-[11px] text-yellow-300">
                📱 সেটিংস &rarr; Apps &rarr; Toolsbd PaySync &rarr; Permissions &rarr; SMS &rarr; <strong>Allow / সবসময় অনুমতি দিন</strong>
              </div>
            </div>
          </div>

          {/* Permission 2: Display Over Other Apps */}
          <div className="p-5 rounded-2xl bg-black/60 border border-amber-500/40 hover:border-amber-400 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">২. Display Over Other Apps (অন্য অ্যাপের উপর প্রদর্শন)</h4>
                  <span className="text-[10px] font-mono text-slate-400">SYSTEM_ALERT_WINDOW</span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40">
                বাধ্যতামূলক
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>
                <strong className="text-white">কেন দরকার:</strong> স্ক্রিন লক অবস্থায় বা অন্য কোনো অ্যাপ ব্যবহার করার সময়ও এসএমএস রিড করার উইন্ডো যেন ব্যাকগ্রাউন্ডে সচল থাকে।
              </p>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 font-mono text-[11px] text-yellow-300">
                📱 সেটিংস &rarr; Special App Access &rarr; Display over other apps &rarr; Toolsbd PaySync &rarr; <strong>Allow চালু করুন</strong>
              </div>
            </div>
          </div>

          {/* Permission 3: Ignore Battery Optimization */}
          <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/40 hover:border-cyan-400 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">৩. Ignore Battery Optimization (ব্যাটারি অপ্টিমাইজেশন বন্ধ)</h4>
                  <span className="text-[10px] font-mono text-slate-400">Don&apos;t optimize / Unrestricted</span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40">
                বাধ্যতামূলক
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>
                <strong className="text-white">কেন দরকার:</strong> ফোন স্লিপ মোডে গেলেও অ্যান্ড্রয়েড সিস্টেম যাতে র‍্যাম বাঁচানোর জন্য গেটওয়ে অ্যাপ কিল বা পজ না করে।
              </p>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 font-mono text-[11px] text-yellow-300">
                📱 সেটিংস &rarr; Battery &rarr; Battery Optimization &rarr; All Apps &rarr; Toolsbd PaySync &rarr; <strong>Don&apos;t optimize / Unrestricted নির্বাচন করুন</strong>
              </div>
            </div>
          </div>

          {/* Permission 4: Auto-start & Background Activity */}
          <div className="p-5 rounded-2xl bg-black/60 border border-purple-500/40 hover:border-purple-400 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">৪. Auto-Start & Background Launch (স্বয়ংক্রিয় চালু)</h4>
                  <span className="text-[10px] font-mono text-slate-400">Xiaomi, Vivo, Oppo, Realme, Samsung</span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                প্রস্তাবিত
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>
                <strong className="text-white">কেন দরকার:</strong> ফোন বন্ধ হয়ে আবার চালু (Reboot) হলে অ্যাপটি নিজে থেকেই ব্যাকগ্রাউন্ডে চালু হয়ে এসএমএস ভেরিফিকেশন শুরু করবে।
              </p>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 font-mono text-[11px] text-yellow-300">
                📱 সেটিংস &rarr; Apps &rarr; Manage Apps &rarr; Toolsbd PaySync &rarr; <strong>Autostart / Allow background activity অন করুন</strong>
              </div>
            </div>
          </div>

          {/* Permission 5: Notifications */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 hover:border-white/20 transition-all space-y-3 md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-yellow-400/15 text-yellow-400 border border-yellow-400/30">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">৫. Notifications & Push Listener (নোটিফিকেশন অনুমতি)</h4>
                  <span className="text-[10px] font-mono text-slate-400">POST_NOTIFICATIONS / Notification Access</span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                প্রস্তাবিত
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>
                <strong className="text-white">কেন দরকার:</strong> গেটওয়ে লাইভ কানেকশন স্ট্যাটাস নোটিফিকেশন বারে সার্বক্ষণিক দেখা যাবে এবং এসএমএস দেরিতে আসলে বিকাশ/নগদ অ্যাপের নোটিফিকেশন থেকেও বিকল্পভাবে যাচাই করা সম্ভব হবে।
              </p>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 font-mono text-[11px] text-yellow-300">
                📱 সেটিংস &rarr; Notifications &rarr; Toolsbd PaySync &rarr; <strong>Allow All Notifications চালু রাখুন</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
