"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatCurrencyCompact as formatCurrency } from "@/lib/format";

// Generate sample revenue data for the last 30 days
function generateSampleData() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Deterministic pseudo-random based on day to avoid hydration mismatch
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    const revenue = 500 + ((seed * 9301 + 49297) % 4500);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Math.round(revenue),
    });
  }
  return data;
}

const data = generateSampleData();

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-container-lowest rounded-lg tonal-shadow px-3 py-2 border border-outline-variant/20">
        <p className="font-label text-xs text-on-surface-variant">{label}</p>
        <p className="font-headline text-sm text-on-surface">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export default function RevenueChart() {
  return (
    <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
      <h2 className="font-headline text-lg text-on-surface mb-4">
        Revenue (Last 30 Days)
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8f473e" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#8f473e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#8f473e"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
