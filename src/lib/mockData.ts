import { Tool, PricePlan, Order, License, Review, Tutorial, FaqItem, SiteSettings, SmsDevice, SmsRecord } from "./types";

export const initialSettings: SiteSettings = {
  siteName: "Toolsbd.com",
  siteTagline: "Bangladesh's #1 Automated Software Tool & Licensing Hub",
  heroTitle: "Premium Software Tool & Automated 24/7 Licensing",
  heroSubtitle: "Deploy our flagship high-speed utility with instantaneous HWID license activation, automated bKash & Rocket verification, and 24/7 VIP Telegram support.",
  telegramGroupUrl: "https://t.me/toolsbd_official",
  telegramChannelUrl: "https://t.me/toolsbd_channel",
  telegramSupportUsername: "@ToolsbdSupport",
  bkashMerchantNumber: "01967922602",
  bkashType: "Personal",
  rocketMerchantNumber: "01731328169",
  rocketType: "Personal",
  nagadMerchantNumber: "01967922602",
  nagadType: "Personal",
  paymentNotice: "Send money via bKash (01967922602) or Rocket (01731328169) Personal and submit your exact TrxID below for instant auto-activation within 45 seconds.",
  contactEmail: "support@toolsbd.com",
  announcementNotice: "🔊 TOOLS OFFER PRICE: 7 DAYS — $2 🔥 | 15 DAYS — $4 🔥 | 30 DAYS — $8 🔥 — Instant bKash & Rocket Auto Delivery!",
  isAnnouncementActive: true,
  maintenanceMode: false,
};

export const samplePlans: PricePlan[] = [
  {
    id: "plan-otp-7d",
    toolId: "tool-otp-utility",
    toolName: "OTP Testing Utility",
    name: "7 DAYS OFFER 🔥",
    durationDays: 7,
    priceUSD: 2,
    originalPriceUSD: 4,
    priceBDT: 240,
    originalPriceBDT: 480,
    currency: "USD",
    isPopular: false,
    enabled: true,
    features: [
      "Full 7 Days Unlimited Access",
      "Single PC HWID Security Lock",
      "Instant bKash / Rocket Activation",
      "Setup Video & Direct Download",
      "Standard Telegram Support"
    ]
  },
  {
    id: "plan-otp-15d",
    toolId: "tool-otp-utility",
    toolName: "OTP Testing Utility",
    name: "15 DAYS OFFER 🔥",
    durationDays: 15,
    priceUSD: 4,
    originalPriceUSD: 7,
    priceBDT: 480,
    originalPriceBDT: 840,
    currency: "USD",
    isPopular: true,
    enabled: true,
    features: [
      "Full 15 Days Unlimited Access",
      "High Priority High-Speed Route",
      "Single PC HWID Security Lock",
      "Instant Auto-Delivery via SMS",
      "Priority 24/7 Telegram Support"
    ]
  },
  {
    id: "plan-otp-30d",
    toolId: "tool-otp-utility",
    toolName: "OTP Testing Utility",
    name: "30 DAYS VIP OFFER 🔥",
    durationDays: 30,
    priceUSD: 8,
    originalPriceUSD: 15,
    priceBDT: 960,
    originalPriceBDT: 1800,
    currency: "USD",
    isPopular: false,
    enabled: true,
    features: [
      "Full 30 Days VIP Unlimited Access",
      "Ultra-Fast Multi-Thread Engine",
      "Single PC HWID Security Lock",
      "Dedicated VIP Telegram Group",
      "All Future Updates Included Free"
    ]
  }
];

