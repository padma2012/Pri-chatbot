export type Stage = "Series A" | "Series B";

export type Sector =
  | "Foundation Models"
  | "AI Agents"
  | "Enterprise AI"
  | "Developer Tools"
  | "Healthcare AI"
  | "Robotics"
  | "Defense & Security"
  | "AI Infrastructure"
  | "Vertical SaaS"
  | "Creative/Media"
  | "Autonomous Vehicles"
  | "Legal AI"
  | "Finance AI"
  | "Other";

export interface Deal {
  company_name: string;
  round_stage: Stage;
  amount_usd_millions: number;
  valuation_usd_millions: number | null;
  lead_investor: string;
  other_investors: string[];
  sector: Sector;
  description: string;
  hq_country: string;
  announced_date: string; // YYYY-MM-DD
  source_url: string;
  source_title: string;
}

export interface Dataset {
  generated_at: string;
  window_start: string;
  window_end: string;
  deals: Deal[];
}
