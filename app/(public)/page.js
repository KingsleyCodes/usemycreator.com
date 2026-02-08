"use client";

import HomeNavbar from '@/app/components/HomeNavbar';
import Hero from '@/app/components/home/Hero';
import CreatorGallery from '@/app/components/home/CreatorGallery';
import Process from '@/app/components/home/Process';
import Features from '@/app/components/home/Features';
import FAQ from '../components/home/FAQ';

export default function HomePage() {
  return (
    // Ensure the outer container is the dark brand color
    <div className="min-h-screen bg-[#001E00] antialiased">
      <HomeNavbar />
      
      {/* Remove any default browser padding/margin on main */}
      <main className="relative">
        <Hero />
        
        {/* The -mt-10 creates the "overlap" effect for the white sections */}
        <div className="relative z-20 -mt-10 bg-white rounded-t-[3rem] lg:rounded-t-[5rem]">
          <CreatorGallery />
          <Process />
          <Features />
          <FAQ />
          
          {/* Growth Footer CTA - Transitioning back to dark */}
          <section className="bg-[#001E00] py-32 px-6 text-center rounded-t-[3rem] lg:rounded-t-[5rem]">
            <h2 className="text-4xl md:text-6xl font-serif text-white mb-8">
              Ready to <span className="italic text-[#a3dcf3]">start growing?</span>
            </h2>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-[#108a00] text-white px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Get Started for Free
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}