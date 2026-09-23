// Mock responses for POST /api/recommend while the backend is not ready.
// "auto" mode runs a small mock dataset through the same filters the backend uses.
import { formatKzt } from "./constants";
import type { Contractor, RecommendRequest, RecommendResponse } from "./types";

export type MockMode = "auto" | "ok" | "no_category" | "no_match";

type MockProfile = {
  id: string;
  name: string;
  category: string;
  city: string;
  price_from_kzt: number;
  event_formats: string[];
  languages: string[];
  max_hours: number | null;
  busy_dates: string[];
  pitch: string;
};

const PROFILES: MockProfile[] = [
  { id: "c-001", name: "Ведущий Арман", category: "ведущий", city: "Алматы", price_from_kzt: 250000, event_formats: ["свадьба", "той", "юбилей"], languages: ["казахский", "русский"], max_hours: 6, busy_dates: ["2026-10-10"], pitch: "двуязычные тои с интерактивом для гостей всех возрастов" },
  { id: "c-002", name: "Ведущая Динара", category: "ведущий", city: "Алматы", price_from_kzt: 180000, event_formats: ["корпоратив", "конференция", "день рождения"], languages: ["русский", "английский"], max_hours: null, busy_dates: [], pitch: "деловые мероприятия и корпоративы для международных команд" },
  { id: "c-003", name: "Ведущий Ерлан", category: "ведущий", city: "Алматы", price_from_kzt: 400000, event_formats: ["свадьба", "той", "корпоратив"], languages: ["казахский", "русский"], max_hours: 8, busy_dates: [], pitch: "премиальные свадьбы и тои с живым вокалом" },
  { id: "c-004", name: "Ведущая Айгерим", category: "ведущий", city: "Алматы", price_from_kzt: 120000, event_formats: ["день рождения", "юбилей", "той"], languages: ["казахский"], max_hours: 4, busy_dates: [], pitch: "камерные семейные праздники на казахском языке" },
  { id: "c-005", name: "Фотограф Тимур", category: "фотограф", city: "Алматы", price_from_kzt: 150000, event_formats: ["свадьба", "той", "день рождения"], languages: ["русский"], max_hours: 10, busy_dates: [], pitch: "репортажная съёмка без постановки, 300+ фото в день" },
  { id: "c-006", name: "Фотограф Жанель", category: "фотограф", city: "Алматы", price_from_kzt: 220000, event_formats: ["свадьба", "корпоратив", "конференция"], languages: ["русский", "английский"], max_hours: null, busy_dates: [], pitch: "fashion-съёмка и деловой репортаж" },
  { id: "c-007", name: "Фотограф Ильяс", category: "фотограф", city: "Астана", price_from_kzt: 130000, event_formats: ["свадьба", "той", "юбилей"], languages: ["казахский", "русский"], max_hours: 8, busy_dates: [], pitch: "тёплые семейные кадры и съёмка обрядов" },
  { id: "c-008", name: "Ведущий Нурлан", category: "ведущий", city: "Астана", price_from_kzt: 200000, event_formats: ["той", "свадьба", "юбилей"], languages: ["казахский", "русский"], max_hours: 6, busy_dates: [], pitch: "классические тои с традициями и современной программой" },
  { id: "c-009", name: "Кейтеринг Dastarkhan", category: "кейтеринг", city: "Астана", price_from_kzt: 900000, event_formats: ["корпоратив", "конференция", "свадьба"], languages: ["русский", "казахский"], max_hours: null, busy_dates: [], pitch: "национальная и европейская кухня на 50–500 гостей" },
  { id: "c-010", name: "Декор Ak Saray", category: "декор", city: "Алматы", price_from_kzt: 350000, event_formats: ["свадьба", "той"], languages: ["русский", "казахский"], max_hours: null, busy_dates: [], pitch: "оформление залов в этно- и минималистичном стиле" },
  { id: "c-011", name: "Event-ведущий Alex", category: "ведущий", city: "Зарубежье", price_from_kzt: 600000, event_formats: ["корпоратив", "конференция"], languages: ["английский", "русский"], max_hours: 8, busy_dates: [], pitch: "международные конференции и выездные корпоративы" },
];

