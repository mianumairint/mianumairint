import { yearsInBusiness } from "@/lib/company-age";

const reasons = [
  {
    icon: "factory",
    title: "Direct from Source",
    description:
      "We own our production. No middlemen. Salt straight from Khewra mines to your warehouse.",
  },
  {
    icon: "verified",
    title: `${yearsInBusiness()} Years of Trust`,
    description:
      "Since 1995, consistent quality and on-time delivery to buyers in 30+ countries worldwide.",
  },
  {
    icon: "local_shipping",
    title: "Flexible Packaging",
    description:
      "From 500g retail pouches to 25kg bulk sacks. Custom branding and private label available.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-surface-container-low py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-headline text-3xl lg:text-4xl text-center text-on-surface mb-12">
          Why Buyers Choose Mian Umair International
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="bg-surface-container-lowest rounded-xl p-8 hover:tonal-shadow transition-shadow duration-300"
            >
              {/* Icon */}
              <div className="mineral-glow w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-white text-xl">
                  {reason.icon}
                </span>
              </div>

              <h3 className="font-headline text-xl text-on-surface mb-3">
                {reason.title}
              </h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
