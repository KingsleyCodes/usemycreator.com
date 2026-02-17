import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email, name, type, slug } = await req.json();

    // 1. Define the content based on the user type
    const isCreator = type === 'creator';
    const subject = isCreator 
      ? `Welcome to the UseMyCreator, ${name}! Your Portfolio is Live 🚀`
      : `Verified Creators are waiting for you, ${name} 🛡️`;

    const dashboardUrl = isCreator 
      ? `https://usemycreator.com/profile/${slug}` 
      : `https://usemycreator.com/dashboard/business/create-campaign`;

    // 2. Send the email
    const data = await resend.emails.send({
      from: 'UseMyCreator <alerts@usemycreator.com>', // Use your verified domain
      to: [email],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h1 style="font-style: italic; font-weight: 900; text-transform: uppercase;">UseMy<span style="color: #22c55e;">Creator.</span></h1>
          <p>Hi ${name},</p>
          <p>${isCreator 
            ? "You’ve just joined the safest ecosystem for content creators in Nigeria." 
            : "Welcome to the future of influencer marketing. No more worrying about creators disappearing after payment."
          }</p>
          <a href="${dashboardUrl}" style="background: black; color: white; padding: 12px 24px; text-decoration: none; border-radius: 50px; display: inline-block; font-weight: bold; margin-top: 20px;">
            ${isCreator ? 'View Your Public Profile' : 'Launch Your First Campaign'}
          </a>
          <p style="margin-top: 40px; font-size: 12px; color: gray;">&copy; 2026 UseMyCreator. Secure Escrow for the Creator Economy.</p>
        </div>
      `
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}