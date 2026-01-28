import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default async function sitemap() {
  const baseUrl = "https://usemycreator.com";

  try {
    // 1. Fetch all creators from your 'creators' collection
    const creatorsSnap = await getDocs(collection(db, "creators"));
    
    // 2. Map through them to create the URL objects
    const creatorUrls = creatorsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        url: `${baseUrl}/profile/${data.profileSlug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      };
    });

    // 3. Define your static core pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/login`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/register`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.5,
      },
    ];

    // 4. Combine them
    return [...staticPages, ...creatorUrls];
  } catch (error) {
    console.error("Sitemap error:", error);
    // Return at least the base URL if the fetch fails
    return [{ url: baseUrl, lastModified: new Date() }];
  }
}