#!/usr/bin/env node
/**
 * fetch-deals.mjs
 *
 * Daily ingestion pipeline for The AI Funding Brief.
 *
 * WHAT IT DOES
 * ------------
 * 1. Pulls RSS feeds from public AI / venture press.
 * 2. Filters items by date window (trailing N days) and headline heuristics
 *    for Series A/B AI financings.
 * 3. Extracts a dollar amount when a recognisable "$XXM" pattern is present.
 * 4. Writes candidates to data/candidates.json for curation.
 * 5. Optionally (if ANTHROPIC_API_KEY is set) asks Claude to structure each
 *    candidate into the full Deal schema and MERGES into data/deals.json by
 *    company_name. Existing hand-curated entries are preserved.
 *
 * Run: `node scripts/fetch-deals.mjs`
 *
 * Zero third-party deps: uses native fetch + a minimal RSS regex parser so it
 * runs in GitHub Actions without `npm install`.
 */

import fs from "node:fs";
import path from "node:path";

const WINDOW_DAYS = 60;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA_DIR = path.join(ROOT, "data");

const FEEDS = [
  { name: "TechCrunch · Venture", url: "https://techcrunch.com/category/venture/feed/" },
  { name: "TechCrunch · AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
  { name: "VentureBeat · AI", url: "https://venturebeat.com/category/ai/feed/" },
  { name: "Sifted", url: "https://sifted.eu/feed" },
  { name: "The Verge · AI", url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml" },
];

const SERIES_RE = /\b(Series\s+[AB])\b/i;
const AMOUNT_RE = /\$\s?(\d+(?:\.\d+)?)\s?(million|billion|m|b)\b/i;
const AI_RE = /\b(AI|artificial intelligence|LLM|generative|agent|foundation model|machine learning|robotics|autonomous)\b/i;

function log(...args) {
  console.log("[fetch-deals]", ...args);
}

function parseRssItems(xml) {
  // Tolerant of both <item> (RSS) and <entry> (Atom).
  const items = [];
  const blockRe = /<item\b[\s\S]*?<\/item>|<entry\b[\s\S]*?<\/entry>/g;
  const blocks = xml.match(blockRe) ?? [];
  for (const block of blocks) {
    const pick = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
      return m ? stripCdata(m[1]).trim() : "";
    };
    const linkAlt = block.match(/<link[^>]*href="([^"]+)"/i);
    items.push({
      title: pick("title"),
      link: pick("link") || (linkAlt ? linkAlt[1] : ""),
      pubDate: pick("pubDate") || pick("published") || pick("updated"),
      description: stripHtml(pick("description") || pick("summary") || pick("content")),
    });
  }
  return items;
}

function stripCdata(s) {
  return s.replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/m, "$1");
}
function stripHtml(s) {
  return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#\d+;/g, "");
}

function toDate(s) {
  const d = new Date(s);
  return isNaN(+d) ? null : d;
}

function inferSector(text) {
  const t = text.toLowerCase();
  if (/foundation model|frontier model/.test(t)) return "Foundation Models";
  if (/agent|copilot|autonomous workflow/.test(t)) return "AI Agents";
  if (/dev tool|developer|code|coding|ide|copilot for code/.test(t)) return "Developer Tools";
  if (/healthcare|biotech|medical|clinical|drug/.test(t)) return "Healthcare AI";
  if (/robot|humanoid|manipulation/.test(t)) return "Robotics";
  if (/defense|military|intel|security|cyber/.test(t)) return "Defense & Security";
  if (/gpu|inference|chip|compute|data center|infra/.test(t)) return "AI Infrastructure";
  if (/legal|contract|law/.test(t)) return "Legal AI";
  if (/fintech|finance|bank|trading|underwriting/.test(t)) return "Finance AI";
  if (/autonomous vehicle|self-driving|robotaxi/.test(t)) return "Autonomous Vehicles";
  if (/creative|video|image|music|design/.test(t)) return "Creative/Media";
  if (/enterprise|b2b|sales|marketing|crm/.test(t)) return "Enterprise AI";
  return "Other";
}

function parseAmountMillions(text) {
  const m = text.match(AMOUNT_RE);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith("b")) return Math.round(n * 1000);
  return Math.round(n);
}

async function fetchFeed(feed) {
  try {
    const res = await fetch(feed.url, {
      headers: { "user-agent": "ai-funding-tracker/0.1 (+github actions)" },
    });
    if (!res.ok) {
      log(`feed ${feed.name} returned ${res.status}`);
      return [];
    }
    const xml = await res.text();
    return parseRssItems(xml).map((i) => ({ ...i, feed: feed.name }));
  } catch (e) {
    log(`feed ${feed.name} failed:`, e.message);
    return [];
  }
}

