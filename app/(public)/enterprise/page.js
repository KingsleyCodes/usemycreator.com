"use client";

import React, { useState } from 'react';
import { ShieldCheck, Zap, BarChart3, Users, ArrowRight, Briefcase, Globe, Send, CheckCircle2 } from 'lucide-react';

const EnterprisePage = () => {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to save to 'leads' collection in Firestore would go here
    setSubmitted(true);
  };

  return (
    <div className="pt-32 pb-24 bg-[#001E00] text-white min-h-screen px-6 relative overflow-hidden font-sans">
      
      {/* --- BACKGROUND INFRASTRUCTURE --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#a3dcf3]/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.1]" 
             style={{ backgroundImage: `linear-gradient(to right, #a3dcf3 1px, transparent 1px), linear-gradient(to bottom, #a3dcf3 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 bg-[#a3dcf3]/10 border border-[#a3dcf3]/20 px-4 py-2 rounded-full mb-6 text-[#a3dcf3]">
            <Briefcase className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional Grade</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-serif font-medium leading-tight mb-8">
            Scale your <br />
            <span className="text-[#a3dcf3] italic font-normal">content pipeline.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
            High-volume creator operations for brands requiring 50+ monthly content assets. 
            We provide the infrastructure; you provide the vision.
          </p>
        </div>

        {/* Feature Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { 
              title: "Custom Vetting", 
              desc: "We hand-select creators that match your exact brand aesthetic and target market.",
              icon: <Users className="h-6 w-6" />
            },
            { 
              title: "Rights Management", 
              desc: "Immediate ownership of all content rights for paid ads and global campaigns.",
              icon: <ShieldCheck className="h-6 w-6" />
            },
            { 
              title: "Dedicated Support", 
              desc: "A personal account manager to handle briefs and creator communications.",
              icon: <Globe className="h-6 w-6" />
            }
          ].map((item, i) => (
            <div key={i} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-[#a3dcf3]/50 transition-all group">
              <div className="h-14 w-14 rounded-2xl bg-[#a3dcf3]/10 flex items-center justify-center mb-8 text-[#a3dcf3] group-hover:bg-[#a3dcf3] group-hover:text-black transition-all">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-tight">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* The "Command Center" Section */}
        <div className="relative bg-white/5 rounded-[3rem] border border-white/10 p-8 md:p-16 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">
                Your content <br />on <span className="text-[#a3dcf3] italic">autopilot.</span>
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Unlock our API and managed services to integrate creator-led content directly into your marketing stack.
              </p>
              <ul className="space-y-4 mb-10">
                {['Direct API Access', 'Whitelabel Options', 'Volume Rebates'].map((check) => (
                  <li key={check} className="flex items-center gap-3 font-bold text-xs uppercase tracking-widest text-[#a3dcf3]">
                    <Zap className="h-4 w-4" /> {check}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* CTA Box / Lead Form */}
            <div className="bg-[#a3dcf3] p-10 md:p-12 rounded-[2rem] text-[#001E00] min-h-[400px] flex flex-col justify-center transition-all duration-500">
              {!showForm ? (
                <div className="flex flex-col items-center text-center animate-in fade-in">
                  <BarChart3 className="h-12 w-12 mb-6" />
                  <h3 className="text-3xl font-black mb-4 tracking-tighter uppercase">Ready for Deployment?</h3>
                  <p className="font-bold mb-8 opacity-70 text-sm uppercase tracking-widest">Inquire for institutional access</p>
                  <button 
                    onClick={() => setShowForm(true)}
                    className="w-full bg-[#001E00] text-white px-8 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all hover:scale-105 flex items-center justify-center gap-3"
                  >
                    Talk to Enterprise Sales
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : submitted ? (
                <div className="text-center animate-in zoom-in">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-6 text-[#001E00]" />
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Request Received</h3>
                  <p className="font-bold opacity-70">A senior partner will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-bottom-4">
                  <h3 className="text-lg font-black uppercase tracking-tighter mb-4 border-b border-[#001E00]/10 pb-2">Institutional Inquiry</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Company Name" className="col-span-2 bg-white/50 border border-[#001E00]/10 p-4 rounded-xl placeholder-[#001E00]/50 text-sm outline-none focus:bg-white transition-all font-bold" required />
                    <input type="email" placeholder="Work Email" className="col-span-2 bg-white/50 border border-[#001E00]/10 p-4 rounded-xl placeholder-[#001E00]/50 text-sm outline-none focus:bg-white transition-all font-bold" required />
                    <select className="col-span-2 bg-white/50 border border-[#001E00]/10 p-4 rounded-xl text-sm outline-none font-bold">
                       <option>Budget: ₦2M - ₦5M monthly</option>
                       <option>Budget: ₦5M - ₦15M monthly</option>
                       <option>Budget: ₦15M+ monthly</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-[#001E00] text-white py-5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 mt-4">
                    Submit Brief <Send className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="w-full text-[9px] font-black uppercase tracking-widest opacity-50 hover:opacity-100">Cancel</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterprisePage;