import "./globals.css";
import Script from "next/script";

export const metadata = {
  metadataBase: new URL('https://usemycreator.com'),
  title: {
    default: "UseMyCreator | Secure Escrow for Influencer Marketing in Nigeria",
    template: "%s | UseMyCreator"
  },
  description: "The safest platform for Nigerian brands to work with creators. Secure escrow, verified proof of work, and instant payouts for TikTok, Instagram, and Twitter creators.",
  keywords: [
    "Influencer Marketing Nigeria",
    "Micro Influencer Marketing Nigeria",  
    "Escrow for Creators", 
    "TikTok Marketing Lagos", 
    "Brand Collaborations Africa", 
    "Secure Payouts Creators Nigeria",
     "User Generated Content Nigeria",
      "UGC Creator Nigeria",
    "UseMyCreator"
  ],
  authors: [{ name: "UseMyCreator Team" }],
  creator: "UseMyCreator",
  publisher: "UseMyCreator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "UseMyCreator -Invest In Influence ",
    description: "Lock funds in escrow and only pay when the content is live. Protect your brand and your money with Nigeria's leading creator escrow platform.",
    url: "https://usemycreator.com",
    siteName: "UseMyCreator",
    images: [
      {
        url: "/og-image.png", // Ensure you place a 1200x630px image in your /public folder
        width: 1200,
        height: 630,
        alt: "UseMyCreator - Secure Escrow for Influencer Marketing",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UseMyCreator | Influencer Escrow Nigeria",
    description: "No more disappearing creators. No more unpaid work. UseMyCreator secures the deal for brands and creators.",
    images: ["/og-image.png"],
    creator: "@usemycreator",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://usemycreator.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* PAYSTACK INLINE SDK 
            This script allows the Paystack payment modal to slide over 
            your dashboard without the user leaving the site. 
            'beforeInteractive' ensures it is ready as soon as the page loads.
        */}
        <Script 
          src="https://js.paystack.co/v1/inline.js" 
          strategy="beforeInteractive" 
        />
      </body>
    </html>
  );
}