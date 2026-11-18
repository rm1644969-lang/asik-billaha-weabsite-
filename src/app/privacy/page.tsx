import React from "react";

export default function PrivacyPage() {
  return (
    <div className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 text-slate-300">
      <div className="space-y-2 border-b border-white/10 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Effective Date: January 1, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          We collect minimal telemetry strictly necessary to fulfill your license activation and payment verification:
        </p>
        <ul className="list-disc list-inside text-xs sm:text-sm space-y-1.5 text-slate-400">
          <li>Account credentials (Email, Name, User ID).</li>
          <li>Transaction data (Sender mobile number and bKash/Nagad TrxID for matching).</li>
          <li>Hardware Fingerprint (One-way hashed HWID string) to bind software licenses.</li>
          <li>IP address and connection timestamps for license abuse prevention.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">2. Companion SMS Gateway Architecture</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          Our companion SMS gateway Android application operates solely on the merchant&apos;s private device and only reads incoming financial receipts sent by authorized financial providers (bKash and Nagad). No customer personal communications, contacts, or unrelated messages are accessed or transmitted.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">3. Data Security & Storage</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          All communications are secured over TLS 1.3 / HTTPS. License verification calls employ HMAC-SHA256 signatures to protect against replay and tampering attacks. We never sell or share user information with third-party advertising networks.
        </p>
      </section>
    </div>
  );
}
