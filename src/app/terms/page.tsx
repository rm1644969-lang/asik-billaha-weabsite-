import React from "react";

export default function TermsPage() {
  return (
    <div className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 text-slate-300">
      <div className="space-y-2 border-b border-white/10 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gradient-shimmer">ব্যবহারের শর্তাবলী ও লাইসেন্স নীতিমালা</h1>
        <p className="text-xs text-slate-400">কার্যকরী তারিখ: ২০২৬</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gradient-shimmer">১. সফটওয়্যার লাইসেন্স চুক্তি</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          এই প্ল্যাটফর্মে সরবরাহকৃত সকল সফটওয়্যার টুলস নির্দিষ্ট মেয়াদের (যেমন: ৭ দিন, ১৫ দিন, অথবা ৩০ দিন) সাবস্ক্রিপশন ভিত্তিক। লাইসেন্স কেনার মাধ্যমে একজন ব্যবহারকারী তার একক কম্পিউটারের হার্ডওয়্যার আইডিতে (HWID) সফটওয়্যারটি চালানোর অধিকার পান।
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gradient-shimmer">২. হার্ডওয়্যার আইডি (HWID) লক</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          ক্লায়েন্টের কম্পিউটারে প্রথমবারের মতো সফটওয়্যার চালুর সময় লাইসেন্স কী স্থায়ীভাবে প্রসেসর ও মাদারবোর্ডের হার্ডওয়্যার আইডির সাথে লক হয়ে যায়। উইন্ডোজ রি-ইনস্টল বা পিসি পরিবর্তনের ক্ষেত্রে ড্যাশবোর্ড থেকে রিসেটের সুবিধা প্রদান করা হয়। কোনো প্রকার অননুমোদিত শেয়ারিং বা ক্র্যাকিং চেষ্টা করলে লাইসেন্স স্বয়ংক্রিয়ভাবে বাতিল হবে।
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gradient-shimmer">৩. পেমেন্ট ও স্বয়ংক্রিয় ভেরিফিকেশন</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          বিকাশ ও রকেট পার্সোনাল সেন্ড মানি মেথডের মাধ্যমে স্বয়ংক্রিয়ভাবে পেমেন্ট যাচাই করা হয়। ব্যবহারকারীকে সঠিক টাকা পাঠিয়ে SMS থেকে সঠিক TrxID সাবমিট করতে হবে। ভুয়া বা ডুপ্লিকেট TrxID দিলে অ্যাকাউন্ট স্বয়ংক্রিয়ভাবে স্থগিত করা হবে।
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gradient-shimmer">৪. রিফান্ড ও রিপ্লেসমেন্ট পলিসি</h2>
        <p className="text-xs sm:text-sm leading-relaxed">
          ডিজিটাল লাইসেন্স কী তাৎক্ষণিক ডেলিভারি হওয়ার পর সাধারণত কোনো রিফান্ড প্রযোজ্য নয়। তবে পেমেন্ট সফল হওয়ার পর যদি ১৫ মিনিটের মধ্যে সিস্টেম থেকে লাইসেন্স কি না আসে, তবে অ্যাডমিন ডেস্ক যাচাই করে তাৎক্ষণিক লাইসেন্স প্রদান অথবা সম্পূর্ণ রিফান্ড নিশ্চিত করবে।
        </p>
      </section>
    </div>
  );
}
