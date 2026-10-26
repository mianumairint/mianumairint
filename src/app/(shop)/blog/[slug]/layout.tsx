import { Metadata } from "next";
import { getSeoMeta, buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const seo = await getSeoMeta(`/blog/${params.slug}`);
  return buildMetadata(seo, `/blog/${params.slug}`);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
