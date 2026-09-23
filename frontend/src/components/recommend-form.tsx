"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORIES, CITIES, EVENT_TYPES, LANGUAGES } from "@/lib/constants";
import type { RecommendRequest } from "@/lib/types";
import { cn } from "@/lib/utils";

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

function isoDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {hint && <span className="font-normal text-muted-foreground">{hint}</span>}
      </Label>
      {children}
    </div>
  );
}

export function RecommendForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (req: RecommendRequest) => void;
}) {
  const [city, setCity] = useState<string>(CITIES[0]);
  const [eventDate, setEventDate] = useState(isoDate(45));
  const [eventType, setEventType] = useState<string>("свадьба");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [budget, setBudget] = useState("1000000");
  const [duration, setDuration] = useState("");
  const [language, setLanguage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      city,
      event_date: eventDate,
      event_type: eventType,
      category: category.trim(),
      budget_kzt: Number(budget),
      duration_hours: duration ? Number(duration) : null,
      language: language || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Город" htmlFor="city">
          <select id="city" className={selectClass} value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Дата" htmlFor="event_date">
          <Input
            id="event_date"
            type="date"
            required
            className="h-9"
            min={isoDate(0)}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Тип мероприятия" htmlFor="event_type">
        <select
          id="event_type"
          className={cn(selectClass, "capitalize")}
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t[0].toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Категория подрядчика" htmlFor="category">
        <select id="category" className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>

      <Field label="Бюджет, ₸" htmlFor="budget">
        <Input
          id="budget"
          type="number"
          required
          min={1}
          inputMode="numeric"
          className="h-9"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Длительность" hint="· ч, опц." htmlFor="duration">
          <Input
            id="duration"
            type="number"
            min={1}
            max={24}
            inputMode="numeric"
            className="h-9"
            placeholder="—"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </Field>
        <Field label="Язык" hint="· опц." htmlFor="language">
          <select id="language" className={selectClass} value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">Любой</option>
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Button type="submit" size="lg" disabled={loading} className="mt-1 h-10 w-full text-sm">
        {loading ? <Loader2 className="animate-spin" /> : <Search />}
        {loading ? "Подбираем…" : "Подобрать подрядчиков"}
      </Button>
    </form>
  );
}
