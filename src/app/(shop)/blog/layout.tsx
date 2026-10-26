import { Metadata } from "next";
import { getSeoMeta, buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMeta("/blog");
  return buildMetadata(seo, "/blog");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
