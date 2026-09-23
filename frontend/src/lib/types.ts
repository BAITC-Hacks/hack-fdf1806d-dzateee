// Types following the backend contract: POST /api/recommend

export type RecommendRequest = {
  city: string;
  event_date: string; // YYYY-MM-DD
  event_type: string;
  category: string;
  budget_kzt: number;
  duration_hours: number | null;
  language: string | null;
};

export type RecommendStatus = "ok" | "no_category" | "no_match";

export type Contractor = {
  id: string | number;
  name: string;
  category: string;
  city: string;
  price_from_kzt: number;
  explanation: string;
};

export type RecommendResponse = {
  status: RecommendStatus;
  message: string;
  total_candidates: number;
  results: Contractor[];
};
