import React from 'react';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Search, Clock, ArrowRight, ChevronRight } from 'lucide-react';
import HomeNavbar from "@/app/components/HomeNavbar";
import BlogCard from "@/app/components/BlogCard";

async function getPosts() {
  const postsDirectory = path.join(process.cwd(), 'content/blog');
  
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md')) // Only read .md files
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      try {
        const { data } = matter(fileContents);
        
        // Safety check: If the file is missing a title or image, skip it
        if (!data || !data.title) {
          return null;
        }

        return {
          slug,
          title: data.title,
          date: data.date || "",
          category: data.category || "General",
          readTime: data.readTime || "5 min read",
          excerpt: data.excerpt || "",
          image: data.image || "", // This captures your Appwrite link
        };
      } catch (e) {
        return null;
      }
    })
    .filter(post => post !== null); // Remove any failed/null posts

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <HomeNavbar />

      <section className="bg-white border-b border-gray-100 pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <span className="text-[#a3dcf3] font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">
            Institutional Insights
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6 uppercase">
            UseMyCreator <span className="text-gray-400">Blog</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            Expert analysis on influencer marketing and the future of the Nigerian creator economy.
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}