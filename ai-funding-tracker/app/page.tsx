import { Masthead } from "@/components/Masthead";
import { Section, Card } from "@/components/Section";
import {
  SectorChart,
  StagePie,
  InvestorChart,
  WeeklyChart,
  GeoChart,
} from "@/components/Charts";
import { DealTable } from "@/components/DealTable";
import { LeagueTable } from "@/components/LeagueTable";
import { Methodology } from "@/components/Methodology";
import { loadDataset } from "@/lib/data";
import { formatMoney, sumAmount, byKey } from "@/lib/aggregate";

// Revalidate every hour; the dataset file is rewritten daily by the fetch pipeline.
export const revalidate = 3600;

export default function Page() {
  const { deals, generated_at, window_start, window_end } = loadDataset();
  const total = sumAmount(deals);
  const seriesA = deals.filter((d) => d.round_stage === "Series A");
  const seriesB = deals.filter((d) => d.round_stage === "Series B");
  const sectors = byKey(deals, (d) => d.sector);
  const topSector = sectors[0];
  const largest = [...deals].sort((a, b) => b.amount_usd_millions - a.amount_usd_millions)[0];
  const medianAmount = (() => {
    const arr = deals.map((d) => d.amount_usd_millions).sort((a, b) => a - b);
    if (!arr.length) return 0;
    const m = Math.floor(arr.length / 2);
    return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
  })();

  return (
    <main>
      <Masthead
        deals={deals}
        generatedAt={generated_at}
        windowStart={window_start}
        windowEnd={window_end}
      />

      {/* Editor's note — key takeaways */}
      <Section
        eyebrow="Editor's Note"
        title="Where the money went this cycle."
        kicker="A compact view of the trailing 60 days of AI financing — where capital clustered, who set the pace, and what's getting priced."
      >
        <div className="grid md:grid-cols-4 gap-5">
          <Card title="Hottest sector">
            <div className="font-serif text-3xl text-ink-50" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
              {topSector?.key ?? "—"}
            </div>
            <div className="mt-1 text-sm text-ink-400 num">
              {topSector ? `${formatMoney(topSector.total)} across ${topSector.count} deals` : ""}
            </div>
          </Card>
          <Card title="Median round size">
            <div className="font-serif text-3xl text-ink-50 num" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
              {formatMoney(medianAmount)}
            </div>
            <div className="mt-1 text-sm text-ink-400">across A + B combined</div>
          </Card>
          <Card title="A : B split">
            <div className="font-serif text-3xl text-ink-50 num" style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}>
              {seriesA.length} <span className="text-ink-500">/</span> {seriesB.length}
            </div>
            <div className="mt-1 text-sm text-ink-400 num">
              {formatMoney(sumAmount(seriesA))} vs {formatMoney(sumAmount(seriesB))}
            </div>
          </Card>
          <Card title="Largest round">
            <div
              className="font-serif text-3xl text-ink-50"
              style={{ fontFamily: '"Instrument Serif", Georgia, serif' }}
            >
              {largest?.company_name ?? "—"}
            </div>
            <div className="mt-1 text-sm text-ink-400 num">
              {largest ? `${formatMoney(largest.amount_usd_millions)} · ${largest.round_stage}` : ""}
            </div>
          </Card>
        </div>
      </Section>

      {/* Sector flow */}
      <Section
        eyebrow="Section I"
        title="Capital by sector."
        kicker="Dollars raised by AI-primary category. Breadth of category tells you where generalist capital is hunting; concentration tells you where consensus has formed."
      >
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" title="Sector funnel (USD raised)">
            <SectorChart deals={deals} />
          </Card>
          <Card title="Stage mix" subtitle="Series A vs Series B, by capital deployed">
            <StagePie deals={deals} />
          </Card>
        </div>
      </Section>

      {/* Tempo & geography */}
      <Section
        eyebrow="Section II"
        title="Tempo & geography."
        kicker="Week-over-week pacing and where the term sheets are getting written."
      >
        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="Weekly capital deployed">
            <WeeklyChart deals={deals} />
          </Card>
          <Card title="Top countries by capital">
            <GeoChart deals={deals} />
          </Card>
        </div>
      </Section>

      {/* Investors */}
      <Section
        eyebrow="Section III"
        title="Who's writing the checks."
        kicker="Funds with the most activity — ranked by rounds led, with total participation shown as context."
      >
        <div className="grid lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3" title="Most active investors">
            <InvestorChart deals={deals} />
          </Card>
          <div className="lg:col-span-2">
            <LeagueTable deals={deals} />
          </div>
        </div>
      </Section>

      {/* Deal log */}
      <Section
        eyebrow="Section IV"
        title="The deal log."
        kicker={`All ${deals.length} disclosed Series A/B AI financings in window. Sortable and filterable; every row links to its original source.`}
      >
        <DealTable deals={deals} />
      </Section>

      <Methodology deals={deals} generatedAt={generated_at} windowStart={window_start} windowEnd={window_end} />

      <footer className="mx-auto max-w-7xl px-6 pb-16 text-xs text-ink-500 flex flex-col sm:flex-row sm:justify-between gap-2">
        <span className="font-mono">The AI Funding Brief · v0.1</span>
        <span>Built with Next.js. Dataset refreshes daily via automated pipeline.</span>
      </footer>
    </main>
  );
}
