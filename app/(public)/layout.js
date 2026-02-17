import HomeNavbar from "@/app/components/HomeNavbar";
import { Globe } from "lucide-react";
import ClientWrapper from "@/app/components/ClientWrapper";

// AIR-TIGHT INSTITUTIONAL METADATA
export const metadata = {
  metadataBase: new URL('https://usemycreator.com'),
  title: {
    default: 'Use My Creator | Institutional Content Infrastructure',
    template: '%s | Use My Creator'
  },
  description: 'The premier infrastructure for Nigerian creators and global businesses.',
  // FAVICON & ICON LINE ADDED HERE
  icons: {
    icon: '/favicon.ico', 
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png', // Optional: for mobile home screens
  },
  alternates: {
    canonical: '/', 
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Next.js automatically injects the favicon from metadata here */}
      </head>
      <body>
        <ClientWrapper>
          <div className="flex flex-col min-h-screen bg-white">
            {/* Standardized Institutional Navigation */}
            <HomeNavbar />

            {/* Main Content Area */}
            <main className="flex-1 pt-20">
              {children}
            </main>

            {/* --- PREMIUM INSTITUTIONAL FOOTER --- */}
            <footer className="bg-white border-t border-gray-100 py-12">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-black rounded flex items-center justify-center">
                      <span className="text-[#22c55e] font-black text-[10px]">M</span>
                    </div>
                    <span className="text-sm font-bold tracking-tighter text-gray-900 uppercase">
                      USE MY <span className="text-gray-400">CREATOR</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <a href="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Privacy Policy</a>
                    <a href="/terms" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Terms of Service</a>
                    <a href="/contact" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Contact</a>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Globe className="h-3 w-3 text-[#22c55e]" />
                    <span>© {new Date().getFullYear()} Global Infrastructure</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ClientWrapper>
      </body>
    </html>
  );
}