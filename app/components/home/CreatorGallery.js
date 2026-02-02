"use client";

import { PlayCircle } from "lucide-react";

export default function CreatorGallery() {
  const samples = [
    { name: "@tech_reviews", niche: "Tech", color: "bg-blue-100" },
    { name: "@skin_glow", niche: "Beauty", color: "bg-pink-100" },
    { name: "@fitness_flow", niche: "Wellness", color: "bg-emerald-100" },
    { name: "@chef_pro", niche: "Food", color: "bg-amber-100" },
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-16">
        <h2 className="text-3xl md:text-5xl font-serif font-medium tracking-tight text-gray-900">
          Built by <span className="italic text-gray-400">the best.</span>
        </h2>
      </div>

      <div className="flex gap-6 animate-marquee whitespace-nowrap">
        {[...samples, ...samples].map((item, i) => (
          <div key={i} className={`w-[300px] h-[450px] ${item.color} rounded-[2.5rem] relative group cursor-pointer shrink-0 overflow-hidden border border-gray-100`}>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <PlayCircle className="text-white h-16 w-16 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-500" />
            </div>
            <div className="absolute bottom-8 left-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">{item.niche}</p>
              <h4 className="text-white font-bold text-xl">{item.name}</h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}