"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import FacebookPixel from "@/app/components/FacebookPixel";

/**
 * ClientWrapper
 * This component acts as the 'brain' for client-side operations.
 * It ensures that Auth states and Tracking Pixels are persistent 
 * across all pages without breaking Server-Side Rendering (SSR).
 */
export default function ClientWrapper({ children }) {
  return (
    <AuthProvider>
      {/* 1. Facebook Pixel: Tracks user behavior and conversions globally */}
      <FacebookPixel /> 

      {/* 2. Content: Renders the rest of your application */}
      {children}
    </AuthProvider>
  );
}