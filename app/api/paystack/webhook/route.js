import { NextResponse } from "next/server";
import crypto from "crypto";
import admin from "firebase-admin";
import { dbAdmin } from "@/lib/firebase-admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  if (!dbAdmin) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  try {
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
    
    if (eventData.event === "charge.success") {
      const { reference, metadata, amount, customer } = eventData.data;
      
      const { 
        type, 
        businessId, 
        campaignId,
        title // Grabbed from metadata for the email
      } = metadata;

      console.log(`✅ Webhook Triggered: Event Type [${type}] | Reference: ${reference}`);

      // --- CASE A: WALLET TOP-UP ---
      if (type === "wallet_topup") {
        const businessRef = dbAdmin.collection("businesses").doc(businessId);
        const transactionRef = dbAdmin.collection("transactions").doc(reference);
        const batch = dbAdmin.batch();

        batch.update(businessRef, {
          walletBalance: admin.firestore.FieldValue.increment(amount / 100),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

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

      // --- CASE B: DIRECT CAMPAIGN FUNDING ---
      if (type === "campaign_payment" || (!type && campaignId)) {
        const campaignRef = dbAdmin.collection("campaigns").doc(campaignId);
        const transactionRef = dbAdmin.collection("transactions").doc(reference);

        const batch = dbAdmin.batch();

        batch.update(campaignRef, {
          paymentStatus: "escrow_locked",
          status: "live", // Changed from 'open' to 'live' to match your dashboard filter
          paystackRef: reference,
          amountPaid: amount / 100,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

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

        // 1. Commit DB updates first so creators see the job immediately
        await batch.commit();
        console.log(`🔒 Escrow Secured: Campaign ${campaignId} is now LIVE.`);

        // 2. NOW SEND THE EMAIL NOTIFICATION
        try {
          const creatorsSnapshot = await dbAdmin.collection("users").where("role", "==", "creator").get();
          const creatorEmails = creatorsSnapshot.docs.map(doc => doc.data().email).filter(email => !!email);

          if (creatorEmails.length > 0) {
            await resend.emails.send({
              from: 'UseMyCreator <alerts@usemycreator.com>',
              to: 'admin@usemycreator.com', // Required primary recipient
              bcc: creatorEmails, // 🛡️ BCC for privacy so creators don't see each other
              subject: `New Opportunity: ${title || "New Campaign Available"}`,
              html: `
                <div style="font-family: sans-serif; color: #333;">
                  <h2>New Campaign Alert! 🚀</h2>
                  <p>A new campaign <strong>"${title || "Social Media Content"}"</strong> has just been funded and is now live.</p>
                  <p>Log in to your creator dashboard to view details and apply before slots are filled.</p>
                  <br />
                  <a href="https://www.usemycreator.com/dashboard/creator" 
                     style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                     View Campaign
                  </a>
                </div>
              `
            });
            console.log(`📧 Notification sent to ${creatorEmails.length} creators via BCC.`);
          }
        } catch (resendError) {
          console.error("⚠️ Webhook succeeded but Resend failed:", resendError);
        }

        return NextResponse.json({ message: "Escrow Secured and Notified" }, { status: 200 });
      }
    }

    return NextResponse.json({ message: "Event ignored" }, { status: 200 });

  } catch (err) {
    console.error("🚨 PAYSTACK WEBHOOK CRITICAL ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}