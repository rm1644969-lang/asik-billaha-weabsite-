import React from "react";

export default function TermsPage() {
  return (
    <div className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 text-slate-300">
      <div className="space-y-2 border-b border-white/10 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-white">Terms of Service & Licensing Policy</h1>
        <p className="text-xs text-slate-400">Effective Date: January 1, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">1. Software License Agreement</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          All utilities distributed on this platform are proprietary software tools licensed on a duration-limited subscription basis (e.g. 7-day, 15-day, or 30-day). A purchased license grants a single non-transferable right to execute the software bound to one physical machine Hardware ID (HWID).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">2. Hardware Fingerprint (HWID) Binding</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          Upon first launch on the client&apos;s machine, the license key is cryptographically locked to the user&apos;s processor and motherboard hardware identifiers. Users are granted one free HWID reset per 30-day billing cycle through their user dashboard in the event of hardware upgrades or operating system reinstalls. Unauthorized sharing or cracking attempts will result in immediate permanent license revocation without refund.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">3. Payment & Automated Verification</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          Payments are handled via automated bKash and Nagad personal mobile payment verification. Users must send the exact specified BDT amount and enter their valid Transaction ID (TrxID). Any falsified TrxID submissions or double-spend attempts will permanently blacklist the client&apos;s IP address and account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">4. Refund & Replacement Policy</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          Due to the digital nature of immediate cryptographic key delivery, sales are final once an active license key is issued. In the rare event that an auto-payment succeeds but no license is generated within 15 minutes, our admin desk will issue the key manually or process a full refund.
        </p>
      </section>
    </div>
  );
}