// Single flagship tool for now (Admin can add more anytime from /admin/tools)
export const sampleTools: Tool[] = [
  {
    id: "tool-otp-utility",
    name: "FAST OTP — FB Auto Resender Pro",
    slug: "otp-testing-utility",
    category: "Flagship Utility",
    tagline: "High-speed automated utility with instant HWID license verification & zero-latency engine",
    description: "Our flagship tool engineered for maximum speed, stability, and automated workflow execution. Features ultra-low latency monitoring, multi-threaded operations, cryptographic HWID license locking, and automatic cloud updates directly from Toolsbd.com.",
    version: "v3.0 PRO",
    bannerUrl: "/images/fast-otp-tool.jpg",
    status: "active",
    isFeatured: true,
    setupVideoUrl: "https://www.youtube.com/embed/U2JBcFAO7mE?si=9Pxpka_XfFtBmDGF",
    downloadFilePath: "/releases/Toolsbd_Utility_v3.4.2_Setup.zip",
    downloadFileName: "Fast_OTP_v3.0_Pro_Setup.zip",
    fileSize: "28.4 MB",
    checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    features: [
      "Real-time high-concurrency multi-threading engine",
      "Instant automated license delivery via bKash & Rocket",
      "HWID Hardware Security Lock to protect your subscription",
      "Instant HWID Machine Authorization (No resets needed)",
      "Detailed live terminal telemetry & exportable logs",
      "Full setup video & direct high-speed download link"
    ],
    systemRequirements: {
      os: "Windows 10 / 11 (64-bit)",
      ram: "4 GB Minimum (8 GB Recommended)",
      processor: "Intel Core i3 / AMD Ryzen 3 or higher",
      netFramework: ".NET Desktop Runtime 8.0"
    },
    screenshots: [
      "/images/fast-otp-tool.jpg"
    ],
    plans: samplePlans,
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-03-01T15:30:00Z"
  },
  {
    id: "tool-tiktok-otp",
    name: "TikTok OTP Resender Pro",
    slug: "tiktok-otp-resender",
    category: "Social Automation",
    tagline: "High-speed automated TikTok OTP verification & resender utility with zero-delay engine",
    description: "Automated TikTok OTP workflow suite engineered for high concurrency, instant bypass verification, and automated token management. Coming soon to Toolsbd.com.",
    version: "COMING SOON",
    bannerUrl: "/images/tiktok-otp-banner.svg",
    status: "coming_soon",
    isFeatured: false,
    setupVideoUrl: "https://www.youtube.com/embed/U2JBcFAO7mE?si=9Pxpka_XfFtBmDGF",
    downloadFilePath: "",
    downloadFileName: "TikTok_OTP_v1.0_Setup.zip",
    fileSize: "Pending Release",
    checksumSha256: "TBD",
    features: [
      "Real-time TikTok automated OTP request & verification",
      "Multi-account parallel thread routing engine",
      "Cryptographic single-machine HWID security lock"
    ],
    systemRequirements: {
      os: "Windows 10 / 11 (64-bit)",
      ram: "4 GB Minimum",
      processor: "Intel / AMD 64-bit",
      netFramework: ".NET Desktop Runtime 8.0"
    },
    screenshots: [
      "/images/tiktok-otp-banner.svg"
    ],
    plans: [],
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z"
  },
  {
    id: "tool-instagram-otp",
    name: "Instagram OTP Resender Pro",
    slug: "instagram-otp-resender",
    category: "Social Automation",
    tagline: "Automated Instagram verification & resender engine with anti-detection and proxy support",
    description: "Enterprise automated Instagram OTP automation software with proxy rotation, session persistence, and instant hardware-locked licenses. Under active development.",
    version: "COMING SOON",
    bannerUrl: "/images/instagram-otp-banner.svg",
    status: "coming_soon",
    isFeatured: false,
    setupVideoUrl: "https://www.youtube.com/embed/U2JBcFAO7mE?si=9Pxpka_XfFtBmDGF",
    downloadFilePath: "",
    downloadFileName: "Instagram_OTP_v1.0_Setup.zip",
    fileSize: "Pending Release",
    checksumSha256: "TBD",
    features: [
      "Ultra-fast Instagram OTP resend automation",
      "Anti-detection rotation & proxy pool management",
      "Single PC HWID license protection"
    ],
    systemRequirements: {
      os: "Windows 10 / 11 (64-bit)",
      ram: "4 GB Minimum",
      processor: "Intel / AMD 64-bit",
      netFramework: ".NET Desktop Runtime 8.0"
    },
    screenshots: [
      "/images/instagram-otp-banner.svg"
    ],
    plans: [],
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z"
  }
];

// Real Production Data: Orders, Licenses, and SMS records start clean and populate from Firestore
export const sampleOrders: Order[] = [];

export const sampleLicenses: License[] = [];

export const sampleSmsDevices: SmsDevice[] = [
  {
    id: "dev-01",
    deviceId: "toolsbd-android-primary",
    name: "Toolsbd PaySync Merchant Phone",
    model: "Android Gateway (bKash & Rocket SIM)",
    status: "ONLINE",
    secretPreview: "sec_live_9f83ca42d992e10650b2ed6cb6bb79",
    batteryLevel: 95,
    lastHeartbeat: "Active",
    lastSyncAt: new Date().toISOString(),
    totalSmsProcessed: 0,
    createdAt: new Date().toISOString()
  }
];

