"use client";

import { useRef, useState } from "react";
import { PartyPopper } from "lucide-react";
import { RecommendForm } from "@/components/recommend-form";
import { ResultsPanel, type ResultState } from "@/components/results-panel";
import { USE_MOCKS } from "@/lib/api";
import type { MockMode } from "@/lib/mocks";
import { recommend } from "@/lib/recommend";
import type { RecommendRequest } from "@/lib/types";
import { cn } from "@/lib/utils";

const MOCK_MODES: { value: MockMode; label: string }[] = [
  { value: "auto", label: "Авто" },
  { value: "ok", label: "ok" },
  { value: "no_category", label: "no_category" },
  { value: "no_match", label: "no_match" },
];

export default function Home() {
  const [state, setState] = useState<ResultState>({ kind: "idle" });
  const [mockMode, setMockMode] = useState<MockMode>("auto");
  const lastRequest = useRef<RecommendRequest | null>(null);
  const requestId = useRef(0);

  async function run(req: RecommendRequest) {
    lastRequest.current = req;
    const id = ++requestId.current;
    setState({ kind: "loading" });
    try {
      const response = await recommend(req, mockMode);
      if (id === requestId.current) setState({ kind: "done", request: req, response });
    } catch (e) {
      if (id !== requestId.current) return;
      const message =
        e instanceof DOMException && e.name === "TimeoutError"
          ? "Сервер не ответил за 15 секунд. Попробуйте ещё раз."
          : e instanceof Error
            ? e.message
            : "Неизвестная ошибка";
      setState({ kind: "error", message });
    }
  }

  return (
    <div className="flex-1 bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PartyPopper className="size-5" />
            </span>
            <div>
              <div className="font-semibold leading-tight">EventMatch KZ</div>
              <div className="text-xs text-muted-foreground">Умный подбор event-подрядчиков</div>
            </div>
          </div>
          {USE_MOCKS && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Мок-ответ:</span>
              <div className="flex rounded-lg border bg-muted p-0.5">
                {MOCK_MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMockMode(m.value)}
                    className={cn(
                      "rounded-md px-2 py-1 font-mono transition-colors",
                      mockMode === m.value ? "bg-background font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <section className="rounded-xl border bg-background p-5 shadow-xs lg:sticky lg:top-6">
          <h1 className="text-lg font-semibold">Параметры мероприятия</h1>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            Подберём до 3 подрядчиков, которые свободны в вашу дату и укладываются в бюджет.
          </p>
          <RecommendForm loading={state.kind === "loading"} onSubmit={run} />
        </section>

        <section aria-live="polite">
          <ResultsPanel state={state} onRetry={() => lastRequest.current && run(lastRequest.current)} />
        </section>
      </main>
    </div>
  );
}
