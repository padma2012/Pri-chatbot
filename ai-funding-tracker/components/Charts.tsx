"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { Deal } from "@/lib/types";
import { byKey, byWeek, topInvestors, formatMoney } from "@/lib/aggregate";

const PALETTE = [
  "#c9a96e",
  "#d4c19c",
  "#8a7348",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
  "#b8935f",
  "#7a6540",
  "#e5d4a8",
  "#57606f",
  "#a08558",
  "#e5e7eb",
  "#3a4049",
  "#d9bf8a",
];

const AXIS = { stroke: "#6b7280", fontSize: 11 };

export function SectorChart({ deals }: { deals: Deal[] }) {
  const data = byKey(deals, (d) => d.sector).map((r) => ({
    name: r.key,
    capital: Math.round(r.total),
    deals: r.count,
  }));
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 40, top: 8 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#20242c" horizontal={false} />
        <XAxis type="number" {...AXIS} tickFormatter={(v) => `$${v}M`} />
        <YAxis type="category" dataKey="name" width={150} {...AXIS} />
        <Tooltip
          cursor={{ fill: "rgba(201,169,110,0.06)" }}
          contentStyle={{ background: "#111317", border: "1px solid #2b3039", borderRadius: 6 }}
          labelStyle={{ color: "#e5e7eb" }}
          formatter={(val: number, key) =>
            key === "capital" ? [formatMoney(val), "Capital"] : [val, "Deals"]
          }
        />
        <Bar dataKey="capital" fill="#c9a96e" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StagePie({ deals }: { deals: Deal[] }) {
  const data = byKey(deals, (d) => d.round_stage).map((r) => ({
    name: r.key,
    value: Math.round(r.total),
    count: r.count,
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={2}
          stroke="#0a0b0d"
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? "#c9a96e" : "#6b7280"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#111317", border: "1px solid #2b3039", borderRadius: 6 }}
          formatter={(val: number, _n, p: any) => [
            `${formatMoney(val)} · ${p.payload.count} deals`,
            p.payload.name,
          ]}
        />
        <Legend
          verticalAlign="bottom"
          iconType="square"
          wrapperStyle={{ color: "#d1d5db", fontSize: 12, paddingTop: 10 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function InvestorChart({ deals }: { deals: Deal[] }) {
  const data = topInvestors(deals, 12).map((r) => ({
    name: r.name,
    leads: r.leads,
    deals: r.deals,
  }));
  return (
    <ResponsiveContainer width="100%" height={440}>
      <BarChart data={data} layout="vertical" margin={{ left: 30, right: 40, top: 8 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#20242c" horizontal={false} />
        <XAxis type="number" {...AXIS} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={170} {...AXIS} />
        <Tooltip
          cursor={{ fill: "rgba(201,169,110,0.06)" }}
          contentStyle={{ background: "#111317", border: "1px solid #2b3039", borderRadius: 6 }}
        />
        <Legend wrapperStyle={{ color: "#d1d5db", fontSize: 12 }} />
        <Bar dataKey="leads" name="Rounds led" stackId="a" fill="#c9a96e" radius={[0, 0, 0, 0]} />
        <Bar
          dataKey="deals"
          name="Participations (incl. lead)"
          stackId="b"
          fill="#3a4049"
          radius={[0, 3, 3, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function WeeklyChart({ deals }: { deals: Deal[] }) {
  const data = byWeek(deals).map((r) => ({
    week: r.week.slice(5),
    capital: Math.round(r.total),
    count: r.count,
  }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ left: 10, right: 20, top: 8 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#20242c" />
        <XAxis dataKey="week" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={(v) => `$${v}M`} />
        <Tooltip
          contentStyle={{ background: "#111317", border: "1px solid #2b3039", borderRadius: 6 }}
          formatter={(val: number, name) =>
            name === "capital" ? [formatMoney(val), "Capital"] : [val, "Deals"]
          }
        />
        <Line type="monotone" dataKey="capital" stroke="#c9a96e" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function GeoChart({ deals }: { deals: Deal[] }) {
  const data = byKey(deals, (d) => d.hq_country || "Unknown")
    .slice(0, 10)
    .map((r) => ({ name: r.key, capital: Math.round(r.total), deals: r.count }));
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ left: 10, right: 20, top: 8 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#20242c" vertical={false} />
        <XAxis dataKey="name" {...AXIS} angle={-15} textAnchor="end" height={60} />
        <YAxis {...AXIS} tickFormatter={(v) => `$${v}M`} />
        <Tooltip
          cursor={{ fill: "rgba(201,169,110,0.06)" }}
          contentStyle={{ background: "#111317", border: "1px solid #2b3039", borderRadius: 6 }}
          formatter={(val: number, key) =>
            key === "capital" ? [formatMoney(val), "Capital"] : [val, "Deals"]
          }
        />
        <Bar dataKey="capital" fill="#c9a96e" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export { PALETTE };
