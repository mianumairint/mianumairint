import { Metadata } from "next";
import { getSeoMeta, buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoMeta("/checkout");
  return buildMetadata(seo, "/checkout");
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
