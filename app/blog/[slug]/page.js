import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { ArrowLeft, Clock, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import HomeNavbar from "@/app/components/HomeNavbar";
import Link from 'next/link';

// SERVER-SIDE: Logic to fetch a single post by its filename (slug)
async function getPostData(slug) {
  try {
    const postsDirectory = path.join(process.cwd(), 'content/blog');
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found at: ${fullPath}`);
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse metadata
    const { data, content } = matter(fileContents);

    // Convert Markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(content);
    const contentHtml = processedContent.toString();

    return {
      slug,
      contentHtml,
      ...data,
    };
  } catch (error) {
    console.error("Error in getPostData:", error);
    return null;
  }
}

export default async function BlogPost({ params }) {
  // 🛡️ CRITICAL FIX: params must be awaited in Next.js 15+
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const post = await getPostData(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc] px-4">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900 mb-4">
          Intelligence Report Not Found
        </h1>
        <p className="text-gray-500 mb-8 font-medium italic">Slug: {slug}.md</p>
        <Link 
          href="/blog" 
          className="px-8 py-4 bg-[#a3dcf3] text-[#001E00] font-black uppercase text-xs tracking-widest rounded-xl hover:scale-105 transition-all"
        >
          Return to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <HomeNavbar />

      {/* --- HEADER SECTION --- */}
      <div className="max-w-[1400px] mx-auto px-4 pt-32 pb-8">
        <Link 
          href="/blog"
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors group mb-12"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Journal
        </Link>

        <header className="max-w-[1000px] mx-auto text-left lg:text-center">
          <div className="flex items-center lg:justify-center gap-3 mb-6">
            <span className="bg-[#a3dcf3]/20 text-[#001E00] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {post.category || "Insight"}
            </span>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <Clock className="h-3.5 w-3.5" /> {post.readTime || "5 min read"}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-[0.95] mb-8 uppercase">
            {post.title}
          </h1>

          <div className="flex items-center lg:justify-center gap-4 py-6 border-y border-gray-100">
            <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center text-[#a3dcf3] font-black text-xs uppercase">
              {post.author ? post.author[0] : 'M'}
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest text-gray-900">{post.author || "Strategy Team"}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{post.date}</p>
            </div>
          </div>
        </header>
      </div>

      {/* --- FEATURED IMAGE --- */}
      <div className="max-w-[1200px] mx-auto px-4 mb-16">
        <div className="h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl">
          {post.image && (
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* --- ARTICLE CONTENT --- */}
      <div className="max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row gap-12 relative">
        
        {/* Social Share Sidebar */}
        <aside className="hidden lg:block w-16 sticky top-32 h-fit">
          <div className="flex flex-col gap-6 items-center">
            <button className="p-3 rounded-full bg-gray-50 text-gray-400 hover:text-black transition-colors"><Twitter className="h-5 w-5" /></button>
            <button className="p-3 rounded-full bg-gray-50 text-gray-400 hover:text-black transition-colors"><Linkedin className="h-5 w-5" /></button>
            <button className="p-3 rounded-full bg-gray-50 text-gray-400 hover:text-black transition-colors"><LinkIcon className="h-5 w-5" /></button>
            <div className="w-[1px] h-20 bg-gray-100"></div>
            <span className="text-[10px] font-black uppercase vertical-text tracking-widest text-gray-300">Share</span>
          </div>
        </aside>

        {/* Main Text & Keywords */}
        <article className="flex-1 max-w-[750px] mx-auto lg:mx-0">
          <div 
            className="prose prose-lg prose-slate max-w-none 
              prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
              prose-h2:text-3xl prose-h2:mt-12
              prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
              prose-blockquote:border-l-4 prose-blockquote:border-[#a3dcf3] prose-blockquote:bg-gray-50 prose-blockquote:p-8 prose-blockquote:rounded-r-2xl prose-blockquote:font-bold prose-blockquote:italic"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* --- KEYWORDS SECTION --- */}
          {post.keywords && (
            <div className="mt-16 pt-8 border-t border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
                Intelligence Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {post.keywords.split(',').map((tag) => (
                  <span 
                    key={tag} 
                    className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 py-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-[#a3dcf3] hover:text-black transition-colors cursor-default"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Right Sidebar CTA */}
        <aside className="lg:w-[350px] space-y-8">
          <div className="bg-[#001E00] p-8 rounded-[2rem] text-white">
            <h3 className="text-xl font-black uppercase mb-4 tracking-tighter">Scale your Infrastructure</h3>
            <p className="text-gray-400 text-sm mb-6 font-medium">Ready to deploy high-converting campaigns in Nigeria?</p>
            <Link 
              href="/register"
              className="block w-full text-center py-4 bg-[#a3dcf3] text-[#001E00] rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
            >
              Get Started Now
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
// This tells Next.js exactly which slugs exist so it can pre-render them
export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'content/blog');
  
  if (!fs.existsSync(postsDirectory)) return [];

  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => ({
      slug: fileName.replace(/\.md$/, ''),
    }));
}