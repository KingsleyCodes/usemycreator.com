import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, amount, campaignId, businessId } = await req.json();

    // Amount must be in Kobo (Naira * 100)
    const paystackAmount = amount * 100;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: paystackAmount,
        callback_url: `${process.env.NEXT_PUBLIC_URL}/dashboard/business/pay/success`,
        metadata: {
          campaignId,
          businessId,
          custom_fields: [
            { display_name: "Campaign ID", variable_name: "campaign_id", value: campaignId }
          ]
        },
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}