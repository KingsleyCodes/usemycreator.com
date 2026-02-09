export const dynamic = 'force-dynamic';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default async function sitemap() {
  const baseUrl = "https://usemycreator.com";

  try {
    // 1. Fetch all creators from your 'creators' collection
    // This is high value for SEO as individual profiles rank for names
    const creatorsSnap = await getDocs(collection(db, "creators"));
    
    const creatorUrls = creatorsSnap.docs.map((doc) => {
      const data = doc.data();
      if (!data.profileSlug) return null;
      return {
        url: `${baseUrl}/profile/${data.profileSlug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.6,
      };
    }).filter(Boolean);

    // 2. Define your STATIC core pages
    // REMOVED: /login and /register to stop the "Page with redirect" errors
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/solutions`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/pricing`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/creator-network`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/enterprise`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ];

    return [...staticPages, ...creatorUrls];
  } catch (error) {
    console.error("Sitemap error:", error);
    return [
      { url: baseUrl, lastModified: new Date().toISOString(), priority: 1.0 },
      { url: `${baseUrl}/solutions`, lastModified: new Date().toISOString(), priority: 0.8 },
      { url: `${baseUrl}/pricing`, lastModified: new Date().toISOString(), priority: 0.9 },
    ];
  }
}