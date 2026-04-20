import { Deal } from "@/lib/types";

export function Methodology({
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
  const sources = Array.from(new Set(deals.map((d) => new URL(d.source_url).hostname.replace(/^www\./, ""))))
    .sort()
    .slice(0, 14);

  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <div className="grid md:grid-cols-3 gap-10">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-accent-gold font-mono">Colophon</div>
          <h3
            className="mt-2 font-serif text-3xl text-ink-50"
            style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
          >
            Methodology
          </h3>
        </div>
        <div className="md:col-span-2 space-y-4 text-ink-300 leading-relaxed">
          <p>
            This brief aggregates publicly reported Series&nbsp;A and Series&nbsp;B financings of
            AI-primary companies announced between <span className="text-ink-100">{windowStart}</span> and{" "}
            <span className="text-ink-100">{windowEnd}</span>. A company is considered
            &ldquo;AI-primary&rdquo; when artificial intelligence is the core product, not an enabling
            feature.
          </p>
          <p>
            Coverage is best-effort from public disclosures — company press releases, tier-one
            financial press, and trade publications. Valuations are included only when explicitly
            disclosed by the company or its investors; undisclosed valuations are left blank rather
            than estimated. Where a deal is reported in multiple outlets, we cite the most
            authoritative source.
          </p>
          <p>
            The dataset refreshes on a daily schedule via an automated pipeline
            (<code className="text-ink-200 font-mono text-sm">scripts/fetch-deals.ts</code>). Known
            limitations: private / stealth rounds, regional deals outside English-language press, and
            round extensions labeled differently by different outlets may be under-represented. A
            paid data provider (Crunchbase, PitchBook) is required for truly exhaustive coverage.
          </p>
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-400 font-mono mb-2">
              Sources cited
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map((s) => (
                <span
                  key={s}
                  className="text-xs font-mono px-2 py-1 border border-ink-700 rounded text-ink-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-ink-500 pt-4 border-t border-ink-800">
            Report generated {new Date(generatedAt).toUTCString()}. Not investment advice.
          </p>
        </div>
      </div>
    </section>
  );
}
