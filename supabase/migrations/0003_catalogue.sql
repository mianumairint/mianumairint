-- ════════════════════════════════════════════════════════════════════════════
--  CATALOGUE  —  imported from https://mianumairint.com
--  Run after 0000_schema.sql and 0001_auth_and_rls.sql.
--
--  The live site publishes fourteen product lines under /products/<slug>/.
--  Each becomes one Category and one Product of the same name, which mirrors
--  the live navigation exactly.
--
--  Prices are 0 because the live site quotes nothing publicly — it is a B2B
--  export catalogue. The storefront shows "Request a Quote" wherever a price
--  would be, and switches back to showing the price on its own as soon as a
--  real one is set, so no code has to change when you add them.
--
--  Re-runnable: it updates by slug and rebuilds the image list for each product.
-- ════════════════════════════════════════════════════════════════════════════

begin;

-- ── Categories ───────────────────────────────────────────────────────────
insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Horse Saddles', 'horse-saddles', 'At Mian Umair International, we provide Premium Horse Saddles built for comfort, strength, and dependable riding performance. Each saddle is produced with carefully selected materials to ensure proper weight distribution, improved rider control, and long-term durability during various equestrian activities.', 'https://mianumairint.com/wp-content/uploads/2026/03/leather-saddles.webp', 0, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Rice', 'rice', 'Mian Umair International provides premium-quality rice that has been meticulously chosen to guarantee the best quality, a constant texture, and a natural flavour. Our rice is perfect for everyday meals, restaurants, catering, and food distributors who demand freshness and excellence in every grain.', 'https://mianumairint.com/wp-content/uploads/2026/01/riceee.webp', 1, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Black Salt', 'black-salt', 'Black Salt from Mian Umair International is a naturally sourced mineral salt known for its distinctive aroma and rich flavor profile. Originating from traditional Himalayan salt deposits, this unique seasoning is widely appreciated in culinary applications for its tangy taste and mineral richness.', 'https://mianumairint.com/wp-content/uploads/2026/01/salt-coarse-black.webp', 2, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Edible Salt', 'edible-salt', 'Edible salt from Mian Umair International is a naturally pure and high-quality product sourced from the ancient Himalayan salt deposits. Carefully processed to preserve its natural mineral composition, this food-grade salt provides a clean taste and reliable quality, making it suitable for everyday cooking, food processing, and professional culinary applications.', '/images/products/edible-salt/salt.webp', 3, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Crafted Lamps', 'crafted-lamps', 'Mian Umair International''s crafted lamps blend natural Himalayan salt with expert craftsmanship to produce decorative lighting that elevates both ambience and interior décor. Each lamp is carefully shaped from authentic Himalayan salt crystals, producing a warm amber glow that adds elegance and comfort to homes, offices, and wellness spaces.', 'https://mianumairint.com/wp-content/uploads/2021/08/5.webp', 4, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Salt Cooking Tiles', 'salt-cooking-tiles', 'Mian Umair International''s Salt Cooking Tiles are authentic Himalayan salt slabs intended for grilling, cooking, serving, and presenting food. Cut from authentic Himalayan salt deposits, these durable cooking surfaces add a subtle mineral flavour to foods while providing a unique culinary experience.', '/images/products/salt-cooking-tiles/salt-blocks-2.webp', 5, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Salt Tiles', 'salt-tiles', 'Salt Tiles are crafted from authentic Himalayan salt crystals, offering a unique combination of natural beauty and functional design. These tiles are widely used for decorative wall panels, spa rooms, wellness centres, and interior lighting installations because of their distinctive texture and warm amber appearance.', 'https://mianumairint.com/wp-content/uploads/2021/08/4-1.webp', 6, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Animal Licks', 'animal-licks', 'Animal Licks are natural Himalayan mineral blocks developed to support the nutritional needs of livestock. These salt blocks are extracted from ancient Himalayan deposits and contain naturally occurring trace minerals that animals commonly seek in their diet.', '/images/products/animal-licks/animal-lick.png', 7, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Bath Salt', 'bath-salt', 'Premium Bath Salt is made from authentic Himalayan mineral crystals known for their exceptional purity and soothing qualities. Carefully processed to preserve essential trace minerals, this natural product helps create a luxurious and relaxing bathing experience.', '/images/products/bath-salt/bath-salt-1.webp', 8, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Salt Grinders', 'salt-grinders', 'Premium Salt Grinders are designed to deliver fresh flavour and convenience for everyday cooking and professional kitchens. Our grinders are filled with authentic Himalayan salt crystals, allowing users to easily grind natural salt for seasoning meals with a rich mineral taste.', '/images/products/salt-grinders/salt-grinders-group.webp', 9, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Natural Lamps', 'natural-lamps', 'Powerful and high-end Himalayan natural salt lamps made from pure crystal salt are available on Mian Umair International, a reputable exporter of genuine Himalayan salt items. Our exquisitely carved Himalayan salt lamps are made to accentuate the natural beauty of homes, workplaces, spas, and wellness areas while producing a cosy, calming glow.', '/images/products/natural-lamps/natural-lamps-group.webp', 10, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Candle Holders', 'candle-holders', 'Light up your space with the natural glow of Himalayan salt candle holders from Mian Umair International. Each holder is carefully hand-carved from authentic Himalayan rock salt, giving your home, office, or spa a warm, soothing ambience.', '/images/products/candle-holders/candle-holders-group.webp', 11, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Salt Inhaler', 'salt-inhaler', 'Relax and breathe easy with the natural Himalayan salt inhaler from Mian Umair International. Made from pure Himalayan rock salt, this inhaler helps support healthy breathing and promotes a calm, refreshing feeling anytime you need it.', 'https://mianumairint.com/wp-content/uploads/2025/10/4-3.webp', 12, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

