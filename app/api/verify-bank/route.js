import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const accountNumber = searchParams.get("accountNumber");
  const bankCode = searchParams.get("bankCode");

  const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  // Safety Check: If key is missing, don't even call Paystack
  if (!SECRET_KEY) {
    console.error("CRITICAL: PAYSTACK_SECRET_KEY is missing from .env.local");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // 1. FETCH BANK LIST
  if (type === "list") {
    try {
      const response = await fetch("https://api.paystack.co/bank?country=nigeria", {
        headers: {
          Authorization: `Bearer ${SECRET_KEY.trim()}`, // .trim() removes accidental spaces
        },
      });
      const data = await response.json();
      
      if (!response.ok) {
        console.log("Paystack Bank List Error:", data);
        return NextResponse.json({ error: data.message }, { status: response.status });
      }

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
          Authorization: `Bearer ${SECRET_KEY.trim()}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!data.status) {
      console.log("Paystack Resolution Error:", data);
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    return NextResponse.json({ accountName: data.data.account_name });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}