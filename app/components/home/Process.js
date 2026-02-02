"use client";

import { 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  Wallet, 
  Sparkles, 
  PlayCircle 
} from "lucide-react";

export default function Process() {
  return (
    <section className="py-24 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-20">
          
          {/* FOR BUSINESSES / BRANDS */}
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 block">
              For Brands
            </span>
            <h3 className="text-4xl md:text-5xl font-serif font-medium mb-12 italic text-[#001E00]">
              Scale your creative output.
            </h3>
            <div className="space-y-10">
              {[
                { 
                  title: "Post a Brief", 
                  desc: "Define your goals, platform, and budget in minutes.", 
                  icon: <Send className="h-5 w-5" /> 
                },
                { 
                  title: "Review Proposals", 
                  desc: "Get curated micro-creators who actually fit your niche.", 
                  icon: <CheckCircle2 className="h-5 w-5" /> 
                },
                { 
                  title: "Escrow Payment", 
                  desc: "Funds are held securely and only released when you approve.", 
                  icon: <ShieldCheck className="h-5 w-5" /> 
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary shrink-0 border border-gray-100 group-hover:scale-110 group-hover:bg-primary group-hover:text-[#001E00] transition-all">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1 text-[#001E00]">{step.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOR CREATORS */}
          <div className="bg-[#001E00] rounded-[3rem] p-8 md:p-16 text-white shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-right-8 duration-1000">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 block">
              For Creators
            </span>
            <h3 className="text-4xl md:text-5xl font-serif font-medium mb-12 italic">
              Monetize your influence.
            </h3>
            <div className="space-y-10">
              {[
                { 
                  title: "Apply to Briefs", 
                  desc: "Access high-quality brands looking for your specific voice.", 
                  icon: <Sparkles className="h-5 w-5" /> 
                },
                { 
                  title: "Create & Submit", 
                  desc: "Upload your content directly through our secure studio portal.", 
                  icon: <PlayCircle className="h-5 w-5" /> 
                },
                { 
                  title: "Instant Settlement", 
                  desc: "No more chasing invoices. Get paid instantly to your wallet.", 
                  icon: <Wallet className="h-5 w-5" /> 
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-black transition-all">
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">{step.title}</h4>
                    <p className="text-white/60 text-sm leading-relaxed max-w-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}