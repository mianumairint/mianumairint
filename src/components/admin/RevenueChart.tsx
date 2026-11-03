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

export interface RevenuePoint {
  /** UTC day, YYYY-MM-DD */
  date: string;
  revenue: number;
}

function dayLabel(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

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

export default function RevenueChart({ data, loading }: { data: RevenuePoint[]; loading?: boolean }) {
  const points = data.map((d) => ({ date: dayLabel(d.date), revenue: d.revenue }));
  const empty = !loading && points.every((p) => p.revenue === 0);
  return (
    <div className="bg-surface-container-lowest rounded-xl tonal-shadow p-6">
      <h2 className="font-headline text-lg text-on-surface mb-4">
        Revenue (Last 30 Days)
      </h2>
      <div className="h-64 relative">
        {loading && <div className="absolute inset-0 rounded-lg bg-on-surface/5 animate-pulse" />}
        {empty && (
          <p className="absolute inset-0 z-10 flex items-center justify-center font-label text-sm text-on-surface-variant pointer-events-none">
            No paid orders in the last 30 days
          </p>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
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
