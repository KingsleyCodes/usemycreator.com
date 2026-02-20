import { NextResponse } from "next/headers";
import { db } from "@/lib/firebase";
import { doc, runTransaction, serverTimestamp, collection } from "firebase/firestore";

export async function POST(req) {
  try {
    const { reference, businessId } = await req.json();

    // 1. Verify with Paystack Server-to-Server
    // This uses your HIDDEN secret key, which the browser can't see
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const verificationData = await paystackRes.json();

    // 2. Only if Paystack confirms the money is actually in your bank
    if (verificationData.data.status === "success") {
      const amountInNaira = verificationData.data.amount / 100;
      const bizRef = doc(db, "businesses", businessId);

      // 3. Update Database via a Secure Transaction
      await runTransaction(db, async (transaction) => {
        const bizDoc = await transaction.get(bizRef);
        if (!bizDoc.exists()) throw "Business profile not found";

        const newBalance = (bizDoc.data().walletBalance || 0) + amountInNaira;

        transaction.update(bizRef, {
          walletBalance: newBalance,
          updatedAt: serverTimestamp()
        });
      });

      return NextResponse.json({ status: "success" });
    }

    return NextResponse.json({ status: "failed" }, { status: 400 });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}