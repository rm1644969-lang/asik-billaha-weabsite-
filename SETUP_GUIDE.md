# NEXUS SOFTWARE TOOLS SAAS PLATFORM — COMPLETE SETUP & DEPLOYMENT GUIDE

This document provides a comprehensive operational guide for the **Nexus Tools** platform: the public SaaS storefront, Owner Admin Panel, Firebase Backend, Automated bKash/Nagad SMS Verification Gateway, and Android Companion Application.

---

## 1. Architecture Overview

```
                                [ Public Web Visitors ]
                             (10k-12k daily traffic target)
                                          │
                                          ▼
                      ┌──────────────────────────────────────┐
                      │    Next.js 14 App Router Platform    │
                      │  - 3D Interactive WebGL Hero Canvas  │
                      │  - Tools Marketplace & Pricing       │
                      │  - Customer Dashboard & HWID Control │
                      │  - Owner Admin Panel (/admin)        │
                      └──────────────────┬───────────────────┘
                                         │
             ┌───────────────────────────┴───────────────────────────┐
             ▼                                                       ▼
┌─────────────────────────┐                             ┌─────────────────────────┐
│   Firebase Firestore    │                             │  License Activation API │
│   & Cloud Storage       │                             │   POST /license/verify  │
│ - Strict security rules │                             │ - HWID Binding          │
│ - Zero plaintext leaks  │                             │ - RSA / HMAC tokens     │
└─────────────────────────┘                             └─────────────────────────┘
             ▲                                                       ▲
             │                                                       │
┌─────────────────────────┐                             ┌─────────────────────────┐
│  Automated SMS Gateway  │◄── HMAC-SHA256 Signed HTTP ──│  Android Companion App  │
│   POST /payment/sms     │                             │ - bKash / Nagad Parser  │
│ - TrxID & Amount Match  │                             │ - WorkManager Retry Q   │
│ - Instant License Issue │                             │ - Keystore Encryption   │
└─────────────────────────┘                             └─────────────────────────┘
```

---

## 2. Running Locally & Live Preview

The Next.js production server is pre-configured and active:
- **Local URL**: `http://localhost:3000`
- **Owner Admin Console**: `http://localhost:3000/admin`
- **Customer Dashboard**: `http://localhost:3000/dashboard`
- **Tools Marketplace**: `http://localhost:3000/tools`
- **Checkout Flow**: `http://localhost:3000/checkout`

### Terminal Commands:
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build production bundle
npm run build

# Start production server
npm run start -- -p 3000
```

---

## 3. Firebase Setup Guide

### 3.1. Create Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project: `nexus-tools-saas`.
3. Enable **Firebase Authentication**:
   - Turn on **Email/Password** authentication.
4. Enable **Cloud Firestore** in Production Mode:
   - Location: `asia-southeast1` (Singapore) or `asia-south1` (Mumbai) for ultra-low latency to Bangladesh.
5. Deploy Security Rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
6. Deploy Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```

### 3.2. Firestore Collections Schema:
- `tools`: Catalog of software utilities, slug, versions, screenshots, and download paths.
- `plans`: Pricing tiers (7-day trial, 15-day, 30-day VIP).
- `orders`: Transactions with `orderNumber`, `amount`, `status` (`PENDING`, `PAID`, `REJECTED`), `trxId`.
- `licenses`: Generated license keys, `keyHash`, `hwidHash`, `expiresAt`, `hwidResetCount`.
- `sms_records`: Incoming merchant SMS receipts parsed by companion phone.
- `devices`: Connected Android companion phones with last heartbeat and status.
- `settings`: Editable site identity, bKash & Nagad numbers, Telegram community links.

---

## 4. Custom SMS Payment System & Android Companion App

### 4.1. Companion App Architecture
Located in the `android/` directory:
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/io/nexustools/companion/receiver/SmsReceiver.kt`
- `android/app/src/main/java/io/nexustools/companion/parser/SmsParser.kt`
- `android/app/src/main/java/io/nexustools/companion/worker/PaymentSyncWorker.kt`
- `android/app/src/main/java/io/nexustools/companion/security/KeystoreHelper.kt`

### 4.2. How the Automated Verification Works:
1. Customer selects a tool and plan on the website (e.g. 7-Day trial for ৳350).
2. Customer sends money from their bKash/Nagad app to the merchant number.
3. The merchant SIM receives the incoming transaction SMS from bKash (`16247`) or Nagad (`16167`).
4. The companion Android app's `SmsReceiver` intercepts the SMS.
5. `SmsParser` extracts the exact `TrxID` (e.g. `BK992A81KC`) and `Amount` (৳350.00).
6. `PaymentSyncWorker` computes an HMAC-SHA256 signature using the secret stored in Android Keystore.
7. The app makes a secure POST request to `/api/payment/sms`.
8. The server matches the TrxID with the customer's pending order, marks it **PAID**, and issues the **License Key** automatically within 45 seconds!

### 4.3. Compiling the Android Companion:
1. Open the `android/` folder in **Android Studio**.
2. Connect your Android device (the phone containing the merchant SIM card).
3. Build and install: `Run -> Run 'app'`.
4. Grant the **RECEIVE_SMS** and **READ_SMS** permissions when prompted.
5. In the app settings screen, enter your `SMS_DEVICE_SECRET` matching your server configuration.

---

## 5. Software License Verification (C# / Python / C++)

To integrate license checks into your Windows desktop tools, send an HTTP POST request upon application launch:

### Request Example (JSON):
```http
POST https://nexustools.io/api/license/verify
Content-Type: application/json

{
  "key": "NEX-OTP-7D-9A2F-84BC-4E11",
  "hwid": "BFEBFBFF000906EA-F48E-381A-B19F",
  "toolId": "tool-otp-utility",
  "version": "v3.4.2"
}
```

### Response Example:
```json
{
  "success": true,
  "message": "License validated successfully. Machine authorized.",
  "data": {
    "toolId": "tool-otp-utility",
    "status": "ACTIVE",
    "expiresAt": "2026-11-24T15:27:27.868Z",
    "token": "48b2688a33934e4d8c9a718f650c81d13a669b2e1b8d0b74829b023e9e56e1cb"
  }
}
```

---

## 6. High-Traffic Production Scaling (10k-12k Daily Visitors)

1. **Next.js Static Generation (SSG)**:
   - Tool pages, Pricing, Tutorials, and Homepage are statically pre-rendered for sub-50ms TTFB.
2. **CDN Caching**:
   - Cloudflare or Vercel Edge CDN caches images, 3D assets, and public routes.
3. **Database Read Optimization**:
   - Catalog queries are cached; real-time listeners are restricted to the active user's dashboard and the Admin SMS log.
4. **App Check**:
   - Enable Firebase App Check with reCAPTCHA v3 or Cloudflare Turnstile to block automated scraping and bot spam.
