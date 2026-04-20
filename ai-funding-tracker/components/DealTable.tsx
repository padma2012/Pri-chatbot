"use client";

import { useMemo, useState } from "react";
import { Deal } from "@/lib/types";
import { formatMoney } from "@/lib/aggregate";

type SortKey = "announced_date" | "amount_usd_millions" | "company_name" | "sector";

export function DealTable({ deals }: { deals: Deal[] }) {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<"All" | "Series A" | "Series B">("All");
  const [sector, setSector] = useState<string>("All");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "amount_usd_millions",
    dir: "desc",
  });

  const sectors = useMemo(
    () => Array.from(new Set(deals.map((d) => d.sector))).sort(),
    [deals],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return deals
      .filter((d) => (stage === "All" ? true : d.round_stage === stage))
      .filter((d) => (sector === "All" ? true : d.sector === sector))
      .filter((d) => {
        if (!needle) return true;
        return (
          d.company_name.toLowerCase().includes(needle) ||
          d.lead_investor.toLowerCase().includes(needle) ||
          d.description.toLowerCase().includes(needle) ||
          d.other_investors.join(" ").toLowerCase().includes(needle)
        );
      })
      .sort((a, b) => {
        const k = sort.key;
        const av = a[k] as any;
        const bv = b[k] as any;
        if (av === bv) return 0;
        const cmp = av > bv ? 1 : -1;
        return sort.dir === "asc" ? cmp : -cmp;
      });
  }, [deals, q, stage, sector, sort]);

  const header = (key: SortKey, label: string, align: "left" | "right" = "left") => (
    <th
      scope="col"
      onClick={() =>
        setSort((s) =>
          s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" },
        )
      }
      className={
        "px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium cursor-pointer select-none hover:text-accent-gold " +
        (align === "right" ? "text-right" : "text-left")
      }
    >
      {label}
      {sort.key === key && <span className="ml-1 text-accent-gold">{sort.dir === "asc" ? "▲" : "▼"}</span>}
    </th>
  );

  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 shadow-card">
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-ink-800">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search company, investor, thesis…"
          className="flex-1 bg-ink-950 border border-ink-700 rounded px-3 py-2 text-sm text-ink-100 placeholder-ink-400 focus:outline-none focus:border-accent-gold"
        />
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value as any)}
          className="bg-ink-950 border border-ink-700 rounded px-3 py-2 text-sm text-ink-100"
        >
          <option>All</option>
          <option>Series A</option>
          <option>Series B</option>
        </select>
        <select
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="bg-ink-950 border border-ink-700 rounded px-3 py-2 text-sm text-ink-100"
        >
          <option>All</option>
          {sectors.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="bg-ink-900 sticky top-0">
            <tr className="border-b border-ink-800">
              {header("company_name", "Company")}
              {header("sector", "Sector")}
              <th className="px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium">Stage</th>
              {header("amount_usd_millions", "Raised", "right")}
              <th className="px-3 py-2 text-right text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium">
                Valuation
              </th>
              <th className="px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium">Lead</th>
              {header("announced_date", "Announced")}
              <th className="px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium">Thesis</th>
              <th className="px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr
                key={d.company_name + d.announced_date}
                className="border-b border-ink-800 hover:bg-ink-800/40 align-top"
              >
                <td className="px-3 py-3">
                  <div className="font-medium text-ink-100">{d.company_name}</div>
                  <div className="text-xs text-ink-400 mt-0.5">{d.hq_country}</div>
                </td>
                <td className="px-3 py-3 text-ink-300 whitespace-nowrap">{d.sector}</td>
                <td className="px-3 py-3">
                  <span
                    className={
                      "text-xs px-2 py-0.5 rounded border " +
                      (d.round_stage === "Series A"
                        ? "border-accent-gold/40 text-accent-gold"
                        : "border-ink-500 text-ink-200")
                    }
                  >
                    {d.round_stage}
                  </span>
                </td>
                <td className="px-3 py-3 text-right num font-medium text-ink-100">
                  {formatMoney(d.amount_usd_millions)}
                </td>
                <td className="px-3 py-3 text-right num text-ink-300">
                  {d.valuation_usd_millions ? formatMoney(d.valuation_usd_millions) : <span className="text-ink-500">—</span>}
                </td>
                <td className="px-3 py-3 text-ink-200 whitespace-nowrap">{d.lead_investor}</td>
                <td className="px-3 py-3 text-ink-300 whitespace-nowrap num">{d.announced_date}</td>
                <td className="px-3 py-3 text-ink-300 max-w-[26rem]">{d.description}</td>
                <td className="px-3 py-3">
                  <a
                    href={d.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-gold hover:underline text-xs"
                    title={d.source_title}
                  >
                    link ↗
                  </a>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-ink-400">
                  No deals match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-ink-800 text-xs text-ink-400">
        <span>
          Showing <span className="text-ink-100 num">{filtered.length}</span> of{" "}
          <span className="text-ink-100 num">{deals.length}</span> deals
        </span>
        <span className="font-mono">Click a column header to re-sort.</span>
      </div>
    </div>
  );
}
