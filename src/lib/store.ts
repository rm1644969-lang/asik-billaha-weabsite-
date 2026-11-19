"use client";

import { useState, useEffect } from "react";
import { 
  Tool, 
  PricePlan, 
  Order, 
  License, 
  SiteSettings, 
  SmsDevice, 
  SmsRecord, 
  Review, 
  Tutorial, 
  FaqItem, 
  WalletDeposit,
  UserAccount 
} from "./types";
import { 
  sampleTools, 
  samplePlans, 
  sampleOrders, 
  sampleLicenses, 
  sampleSmsDevices, 
  sampleSmsRecords, 
  initialSettings, 
  sampleReviews, 
  sampleTutorials, 
  sampleFaqs 
} from "./mockData";
import {
  syncLicenseToFirestore,
  syncOrderToFirestore,
  syncDepositToFirestore,
  syncWalletBalanceToFirestore,
  syncSettingsToFirestore,
  fetchSettingsFromFirestore,
  FIREBASE_PROJECT_ID,
  webDb
} from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export function generateToolLicenseKey(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `AT-${seg()}-${seg()}-${seg()}-${seg()}`;
}

export function useNexusStore() {
  const [tools, setTools] = useState<Tool[]>(sampleTools);
  const [plans, setPlans] = useState<PricePlan[]>(samplePlans);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [licenses, setLicenses] = useState<License[]>(sampleLicenses);
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [smsDevices, setSmsDevices] = useState<SmsDevice[]>(sampleSmsDevices);
  const [smsRecords, setSmsRecords] = useState<SmsRecord[]>(sampleSmsRecords);
  const [reviews] = useState<Review[]>(sampleReviews);
  const [tutorials, setTutorials] = useState<Tutorial[]>(sampleTutorials);
  const [faqs, setFaqs] = useState<FaqItem[]>(sampleFaqs);
  const [walletBalanceUSD, setWalletBalanceUSD] = useState<number>(0);
  const [deposits, setDeposits] = useState<WalletDeposit[]>([]);
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedTools = localStorage.getItem("toolsbd_v4_tools");
      const storedPlans = localStorage.getItem("toolsbd_v4_plans");
      const storedOrders = localStorage.getItem("toolsbd_v4_orders");
      const storedLicenses = localStorage.getItem("toolsbd_v4_licenses");
      const storedSettings = localStorage.getItem("toolsbd_v4_settings");
      const storedSmsRecords = localStorage.getItem("toolsbd_v4_sms_records");
      const storedDevices = localStorage.getItem("toolsbd_v4_sms_devices");
      const storedWallet = localStorage.getItem("toolsbd_v4_wallet_usd");
      const storedDeposits = localStorage.getItem("toolsbd_v4_deposits");
      const storedTutorials = localStorage.getItem("toolsbd_v4_tutorials");
      const storedFaqs = localStorage.getItem("toolsbd_v4_faqs");
      const storedAuthUser = localStorage.getItem("toolsbd_auth_current_user");

      if (storedTools) {
        const parsedTools = JSON.parse(storedTools);
        const updatedTools = parsedTools.map((t: Tool) => {
          if (t.id === "tool-otp-utility" || (t.bannerUrl && t.bannerUrl.includes("unsplash.com"))) {
            return {
              ...t,
              name: "FAST OTP — FB Auto Resender Pro",
              version: "v3.0 PRO",
              bannerUrl: "/images/fast-otp-tool.jpg",
              screenshots: ["/images/fast-otp-tool.jpg"],
            };
          }
          return t;
        });
        setTools(updatedTools);
      }
      if (storedPlans) setPlans(JSON.parse(storedPlans));
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      if (storedLicenses) setLicenses(JSON.parse(storedLicenses));
      if (storedSettings) setSettings(JSON.parse(storedSettings));
      if (storedSmsRecords) setSmsRecords(JSON.parse(storedSmsRecords));
      if (storedDevices) setSmsDevices(JSON.parse(storedDevices));
      if (storedDeposits) setDeposits(JSON.parse(storedDeposits));
      if (storedTutorials) setTutorials(JSON.parse(storedTutorials));
      if (storedFaqs) setFaqs(JSON.parse(storedFaqs));

      // Load Logged in User & Balance
      if (storedAuthUser) {
        const user: UserAccount = JSON.parse(storedAuthUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
        setWalletBalanceUSD(user.walletBalanceUSD ?? 0);
      } else if (storedWallet) {
        setWalletBalanceUSD(JSON.parse(storedWallet));
      }
      // Also try fetching live settings from Firestore in the background
      fetchSettingsFromFirestore().then((remoteSettings) => {
        if (remoteSettings) {
          setSettings(prev => ({ ...prev, ...remoteSettings }));
          if (typeof window !== "undefined") {
            localStorage.setItem("toolsbd_v4_settings", JSON.stringify(remoteSettings));
          }
        }
      }).catch(() => {});
    } catch {
      // Fallback
    }
    setIsLoaded(true);
  }, []);

  // Sync helpers
  const saveTools = (newTools: Tool[]) => {
    setTools(newTools);
    if (typeof window !== "undefined") localStorage.setItem("toolsbd_v4_tools", JSON.stringify(newTools));
  };

  const savePlans = (newPlans: PricePlan[]) => {
    setPlans(newPlans);
    if (typeof window !== "undefined") localStorage.setItem("toolsbd_v4_plans", JSON.stringify(newPlans));
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    if (typeof window !== "undefined") localStorage.setItem("toolsbd_v4_orders", JSON.stringify(newOrders));
  };

  const saveLicenses = (newLicenses: License[]) => {
    setLicenses(newLicenses);
    if (typeof window !== "undefined") localStorage.setItem("toolsbd_v4_licenses", JSON.stringify(newLicenses));
  };

  const saveSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    if (typeof window !== "undefined") localStorage.setItem("toolsbd_v4_settings", JSON.stringify(newSettings));
    syncSettingsToFirestore(newSettings).catch(() => {});
  };

  const saveSmsRecords = (newRecords: SmsRecord[]) => {
    setSmsRecords(newRecords);
    if (typeof window !== "undefined") localStorage.setItem("toolsbd_v4_sms_records", JSON.stringify(newRecords));
  };

  const saveWalletBalance = (newBalanceUSD: number) => {
    setWalletBalanceUSD(newBalanceUSD);
    if (typeof window !== "undefined") {
      localStorage.setItem("toolsbd_v4_wallet_usd", JSON.stringify(newBalanceUSD));
    }
    if (currentUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        walletBalanceUSD: newBalanceUSD,
        walletBalanceBDT: Math.round(newBalanceUSD * 120),
      };
      setCurrentUser(updatedUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("toolsbd_auth_current_user", JSON.stringify(updatedUser));
      }
      syncWalletBalanceToFirestore(currentUser.id, currentUser.email, newBalanceUSD, newBalanceUSD * 120);
    }
  };

  const saveDeposits = (newDeposits: WalletDeposit[]) => {
    setDeposits(newDeposits);
    if (typeof window !== "undefined") localStorage.setItem("toolsbd_v4_deposits", JSON.stringify(newDeposits));
  };

  const saveTutorials = (newTutorials: Tutorial[]) => {
    setTutorials(newTutorials);
    if (typeof window !== "undefined") localStorage.setItem("toolsbd_v4_tutorials", JSON.stringify(newTutorials));
  };

  const saveFaqs = (newFaqs: FaqItem[]) => {
    setFaqs(newFaqs);
    if (typeof window !== "undefined") localStorage.setItem("toolsbd_v4_faqs", JSON.stringify(newFaqs));
  };

  // ==============================================================
  // USER AUTHENTICATION (REGISTER / LOGIN WITH GMAIL & PASSWORD)
  // CLOUD PERSISTED ACROSS ALL DEVICES VIA FIREBASE FIRESTORE
  // ==============================================================
  const registerUser = async (name: string, email: string, password = ""): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split("@")[0] || "Toolsbd Member";

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid Gmail / Email address." };
    }
    if (!password || password.length < 4) {
      return { success: false, error: "Password must be at least 4 characters." };
    }

    try {
      const userRef = doc(webDb, "users", cleanEmail);
      const existingSnap = await getDoc(userRef);

      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        if (password && existingData.password && existingData.password !== password) {
          return { success: false, error: "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট তৈরি আছে। সঠিক পাসওয়ার্ড দিন।" };
        }
        const userObj: UserAccount = {
          id: cleanEmail,
          name: existingData.name || cleanName,
          email: cleanEmail,
          password: existingData.password || password,
          role: cleanEmail.includes("admin") ? "admin" : (existingData.role || "customer"),
          walletBalanceUSD: existingData.walletBalanceUSD ?? 0,
          walletBalanceBDT: existingData.walletBalanceBDT ?? (Math.round((existingData.walletBalanceUSD ?? 0) * 120)),
          createdAt: existingData.createdAt || new Date().toISOString()
        };
        setCurrentUser(userObj);
        setIsLoggedIn(true);
        setWalletBalanceUSD(userObj.walletBalanceUSD);
        if (typeof window !== "undefined") {
          localStorage.setItem("toolsbd_auth_current_user", JSON.stringify(userObj));
        }
        return { success: true };
      }

      // Create new user in Firestore
      const newUser: UserAccount = {
        id: cleanEmail,
        name: cleanName,
        email: cleanEmail,
        password,
        role: cleanEmail.includes("admin") ? "admin" : "customer",
        walletBalanceUSD: 0,
        walletBalanceBDT: 0,
        createdAt: new Date().toISOString()
      };

      await setDoc(userRef, {
        ...newUser,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setCurrentUser(newUser);
      setIsLoggedIn(true);
      setWalletBalanceUSD(0);

      if (typeof window !== "undefined") {
        localStorage.setItem("toolsbd_auth_current_user", JSON.stringify(newUser));
        const allUsers = JSON.parse(localStorage.getItem("toolsbd_all_users") || "[]");
        const filtered = allUsers.filter((u: UserAccount) => u.email !== cleanEmail);
        filtered.push(newUser);
        localStorage.setItem("toolsbd_all_users", JSON.stringify(filtered));
      }

      return { success: true };
    } catch (err: any) {
      console.warn("Firestore registration notice:", err);
      // Fallback local register
      const fallbackUser: UserAccount = {
        id: cleanEmail,
        name: cleanName,
        email: cleanEmail,
        password,
        role: cleanEmail.includes("admin") ? "admin" : "customer",
        walletBalanceUSD: 0,
        walletBalanceBDT: 0,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(fallbackUser);
      setIsLoggedIn(true);
      setWalletBalanceUSD(0);
      if (typeof window !== "undefined") {
        localStorage.setItem("toolsbd_auth_current_user", JSON.stringify(fallbackUser));
      }
      return { success: true };
    }
  };

  const loginUser = async (email: string, password = ""): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Please enter a valid Gmail address." };
    }

    try {
      // 1. Fetch live user document from Firestore (Cloud sync for any device!)
      const userRef = doc(webDb, "users", cleanEmail);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const u = snap.data();
        if (password && u.password && u.password !== password) {
          return { success: false, error: "ভুল পাসওয়ার্ড। দয়া করে সঠিক পাসওয়ার্ড দিন।" };
        }

        const userObj: UserAccount = {
          id: cleanEmail,
          name: u.name || cleanEmail.split("@")[0],
          email: cleanEmail,
          password: u.password || password,
          role: cleanEmail.includes("admin") ? "admin" : (u.role || "customer"),
          walletBalanceUSD: u.walletBalanceUSD ?? 0,
          walletBalanceBDT: u.walletBalanceBDT ?? (Math.round((u.walletBalanceUSD ?? 0) * 120)),
          createdAt: u.createdAt || new Date().toISOString()
        };

        setCurrentUser(userObj);
        setIsLoggedIn(true);
        setWalletBalanceUSD(userObj.walletBalanceUSD);

        if (typeof window !== "undefined") {
          localStorage.setItem("toolsbd_auth_current_user", JSON.stringify(userObj));
        }

        return { success: true };
      }
    } catch (err) {
      console.warn("Firestore cloud login notice:", err);
    }

    // 2. Check local users cache
    if (typeof window !== "undefined") {
      const allUsers: UserAccount[] = JSON.parse(localStorage.getItem("toolsbd_all_users") || "[]");
      const existing = allUsers.find(u => u.email === cleanEmail);

      if (existing) {
        if (password && existing.password && existing.password !== password) {
          return { success: false, error: "ভুল পাসওয়ার্ড। দয়া করে সঠিক পাসওয়ার্ড দিন।" };
        }
        setCurrentUser(existing);
        setIsLoggedIn(true);
        setWalletBalanceUSD(existing.walletBalanceUSD || 0);
        localStorage.setItem("toolsbd_auth_current_user", JSON.stringify(existing));
        return { success: true };
      }
    }

    // 3. If brand new user, auto-register them seamlessly in Firestore!
    return await registerUser(cleanEmail.split("@")[0], cleanEmail, password || "123456");
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setWalletBalanceUSD(0);
    if (typeof window !== "undefined") {
      localStorage.removeItem("toolsbd_auth_current_user");
    }
  };

  // ==============================================================
  // WALLET DEPOSIT (ADD MONEY VIA BKASH & ROCKET)
  // ==============================================================
  const submitWalletDeposit = async (
    amountUSD: number, 
    method: "bKash" | "Rocket", 
    senderNumber: string, 
    trxId: string, 
    autoApprove = false
  ) => {
    const cleanTrx = trxId.trim().toUpperCase();
    const amountBDT = amountUSD * 120;
    const userId = currentUser?.id || "guest-user";
    const userEmail = currentUser?.email || "guest@toolsbd.com";
    const userName = currentUser?.name || "Toolsbd Guest";

    const newDeposit: WalletDeposit = {
      id: `dep-${Date.now()}`,
      userId,
      userEmail,
      userName,
      amountUSD,
      amountBDT,
      method,
      senderNumber: senderNumber.trim(),
      trxId: cleanTrx,
      status: autoApprove ? "APPROVED" : "PENDING",
      createdAt: new Date().toISOString(),
      approvedAt: autoApprove ? new Date().toISOString() : undefined
    };

    saveDeposits([newDeposit, ...deposits]);
    const fbRes = await syncDepositToFirestore(newDeposit);

    if (autoApprove) {
      saveWalletBalance(walletBalanceUSD + amountUSD);
    }

    return {
      success: true,
      deposit: newDeposit,
      firebaseSynced: fbRes.synced,
      firebaseError: fbRes.error
    };
  };

  const approveWalletDeposit = (depositId: string) => {
    const dep = deposits.find(d => d.id === depositId);
    if (!dep || dep.status === "APPROVED") return;

    const updated = deposits.map(d => {
      if (d.id === depositId) {
        return {
          ...d,
          status: "APPROVED" as const,
          approvedAt: new Date().toISOString()
        };
      }
      return d;
    });

    saveDeposits(updated);
    saveWalletBalance(walletBalanceUSD + dep.amountUSD);
    syncDepositToFirestore({
      ...dep,
      status: "APPROVED",
      createdAt: dep.createdAt
    });
  };

  // ==============================================================
  // PURCHASE TOOL PLAN WITH PRE-FUNDED WALLET BALANCE
  // ==============================================================
  const purchaseOfferWithWallet = async (
    tool: Tool, 
    plan: PricePlan,
    initialHwid?: string
  ) => {
    if (walletBalanceUSD < plan.priceUSD) {
      return {
        success: false,
        error: `Insufficient balance! You have $${walletBalanceUSD.toFixed(2)}, but plan requires $${plan.priceUSD.toFixed(2)}. Please Add Money via bKash/Rocket.`
      };
    }

    const orderNumber = `TBD-WALLET-${Math.floor(100000 + Math.random() * 900000)}`;
    const generatedKey = generateToolLicenseKey();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: currentUser?.id || "guest-user",
      userEmail: currentUser?.email || "guest@toolsbd.com",
      userName: currentUser?.name || "Toolsbd Member",
      toolId: tool.id,
      toolName: tool.name,
      planId: plan.id,
      planDuration: plan.durationDays,
      amount: plan.priceBDT,
      currency: "BDT",
      status: "PAID",
      paymentMethod: "Manual",
      trxId: `WALLET-$${plan.priceUSD}`,
      licenseKey: generatedKey,
      notes: `Purchased using Toolsbd Profile Balance ($${plan.priceUSD} / ৳${plan.priceBDT}).`,
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString()
    };

    const expires = new Date();
    expires.setDate(expires.getDate() + plan.durationDays);

    const newLic: License = {
      id: `lic-${Date.now()}`,
      key: generatedKey,
      keyHash: "hash_" + generatedKey,
      toolId: tool.id,
      toolName: tool.name,
      userId: currentUser?.id || "guest-user",
      userEmail: currentUser?.email || "guest@toolsbd.com",
      orderId: newOrder.id,
      durationDays: plan.durationDays,
      status: "ACTIVE",
      hwid: initialHwid?.trim() || undefined,
      hwidLockedAt: initialHwid?.trim() ? new Date().toISOString() : undefined,
      hwidResetCount: 0,
      maxDevices: 1,
      activationsCount: initialHwid?.trim() ? 1 : 0,
      createdAt: new Date().toISOString(),
      expiresAt: expires.toISOString()
    };

    // Deduct balance from profile & save
    saveWalletBalance(Number((walletBalanceUSD - plan.priceUSD).toFixed(2)));
    saveOrders([newOrder, ...orders]);
    saveLicenses([newLic, ...licenses]);

    // Sync to Firebase
    await syncOrderToFirestore(newOrder);
    const fbLic = await syncLicenseToFirestore(newLic);

    return {
      success: true,
      order: newOrder,
      license: newLic,
      firebaseSynced: fbLic.synced
    };
  };

  // ==============================================================
  // PERMANENT HWID LOCK (NO COMPLICATED RESET NEEDED)
  // ==============================================================
  const bindHwidToLicense = async (licenseKeyOrId: string, hwid: string) => {
    let targetLic: License | undefined;
    const cleanHwid = hwid.trim();

    const updated = licenses.map(lic => {
      if (lic.id === licenseKeyOrId || lic.key === licenseKeyOrId) {
        targetLic = {
          ...lic,
          hwid: cleanHwid,
          hwidLockedAt: new Date().toISOString(),
          activationsCount: (lic.activationsCount || 0) + 1
        };
        return targetLic;
      }
      return lic;
    });

    if (!targetLic) {
      return { success: false, error: "License key not found." };
    }

    saveLicenses(updated);
    const fbRes = await syncLicenseToFirestore(targetLic);

    return {
      success: true,
      license: targetLic,
      firebaseSynced: fbRes.synced,
      firebaseError: fbRes.error
    };
  };

  const resetHwid = (licenseId: string) => {
    let targetLic: License | undefined;
    const updated = licenses.map(l => {
      if (l.id === licenseId || l.key === licenseId) {
        targetLic = {
          ...l,
          hwid: undefined,
          hwidLockedAt: undefined,
          hwidResetCount: (l.hwidResetCount || 0) + 1,
        };
        return targetLic;
      }
      return l;
    });
    saveLicenses(updated);
    if (targetLic) {
      syncLicenseToFirestore(targetLic);
    }
  };

  // Direct checkout order creation
  const createOrder = (tool: Tool, plan: PricePlan, paymentMethod: "bKash" | "Rocket" | "Manual") => {
    const orderNumber = `TBD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: currentUser?.id || "guest-user",
      userEmail: currentUser?.email || "guest@toolsbd.com",
      userName: currentUser?.name || "Toolsbd Member",
      toolId: tool.id,
      toolName: tool.name,
      planId: plan.id,
      planDuration: plan.durationDays,
      amount: plan.priceBDT,
      currency: "BDT",
      status: "PENDING",
      paymentMethod,
      createdAt: new Date().toISOString()
    };
    const updated = [newOrder, ...orders];
    saveOrders(updated);
    syncOrderToFirestore(newOrder);
    return newOrder;
  };

  const submitOrderPayment = (orderId: string, trxId: string, senderNumber: string) => {
    let targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return { autoVerified: false, error: "Order not found" };

    const matchingSms = smsRecords.find(
      sms => sms.trxId.toUpperCase() === trxId.trim().toUpperCase() && sms.amount === targetOrder!.amount
    );

    const isAutoVerified = !!matchingSms;
    const generatedKey = generateToolLicenseKey();

    let updatedOrder: Order;
    const updatedOrders = orders.map(ord => {
      if (ord.id === orderId) {
        updatedOrder = {
          ...ord,
          trxId: trxId.trim().toUpperCase(),
          senderNumber,
          status: isAutoVerified ? ("PAID" as const) : ("PENDING" as const),
          licenseKey: isAutoVerified ? generatedKey : undefined,
          paidAt: isAutoVerified ? new Date().toISOString() : undefined,
          notes: isAutoVerified ? "Auto-verified by Companion SMS Gateway" : "Payment submitted, awaiting companion match"
        };
        return updatedOrder;
      }
      return ord;
    });

    saveOrders(updatedOrders);
    if (updatedOrder!) syncOrderToFirestore(updatedOrder);

    if (isAutoVerified) {
      const updatedSms = smsRecords.map(sms => {
        if (sms.id === matchingSms.id) {
          return { ...sms, matchedOrderId: orderId, status: "MATCHED" as const };
        }
        return sms;
      });
      saveSmsRecords(updatedSms);

      const expires = new Date();
      expires.setDate(expires.getDate() + targetOrder.planDuration);
      const newLic: License = {
        id: `lic-${Date.now()}`,
        key: generatedKey,
        keyHash: "hash_" + generatedKey,
        toolId: targetOrder.toolId,
        toolName: targetOrder.toolName,
        userId: targetOrder.userId,
        userEmail: targetOrder.userEmail,
        orderId: targetOrder.id,
        durationDays: targetOrder.planDuration,
        status: "ACTIVE",
        hwidResetCount: 0,
        maxDevices: 1,
        activationsCount: 0,
        createdAt: new Date().toISOString(),
        expiresAt: expires.toISOString()
      };
      saveLicenses([newLic, ...licenses]);
      syncLicenseToFirestore(newLic);
    }

    return { autoVerified: isAutoVerified, key: generatedKey };
  };

  const simulateIncomingSms = (provider: "bKash" | "Rocket" | "Nagad", amount: number, senderNumber: string, customTrxId?: string) => {
    const trxId = customTrxId || `${provider === "bKash" ? "BK" : provider === "Rocket" ? "RK" : "NG"}${Math.floor(10000000 + Math.random() * 90000000)}`;
    const rawMessage = provider === "bKash" 
      ? `You have received Tk ${amount.toFixed(2)} from ${senderNumber}. Fee Tk 0.00. Balance Tk 52,100.00. TrxID ${trxId} at ${new Date().toLocaleTimeString()}`
      : provider === "Rocket"
      ? `DBBL Rocket Cash In: Tk ${amount.toFixed(2)} received from ${senderNumber}. TxnId: ${trxId}. Balance: Tk 31,500.00.`
      : `Cash In Received. Amount: Tk ${amount.toFixed(2)}. Sender: ${senderNumber}. TxnID: ${trxId}. Date: ${new Date().toLocaleTimeString()}`;

    const matchingOrder = orders.find(
      o => o.status === "PENDING" && o.trxId && o.trxId.toUpperCase() === trxId.toUpperCase() && o.amount === amount
    );

    const newRecord: SmsRecord = {
      id: `sms-${Date.now()}`,
      deviceId: "samsung-sm-g998b-primary",
      deviceName: "Toolsbd Merchant Phone",
      sender: provider,
      rawMessage,
      trxId,
      amount,
      provider,
      receivedAt: new Date().toISOString(),
      matchedOrderId: matchingOrder ? matchingOrder.id : undefined,
      status: matchingOrder ? "MATCHED" : "UNMATCHED"
    };

    saveSmsRecords([newRecord, ...smsRecords]);

    if (matchingOrder) {
      const generatedKey = generateToolLicenseKey();
      
      let paidOrd: Order | undefined;
      const updatedOrders = orders.map(ord => {
        if (ord.id === matchingOrder.id) {
          paidOrd = {
            ...ord,
            status: "PAID" as const,
            licenseKey: generatedKey,
            paidAt: new Date().toISOString(),
            notes: "Instantly verified from incoming merchant SMS sync."
          };
          return paidOrd;
        }
        return ord;
      });
      saveOrders(updatedOrders);
      if (paidOrd) syncOrderToFirestore(paidOrd);

      const expires = new Date();
      expires.setDate(expires.getDate() + matchingOrder.planDuration);
      const newLic: License = {
        id: `lic-${Date.now()}`,
        key: generatedKey,
        keyHash: "hash_" + generatedKey,
        toolId: matchingOrder.toolId,
        toolName: matchingOrder.toolName,
        userId: matchingOrder.userId,
        userEmail: matchingOrder.userEmail,
        orderId: matchingOrder.id,
        durationDays: matchingOrder.planDuration,
        status: "ACTIVE",
        hwidResetCount: 0,
        maxDevices: 1,
        activationsCount: 0,
        createdAt: new Date().toISOString(),
        expiresAt: expires.toISOString()
      };
      saveLicenses([newLic, ...licenses]);
      syncLicenseToFirestore(newLic);
    }

    return { record: newRecord, matched: !!matchingOrder };
  };

  const approveOrderManually = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const generatedKey = generateToolLicenseKey();

    let paidOrd: Order | undefined;
    const updated = orders.map(o => {
      if (o.id === orderId) {
        paidOrd = {
          ...o,
          status: "PAID" as const,
          licenseKey: generatedKey,
          paidAt: new Date().toISOString(),
          notes: "Approved manually by Admin."
        };
        return paidOrd;
      }
      return o;
    });
    saveOrders(updated);
    if (paidOrd) syncOrderToFirestore(paidOrd);

    const expires = new Date();
    expires.setDate(expires.getDate() + order.planDuration);
    const newLic: License = {
      id: `lic-${Date.now()}`,
      key: generatedKey,
      keyHash: "hash_" + generatedKey,
      toolId: order.toolId,
      toolName: order.toolName,
      userId: order.userId,
      userEmail: order.userEmail,
      orderId: order.id,
      durationDays: order.planDuration,
      status: "ACTIVE",
      hwidResetCount: 0,
      maxDevices: 1,
      activationsCount: 0,
      createdAt: new Date().toISOString(),
      expiresAt: expires.toISOString()
    };
    saveLicenses([newLic, ...licenses]);
    syncLicenseToFirestore(newLic);
  };

  const rejectOrderManually = (orderId: string, reason?: string) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "REJECTED" as const,
          notes: reason || "Rejected by Admin."
        };
      }
      return o;
    });
    saveOrders(updated);
  };

  const switchUserRole = (role: "customer" | "admin") => {
    if (currentUser) {
      const updated: UserAccount = {
        ...currentUser,
        role,
        name: role === "admin" ? "Platform Administrator" : (currentUser.name || "Toolsbd Member"),
        email: role === "admin" ? "admin@toolsbd.com" : currentUser.email,
      };
      setCurrentUser(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("toolsbd_auth_current_user", JSON.stringify(updated));
      }
    } else {
      registerUser(role === "admin" ? "Admin" : "Member", role === "admin" ? "admin@toolsbd.com" : "user@gmail.com", "123456");
    }
  };

  return {
    isLoaded,
    firebaseProjectId: FIREBASE_PROJECT_ID,
    tools,
    plans,
    orders,
    licenses,
    settings,
    smsDevices,
    smsRecords,
    reviews,
    tutorials,
    faqs,
    walletBalanceUSD,
    deposits,
    currentUser,
    isLoggedIn,
    loginUser,
    registerUser,
    logoutUser,
    switchUserRole,
    saveTools,
    savePlans,
    saveOrders,
    saveLicenses,
    saveSettings,
    saveTutorials,
    saveFaqs,
    saveWalletBalance,
    submitWalletDeposit,
    approveWalletDeposit,
    purchaseOfferWithWallet,
    bindHwidToLicense,
    resetHwid,
    createOrder,
    submitOrderPayment,
    simulateIncomingSms,
    approveOrderManually,
    rejectOrderManually,
  };
}
