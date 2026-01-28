import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, amount, businessId } = await req.json();

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/business`, // Go back to dashboard
        metadata: {
          businessId,
          type: "wallet_topup", // Very important for the webhook to distinguish this
        },
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Initialization failed" }, { status: 500 });
  }
}