function withinWindow(d, windowStart, windowEnd) {
  if (!d) return false;
  return d >= windowStart && d <= windowEnd;
}

function toCandidate(item) {
  const amount = parseAmountMillions(`${item.title} ${item.description}`);
  const stageMatch = (item.title + " " + item.description).match(SERIES_RE);
  const stage = stageMatch ? stageMatch[1].replace(/\s+/g, " ") : null;
  return {
    title: item.title,
    url: item.link,
    published: item.pubDate,
    source: item.feed,
    candidate_stage: stage,
    candidate_amount_millions: amount,
    candidate_sector: inferSector(item.title + " " + item.description),
    description_excerpt: item.description.slice(0, 280),
  };
}

function mergeDealsByCompany(existing, incoming) {
  const byName = new Map(existing.map((d) => [d.company_name.toLowerCase(), d]));
  for (const d of incoming) {
    const key = d.company_name.toLowerCase();
    if (!byName.has(key)) byName.set(key, d);
    // Preserve hand-curated entries; never overwrite silently.
  }
  return Array.from(byName.values()).sort((a, b) =>
    a.announced_date < b.announced_date ? 1 : -1,
  );
}

async function structureWithClaude(candidates) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    log("ANTHROPIC_API_KEY not set — skipping structured extraction step.");
    return [];
  }
  if (candidates.length === 0) return [];
  log(`structuring ${candidates.length} candidates with Claude…`);

  const prompt = `You are extracting structured data from AI startup funding news headlines. For each candidate below, return a JSON array (no prose, no fences). Only include candidates that are clearly a Series A or Series B of an AI-primary company. Skip anything else. Each object must have: company_name, round_stage ("Series A" | "Series B"), amount_usd_millions (number), valuation_usd_millions (number or null), lead_investor (string; "Undisclosed" if not named), other_investors (string[]), sector (one of: Foundation Models, AI Agents, Enterprise AI, Developer Tools, Healthcare AI, Robotics, Defense & Security, AI Infrastructure, Vertical SaaS, Creative/Media, Autonomous Vehicles, Legal AI, Finance AI, Other), description (ONE sentence of what the company builds), hq_country, announced_date (YYYY-MM-DD), source_url, source_title.\n\nCANDIDATES:\n${JSON.stringify(candidates, null, 2)}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      log("Claude API error:", res.status, await res.text());
      return [];
    }
    const data = await res.json();
    const text = data?.content?.[0]?.text ?? "";
    // Strip code fences if any
    const cleaned = text.replace(/^```(?:json)?/m, "").replace(/```$/m, "").trim();
    const arr = JSON.parse(cleaned);
    if (Array.isArray(arr)) return arr;
    log("Claude did not return an array");
    return [];
  } catch (e) {
    log("structured extraction failed:", e.message);
    return [];
  }
}

async function main() {
  const now = new Date();
  const windowEnd = now;
  const windowStart = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  log(`window: ${windowStart.toISOString().slice(0, 10)} → ${windowEnd.toISOString().slice(0, 10)}`);

  const all = (await Promise.all(FEEDS.map(fetchFeed))).flat();
  log(`pulled ${all.length} items across ${FEEDS.length} feeds`);

  const relevant = all.filter((i) => {
    const d = toDate(i.pubDate);
    if (!withinWindow(d, windowStart, windowEnd)) return false;
    const blob = i.title + " " + i.description;
    return SERIES_RE.test(blob) && AI_RE.test(blob);
  });
  log(`${relevant.length} items match Series A/B + AI heuristics`);

  const candidates = relevant.map(toCandidate);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DATA_DIR, "candidates.json"),
    JSON.stringify(
      { generated_at: now.toISOString(), window_days: WINDOW_DAYS, candidates },
      null,
      2,
    ),
  );
  log(`wrote data/candidates.json (${candidates.length} candidates)`);

  // Optional: structured merge into deals.json via Claude
  const existingPath = path.join(DATA_DIR, "deals.json");
  let existing = { generated_at: now.toISOString(), window_start: "", window_end: "", deals: [] };
  if (fs.existsSync(existingPath)) {
    existing = JSON.parse(fs.readFileSync(existingPath, "utf8"));
  }

  const structured = await structureWithClaude(candidates);
  const merged = mergeDealsByCompany(existing.deals ?? [], structured);

  const out = {
    generated_at: now.toISOString(),
    window_start: windowStart.toISOString().slice(0, 10),
    window_end: windowEnd.toISOString().slice(0, 10),
    deals: merged,
  };
  fs.writeFileSync(existingPath, JSON.stringify(out, null, 2));
  log(`wrote data/deals.json · ${merged.length} deals (added ${merged.length - (existing.deals?.length ?? 0)})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
