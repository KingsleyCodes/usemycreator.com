"use client";

import { useRouter } from 'next/navigation';
import { Clock, ArrowRight } from 'lucide-react';

export default function BlogCard({ post }) {
  const router = useRouter();
  
  // Safety check to prevent the 'undefined' error we saw earlier
  if (!post) return null;

  return (
    <article 
      onClick={() => router.push(`/blog/${post.slug}`)}
      className="group cursor-pointer bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-[#22c55e]/10 transition-all duration-500 flex flex-col"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gray-50">
        {post.image ? (
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Image Found</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm">
            {post.category || 'General'}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-4 text-gray-400">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
            <Clock className="h-3 w-3" /> {post.readTime || '5 min read'}
          </div>
        </div>

        <h3 className="text-xl font-black text-gray-900 leading-tight mb-4 group-hover:text-[#22c55e] transition-colors uppercase">
          {post.title}
        </h3>

        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
          {post.excerpt}
        </p>

        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
            Read Intelligence <ArrowRight className="h-4 w-4 text-[#22c55e]" />
          </span>
        </div>
      </div>
    </article>
  );
}