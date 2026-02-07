export const dynamic = 'force-dynamic';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default async function sitemap() {
  const baseUrl = "https://usemycreator.com";

  try {
    // 1. Fetch all creators from your 'creators' collection
    const creatorsSnap = await getDocs(collection(db, "creators"));
    
    // 2. Map through creators to create the URL objects
    const creatorUrls = creatorsSnap.docs.map((doc) => {
      const data = doc.data();
      // Only add if the profileSlug exists to avoid broken links
      if (!data.profileSlug) return null;
      return {
        url: `${baseUrl}/profile/${data.profileSlug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.6,
      };
    }).filter(Boolean); // Remove nulls

    // 3. Define your STATIC core pages (Crucial for Sitelinks)
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
        priority: 0.9, // Higher priority to encourage Sitelink
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
      {
        url: `${baseUrl}/login`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/register`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
    ];

    // 4. Combine them
    return [...staticPages, ...creatorUrls];
  } catch (error) {
    console.error("Sitemap error:", error);
    // Return the base URL and static pages if Firebase fails
    return [
      { url: baseUrl, lastModified: new Date().toISOString() },
      { url: `${baseUrl}/pricing`, lastModified: new Date().toISOString() },
      { url: `${baseUrl}/blog`, lastModified: new Date().toISOString() },
    ];
  }
}