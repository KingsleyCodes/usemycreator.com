import { NextResponse } from "next/server";
import crypto from "crypto";
import admin from "firebase-admin"; // Required for FieldValue
import { dbAdmin } from "@/lib/firebase-admin";

export async function POST(req) {
  // SAFETY GATE: Ensure dbAdmin is initialized (handles build/CI phases)
  if (!dbAdmin) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  try {
    // 1. VERIFY SIGNATURE (Security Guard)
    const rawBody = await req.text(); 
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY;

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.error("❌ Invalid Webhook Signature Detected");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventData = JSON.parse(rawBody);
    
    // 2. PROCESS SUCCESSFUL PAYMENTS
    if (eventData.event === "charge.success") {
      const { reference, metadata, amount, customer } = eventData.data;
      
      // Destructure our metadata fields
      const { 
        type, 
        businessId, 
        campaignId 
      } = metadata;

      console.log(`✅ Webhook Triggered: Event Type [${type}] | Reference: ${reference}`);

      // --- CASE A: WALLET TOP-UP ---
      if (type === "wallet_topup") {
        const businessRef = dbAdmin.collection("businesses").doc(businessId);
        const transactionRef = dbAdmin.collection("transactions").doc(reference);

        const batch = dbAdmin.batch();

        // Increment the business wallet balance
        batch.update(businessRef, {
          walletBalance: admin.firestore.FieldValue.increment(amount / 100),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Record as a deposit transaction
        batch.set(transactionRef, {
          type: "wallet_deposit",
          amount: amount / 100,
          businessId: businessId,
          reference: reference,
          status: "success",
          customerEmail: customer.email,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();
        console.log(`💰 Wallet Funded: Business ${businessId} received ₦${amount/100}`);
        return NextResponse.json({ message: "Wallet Balance Updated" }, { status: 200 });
      }

      // --- CASE B: DIRECT CAMPAIGN FUNDING (Existing Logic) ---
      if (type === "campaign_payment" || (!type && campaignId)) {
        const campaignRef = dbAdmin.collection("campaigns").doc(campaignId);
        const transactionRef = dbAdmin.collection("transactions").doc(reference);

        const batch = dbAdmin.batch();

        // Update the Campaign: Lock funds in Escrow and open it to Creators
        batch.update(campaignRef, {
          paymentStatus: "escrow_locked",
          status: "open", 
          paystackRef: reference,
          amountPaid: amount / 100,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Create a Transaction Record for Escrow
        batch.set(transactionRef, {
          type: "escrow_deposit",
          amount: amount / 100,
          businessId: businessId,
          campaignId: campaignId,
          reference: reference,
          status: "success",
          customerEmail: customer.email,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();
        console.log(`🔒 Escrow Secured: Campaign ${campaignId} is now LIVE.`);
        return NextResponse.json({ message: "Escrow Secured" }, { status: 200 });
      }
    }

    // Acknowledge other events (like charge.failed) but do nothing for now
    return NextResponse.json({ message: "Event ignored" }, { status: 200 });

  } catch (err) {
    console.error("🚨 PAYSTACK WEBHOOK CRITICAL ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}