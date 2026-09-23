"use client";

import { useEffect, useState } from "react";
import { AlertOctagon, CheckCircle2, FilterX, Loader2, MapPinOff, RotateCcw, SearchCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ContractorCard } from "@/components/contractor-card";
import type { RecommendRequest, RecommendResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ResultState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; request: RecommendRequest; response: RecommendResponse };

function StatusPanel({
  tone,
  icon: Icon,
  label,
  title,
  children,
}: {
  tone: "sky" | "amber" | "red";
  icon: React.ElementType;
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  const tones = {
    sky: "border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-50 [&_[data-icon]]:bg-sky-600",
    amber: "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50 [&_[data-icon]]:bg-amber-500",
    red: "border-red-300 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/40 dark:text-red-50 [&_[data-icon]]:bg-red-600",
  };
  return (
    <div role="status" className={cn("rounded-xl border-2 p-5", tones[tone])}>
      <div className="flex items-start gap-4">
        <span data-icon className="flex size-11 shrink-0 items-center justify-center rounded-full text-white">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</div>
          <h2 className="mt-0.5 text-lg font-semibold leading-snug">{title}</h2>
          {children && <div className="mt-2 text-sm leading-relaxed">{children}</div>}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid gap-3" aria-busy="true">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Подбираем подрядчиков и объясняем выбор… <span className="tabular-nums">{seconds} с</span>
        <span className="hidden sm:inline">· обычно до 10 секунд</span>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid gap-3 rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-14 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ResultsPanel({ state, onRetry }: { state: ResultState; onRetry: () => void }) {
  if (state.kind === "idle") {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center text-muted-foreground">
        <SearchCheck className="size-10 opacity-40" />
        <div>
          <p className="font-medium text-foreground">Заполните параметры мероприятия</p>
          <p className="mt-1 text-sm">Подберём до 3 подрядчиков и объясним, почему именно они.</p>
        </div>
      </div>
    );
  }

  if (state.kind === "loading") return <LoadingState />;

  if (state.kind === "error") {
    return (
      <StatusPanel tone="red" icon={AlertOctagon} label="Ошибка" title="Не удалось получить ответ сервера">
        <p className="opacity-80">{state.message}</p>
        <Button variant="outline" size="sm" className="mt-3 bg-background" onClick={onRetry}>
          <RotateCcw /> Повторить
        </Button>
      </StatusPanel>
    );
  }

  const { request, response } = state;

  if (response.status === "no_category") {
    return (
      <StatusPanel
        tone="sky"
        icon={MapPinOff}
        label="Нет такой категории"
        title={`В городе ${request.city} нет подрядчиков категории «${request.category}»`}
      >
        {response.message && <p className="opacity-80">{response.message}</p>}
        <p className="mt-2 opacity-80">Попробуйте другой город или соседнюю категорию.</p>
      </StatusPanel>
    );
  }

  if (response.status === "no_match") {
    return (
      <StatusPanel
        tone="amber"
        icon={FilterX}
        label="Никто не подошёл"
        title={`${response.total_candidates} ${plural(response.total_candidates, "подрядчик", "подрядчика", "подрядчиков")} в категории — но ни один не прошёл фильтры`}
      >
        <p className="font-medium">{response.message}</p>
        <p className="mt-2 opacity-80">Попробуйте увеличить бюджет, сменить дату, формат или убрать требование к языку.</p>
      </StatusPanel>
    );
  }

  const n = response.results.length;
  return (
    <div className="grid gap-3">
      <div className="flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-50">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
        <div className="text-sm">
          <span className="font-semibold">
            {n} {plural(n, "подходящий подрядчик", "подходящих подрядчика", "подходящих подрядчиков")}
          </span>
          <span className="opacity-70"> · из {response.total_candidates} в категории</span>
          {response.message && <p className="mt-1 opacity-80">{response.message}</p>}
        </div>
      </div>
      {response.results.map((c, i) => (
        <ContractorCard key={c.id} contractor={c} rank={i + 1} />
      ))}
    </div>
  );
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
