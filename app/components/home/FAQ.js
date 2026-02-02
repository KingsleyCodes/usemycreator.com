"use client";
import { Plus } from 'lucide-react';

export default function FAQ() {
  const questions = [
    { q: "How do you verify creators?", a: "Every creator goes through a 3-step vetting process checking engagement authenticity, content quality, and reliability." },
    { q: "How does the escrow work?", a: "Payments are held by MyCreator and only released once the creator submits the approved content." },
    { q: "Can I use the content for Ads?", a: "Yes, our 'Pro' and 'Enterprise' plans include full commercial usage rights for all content produced." }
  ];

  return (
    <section className="py-24 bg-[#F9FAFB]">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-serif text-center mb-16 italic text-[#001E00]">Common Questions</h2>
        <div className="space-y-4">
          {questions.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-primary transition-colors cursor-pointer group">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[#001E00]">{item.q}</h4>
                <Plus className="h-4 w-4 text-primary group-hover:rotate-90 transition-transform" />
              </div>
              <p className="mt-4 text-gray-500 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}