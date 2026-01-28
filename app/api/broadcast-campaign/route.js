import { Resend } from 'resend';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { campaignTitle, budget, platform, category } = await req.json();

    // 1. Fetch all creators from the database
    const creatorsSnap = await getDocs(collection(db, "creators"));
    const creatorEmails = creatorsSnap.docs.map(doc => doc.data().email).filter(Boolean);

    if (creatorEmails.length === 0) return NextResponse.json({ message: "No creators found" });

    // 2. Send the broadcast via Resend
    // Note: Resend allows batching or sending to multiple recipients at once
    const data = await resend.emails.send({
      from: 'UseMyCreator <alerts@usemycreator.com>',
      to: creatorEmails, // Sends to all creators at once
      subject: `New Campaign: ${campaignTitle} ($${budget}) 💰`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 20px;">
          <h2 style="text-transform: uppercase; font-weight: 900;">New <span style="color: #a3dcf3;">Opportunity</span></h2>
          <p>A new brand has just posted a campaign that matches the community!</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 15px; margin: 20px 0;">
            <h3 style="margin: 0;">${campaignTitle}</h3>
            <p style="color: #666;">Platform: <b>${platform}</b> | Budget: <b>$${budget}</b></p>
          </div>
          <a href="https://usemycreator.com/dashboard/creator" style="background: black; color: white; padding: 15px 25px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: bold;">
            Apply Now →
          </a>
        </div>
      `
    });

    return NextResponse.json({ success: true, count: creatorEmails.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}