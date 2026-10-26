"use client";

import { useState } from "react";

const zones = [
  {
    id: 1,
    name: "North America",
    countries: ["United States", "Canada"],
    rates: [
      { method: "Standard Shipping", minWeight: "0 kg", maxWeight: "5 kg", price: "$12.00", est: "5-7 days" },
      { method: "Standard Shipping", minWeight: "5 kg", maxWeight: "20 kg", price: "$25.00", est: "5-7 days" },
      { method: "Express Shipping", minWeight: "0 kg", maxWeight: "20 kg", price: "$35.00", est: "2-3 days" },
    ],
    freeAbove: "$150.00",
  },
  {
    id: 2,
    name: "Europe",
    countries: ["Germany", "France", "United Kingdom", "Italy", "Spain", "Netherlands"],
    rates: [
      { method: "Standard Shipping", minWeight: "0 kg", maxWeight: "5 kg", price: "$18.00", est: "7-10 days" },
      { method: "Standard Shipping", minWeight: "5 kg", maxWeight: "20 kg", price: "$32.00", est: "7-10 days" },
      { method: "Express Shipping", minWeight: "0 kg", maxWeight: "20 kg", price: "$45.00", est: "3-5 days" },
    ],
    freeAbove: "$200.00",
  },
  {
    id: 3,
    name: "Middle East",
    countries: ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain"],
    rates: [
      { method: "Standard Shipping", minWeight: "0 kg", maxWeight: "10 kg", price: "$15.00", est: "5-7 days" },
      { method: "Standard Shipping", minWeight: "10 kg", maxWeight: "50 kg", price: "$28.00", est: "5-7 days" },
    ],
    freeAbove: "$250.00",
  },
  {
    id: 4,
    name: "Asia Pacific",
    countries: ["Japan", "China", "Australia", "Singapore", "South Korea"],
    rates: [
      { method: "Standard Shipping", minWeight: "0 kg", maxWeight: "5 kg", price: "$20.00", est: "10-14 days" },
      { method: "Express Shipping", minWeight: "0 kg", maxWeight: "5 kg", price: "$40.00", est: "5-7 days" },
    ],
    freeAbove: "$300.00",
  },
  {
    id: 5,
    name: "Pakistan (Domestic)",
    countries: ["Pakistan"],
    rates: [
      { method: "Standard", minWeight: "0 kg", maxWeight: "10 kg", price: "Rs. 250", est: "3-5 days" },
      { method: "Express", minWeight: "0 kg", maxWeight: "10 kg", price: "Rs. 500", est: "1-2 days" },
    ],
    freeAbove: "Rs. 5,000",
  },
];

export default function ShippingPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl text-on-surface">Shipping Zones</h1>

      <div className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/30">
              {["Zone", "Countries", "Rates", "Free Above", ""].map((h) => (
                <th key={h} className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <>
                <tr
                  key={zone.id}
                  className="border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition cursor-pointer"
                  onClick={() => setExpanded(expanded === zone.id ? null : zone.id)}
                >
                  <td className="px-6 py-3 font-label text-sm font-medium text-on-surface">{zone.name}</td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">
                    {zone.countries.join(", ")}
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface-variant">
                    {zone.rates.length} rate{zone.rates.length > 1 ? "s" : ""}
                  </td>
                  <td className="px-6 py-3 font-body text-sm text-on-surface">{zone.freeAbove}</td>
                  <td className="px-6 py-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                      {expanded === zone.id ? "expand_less" : "expand_more"}
                    </span>
                  </td>
                </tr>
                {expanded === zone.id && (
                  <tr key={`${zone.id}-expanded`}>
                    <td colSpan={5} className="px-6 py-4 bg-surface-container-low/30">
                      <table className="w-full">
                        <thead>
                          <tr>
                            {["Method", "Min Weight", "Max Weight", "Price", "Est. Delivery"].map((h) => (
                              <th key={h} className="text-left py-2 pr-4 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {zone.rates.map((rate, i) => (
                            <tr key={i} className="border-t border-outline-variant/10">
                              <td className="py-2 pr-4 font-body text-sm text-on-surface">{rate.method}</td>
                              <td className="py-2 pr-4 font-body text-sm text-on-surface-variant">{rate.minWeight}</td>
                              <td className="py-2 pr-4 font-body text-sm text-on-surface-variant">{rate.maxWeight}</td>
                              <td className="py-2 pr-4 font-body text-sm text-on-surface">{rate.price}</td>
                              <td className="py-2 pr-4 font-body text-sm text-on-surface-variant">{rate.est}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <button className="mt-3 font-label text-sm text-primary hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Edit Rates
                      </button>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
