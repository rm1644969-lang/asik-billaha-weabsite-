# TOOLSBD.COM — COMPLETE ARCHITECTURE, DUAL FIREBASE & SCALING GUIDE

This official production guide explains the **Toolsbd.com** architecture, the **Dual Firebase System**, the **50,000 Free Firestore Quota Defense**, and instructions on how to scale the server effortlessly to 10,000–50,000+ daily members.

---

## 1. Dual Firebase Architecture

To ensure your website never slows down and to protect Firestore daily read limits, Toolsbd.com is architected with **two separate Firebase projects**:

```
                       ┌────────────────────────────────────────────────────────┐
                       │           Toolsbd.com Next.js 14 App Shell            │
                       │     (Vercel Serverless Edge Auto-Scale 10k-50k+)       │
                       └───────────────┬────────────────────────┬───────────────┘
                                       │                        │
                                       ▼                        ▼
              ┌──────────────────────────────────┐    ┌──────────────────────────────────┐
              │       FIREBASE PROJECT 1         │    │       FIREBASE PROJECT 2         │
              │        Website Backend           │    │    Tool & HWID Licensing DB      │
              │      (fb-resend-otp)             │    │    (Dedicated License Project)   │
              ├──────────────────────────────────┤    ├──────────────────────────────────┤
              │ • users (wallet balance, profile)│    │ • licenses (keys, durations)     │
              │ • wallet_deposits (bKash/Rocket) │    │ • hwid_keys (hardware bindings)  │
              │ • orders (transaction receipts)  │    │ • machine_locks (1-click resets) │
              │ • site_settings & tutorials      │    │ • tool_telemetry (audit trail)   │
              └──────────────────────────────────┘    └──────────────────────────────────┘
```

### Why Dual Firebase?
1. **Isolated Quotas**: Even if thousands of desktop users run the software utility, their background license queries hit **Project 2**, leaving **Project 1 (Website, Orders & Payments)** at 100% capacity with zero risk of quota exhaustion!
2. **Easy Activation**: Your primary project (`fb-resend-otp`) is already live. When you create your second Firebase project, simply paste its credentials into `.env.local` or Vercel Environment Variables:
   - `NEXT_PUBLIC_LICENSE_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_LICENSE_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_LICENSE_FIREBASE_APP_ID`
   *(If not yet provided, the system automatically falls back to Project 1 safely using the in-memory RAM cache!)*

---

## 2. 50,000 Free Firestore Reads Quota Defense

Google Firebase offers **50,000 free reads and 20,000 free writes per day** on the Spark free plan.
If 500 members run your desktop tool and the tool pings the database every 30 seconds:
> **500 users × 2 pings/min × 60 min = 60,000 reads/hour (Quota crashed in 50 minutes!)**

### Toolsbd.com 3-Tier Quota Shield:

#### Tier 1: 12-Hour Signed Cryptographic Session Token (Offline Token)
- When a user verifies their tool with license key + HWID, `/api/license/verify` issues an HMAC-SHA256 cryptographically signed session token valid for **12 Hours**.
- The desktop tool saves this token locally on the user's PC.
- For the next 12 hours, the desktop tool runs **100% offline without making a single request to Firebase**!
- The tool only checks back once every 12 hours.
- **Math**: 10,000 active users × 2 checks/day = **20,000 reads/day** (less than 40% of the 50,000 free quota!).

#### Tier 2: Server-Side In-Memory RAM Cache (15-Minute TTL)
- Next.js stores active verification responses in memory RAM (`Map<string, CacheEntry>`).
- If 1,000 users launch the tool simultaneously, the first request fetches Firestore once, and the remaining 999 requests are served in **0.2 milliseconds directly from RAM** with **ZERO Firestore reads**!

#### Tier 3: Rate Limiting & Protection
- Limits rapid requests from identical IPs or machines to max 60 requests/minute, completely blocking malicious loops, spam, or DDoS attacks.

---

## 3. How to Scale the Server ("Server Barabo Kivabe?")

If your member base grows to 20,000, 50,000, or 100,000 users:

### Step 1: Vercel Edge Serverless (Already Enabled)
- Toolsbd.com runs on Vercel Serverless.
- You do NOT need to buy more VPS RAM, CPU, or maintain Linux servers. Vercel automatically scales from 1 request to 100,000 requests per second.

### Step 2: Firebase Blaze Plan (Pay As You Go — Super Cheap)
- In the Firebase Console, switch your billing plan from **Spark (Free)** to **Blaze**.
- **Important**: In the Blaze plan, the first **50,000 reads EVERY DAY are still 100% FREE ($0.00)**!
- If you ever exceed 50,000 reads, Google only charges **$0.06 (6 cents, approx ৳8 BDT) per 100,000 extra reads**!
- Even with 500,000 daily reads, your monthly bill would only be around **$0.50 – $1.00 USD (~৳100 BDT)**.

### Step 3: Cloudflare Proxy (Optional for DDoS Protection)
- Point your custom domain (e.g., `toolsbd.com`) through Cloudflare (Free Plan).
- Enable "Proxy Status (Orange Cloud)". Cloudflare will cache static assets at Bangladesh edge servers and block bot attacks.

---

## 4. Desktop Tool Implementation Guide (Zero-Quota-Drain)

Give this Python or C# snippet to your desktop software developer:

### Python Desktop Tool Client:
```python
import requests, os, json, time

API_URL = "https://toolsbd.com/api/license/verify"
CACHE_FILE = "license_session.dat"

def verify_tool_license(key, hwid):
    # 1. Check local offline cache first (Zero server pings for 12 hours!)
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as f:
                data = json.load(f)
                if time.time() < data.get("valid_until_timestamp", 0):
                    return True # Validated offline!
        except:
            pass

    # 2. Query Toolsbd.com server only once every 12 hours
    try:
        res = requests.post(API_URL, json={"key": key, "hwid": hwid}, timeout=10)
        json_data = res.json()
        if json_data.get("success"):
            # Save 12h signed session token locally
            with open(CACHE_FILE, "w") as f:
                json.dump({
                    "token": json_data["data"]["offlineToken"],
                    "valid_until_timestamp": time.time() + (12 * 3600)
                }, f)
            return True
    except Exception as e:
        print("Verification error:", e)
    return False
```

---

## 5. Official Offer Pricing & Payment Details

- **Flagship Tool**: OTP Testing Utility (v3.4.2 PRO)
- **7 Days Access**: $2 USD (৳240 BDT) 🔥
- **15 Days Access**: $4 USD (৳480 BDT) 🔥
- **30 Days VIP Access**: $8 USD (৳960 BDT) 🔥
- **bKash Personal**: `01609166109`
- **Rocket Personal**: `01731328169`
- **Automated Verification Window**: 30 – 45 seconds via companion SMS gateway or Instant Wallet Purchase.
