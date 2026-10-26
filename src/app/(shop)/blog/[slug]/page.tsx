"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

const allPosts: Record<
  string,
  {
    title: string;
    category: string;
    date: string;
    readTime: string;
    excerpt: string;
  }
> = {
  "10-surprising-health-benefits-of-himalayan-pink-salt": {
    title: "10 Surprising Health Benefits of Himalayan Pink Salt",
    category: "Health & Wellness",
    date: "March 28, 2026",
    readTime: "6 min read",
    excerpt:
      "Discover how this ancient mineral can support hydration, respiratory health, and more.",
  },
  "cooking-with-himalayan-salt-blocks-a-complete-guide": {
    title: "Cooking with Himalayan Salt Blocks: A Complete Guide",
    category: "Culinary Arts",
    date: "March 15, 2026",
    readTime: "8 min read",
    excerpt:
      "Salt block cooking adds a subtle mineral flavor that transforms ordinary dishes.",
  },
  "how-himalayan-salt-lamps-transform-your-living-space": {
    title: "How Himalayan Salt Lamps Transform Your Living Space",
    category: "Home Decor",
    date: "February 22, 2026",
    readTime: "5 min read",
    excerpt:
      "Beyond their warm amber glow, salt lamps create an atmosphere of calm and natural beauty.",
  },
};

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const relatedSlugs = Object.keys(allPosts);

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const post = allPosts[slug] || {
    title: slugToTitle(slug),
    category: "General",
    date: "April 2026",
    readTime: "5 min read",
    excerpt: "",
  };

  const relatedPosts = relatedSlugs
    .filter((s) => s !== slug)
    .slice(0, 3)
    .map((s) => ({ slug: s, ...allPosts[s] }));

  return (
    <article className="bg-surface">
      {/* ── Hero Image Placeholder ── */}
      <motion.div
        className="w-full h-[400px] bg-surface-container-low flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 mb-2 block">
            image
          </span>
          <p className="font-label text-sm text-on-surface-variant/40">
            Featured Image
          </p>
        </div>
      </motion.div>

      {/* ── Article Content ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Meta */}
          <div className="flex items-center gap-3 mb-6">
            <span className="salt-chip">{post.category}</span>
            <span className="font-label text-xs text-on-surface-variant">
              {post.date} &middot; {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-headline text-3xl lg:text-4xl text-primary mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Rich text content placeholder */}
          <div className="prose-custom space-y-6">
            <p className="font-body text-on-surface leading-relaxed text-lg">
              Himalayan pink salt, mined from the ancient Khewra Salt Mines in
              Pakistan, is one of the purest forms of salt available today.
              Formed over 250 million years ago from ancient ocean deposits, this
              mineral-rich salt contains up to 84 trace minerals that contribute
              to its distinctive rose-pink hue.
            </p>

            <h2 className="font-headline text-2xl text-on-surface mt-10 mb-4">
              The Origins of Himalayan Salt
            </h2>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Deep within the foothills of the Himalayas, the Khewra Salt Mine
              stands as the second largest salt mine in the world. The salt
              deposits here were formed during the Precambrian era when an
              ancient sea evaporated, leaving behind vast crystalline salt beds
              that were eventually sealed by layers of rock and geological
              pressure.
            </p>
            <p className="font-body text-on-surface-variant leading-relaxed">
              This unique geological history means that Himalayan salt has been
              protected from modern environmental pollutants, making it one of
              the purest forms of salt on earth. The trace minerals present in
              the salt, including iron, magnesium, potassium, and calcium, give
              it not only its beautiful color but also potential health benefits
              that table salt simply cannot offer.
            </p>

            <h2 className="font-headline text-2xl text-on-surface mt-10 mb-4">
              Key Benefits and Uses
            </h2>

            <h3 className="font-headline text-xl text-on-surface mt-8 mb-3">
              1. Mineral-Rich Nutrition
            </h3>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Unlike heavily processed table salt, Himalayan pink salt retains
              its natural mineral content. These trace minerals can help support
              the body&apos;s natural functions and provide a more complex flavor
              profile for culinary applications.
            </p>

            <h3 className="font-headline text-xl text-on-surface mt-8 mb-3">
              2. Respiratory Wellness
            </h3>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Salt therapy, or halotherapy, has been practiced for centuries.
              Himalayan salt inhalers and salt rooms leverage the natural
              antibacterial and anti-inflammatory properties of salt to support
              respiratory health and clearer breathing.
            </p>

            <h3 className="font-headline text-xl text-on-surface mt-8 mb-3">
              3. Home and Ambiance
            </h3>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Himalayan salt lamps have become increasingly popular for their
              warm, amber glow that creates a calming atmosphere. When heated,
              these lamps may release negative ions that can help purify the
              surrounding air, though more research is needed on this effect.
            </p>

            {/* Bullet list example */}
            <div className="bg-surface-container-low rounded-xl p-6 my-8">
              <h3 className="font-headline text-lg text-on-surface mb-4">
                Popular Himalayan Salt Products
              </h3>
              <ul className="space-y-2">
                {[
                  "Fine and coarse grain pink salt for cooking and seasoning",
                  "Salt lamps in various natural and crafted shapes",
                  "Salt blocks and tiles for cooking and serving",
                  "Bath salts and spa products for wellness",
                  "Salt inhalers for respiratory support",
                  "Animal lick salt blocks for livestock nutrition",
                  "Decorative items like candle holders and shot glasses",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 font-body text-on-surface-variant text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <h2 className="font-headline text-2xl text-on-surface mt-10 mb-4">
              Quality Matters
            </h2>
            <p className="font-body text-on-surface-variant leading-relaxed">
              When sourcing Himalayan salt, quality and authenticity are
              paramount. Look for suppliers who can provide certificates of
              analysis, proof of origin from the Khewra mines, and relevant food
              safety certifications such as ISO, Halal, and GMP compliance.
            </p>
            <p className="font-body text-on-surface-variant leading-relaxed">
              At Mian Umair International, we maintain strict quality control
              from mine to market, ensuring every product meets international
              standards. Our vertically integrated supply chain means we oversee
              every step from extraction to packaging and export.
            </p>
          </div>

          {/* Back link */}
          <div className="mt-12 pt-8">
            <div className="bg-surface-container-low h-px mb-8" />
            <Link
              href="/blog"
              className="font-label text-sm text-primary hover:text-primary-container transition-colors inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">
                arrow_back
              </span>
              Back to Journal
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Related Posts ── */}
      <div className="bg-surface-container-low py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-2xl text-on-surface text-center mb-12">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((related, index) => (
              <motion.div
                key={related.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link
                  href={`/blog/${related.slug}`}
                  className="block group"
                >
                  {/* Image placeholder */}
                  <div className="aspect-[4/3] bg-surface-container rounded-xl mb-4 flex items-center justify-center group-hover:bg-surface-container-high transition-colors overflow-hidden">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant/20">
                      image
                    </span>
                  </div>
                  <p className="font-label text-xs text-on-surface-variant mb-2">
                    {related.category} &middot; {related.date}
                  </p>
                  <h3 className="font-headline text-lg text-on-surface group-hover:text-primary transition-colors leading-snug">
                    {related.title}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