insert into public."Category" (name, slug, description, image, "sortOrder", "isActive") values
  ('Industrial Salt', 'industrial-salt', 'Mian Umair International offers premium industrial salt that meets the highest quality standards for a wide range of industrial and commercial applications. Our salt is pure, consistent, and reliable, making it perfect for water treatment, chemical production, de-icing, and more.', 'https://mianumairint.com/wp-content/uploads/2021/03/IMG-20251031-WA0005.jpg', 13, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

-- ── Products ─────────────────────────────────────────────────────────────
insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Horse Saddles', 'horse-saddles', 'MUI-HORSE-SADDLES', 'At Mian Umair International, we provide Premium Horse Saddles built for comfort, strength, and dependable riding performance. Each saddle is produced with carefully selected materials to ensure proper weight distribution, improved rider control, and long-term durability during various equestrian activities. Whether used for ranch duties, competitive events, or casual horseback riding, our saddles are designed to offer a secure and comfortable experience for both the rider and the horse. As a reliable exporter, we supplies international markets, including Dallas (USA), Sydney (Australia), and Ontario (Canada), with consistent wholesale availability and worldwide shipping. Our collection features a variety of saddle types such as Western horse saddles, English riding saddles, endurance saddles, barrel racing saddles, and trail riding saddles, making them suitable for professional riders, equestrian businesses, and horse equipment retailers around the world.', 'At Mian Umair International, we provide Premium Horse Saddles built for comfort, strength, and dependable riding performance. Each saddle is produced with carefully selected materials to ensure proper weight distribution, improved rider control, and long-term durability during various equestrian activities.', 0,
   (select id from public."Category" where slug = 'horse-saddles'),
   false, false, true, 'Horse Saddles | Mian Umair International', 'At Mian Umair International, we provide Premium Horse Saddles built for comfort, strength, and dependable riding performance. Each saddle is produced with caref')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Rice', 'rice', 'MUI-RICE', 'Mian Umair International provides premium-quality rice that has been meticulously chosen to guarantee the best quality, a constant texture, and a natural flavour. Our rice is perfect for everyday meals, restaurants, catering, and food distributors who demand freshness and excellence in every grain. Our high-quality rice is processed under strict standards to maintain uniform size, purity, polishing and excellent cooking performance. Whether you are preparing simple home meals or gourmet dishes, our rice delivers a naturally satisfying taste and perfect texture every time. We supply bulk premium rice, long-grain rice, basmati rice, and high-quality rice to wholesalers, retailers, and distributors in Dallas, Sydney, and Ontario. Each batch is packed to preserve freshness and ensure that every grain meets our premium quality standards. Experience the amazing taste and reliability of Mian Umair International’s premium rice, and enjoy every meal with confidence, knowing you are using rice that is naturally pure, fresh, and perfect for any culinary need.', 'Mian Umair International provides premium-quality rice that has been meticulously chosen to guarantee the best quality, a constant texture, and a natural flavour. Our rice is perfect for everyday meals, restaurants, catering, and food distributors who demand freshness and excellence in every grain.', 0,
   (select id from public."Category" where slug = 'rice'),
   false, false, true, 'Rice | Mian Umair International', 'Mian Umair International provides premium-quality rice that has been meticulously chosen to guarantee the best quality, a constant texture, and a natural flavou')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Black Salt', 'black-salt', 'MUI-BLACK-SALT', 'Black Salt from Mian Umair International is a naturally sourced mineral salt known for its distinctive aroma and rich flavor profile. Originating from traditional Himalayan salt deposits, this unique seasoning is widely appreciated in culinary applications for its tangy taste and mineral richness. Carefully processed to preserve its natural characteristics, it is commonly used in snacks, salads, chutneys, and traditional dishes across many cuisines. As a reliable Himalayan salt exporter, Mian Umair International supplies premium-quality mineral salts to international markets including Sydney (Australia), Ontario (Canada), California, and Dallas (USA). Our company supports bulk supply requirements for food distributors, spice traders, and food manufacturers who need consistent quality and dependable export services. We also offer flexible packaging options suitable for wholesale distribution and international shipping. Our product portfolio includes Himalayan kala namak, fine seasoning salt, culinary mineral salt, and bulk Himalayan seasoning products for commercial and food industry use. With strict quality control and reliable supply capacity, Mian Umair International has been serving global buyers seeking trusted salt exporters and suppliers since 1995.', 'Black Salt from Mian Umair International is a naturally sourced mineral salt known for its distinctive aroma and rich flavor profile. Originating from traditional Himalayan salt deposits, this unique seasoning is widely appreciated in culinary applications for its tangy taste and mineral richness.', 0,
   (select id from public."Category" where slug = 'black-salt'),
   true, false, true, 'Black Salt | Mian Umair International', 'Black Salt from Mian Umair International is a naturally sourced mineral salt known for its distinctive aroma and rich flavor profile. Originating from tradition')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Edible Salt', 'edible-salt', 'MUI-EDIBLE-SALT', 'Edible salt from Mian Umair International is a naturally pure and high-quality product sourced from the ancient Himalayan salt deposits. Carefully processed to preserve its natural mineral composition, this food-grade salt provides a clean taste and reliable quality, making it suitable for everyday cooking, food processing, and professional culinary applications. Its natural purity and balanced minerals make it a preferred choice for households, restaurants, and food manufacturers. As an experienced Himalayan salt exporter, Mian Umair International supplies premium food-grade products to global markets, including Sydney (Australia), Ontario (Canada), California, and Dallas (USA). We handle large-scale supply requirements for businesses that need consistent availability. Our company offers flexible wholesale packaging options and efficient international export services, making global distribution smooth and reliable for our partners. Our product line includes fine food-grade salt, natural cooking salt, Himalayan table salt, and bulk salt for the food industry. With strict quality control and dependable supply capacity, Mian Umair International has been a trusted partner for companies seeking reliable salt exporters and suppliers worldwide since 1995.', 'Edible salt from Mian Umair International is a naturally pure and high-quality product sourced from the ancient Himalayan salt deposits. Carefully processed to preserve its natural mineral composition, this food-grade salt provides a clean taste and reliable quality, making it suitable for everyday cooking, food processing, and professional culinary applications.', 0,
   (select id from public."Category" where slug = 'edible-salt'),
   true, true, true, 'Edible Salt | Mian Umair International', 'Edible salt from Mian Umair International is a naturally pure and high-quality product sourced from the ancient Himalayan salt deposits. Carefully processed to ')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Crafted Lamps', 'crafted-lamps', 'MUI-CRAFTED-LAMPS', 'Mian Umair International''s crafted lamps blend natural Himalayan salt with expert craftsmanship to produce decorative lighting that elevates both ambience and interior décor. Each lamp is carefully shaped from authentic Himalayan salt crystals, producing a warm amber glow that adds elegance and comfort to homes, offices, and wellness spaces. These natural lamps are valued for their distinctive appearance, handcrafted quality, and timeless decorative appeal. As an experienced Himalayan salt product exporter, Mian Umair International supplies high-quality lighting products to international markets, including Sydney (Australia), Ontario (Canada), California, and Dallas (USA). Our company works closely with wholesalers, retailers, and interior décor suppliers by providing dependable bulk availability, tailored packaging solutions, and smooth international delivery services. Our lighting range includes Himalayan salt lamps, crystal salt lamps, decorative ambient lamps, handcrafted salt lighting, and Himalayan glow lamps, making them perfect for home décor retailers, gift stores, and wellness product outlets. With consistent quality standards and dependable export services, Mian Umair International has been a trusted supplier of Himalayan salt products worldwide since 1995.', 'Mian Umair International''s crafted lamps blend natural Himalayan salt with expert craftsmanship to produce decorative lighting that elevates both ambience and interior décor. Each lamp is carefully shaped from authentic Himalayan salt crystals, producing a warm amber glow that adds elegance and comfort to homes, offices, and wellness spaces.', 0,
   (select id from public."Category" where slug = 'crafted-lamps'),
   false, false, true, 'Crafted Lamps | Mian Umair International', 'Mian Umair International''s crafted lamps blend natural Himalayan salt with expert craftsmanship to produce decorative lighting that elevates both ambience and i')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Salt Cooking Tiles', 'salt-cooking-tiles', 'MUI-SALT-COOKING-TILES', 'Mian Umair International''s Salt Cooking Tiles are authentic Himalayan salt slabs intended for grilling, cooking, serving, and presenting food. Cut from authentic Himalayan salt deposits, these durable cooking surfaces add a subtle mineral flavour to foods while providing a unique culinary experience. They can be warmed on grills, ovens, or stovetops and are also perfect for serving cold dishes like sushi, fruits, and desserts. As a trusted exporter of Himalayan salt products, Mian Umair International supplies premium cooking slabs to international markets, including Sydney, Ontario, California, and Dallas. We support restaurants, kitchenware distributors, and retail stores with dependable bulk supply, customised packaging, and efficient global shipping solutions. We provide a range of items, including Himalayan salt cooking blocks, natural grilling slabs, salt BBQ tiles, Himalayan salt plates, and culinary salt bricks perfect for gourmet kitchens, fine dining establishments, and home cooking fans. With strict quality standards and reliable export capability, Mian Umair International has been supplying premium Himalayan salt products to global buyers since 1995.', 'Mian Umair International''s Salt Cooking Tiles are authentic Himalayan salt slabs intended for grilling, cooking, serving, and presenting food. Cut from authentic Himalayan salt deposits, these durable cooking surfaces add a subtle mineral flavour to foods while providing a unique culinary experience.', 0,
   (select id from public."Category" where slug = 'salt-cooking-tiles'),
   false, true, true, 'Salt Cooking Tiles | Mian Umair International', 'Mian Umair International''s Salt Cooking Tiles are authentic Himalayan salt slabs intended for grilling, cooking, serving, and presenting food. Cut from authenti')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Salt Tiles', 'salt-tiles', 'MUI-SALT-TILES', 'Salt Tiles are crafted from authentic Himalayan salt crystals, offering a unique combination of natural beauty and functional design. These tiles are widely used for decorative wall panels, spa rooms, wellness centres, and interior lighting installations because of their distinctive texture and warm amber appearance. Their natural composition and handcrafted finish make them a popular choice for modern architectural and decorative projects. As a trusted exporter of Himalayan salt products, Mian Umair International supplies high-quality salt tiles to international markets, including Sydney, Ontario, California, and Dallas. We support wholesalers, interior designers, spa developers, and construction distributors with reliable bulk supply, custom sizes, and efficient global shipping. Himalayan salt wall tiles, ornamental salt bricks, natural salt panels, Himalayan crystal tiles, and salt wall blocks are among the products we provide that are appropriate for use in spas, luxury interior design projects, restaurants, and wellness centres. With consistent quality standards and dependable export services, Mian Umair International has been supplying Himalayan salt products to global buyers since 1995.', 'Salt Tiles are crafted from authentic Himalayan salt crystals, offering a unique combination of natural beauty and functional design. These tiles are widely used for decorative wall panels, spa rooms, wellness centres, and interior lighting installations because of their distinctive texture and warm amber appearance.', 0,
   (select id from public."Category" where slug = 'salt-tiles'),
   false, false, true, 'Salt Tiles | Mian Umair International', 'Salt Tiles are crafted from authentic Himalayan salt crystals, offering a unique combination of natural beauty and functional design. These tiles are widely use')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Animal Licks', 'animal-licks', 'MUI-ANIMAL-LICKS', 'Animal Licks are natural Himalayan mineral blocks developed to support the nutritional needs of livestock. These salt blocks are extracted from ancient Himalayan deposits and contain naturally occurring trace minerals that animals commonly seek in their diet. Farmers often place these blocks in fields or feeding areas so cattle, horses, goats, and sheep can access essential minerals whenever needed. With years of experience in Himalayan salt exports, Mian Umair International supplies premium livestock mineral products to international markets, including Sydney, Ontario, California, and Dallas. Our company works with agricultural distributors, livestock farms, and feed suppliers by providing consistent bulk availability, export-ready packaging, and reliable global delivery. Our product range includes Himalayan salt lick blocks, livestock mineral blocks, natural animal salt blocks, cattle salt licks, and farm mineral licks designed for long-lasting outdoor use. With strict quality control and dependable production capacity, Mian Umair International has been supplying Himalayan salt products to global agricultural markets since 1995.', 'Animal Licks are natural Himalayan mineral blocks developed to support the nutritional needs of livestock. These salt blocks are extracted from ancient Himalayan deposits and contain naturally occurring trace minerals that animals commonly seek in their diet.', 0,
   (select id from public."Category" where slug = 'animal-licks'),
   false, false, true, 'Animal Licks | Mian Umair International', 'Animal Licks are natural Himalayan mineral blocks developed to support the nutritional needs of livestock. These salt blocks are extracted from ancient Himalaya')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Bath Salt', 'bath-salt', 'MUI-BATH-SALT', 'Premium Bath Salt is made from authentic Himalayan mineral crystals known for their exceptional purity and soothing qualities. Carefully processed to preserve essential trace minerals, this natural product helps create a luxurious and relaxing bathing experience. When dissolved in warm water, it produces a calming spa-like atmosphere that is widely appreciated in wellness centres, beauty spas, and personal care routines. Mian Umair International, a reputable supplier of Himalayan salt products, provides premium health minerals to international markets, such as Sydney, Ontario, California, and Dallas. We work with cosmetic brands, spa suppliers, and distributors by offering dependable bulk supply, customised packaging options, and efficient international shipping. Himalayan mineral bath crystals, natural spa salts, aromatherapy bath minerals, and coarse Himalayan bathing salts for relaxation, skincare, and wellness are all part of our product line. With strict quality control and reliable export capability, Mian Umair International proudly delivers premium Himalayan salt products that help businesses offer a refreshing and revitalising experience to their customers worldwide. Choose Mian Umair International for premium Himalayan bath salt and experience the perfect blend of natural purity, relaxation, and global quality you can trust.', 'Premium Bath Salt is made from authentic Himalayan mineral crystals known for their exceptional purity and soothing qualities. Carefully processed to preserve essential trace minerals, this natural product helps create a luxurious and relaxing bathing experience.', 0,
   (select id from public."Category" where slug = 'bath-salt'),
   false, true, true, 'Bath Salt | Mian Umair International', 'Premium Bath Salt is made from authentic Himalayan mineral crystals known for their exceptional purity and soothing qualities. Carefully processed to preserve e')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Salt Grinders', 'salt-grinders', 'MUI-SALT-GRINDERS', 'Premium Salt Grinders are designed to deliver fresh flavour and convenience for everyday cooking and professional kitchens. Our grinders are filled with authentic Himalayan salt crystals, allowing users to easily grind natural salt for seasoning meals with a rich mineral taste. These grinders are practical, easy to use, and perfect for both home kitchens and restaurant dining tables. We provide a range of grinder alternatives, such as exquisite glass grinder jars and Himalayan salt plastic grinder jars, offering long-lasting and fashionable solutions for food preparation and seasoning. The adjustable grinding mechanism allows users to choose fine or coarse salt texture, making these grinders suitable for different culinary needs. As a trusted exporter of Himalayan salt products, Mian Umair International supplies high-quality salt grinders to global markets, including Sydney, Ontario, California, and Dallas. We support wholesalers, kitchenware distributors, supermarkets, and food retailers by offering reliable bulk supply, customised packaging options, and efficient international shipping. Our grinder collection includes Himalayan salt grinders, plastic grinder jars, glass grinder jars, refillable salt mills, and premium seasoning grinders designed for retail markets, restaurants, and gourmet food brands. With strict quality control and dependable export capability, Mian Umair International proudly delivers premium Himalayan salt products that enhance flavour and add value to kitchens worldwide.', 'Premium Salt Grinders are designed to deliver fresh flavour and convenience for everyday cooking and professional kitchens. Our grinders are filled with authentic Himalayan salt crystals, allowing users to easily grind natural salt for seasoning meals with a rich mineral taste.', 0,
   (select id from public."Category" where slug = 'salt-grinders'),
   false, false, true, 'Salt Grinders | Mian Umair International', 'Premium Salt Grinders are designed to deliver fresh flavour and convenience for everyday cooking and professional kitchens. Our grinders are filled with authent')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Natural Lamps', 'natural-lamps', 'MUI-NATURAL-LAMPS', 'Powerful and high-end Himalayan natural salt lamps made from pure crystal salt are available on Mian Umair International, a reputable exporter of genuine Himalayan salt items. Our exquisitely carved Himalayan salt lamps are made to accentuate the natural beauty of homes, workplaces, spas, and wellness areas while producing a cosy, calming glow. Each natural lamp is carefully hand-shaped from genuine Himalayan rock salt, ensuring durability, purity, and a unique decorative appearance. As a reliable supplier, Mian Umair International provides high-quality Himalayan natural salt lamps, crystal salt lamps, natural rock salt lamps, and decorative Himalayan lamps with premium-quality imported electric cables for wholesalers, retailers, and global distributors in Dallas, Sydney, and Ontario. Our premium lamps combine natural elegance with excellent craftsmanship, making them ideal for interior décor, wellness environments, and gifting. Experience the amazing natural glow of Himalayan salt lamps and bring a calm, positive atmosphere to any space with our superior-quality products.', 'Powerful and high-end Himalayan natural salt lamps made from pure crystal salt are available on Mian Umair International, a reputable exporter of genuine Himalayan salt items. Our exquisitely carved Himalayan salt lamps are made to accentuate the natural beauty of homes, workplaces, spas, and wellness areas while producing a cosy, calming glow.', 0,
   (select id from public."Category" where slug = 'natural-lamps'),
   true, false, true, 'Natural Lamps | Mian Umair International', 'Powerful and high-end Himalayan natural salt lamps made from pure crystal salt are available on Mian Umair International, a reputable exporter of genuine Himala')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Candle Holders', 'candle-holders', 'MUI-CANDLE-HOLDERS', 'Light up your space with the natural glow of Himalayan salt candle holders from Mian Umair International. Each holder is carefully hand-carved from authentic Himalayan rock salt, giving your home, office, or spa a warm, soothing ambience. These salt holders aren’t just decorative—they bring a sense of calm, balance, and positive energy to any room. Every piece is unique in shape and colour, making it perfect for interior décor, meditation corners, or thoughtful gifting. Mian Umair International is a reliable exporter that supplies wholesalers, retailers, and distributors with premium natural Himalayan candle salt holders, handmade crystal salt holders, and ornamental rock salt candle holders in Dallas, Sydney, and Ontario. Experience the amazing charm and transform ordinary spaces into relaxing, beautiful havens.', 'Light up your space with the natural glow of Himalayan salt candle holders from Mian Umair International. Each holder is carefully hand-carved from authentic Himalayan rock salt, giving your home, office, or spa a warm, soothing ambience.', 0,
   (select id from public."Category" where slug = 'candle-holders'),
   false, false, true, 'Candle Holders | Mian Umair International', 'Light up your space with the natural glow of Himalayan salt candle holders from Mian Umair International. Each holder is carefully hand-carved from authentic Hi')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Salt Inhaler', 'salt-inhaler', 'MUI-SALT-INHALER', 'Relax and breathe easy with the natural Himalayan salt inhaler from Mian Umair International. Made from pure Himalayan rock salt, this inhaler helps support healthy breathing and promotes a calm, refreshing feeling anytime you need it. Our inhalers are small, portable, and easy to use at home, at work, or while travelling. Each inhaler contains genuine crystal salt, carefully selected for its natural benefits and long-lasting use. These natural inhalers are perfect for daily wellness, helping you feel refreshed, reduce stress, and enjoy cleaner, calmer air wherever you go. As a trusted exporter, Mian Umair International supplies high-quality portable salt therapy inhalers and salt crystal inhalers to wholesalers, retailers, and distributors in Dallas, Sydney, and Ontario. Experience the amazing calming benefits of Himalayan salt inhalers and add natural wellness to your daily routine.', 'Relax and breathe easy with the natural Himalayan salt inhaler from Mian Umair International. Made from pure Himalayan rock salt, this inhaler helps support healthy breathing and promotes a calm, refreshing feeling anytime you need it.', 0,
   (select id from public."Category" where slug = 'salt-inhaler'),
   false, false, true, 'Salt Inhaler | Mian Umair International', 'Relax and breathe easy with the natural Himalayan salt inhaler from Mian Umair International. Made from pure Himalayan rock salt, this inhaler helps support hea')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

