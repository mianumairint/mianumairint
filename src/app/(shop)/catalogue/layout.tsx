import { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/catalogue");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
