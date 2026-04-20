import type { Deal } from "./types";

export function sumAmount(deals: Deal[]): number {
  return deals.reduce((a, d) => a + d.amount_usd_millions, 0);
}

export function byKey<T extends string>(
  deals: Deal[],
  keyFn: (d: Deal) => T,
): { key: T; count: number; total: number }[] {
  const m = new Map<T, { count: number; total: number }>();
  for (const d of deals) {
    const k = keyFn(d);
    const cur = m.get(k) ?? { count: 0, total: 0 };
    cur.count += 1;
    cur.total += d.amount_usd_millions;
    m.set(k, cur);
  }
  return Array.from(m.entries())
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.total - a.total);
}

export function topInvestors(
  deals: Deal[],
  limit = 12,
): { name: string; leads: number; deals: number; capitalLed: number }[] {
  const m = new Map<string, { leads: number; deals: number; capitalLed: number }>();
  for (const d of deals) {
    const names = new Set<string>([d.lead_investor, ...d.other_investors].filter(Boolean));
    for (const n of names) {
      if (!n || /undisclosed/i.test(n)) continue;
      const cur = m.get(n) ?? { leads: 0, deals: 0, capitalLed: 0 };
      cur.deals += 1;
      if (n === d.lead_investor) {
        cur.leads += 1;
        cur.capitalLed += d.amount_usd_millions;
      }
      m.set(n, cur);
    }
  }
  return Array.from(m.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.leads - a.leads || b.deals - a.deals || b.capitalLed - a.capitalLed)
    .slice(0, limit);
}

export function byWeek(deals: Deal[]): { week: string; total: number; count: number }[] {
  const m = new Map<string, { total: number; count: number }>();
  for (const d of deals) {
    const dt = new Date(d.announced_date + "T00:00:00Z");
    // Week starting Monday
    const day = (dt.getUTCDay() + 6) % 7;
    dt.setUTCDate(dt.getUTCDate() - day);
    const k = dt.toISOString().slice(0, 10);
    const cur = m.get(k) ?? { total: 0, count: 0 };
    cur.total += d.amount_usd_millions;
    cur.count += 1;
    m.set(k, cur);
  }
  return Array.from(m.entries())
    .map(([week, v]) => ({ week, ...v }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

export function formatMoney(m: number): string {
  if (m >= 1000) return `$${(m / 1000).toFixed(m >= 10000 ? 1 : 2)}B`;
  if (m >= 1) return `$${m.toFixed(0)}M`;
  return `$${(m * 1000).toFixed(0)}K`;
}