insert into public."Product" (name, slug, sku, description, "shortDesc", price, "categoryId", "isFeatured", "isBestSeller", "isActive", "metaTitle", "metaDesc") values
  ('Industrial Salt', 'industrial-salt', 'MUI-INDUSTRIAL-SALT', 'Mian Umair International offers premium industrial salt that meets the highest quality standards for a wide range of industrial and commercial applications. Our salt is pure, consistent, and reliable, making it perfect for water treatment, chemical production, de-icing, and more. Our salt is carefully processed to ensure uniform size, high purity, and superior performance for every use. Trusted by manufacturers, distributors, and businesses in Dallas, Sydney, and Ontario, it delivers dependable results every time. We supply bulk, refined, and high-grade salt to wholesalers and exporters worldwide. Experience the amazing quality and reliability of Mian Umair International’s salt and keep your operations running smoothly.', 'Mian Umair International offers premium industrial salt that meets the highest quality standards for a wide range of industrial and commercial applications. Our salt is pure, consistent, and reliable, making it perfect for water treatment, chemical production, de-icing, and more.', 0,
   (select id from public."Category" where slug = 'industrial-salt'),
   false, false, true, 'Industrial Salt | Mian Umair International', 'Mian Umair International offers premium industrial salt that meets the highest quality standards for a wide range of industrial and commercial applications. Our')
