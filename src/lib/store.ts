"use client";

import { useState, useEffect } from "react";
import { Tool, PricePlan, Order, License, SiteSettings, SmsDevice, SmsRecord, Review, Tutorial, FaqItem, WalletDeposit } from "./types";
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
  FIREBASE_PROJECT_ID
} from "./firebase";

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
  const [walletBalanceUSD, setWalletBalanceUSD] = useState<number>(10); // Demo starting wallet balance ($10) so user can test instantly, or add more via bKash/Rocket
  const [deposits, setDeposits] = useState<WalletDeposit[]>([
    {
      id: "dep-1001",
      userId: "user-test-01",
      userEmail: "shakil.dev@gmail.com",
      userName: "Shakil Ahmed",
      amountUSD: 10,
      amountBDT: 1200,
      method: "bKash",
      senderNumber: "01755123456",
      trxId: "BK5519X20P",
      status: "APPROVED",
      createdAt: "2026-03-14T10:00:00Z",
      approvedAt: "2026-03-14T10:01:00Z"
    }
  ]);

  const [currentUser, setCurrentUser] = useState({
    id: "user-test-01",
    name: "Shakil Ahmed",
    email: "shakil.dev@gmail.com",
    role: "customer", // "customer" | "admin"
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage if present
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

      if (storedTools) setTools(JSON.parse(storedTools));
      if (storedPlans) setPlans(JSON.parse(storedPlans));
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      if (storedLicenses) setLicenses(JSON.parse(storedLicenses));
      if (storedSettings) setSettings(JSON.parse(storedSettings));
      if (storedSmsRecords) setSmsRecords(JSON.parse(storedSmsRecords));
      if (storedDevices) setSmsDevices(JSON.parse(storedDevices));
      if (storedWallet) setWalletBalanceUSD(JSON.parse(storedWallet));
      if (storedDeposits) setDeposits(JSON.parse(storedDeposits));
      if (storedTutorials) setTutorials(JSON.parse(storedTutorials));
      if (storedFaqs) setFaqs(JSON.parse(storedFaqs));
    } catch {
      // Fallback to memory
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
  };

  const saveSmsRecords = (newRecords: SmsRecord[]) => {
    setSmsRecords(newRecords);
    if (typeof window !== "undefined") localStorage.setItem("toolsbd_v4_sms_records", JSON.stringify(newRecords));
  };

  const saveWalletBalance = (newBalanceUSD: number) => {
    setWalletBalanceUSD(newBalanceUSD);
    if (typeof window !== "undefined") localStorage.setItem("toolsbd_v4_wallet_usd", JSON.stringify(newBalanceUSD));
    syncWalletBalanceToFirestore(currentUser.id, currentUser.email, newBalanceUSD, newBalanceUSD * 120);
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
  // WALLET ADD MONEY ACTIONS (bKash / Rocket -> Firebase)
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
    const newDeposit: WalletDeposit = {
      id: `dep-${Date.now()}`,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
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

    return { deposit: newDeposit, firebaseSynced: fbRes.synced, firebaseError: fbRes.error };
  };

  const approveWalletDeposit = async (depositId: string) => {
    const target = deposits.find(d => d.id === depositId);
    if (!target || target.status === "APPROVED") return;

    const updatedDeposit: WalletDeposit = {
      ...target,
      status: "APPROVED",
      approvedAt: new Date().toISOString()
    };

    saveDeposits(deposits.map(d => d.id === depositId ? updatedDeposit : d));
    saveWalletBalance(walletBalanceUSD + target.amountUSD);
    await syncDepositToFirestore(updatedDeposit);
  };

  // ==============================================================
  // BUY OFFER USING WALLET BALANCE -> INSTANT KEY + FIREBASE SYNC
  // ==============================================================
  const purchaseOfferWithWallet = async (
    tool: Tool,
    plan: PricePlan,
    initialHwid?: string
  ): Promise<{ success: boolean; error?: string; order?: Order; license?: License; firebaseSynced?: boolean }> => {
    if (walletBalanceUSD < plan.priceUSD) {
      return {
        success: false,
        error: `Insufficient wallet balance! You have $${walletBalanceUSD.toFixed(2)}, but this plan costs $${plan.priceUSD}. Please Add Money via bKash or Rocket first.`
      };
    }

    const generatedKey = `TBD-${plan.durationDays}D-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const orderNumber = `TBD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
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
      notes: `Purchased using Toolsbd Wallet Balance ($${plan.priceUSD} / ৳${plan.priceBDT}).`,
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
      userId: currentUser.id,
      userEmail: currentUser.email,
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

    // Deduct balance & save
    saveWalletBalance(Number((walletBalanceUSD - plan.priceUSD).toFixed(2)));
    saveOrders([newOrder, ...orders]);
    saveLicenses([newLic, ...licenses]);

    // Sync directly to Firebase (fb-resend-otp)
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
  // BIND HWID TO LICENSE KEY -> DIRECTLY WRITES TO FIREBASE
  // ==============================================================
  const bindHwidToLicense = async (licenseIdOrKey: string, hwidInput: string) => {
    const cleanHwid = hwidInput.trim();
    if (!cleanHwid) return { success: false, error: "Please enter a valid HWID." };

    let targetLic: License | undefined;
    const updated = licenses.map(lic => {
      if (lic.id === licenseIdOrKey || lic.key === licenseIdOrKey) {
        targetLic = {
          ...lic,
          hwid: cleanHwid,
          hwidHash: "hwid_" + cleanHwid,
          hwidLockedAt: new Date().toISOString(),
          activationsCount: (lic.activationsCount || 0) + 1,
          lastActivatedAt: new Date().toISOString()
        };
        return targetLic;
      }
      return lic;
    });

    if (!targetLic) {
      return { success: false, error: "License record not found." };
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

  // ==============================================================
  // DIRECT CHECKOUT ORDER ACTIONS
  // ==============================================================
  const createOrder = (tool: Tool, plan: PricePlan, paymentMethod: "bKash" | "Rocket" | "Nagad"): Order => {
    const orderNumber = `TBD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
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
    const cleanTrx = trxId.trim().toUpperCase();
    const cleanSender = senderNumber.trim();

    const matchingSms = smsRecords.find(
      r => r.trxId.toUpperCase() === cleanTrx && r.status === "UNMATCHED"
    );

    let generatedKey = "";
    const isAutoVerified = !!matchingSms;

    const targetOrder = orders.find(o => o.id === orderId);
    if (isAutoVerified) {
      generatedKey = `TBD-${targetOrder?.planDuration || 7}D-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }

    let updatedOrderObj: Order | undefined;
    const updatedOrders = orders.map(ord => {
      if (ord.id === orderId) {
        updatedOrderObj = {
          ...ord,
          trxId: cleanTrx,
          senderNumber: cleanSender,
          status: isAutoVerified ? ("PAID" as const) : ("PENDING" as const),
          licenseKey: isAutoVerified ? generatedKey : undefined,
          paidAt: isAutoVerified ? new Date().toISOString() : undefined,
          notes: isAutoVerified ? "Instant auto-matched via companion SMS" : "Submitted. Verification in progress."
        };
        return updatedOrderObj;
      }
      return ord;
    });

    saveOrders(updatedOrders);
    if (updatedOrderObj) syncOrderToFirestore(updatedOrderObj);

    if (isAutoVerified && targetOrder) {
      const updatedSms = smsRecords.map(s => {
        if (s.id === matchingSms.id) {
          return { ...s, status: "MATCHED" as const, matchedOrderId: orderId };
        }
        return s;
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
      deviceName: "Toolsbd Merchant Phone (Samsung S21)",
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
      const generatedKey = `TBD-${matchingOrder.planDuration}D-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
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

    const generatedKey = `TBD-${order.planDuration}D-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

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

  const resetHwid = (licenseId: string) => {
    let targetLic: License | undefined;
    const updated = licenses.map(lic => {
      if (lic.id === licenseId) {
        targetLic = {
          ...lic,
          hwid: undefined,
          hwidHash: undefined,
          hwidResetCount: lic.hwidResetCount + 1,
          lastHwidResetAt: new Date().toISOString()
        };
        return targetLic;
      }
      return lic;
    });
    saveLicenses(updated);
    if (targetLic) syncLicenseToFirestore(targetLic);
  };

  const switchUserRole = (role: "customer" | "admin") => {
    setCurrentUser(prev => ({
      ...prev,
      role,
      name: role === "admin" ? "Platform Administrator" : "Shakil Ahmed",
      email: role === "admin" ? "admin@toolsbd.com" : "shakil.dev@gmail.com"
    }));
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
    switchUserRole,
    saveTools,
    savePlans,
    saveOrders,
    saveLicenses,
    saveSettings,
    saveTutorials,
    saveFaqs,
    submitWalletDeposit,
    approveWalletDeposit,
    purchaseOfferWithWallet,
    bindHwidToLicense,
    createOrder,
    submitOrderPayment,
    simulateIncomingSms,
    approveOrderManually,
    rejectOrderManually,
    resetHwid
  };
}