export const sampleSmsRecords: SmsRecord[] = [];

export const sampleReviews: Review[] = [
  {
    id: "rev-1",
    customerName: "Imran Khan",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Imran",
    rating: 5,
    toolName: "OTP Testing Utility",
    comment: "7 Days only $2! Auto payment confirmed within 35 seconds on bKash (01967922602). HWID license key worked instantly on Windows 11.",
    date: "2 days ago",
    isVerified: true
  },
  {
    id: "rev-2",
    customerName: "Rifat Noor",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Rifat",
    rating: 5,
    toolName: "OTP Testing Utility",
    comment: "Took the 15 Days $4 offer via Rocket. Super clean site, instant download link, and super fast Telegram support. Best in BD!",
    date: "5 days ago",
    isVerified: true
  },
  {
    id: "rev-3",
    customerName: "Mahbubur Rahman",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=Mahbub",
    rating: 5,
    toolName: "OTP Testing Utility",
    comment: "30 Days VIP for just $8 is unbeatable! The setup video explained everything clearly and HWID reset works with one click.",
    date: "1 week ago",
    isVerified: true
  }
];

export const sampleTutorials: Tutorial[] = [
  {
    id: "tut-1",
    title: "Complete Tool Setup, Download & HWID Activation Guide",
    toolSlug: "otp-testing-utility",
    toolName: "OTP Testing Utility",
    videoUrl: "https://www.youtube.com/embed/U2JBcFAO7mE?si=9Pxpka_XfFtBmDGF",
    duration: "Full Setup Guide",
    description: "Step-by-step walkthrough covering downloading the tool, extracting the zip file, obtaining your HWID, and activating your license key from Toolsbd.com.",
    steps: [
      "Extract the downloaded ZIP archive using 7-Zip or WinRAR.",
      "Right click the executable and select 'Run as Administrator'.",
      "Copy your generated Hardware ID (HWID) and paste it inside your Toolsbd.com dashboard.",
      "Click 'Bind HWID & Activate' to unlock the software immediately."
    ]
  },
  {
    id: "tut-2",
    title: "How to Add Money, Buy Offer & Reset HWID",
    toolSlug: "general",
    toolName: "Toolsbd.com Account",
    videoUrl: "https://www.youtube.com/embed/U2JBcFAO7mE?si=9Pxpka_XfFtBmDGF",
    duration: "Quick Guide",
    description: "Learn how to add balance via bKash/Rocket, buy the 7/15/30-day offer, and use your 1-click HWID reset button when switching PCs.",
    steps: [
      "Open My Dashboard -> Add Money via bKash (01967922602) or Rocket (01731328169).",
      "Buy your preferred offer (7 Days $2, 15 Days $4, or 30 Days $8).",
      "Go to My Licenses -> paste your PC HWID and activate.",
      "To change PCs later, click 'Reset HWID' with 1 click."
    ]
  }
];

export const sampleFaqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "How long does automated bKash/Rocket payment confirmation take?",
    answer: "Our automated companion SMS gateway detects your transaction within 30 to 45 seconds after you send money to bKash (01967922602) or Rocket (01731328169) and submit your TrxID. Your license key is generated immediately.",
    category: "Payment"
  },
  {
    id: "faq-2",
    question: "What are the current offer prices?",
    answer: "Our current TOOLS OFFER PRICE is: 7 Days for $2 (৳240 BDT), 15 Days for $4 (৳480 BDT), and 30 Days VIP for $8 (৳960 BDT).",
    category: "Payment"
  },
  {
    id: "faq-3",
    question: "What is an HWID (Hardware ID) lock?",
    answer: "HWID is a unique digital fingerprint of your PC. Once you activate a license key on your computer, it locks to that machine for security. You can easily reset your HWID from your dashboard if you switch PCs.",
    category: "License"
  },
  {
    id: "faq-4",
    question: "Where can I download the tool after payment?",
    answer: "Downloads are available immediately after payment confirmation and anytime inside your customer dashboard under the 'Authorized Downloads' tab.",
    category: "Installation"
  }
];
