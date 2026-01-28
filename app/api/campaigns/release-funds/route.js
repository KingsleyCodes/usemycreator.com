import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { dbAdmin } from "@/lib/firebase-admin";

export async function POST(req) {
  // SAFETY CHECK: If dbAdmin is null (happens during build/CI), skip execution
  if (!dbAdmin) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  try {
    const { campaignId, businessId } = await req.json();

    // 1. Fetch the campaign to verify ownership and amount
    const campaignRef = dbAdmin.collection("campaigns").doc(campaignId);
    const campaignSnap = await campaignRef.get();

    if (!campaignSnap.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const campaign = campaignSnap.data();

    // 2. Security Check: Only the business who owns the campaign can release funds
    if (campaign.businessId !== businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Status Check: Ensure funds aren't already released
    if (campaign.paymentStatus !== "escrow_locked") {
      return NextResponse.json({ error: "Funds not in escrow or already released" }, { status: 400 });
    }

    const creatorId = campaign.assignedCreatorId;
    if (!creatorId) {
      return NextResponse.json({ error: "No creator assigned to this campaign" }, { status: 400 });
    }

    // 4. ATOMIC TRANSACTION
    // We update the creator's balance and the campaign status at the exact same time
    const creatorRef = dbAdmin.collection("creators").doc(creatorId);
    const transactionRef = dbAdmin.collection("transactions").doc(); // Auto-ID

    await dbAdmin.runTransaction(async (t) => {
      // Add money to creator's balance
      t.update(creatorRef, {
        balance: admin.firestore.FieldValue.increment(campaign.budget)
      });

      // Mark campaign as completed and paid
      t.update(campaignRef, {
        paymentStatus: "released",
        status: "completed",
        fundsReleasedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Record the internal transfer
      t.set(transactionRef, {
        type: "payout_credit",
        amount: campaign.budget,
        creatorId: creatorId,
        campaignId: campaignId,
        campaignTitle: campaign.title, // Good to add this for the creator's history!
        status: "success",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    return NextResponse.json({ message: "Funds released to creator wallet" }, { status: 200 });

  } catch (err) {
    console.error("RELEASE FUNDS ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}