function explain(p: MockProfile, req: RecommendRequest): string {
  const diff = req.budget_kzt - p.price_from_kzt;
  const parts = [
    `Цена от ${formatKzt(p.price_from_kzt)} — на ${formatKzt(diff)} ниже вашего бюджета`,
    `работает с форматом «${req.event_type}»`,
  ];
  if (req.language) parts.push(`ведёт на языке: ${req.language}`);
  if (req.duration_hours)
    parts.push(p.max_hours ? `до ${p.max_hours} ч (вам нужно ${req.duration_hours})` : "без ограничения по часам");
  return `${parts.join(", ")}. Специализация: ${p.pitch}.`;
}

function auto(req: RecommendRequest): RecommendResponse {
  const cat = req.category.trim().toLowerCase();
  const pool = PROFILES.filter((p) => p.city === req.city && p.category.toLowerCase() === cat);

  if (pool.length === 0) {
    return {
      status: "no_category",
      message: `В городе ${req.city} нет подрядчиков категории «${req.category}».`,
      total_candidates: 0,
      results: [],
    };
  }

  const reasons = { busy: 0, budget: 0, format: 0, language: 0, hours: 0 };
  const passed = pool.filter((p) => {
    if (p.busy_dates.includes(req.event_date)) return reasons.busy++, false;
    if (!p.event_formats.includes(req.event_type)) return reasons.format++, false;
    if (p.price_from_kzt > req.budget_kzt) return reasons.budget++, false;
    if (req.language && !p.languages.includes(req.language)) return reasons.language++, false;
    if (req.duration_hours && p.max_hours !== null && p.max_hours < req.duration_hours)
      return reasons.hours++, false;
    return true;
  });

  if (passed.length === 0) {
    const labels: Record<keyof typeof reasons, string> = {
      busy: "заняты на эту дату",
      budget: "дороже вашего бюджета",
      format: "не работают с таким форматом",
      language: "не ведут на выбранном языке",
      hours: "не работают так долго",
    };
    const why = (Object.keys(reasons) as (keyof typeof reasons)[])
      .filter((k) => reasons[k] > 0)
      .map((k) => `${reasons[k]} — ${labels[k]}`)
      .join("; ");
    return {
      status: "no_match",
      message: `В категории «${req.category}» в городе ${req.city} есть ${pool.length} подрядчиков, но никто не подошёл: ${why}.`,
      total_candidates: pool.length,
      results: [],
    };
  }

  const results: Contractor[] = passed
    .sort((a, b) => a.price_from_kzt - b.price_from_kzt || a.id.localeCompare(b.id))
    .slice(0, 3)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      city: p.city,
      price_from_kzt: p.price_from_kzt,
      explanation: explain(p, req),
    }));

  return {
    status: "ok",
    message:
      results.length < 3
        ? `Подошли ${results.length} из ${pool.length} подрядчиков в категории — остальные не прошли фильтры.`
        : `Нашли ${results.length} подходящих подрядчиков.`,
    total_candidates: pool.length,
    results,
  };
}

const CANNED: Record<Exclude<MockMode, "auto">, RecommendResponse> = {
  ok: {
    status: "ok",
    message: "Нашли 3 подходящих подрядчиков.",
    total_candidates: 7,
    results: [
      { id: "c-002", name: "Ведущая Динара", category: "ведущий", city: "Алматы", price_from_kzt: 180000, explanation: "Цена от 180 000 ₸ — на 120 000 ₸ ниже бюджета, ведёт корпоративы на русском и английском, без ограничения по часам." },
      { id: "c-001", name: "Ведущий Арман", category: "ведущий", city: "Алматы", price_from_kzt: 250000, explanation: "Укладывается в бюджет с запасом 50 000 ₸, специализируется на двуязычных тоях — совпадает с форматом «той» и казахским языком." },
      { id: "c-003", name: "Ведущий Ерлан", category: "ведущий", city: "Алматы", price_from_kzt: 290000, explanation: "Ровно в пределах бюджета, работает до 8 часов (вам нужно 6), в описании — тои с живым вокалом." },
    ],
  },
  no_category: {
    status: "no_category",
    message: "В городе Зарубежье нет подрядчиков категории «кейтеринг».",
    total_candidates: 0,
    results: [],
  },
  no_match: {
    status: "no_match",
    message: "В категории «ведущий» в городе Алматы есть 4 подрядчика, но никто не подошёл: 1 — занят на эту дату; 2 — дороже вашего бюджета; 1 — не ведёт на выбранном языке.",
    total_candidates: 4,
    results: [],
  },
};

export function mockRecommend(req: RecommendRequest, mode: MockMode): RecommendResponse {
  return mode === "auto" ? auto(req) : CANNED[mode];
}
