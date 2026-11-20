export interface Tool {
  id: string;
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  version: string;
  bannerUrl: string;
  iconUrl?: string;
  status: "active" | "maintenance" | "beta" | "updated" | "coming_soon";
  isFeatured?: boolean;
  setupVideoUrl: string;
  downloadFilePath: string;
  downloadFileName: string;
  fileSize: string;
  checksumSha256: string;
  features: string[];
  systemRequirements: {
    os: string;
    ram: string;
    processor: string;
    netFramework: string;
  };
  screenshots: string[];
  plans?: PricePlan[];
  createdAt: string;
  updatedAt: string;
}

export interface PricePlan {
  id: string;
  toolId: string;
  toolName?: string;
  name: string;
  durationDays: number;
  priceUSD: number;
  originalPriceUSD?: number;
  priceBDT: number;
  originalPriceBDT?: number;
  currency: string;
  isPopular?: boolean;
  enabled: boolean;
  features: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  toolId: string;
  toolName: string;
  planId: string;
  planDuration: number;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "REJECTED" | "EXPIRED";
  paymentMethod: "bKash" | "Nagad" | "Rocket" | "Manual";
  senderNumber?: string;
  trxId?: string;
  licenseKey?: string;
  notes?: string;
  createdAt: string;
  paidAt?: string;
}

export interface PaymentSubmission {
  id: string;
  orderId: string;
  trxId: string;
  senderNumber: string;
  amount: number;
  provider: "bKash" | "Nagad" | "Rocket";
  status: "PENDING_VERIFICATION" | "MATCHED" | "REJECTED" | "MANUAL_REVIEW";
  matchedSmsId?: string;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: "SMS_AUTOMATION" | "ADMIN_MANUAL";
}

export interface License {
  id: string;
  key: string;
  keyHash: string;
  toolId: string;
  toolName: string;
  userId: string;
  userEmail: string;
  orderId: string;
  durationDays: number;
  status: "ACTIVE" | "EXPIRED" | "BANNED" | "REVOKED";
  hwid?: string;
  hwidHash?: string;
  hwidLockedAt?: string;
  hwidResetCount: number;
  lastHwidResetAt?: string;
  maxDevices: number;
  activationsCount: number;
  lastActivatedAt?: string;
  lastIpAddress?: string;
  createdAt: string;
  expiresAt: string;
}

export interface SmsRecord {
  id: string;
  deviceId: string;
  deviceName: string;
  sender: string;
  rawMessage: string;
  trxId: string;
  amount: number;
  provider: "bKash" | "Nagad" | "Rocket" | "UNKNOWN";
  receivedAt: string;
  matchedOrderId?: string;
  status: "MATCHED" | "UNMATCHED" | "DUPLICATE";
}

export interface SmsDevice {
  id: string;
  deviceId: string;
  name: string;
  model: string;
  status: "ONLINE" | "OFFLINE" | "REVOKED";
  secretPreview: string;
  batteryLevel?: number;
  lastHeartbeat: string;
  lastSyncAt: string;
  totalSmsProcessed: number;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  telegramGroupUrl: string;
  telegramChannelUrl: string;
  telegramSupportUsername: string;
  bkashMerchantNumber: string;
  bkashType: "Personal" | "Merchant" | "Agent";
  rocketMerchantNumber: string;
  rocketType: "Personal" | "Merchant";
  nagadMerchantNumber: string;
  nagadType: "Personal" | "Merchant";
  paymentNotice: string;
  contactEmail: string;
  announcementNotice: string;
  isAnnouncementActive: boolean;
  maintenanceMode: boolean;
}

export interface Review {
  id: string;
  customerName: string;
  avatarUrl?: string;
  rating: number;
  toolName: string;
  comment: string;
  date: string;
  isVerified: boolean;
}

export interface Tutorial {
  id: string;
  title: string;
  toolSlug: string;
  toolName: string;
  videoUrl: string;
  duration: string;
  description: string;
  steps: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "Payment" | "License" | "Installation" | "Support";
}

export interface WalletDeposit {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amountUSD: number;
  amountBDT: number;
  method: "bKash" | "Nagad" | "Rocket";
  senderNumber: string;
  trxId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedAt?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "customer" | "admin";
  walletBalanceUSD: number;
  walletBalanceBDT: number;
  createdAt: string;
}
