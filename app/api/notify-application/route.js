import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { businessEmail, businessName, creatorName, campaignTitle } = await req.json();

    const data = await resend.emails.send({
      from: 'UseMyCreator <alerts@usemycreator.com>',
      to: [businessEmail],
      subject: `New Applicant: ${creatorName} wants to work with you! 🚀`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
          <h2 style="text-transform: uppercase; font-weight: 900;">New <span style="color: #a3dcf3;">Application</span></h2>
          <p>Hi ${businessName},</p>
          <p>Good news! <b>${creatorName}</b> has just applied to your campaign: <b>"${campaignTitle}"</b>.</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">Log in to your dashboard to review their profile, check their past work, and approve the application.</p>
          </div>

          <a href="https://usemycreator.com/dashboard/business" style="background: black; color: white; padding: 15px 25px; text-decoration: none; border-radius: 10px; display: inline-block; font-weight: bold;">
            Review Application →
          </a>
          
          <p style="margin-top: 30px; font-size: 10px; color: gray;">You are receiving this because you have an active campaign on UseMyCreator.</p>
        </div>
      `
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}