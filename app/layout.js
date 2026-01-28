import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "mycreator",
  description: "Connect businesses with micro-content creators",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Main Content */}
        {children}

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