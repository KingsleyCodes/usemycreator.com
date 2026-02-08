import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const accountNumber = searchParams.get("accountNumber");
  const bankCode = searchParams.get("bankCode");

  // 1. FETCH BANK LIST
  if (type === "list") {
    try {
      const response = await fetch("https://api.paystack.co/bank?country=nigeria", {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      });
      const data = await response.json();
      return NextResponse.json(data.data || []); 
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch banks" }, { status: 500 });
    }
  }

  // 2. RESOLVE ACCOUNT NAME
  if (!accountNumber || !bankCode) {
    return NextResponse.json({ error: "Missing account number or bank code" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    // Debugging: This will show in your terminal exactly what Paystack said
    console.log("Paystack Response:", data);

    if (!data.status) {
      // If Paystack says no, return their specific message (e.g., "Could not resolve account name")
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({ accountName: data.data.account_name });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}