on conflict (slug) do update set
  name = excluded.name,
  sku = excluded.sku,
  description = excluded.description,
  "shortDesc" = excluded."shortDesc",
  "categoryId" = excluded."categoryId",
  "isFeatured" = excluded."isFeatured",
  "isBestSeller" = excluded."isBestSeller",
  "isActive" = true,
  "metaTitle" = excluded."metaTitle",
  "metaDesc" = excluded."metaDesc";

-- ── Product images ───────────────────────────────────────────────────────
-- Rebuilt from scratch each run so the list cannot drift or duplicate.
delete from public."ProductImage" where "productId" in (select id from public."Product" where slug in ('horse-saddles', 'rice', 'black-salt', 'edible-salt', 'crafted-lamps', 'salt-cooking-tiles', 'salt-tiles', 'animal-licks', 'bath-salt', 'salt-grinders', 'natural-lamps', 'candle-holders', 'salt-inhaler', 'industrial-salt'));

insert into public."ProductImage" ("productId", url, "altText", "sortOrder", "isPrimary") values
  ((select id from public."Product" where slug = 'horse-saddles'), 'https://mianumairint.com/wp-content/uploads/2026/03/leather-saddles.webp', 'Horse Saddles', 0, true),
  ((select id from public."Product" where slug = 'horse-saddles'), '/images/products/horse-saddles/brown-saddle.webp', 'Horse Saddles', 1, false),
  ((select id from public."Product" where slug = 'horse-saddles'), '/images/products/horse-saddles/saddle-on-horse.webp', 'Horse Saddles', 2, false),
  ((select id from public."Product" where slug = 'horse-saddles'), 'https://mianumairint.com/wp-content/uploads/2026/03/saddles-for-horses.webp', 'Horse Saddles', 3, false),
  ((select id from public."Product" where slug = 'horse-saddles'), 'https://mianumairint.com/wp-content/uploads/2026/03/brown-leather-saddle.webp', 'Horse Saddles', 4, false),
  ((select id from public."Product" where slug = 'horse-saddles'), 'https://mianumairint.com/wp-content/uploads/2026/03/horse-saddles.webp', 'Horse Saddles', 5, false),
  ((select id from public."Product" where slug = 'horse-saddles'), 'https://mianumairint.com/wp-content/uploads/2026/03/all-type-saddles.webp', 'Horse Saddles', 6, false),
  ((select id from public."Product" where slug = 'horse-saddles'), 'https://mianumairint.com/wp-content/uploads/2026/03/saddle.webp', 'Horse Saddles', 7, false),
  ((select id from public."Product" where slug = 'horse-saddles'), 'https://mianumairint.com/wp-content/uploads/2026/03/black-saddle.webp', 'Horse Saddles', 8, false),
  ((select id from public."Product" where slug = 'rice'), 'https://mianumairint.com/wp-content/uploads/2026/01/riceee.webp', 'Rice', 0, true),
  ((select id from public."Product" where slug = 'rice'), 'https://mianumairint.com/wp-content/uploads/2026/01/basmati-rice.webp', 'Rice', 1, false),
  ((select id from public."Product" where slug = 'rice'), 'https://mianumairint.com/wp-content/uploads/2026/01/rice-weight.webp', 'Rice', 2, false),
  ((select id from public."Product" where slug = 'rice'), 'https://mianumairint.com/wp-content/uploads/2026/01/rice-mill.webp', 'Rice', 3, false),
  ((select id from public."Product" where slug = 'rice'), '/images/products/rice/white-rice.webp', 'Rice', 4, false),
  ((select id from public."Product" where slug = 'rice'), '/images/products/rice/rice-in-spoon.webp', 'Rice', 5, false),
  ((select id from public."Product" where slug = 'rice'), 'https://mianumairint.com/wp-content/uploads/2026/01/rice-colors.webp', 'Rice', 6, false),
  ((select id from public."Product" where slug = 'rice'), 'https://mianumairint.com/wp-content/uploads/2026/01/rice-bowl.webp', 'Rice', 7, false),
  ((select id from public."Product" where slug = 'rice'), 'https://mianumairint.com/wp-content/uploads/2026/01/rice-feed.webp', 'Rice', 8, false),
  ((select id from public."Product" where slug = 'rice'), 'https://mianumairint.com/wp-content/uploads/2026/01/rice-in-bowl.webp', 'Rice', 9, false),
  ((select id from public."Product" where slug = 'rice'), 'https://mianumairint.com/wp-content/uploads/2026/01/rice-types.webp', 'Rice', 10, false),
  ((select id from public."Product" where slug = 'rice'), 'https://mianumairint.com/wp-content/uploads/2026/01/rice-spread.webp', 'Rice', 11, false),
  ((select id from public."Product" where slug = 'rice'), 'https://mianumairint.com/wp-content/uploads/2026/01/rice-bag.webp', 'Rice', 12, false),
  ((select id from public."Product" where slug = 'black-salt'), 'https://mianumairint.com/wp-content/uploads/2026/01/salt-coarse-black.webp', 'Black Salt', 0, true),
  ((select id from public."Product" where slug = 'black-salt'), 'https://mianumairint.com/wp-content/uploads/2026/01/black-salt-1.webp', 'Black Salt', 1, false),
  ((select id from public."Product" where slug = 'black-salt'), '/images/products/black-salt/black-salt.webp', 'Black Salt', 2, false),
  ((select id from public."Product" where slug = 'black-salt'), 'https://mianumairint.com/wp-content/uploads/2026/01/black-salt-in-spoon-1.webp', 'Black Salt', 3, false),
  ((select id from public."Product" where slug = 'black-salt'), 'https://mianumairint.com/wp-content/uploads/2026/01/black-salt-coarse.webp', 'Black Salt', 4, false),
  ((select id from public."Product" where slug = 'black-salt'), 'https://mianumairint.com/wp-content/uploads/2026/01/paper-salt.webp', 'Black Salt', 5, false),
  ((select id from public."Product" where slug = 'black-salt'), 'https://mianumairint.com/wp-content/uploads/2026/01/black-paper-salt.webp', 'Black Salt', 6, false),
  ((select id from public."Product" where slug = 'black-salt'), 'https://mianumairint.com/wp-content/uploads/2026/01/blakish-salt.webp', 'Black Salt', 7, false),
  ((select id from public."Product" where slug = 'black-salt'), 'https://mianumairint.com/wp-content/uploads/2026/01/salt-black.webp', 'Black Salt', 8, false),
  ((select id from public."Product" where slug = 'black-salt'), 'https://mianumairint.com/wp-content/uploads/2026/01/black-salt-in-bottle.webp', 'Black Salt', 9, false),
  ((select id from public."Product" where slug = 'edible-salt'), '/images/products/edible-salt/salt.webp', 'Edible Salt', 0, true),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/24.webp', 'Edible Salt', 1, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/27.webp', 'Edible Salt', 2, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/5.webp', 'Edible Salt', 3, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/55.webp', 'Edible Salt', 4, false),
  ((select id from public."Product" where slug = 'edible-salt'), '/images/products/edible-salt/edible-salt-1.webp', 'Edible Salt', 5, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2021/08/1.webp', 'Edible Salt', 6, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/2.webp', 'Edible Salt', 7, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/39.webp', 'Edible Salt', 8, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/8.webp', 'Edible Salt', 9, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/6.webp', 'Edible Salt', 10, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/3.webp', 'Edible Salt', 11, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/4.webp', 'Edible Salt', 12, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/14.webp', 'Edible Salt', 13, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/7.webp', 'Edible Salt', 14, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/54.webp', 'Edible Salt', 15, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/19.webp', 'Edible Salt', 16, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/21.webp', 'Edible Salt', 17, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/3-6.webp', 'Edible Salt', 18, false),
  ((select id from public."Product" where slug = 'edible-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/29.webp', 'Edible Salt', 19, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/5.webp', 'Crafted Lamps', 0, true),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/13.webp', 'Crafted Lamps', 1, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/4.webp', 'Crafted Lamps', 2, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/6.webp', 'Crafted Lamps', 3, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2025/12/silver-stone-lamp.webp', 'Crafted Lamps', 4, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/15.webp', 'Crafted Lamps', 5, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2025/12/crafted-lamp-salt.webp', 'Crafted Lamps', 6, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/2.webp', 'Crafted Lamps', 7, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/12.webp', 'Crafted Lamps', 8, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2025/12/bird-salt-lamp.webp', 'Crafted Lamps', 9, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/49.webp', 'Crafted Lamps', 10, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/47.webp', 'Crafted Lamps', 11, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/1-1.webp', 'Crafted Lamps', 12, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), '/images/products/crafted-lamps/crafted-lamp-1.webp', 'Crafted Lamps', 13, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/7.webp', 'Crafted Lamps', 14, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2025/12/elephant-salt-lamp.webp', 'Crafted Lamps', 15, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2025/12/pyramid-salt-lamp.webp', 'Crafted Lamps', 16, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/38.webp', 'Crafted Lamps', 17, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/3.webp', 'Crafted Lamps', 18, false),
  ((select id from public."Product" where slug = 'crafted-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/11.webp', 'Crafted Lamps', 19, false),
  ((select id from public."Product" where slug = 'salt-cooking-tiles'), '/images/products/salt-cooking-tiles/salt-blocks-2.webp', 'Salt Cooking Tiles', 0, true),
  ((select id from public."Product" where slug = 'salt-cooking-tiles'), 'https://mianumairint.com/wp-content/uploads/2025/10/3-1.webp', 'Salt Cooking Tiles', 1, false),
  ((select id from public."Product" where slug = 'salt-cooking-tiles'), '/images/products/salt-cooking-tiles/salt-blocks.webp', 'Salt Cooking Tiles', 2, false),
  ((select id from public."Product" where slug = 'salt-cooking-tiles'), 'https://mianumairint.com/wp-content/uploads/2025/10/56.webp', 'Salt Cooking Tiles', 3, false),
  ((select id from public."Product" where slug = 'salt-cooking-tiles'), 'https://mianumairint.com/wp-content/uploads/2025/10/2-1.webp', 'Salt Cooking Tiles', 4, false),
  ((select id from public."Product" where slug = 'salt-cooking-tiles'), 'https://mianumairint.com/wp-content/uploads/2025/10/4-5.webp', 'Salt Cooking Tiles', 5, false),
  ((select id from public."Product" where slug = 'salt-cooking-tiles'), 'https://mianumairint.com/wp-content/uploads/2025/10/53.webp', 'Salt Cooking Tiles', 6, false),
  ((select id from public."Product" where slug = 'salt-tiles'), 'https://mianumairint.com/wp-content/uploads/2021/08/4-1.webp', 'Salt Tiles', 0, true),
  ((select id from public."Product" where slug = 'salt-tiles'), 'https://mianumairint.com/wp-content/uploads/2021/08/3-1.webp', 'Salt Tiles', 1, false),
  ((select id from public."Product" where slug = 'salt-tiles'), '/images/products/salt-tiles/salt-tiles-1.webp', 'Salt Tiles', 2, false),
  ((select id from public."Product" where slug = 'salt-tiles'), 'https://mianumairint.com/wp-content/uploads/2021/08/1-2.webp', 'Salt Tiles', 3, false),
  ((select id from public."Product" where slug = 'salt-tiles'), 'https://mianumairint.com/wp-content/uploads/2021/08/5-1.webp', 'Salt Tiles', 4, false),
  ((select id from public."Product" where slug = 'salt-tiles'), 'https://mianumairint.com/wp-content/uploads/2021/08/2-1.webp', 'Salt Tiles', 5, false),
  ((select id from public."Product" where slug = 'salt-tiles'), 'https://mianumairint.com/wp-content/uploads/2021/08/6-1.webp', 'Salt Tiles', 6, false),
  ((select id from public."Product" where slug = 'animal-licks'), '/images/products/animal-licks/animal-lick.png', 'Animal Licks', 0, true),
  ((select id from public."Product" where slug = 'animal-licks'), 'https://mianumairint.com/wp-content/uploads/2021/08/Canva.png', 'Animal Licks', 1, false),
  ((select id from public."Product" where slug = 'animal-licks'), 'https://mianumairint.com/wp-content/uploads/2025/10/3-2.webp', 'Animal Licks', 2, false),
  ((select id from public."Product" where slug = 'animal-licks'), 'https://mianumairint.com/wp-content/uploads/2025/10/42.webp', 'Animal Licks', 3, false),
  ((select id from public."Product" where slug = 'animal-licks'), 'https://mianumairint.com/wp-content/uploads/2025/10/50.webp', 'Animal Licks', 4, false),
  ((select id from public."Product" where slug = 'bath-salt'), '/images/products/bath-salt/bath-salt-1.webp', 'Bath Salt', 0, true),
  ((select id from public."Product" where slug = 'bath-salt'), 'https://mianumairint.com/wp-content/uploads/2021/08/4-2.webp', 'Bath Salt', 1, false),
  ((select id from public."Product" where slug = 'bath-salt'), 'https://mianumairint.com/wp-content/uploads/2021/08/3-3.webp', 'Bath Salt', 2, false),
  ((select id from public."Product" where slug = 'bath-salt'), 'https://mianumairint.com/wp-content/uploads/2021/08/1-3.webp', 'Bath Salt', 3, false),
  ((select id from public."Product" where slug = 'bath-salt'), 'https://mianumairint.com/wp-content/uploads/2021/08/2-2.webp', 'Bath Salt', 4, false),
  ((select id from public."Product" where slug = 'salt-grinders'), '/images/products/salt-grinders/salt-grinders-group.webp', 'Salt Grinders', 0, true),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2021/08/grinders.jpg', 'Salt Grinders', 1, false),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2021/08/2-3.webp', 'Salt Grinders', 2, false),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2021/08/1-4.webp', 'Salt Grinders', 3, false),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2025/10/52.webp', 'Salt Grinders', 4, false),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2025/10/18.webp', 'Salt Grinders', 5, false),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2021/08/4-3.webp', 'Salt Grinders', 6, false),
  ((select id from public."Product" where slug = 'salt-grinders'), '/images/products/salt-grinders/salt-grinder.webp', 'Salt Grinders', 7, false),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2025/10/6-1.webp', 'Salt Grinders', 8, false),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2025/10/2-6.webp', 'Salt Grinders', 9, false),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2025/10/17.webp', 'Salt Grinders', 10, false),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2025/10/26.webp', 'Salt Grinders', 11, false),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2025/10/35.webp', 'Salt Grinders', 12, false),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2025/10/30.webp', 'Salt Grinders', 13, false),
  ((select id from public."Product" where slug = 'salt-grinders'), 'https://mianumairint.com/wp-content/uploads/2025/10/31.webp', 'Salt Grinders', 14, false),
  ((select id from public."Product" where slug = 'natural-lamps'), '/images/products/natural-lamps/natural-lamps-group.webp', 'Natural Lamps', 0, true),
  ((select id from public."Product" where slug = 'natural-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/Natural-Lamp.webp', 'Natural Lamps', 1, false),
  ((select id from public."Product" where slug = 'natural-lamps'), '/images/products/natural-lamps/natural-lamp-1.webp', 'Natural Lamps', 2, false),
  ((select id from public."Product" where slug = 'natural-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/41.webp', 'Natural Lamps', 3, false),
  ((select id from public."Product" where slug = 'natural-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/1-5.webp', 'Natural Lamps', 4, false),
  ((select id from public."Product" where slug = 'natural-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/4-4.webp', 'Natural Lamps', 5, false),
  ((select id from public."Product" where slug = 'natural-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/40.webp', 'Natural Lamps', 6, false),
  ((select id from public."Product" where slug = 'natural-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/2-4.webp', 'Natural Lamps', 7, false),
  ((select id from public."Product" where slug = 'natural-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/5-2.webp', 'Natural Lamps', 8, false),
  ((select id from public."Product" where slug = 'natural-lamps'), 'https://mianumairint.com/wp-content/uploads/2021/08/33.webp', 'Natural Lamps', 9, false),
  ((select id from public."Product" where slug = 'candle-holders'), '/images/products/candle-holders/candle-holders-group.webp', 'Candle Holders', 0, true),
  ((select id from public."Product" where slug = 'candle-holders'), 'https://mianumairint.com/wp-content/uploads/2025/12/salt-candle-holder.webp', 'Candle Holders', 1, false),
  ((select id from public."Product" where slug = 'candle-holders'), 'https://mianumairint.com/wp-content/uploads/2025/10/4-2.webp', 'Candle Holders', 2, false),
  ((select id from public."Product" where slug = 'candle-holders'), 'https://mianumairint.com/wp-content/uploads/2025/12/candle-holder-salt.webp', 'Candle Holders', 3, false),
  ((select id from public."Product" where slug = 'candle-holders'), 'https://mianumairint.com/wp-content/uploads/2025/10/2-3.webp', 'Candle Holders', 4, false),
  ((select id from public."Product" where slug = 'candle-holders'), '/images/products/candle-holders/salt-candle-holders.webp', 'Candle Holders', 5, false),
  ((select id from public."Product" where slug = 'candle-holders'), 'https://mianumairint.com/wp-content/uploads/2025/12/heart-candle-holder.webp', 'Candle Holders', 6, false),
  ((select id from public."Product" where slug = 'candle-holders'), 'https://mianumairint.com/wp-content/uploads/2025/10/3-3.webp', 'Candle Holders', 7, false),
  ((select id from public."Product" where slug = 'salt-inhaler'), 'https://mianumairint.com/wp-content/uploads/2025/10/4-3.webp', 'Salt Inhaler', 0, true),
  ((select id from public."Product" where slug = 'salt-inhaler'), 'https://mianumairint.com/wp-content/uploads/2021/04/22.webp', 'Salt Inhaler', 1, false),
  ((select id from public."Product" where slug = 'salt-inhaler'), 'https://mianumairint.com/wp-content/uploads/2021/04/36.webp', 'Salt Inhaler', 2, false),
  ((select id from public."Product" where slug = 'salt-inhaler'), 'https://mianumairint.com/wp-content/uploads/2025/10/2-4.webp', 'Salt Inhaler', 3, false),
  ((select id from public."Product" where slug = 'salt-inhaler'), 'https://mianumairint.com/wp-content/uploads/2021/04/10.webp', 'Salt Inhaler', 4, false),
  ((select id from public."Product" where slug = 'salt-inhaler'), 'https://mianumairint.com/wp-content/uploads/2025/10/3-4.webp', 'Salt Inhaler', 5, false),
  ((select id from public."Product" where slug = 'industrial-salt'), 'https://mianumairint.com/wp-content/uploads/2021/03/IMG-20251031-WA0005.jpg', 'Industrial Salt', 0, true),
  ((select id from public."Product" where slug = 'industrial-salt'), 'https://mianumairint.com/wp-content/uploads/2021/03/IMG-20251031-WA0003.jpg', 'Industrial Salt', 1, false),
  ((select id from public."Product" where slug = 'industrial-salt'), 'https://mianumairint.com/wp-content/uploads/2021/03/IMG-20251031-WA0006.jpg', 'Industrial Salt', 2, false),
  ((select id from public."Product" where slug = 'industrial-salt'), 'https://mianumairint.com/wp-content/uploads/2021/03/IMG-20251031-WA0004.jpg', 'Industrial Salt', 3, false),
  ((select id from public."Product" where slug = 'industrial-salt'), 'https://mianumairint.com/wp-content/uploads/2021/03/IMG-20251031-WA0007.jpg', 'Industrial Salt', 4, false),
  ((select id from public."Product" where slug = 'industrial-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/3-5.webp', 'Industrial Salt', 5, false),
  ((select id from public."Product" where slug = 'industrial-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/4-4.webp', 'Industrial Salt', 6, false),
  ((select id from public."Product" where slug = 'industrial-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/1-2.webp', 'Industrial Salt', 7, false),
  ((select id from public."Product" where slug = 'industrial-salt'), 'https://mianumairint.com/wp-content/uploads/2025/10/2-5.webp', 'Industrial Salt', 8, false);

commit;
