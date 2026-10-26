import { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/about");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
