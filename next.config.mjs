import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Every image the site shows now lives in our own Supabase Storage or in
    // public/. The old site and Unsplash were removed once their files had
    // been copied across: leaving them listed would let a stale URL keep
    // working quietly instead of failing where we can see it.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;