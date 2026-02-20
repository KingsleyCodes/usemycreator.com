"use client";

import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfileNudge({ userData }) {
  const router = useRouter();

  // Logic to check completeness based on your Profile and Bank code
  const checks = [
    { 
      id: 'bio', 
      label: "Bio", 
      isMet: !!userData?.bio && userData?.bio?.length > 10 
    },
    { 
      id: 'platforms', 
      label: "Socials", 
      isMet: userData?.platforms?.length > 0 && Object.keys(userData?.socialLinks || {}).length > 0 
    },
    { 
      id: 'bank', 
      label: "Payout", 
      isMet: !!userData?.bankDetails?.accountNumber 
    },
    { 
      id: 'name', 
      label: "Identity", 
      isMet: !!userData?.name && userData?.name !== "New Creator" 
    },
  ];

  const completed = checks.filter(c => c.isMet).length;
  const percentage = Math.round((completed / checks.length) * 100);

  // If 100%, we hide the nudge to keep the dashboard clean
  if (percentage === 100) return null;

  return (
    <div className="mb-10 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Sparkles className="h-24 w-24 text-[#22c55e]" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Progress Ring / Percentage */}
        <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
          <svg className="h-full w-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-100"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * percentage) / 100}
              className="text-[#22c55e] transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="absolute text-xl font-black italic tracking-tighter">{percentage}%</span>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">
            Finish your <span className="text-[#22c55e]">Creator Setup</span>
          </h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 leading-relaxed">
            Brands prioritize creators with 100% verified profiles. 
            <br />You're just a few clicks away from your first deal.
          </p>

          {/* Checklist horizontal */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
            {checks.map((check) => (
              <div key={check.id} className="flex items-center gap-1.5">
                {check.isMet ? (
                  <CheckCircle2 className="h-3 w-3 text-[#22c55e]" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                )}
                <span className={`text-[9px] font-black uppercase tracking-tighter ${check.isMet ? 'text-gray-900' : 'text-gray-300'}`}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => router.push('/dashboard/creator/profile')}
          className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#22c55e] hover:text-black transition-all shadow-xl active:scale-95 flex items-center gap-3"
        >
          Complete Now <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}