"use client";

import { ShieldCheck, Zap, BarChart3, Globe } from "lucide-react";

export default function Features() {
  const features = [
    { 
      title: "SafePay Escrow", 
      desc: "Secure financial infrastructure that protects both brand and talent.", 
      icon: <ShieldCheck /> 
    },
    { 
      title: "Niche Match AI", 
      desc: "Our algorithm connects you to creators based on actual engagement data.", 
      icon: <Zap /> 
    },
    { 
      title: "Real-time ROI", 
      desc: "Track every impression and conversion through your brand dashboard.", 
      icon: <BarChart3 /> 
    },
    { 
      title: "Global Standard", 
      desc: "Built for Nigerian businesses with world-class execution standards.", 
      icon: <Globe /> 
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-10 rounded-[2.5rem] border border-gray-100 hover:border-primary/30 hover:bg-gray-50 transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-black transition-all text-primary">
                {f.icon}
              </div>
              <h4 className="text-xl font-bold mb-4 uppercase tracking-tighter text-[#001E00]">
                {f.title}
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}