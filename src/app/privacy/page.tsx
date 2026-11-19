import React from "react";

export default function PrivacyPage() {
  return (
    <div className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 text-slate-300">
      <div className="space-y-2 border-b border-white/10 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gradient-shimmer">প্রাইভেসি পলিসি (গোপনীয়তা নীতি)</h1>
        <p className="text-xs text-slate-400">কার্যকরী তারিখ: ২০২৬</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gradient-shimmer">১. যেসব তথ্য আমরা সংগ্রহ করি</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          আপনার লাইসেন্স সক্রিয়করণ ও পেমেন্ট যাচাইয়ের জন্য শুধুমাত্র প্রয়োজনীয় ন্যূনতম তথ্য সংরক্ষণ করা হয়:
        </p>
        <ul className="list-disc list-inside text-xs sm:text-sm space-y-1.5 text-slate-400">
          <li>অ্যাকাউন্ট পরিচিতি (ইমেইল এড্রেস ও নাম)।</li>
          <li>লেনদেন তথ্য (বিকাশ/রকেট প্রেরক নম্বর ও TrxID ম্যাচিংয়ের জন্য)।</li>
          <li>কম্পিউটার হার্ডওয়্যার আইডি (একমুখী হ্যাশকৃত HWID কোড) লাইসেন্স লকের উদ্দেশ্যে।</li>
          <li>আইপি এড্রেস এবং সংযোগ সময় (লাইসেন্স অপব্যবহার ও স্প্যামিং রোধে)।</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gradient-shimmer">২. এসএমএস গেটওয়ে আর্কিটেকচার</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          আমাদের এসএমএস গেটওয়ে অ্যান্ড্রয়েড অ্যাপ শুধুমাত্র মার্চেন্টের ব্যক্তিগত ডিভাইসে চলে এবং কেবল বিকাশ ও রকেট থেকে আসা আর্থিক এসএমএস ট্রানজেকশন রিড করে। কোনো গ্রাহকের ব্যক্তিগত যোগাযোগ বা অন্যান্য বার্তা কখনোই এক্সেস করা হয় না।
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gradient-shimmer">৩. ডেটা সুরক্ষা ও নিরাপত্তা</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          আমাদের সমস্ত ডেটা এনক্রিপ্টেড TLS 1.3 / HTTPS প্রটোকলে সংরক্ষিত হয়। আমরা কখনোই আপনার কোনো ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষ বা বিজ্ঞাপনী সংস্থার সাথে শেয়ার করি না।
        </p>
      </section>
    </div>
  );
}
