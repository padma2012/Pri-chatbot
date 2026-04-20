import { Deal } from "@/lib/types";
import { formatMoney, topInvestors } from "@/lib/aggregate";

export function LeagueTable({ deals }: { deals: Deal[] }) {
  const rows = topInvestors(deals, 15);
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 shadow-card overflow-hidden">
      <div className="px-5 pt-5 pb-3 border-b border-ink-800">
        <h3 className="font-medium text-ink-100 tracking-tight">League Table · Most Active Investors</h3>
        <p className="mt-1 text-sm text-ink-400">Ranked by rounds led in the trailing 60 days.</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-ink-800">
            <th className="px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium w-10">#</th>
            <th className="px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium">Investor</th>
            <th className="px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium text-right">Led</th>
            <th className="px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium text-right">Total deals</th>
            <th className="px-5 py-2 text-[11px] uppercase tracking-[0.18em] text-ink-400 font-medium text-right">Capital led</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name} className="border-b border-ink-800">
              <td className="px-5 py-3 text-ink-500 num">{String(i + 1).padStart(2, "0")}</td>
              <td className="px-5 py-3 text-ink-100">{r.name}</td>
              <td className="px-5 py-3 text-right num text-accent-gold">{r.leads}</td>
              <td className="px-5 py-3 text-right num text-ink-200">{r.deals}</td>
              <td className="px-5 py-3 text-right num text-ink-200">{formatMoney(r.capitalLed)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-ink-400">
                No investor activity yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
