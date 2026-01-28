import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import CreatorPublicProfileClient from "./CreatorPublicProfileClient";

// --- SERVER SIDE: SEO GENERATION ---
export async function generateMetadata({ params }) {
  // NEXT.js 15/16 REQUIREMENT: Await params
  const { slug } = await params; 

  try {
    const q = query(
      collection(db, "creators"),
      where("profileSlug", "==", slug),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { title: "Creator Not Found | UseMyCreator" };
    }

    const creator = querySnapshot.docs[0].data();

    return {
      title: `${creator.name} (@${slug}) | Verified Creator Portfolio`,
      description: creator.bio || `Collaborate with ${creator.name} on UseMyCreator. View verified platforms and book secure influencer campaigns via escrow.`,
      openGraph: {
        title: `${creator.name} - Influencer Portfolio`,
        description: `Securely book ${creator.name} for your next campaign. Funds are protected by UseMyCreator escrow.`,
        url: `https://usemycreator.com/profile/${slug}`,
        images: [
          {
            url: creator.profileImage || "/og-image.png",
            width: 1200,
            height: 630,
            alt: `${creator.name} Profile`,
          },
        ],
        type: "profile",
      },
      twitter: {
        card: "summary_large_image",
        title: `${creator.name} on UseMyCreator`,
        description: `Work with ${creator.name} via secure escrow.`,
        images: [creator.profileImage || "/og-image.png"],
      },
    };
  } catch (error) {
    console.error("SEO Metadata Error:", error);
    return { title: "Creator Profile | UseMyCreator" };
  }
}

// --- THE MAIN PAGE COMPONENT ---
export default async function Page({ params }) {
  // NEXT.js 15/16 REQUIREMENT: Await params
  const { slug } = await params; 
  
  // We pass the resolved slug to the client component
  return <CreatorPublicProfileClient slug={slug} />;
}