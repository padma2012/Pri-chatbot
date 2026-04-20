import { Deal } from "@/lib/types";
import { formatMoney, sumAmount } from "@/lib/aggregate";

export function Masthead({
  deals,
  generatedAt,
  windowStart,
  windowEnd,
}: {
  deals: Deal[];
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
}) {
  const total = sumAmount(deals);
  const issue = new Date(generatedAt);
  const issueStr = issue.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const fmt = (iso: string) =>
    new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <header className="border-b border-ink-700 bg-ink-950 grain">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-ink-400">
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-accent-gold" />
            <span className="font-mono">Volume I · Issue 01</span>
          </div>
          <div className="font-mono">{issueStr}</div>
        </div>

        <h1
          className="mt-6 font-serif text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight text-ink-50"
          style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
        >
          The AI Funding Brief
        </h1>
        <p className="mt-4 max-w-3xl text-ink-300 text-lg">
          A trailing-60-day research report on every publicly disclosed Series&nbsp;A and
          Series&nbsp;B financing across artificial intelligence —
          <span className="text-ink-200"> {fmt(windowStart)} to {fmt(windowEnd)}</span>.
        </p>

        <div className="mt-8 hairline" />

        <dl className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-6 text-ink-200">
          <div>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-ink-400">Deals Tracked</dt>
            <dd className="mt-1 font-serif text-3xl num" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
              {deals.length}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-ink-400">Capital Deployed</dt>
            <dd className="mt-1 font-serif text-3xl num" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
              {formatMoney(total)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-ink-400">Series A</dt>
            <dd className="mt-1 font-serif text-3xl num" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
              {deals.filter((d) => d.round_stage === "Series A").length}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-[0.2em] text-ink-400">Series B</dt>
            <dd className="mt-1 font-serif text-3xl num" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
              {deals.filter((d) => d.round_stage === "Series B").length}
            </dd>
          </div>
        </dl>
      </div>
    </header>
  );
}
