import { MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatKzt } from "@/lib/constants";
import type { Contractor } from "@/lib/types";

export function ContractorCard({ contractor, rank }: { contractor: Contractor; rank: number }) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
          {rank}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-tight">{contractor.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <Badge variant="secondary">
              {contractor.category}
            </Badge>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {contractor.city}
            </span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-muted-foreground">от</div>
          <div className="font-semibold tabular-nums">{formatKzt(contractor.price_from_kzt)}</div>
        </div>
      </div>
      <div className="rounded-lg bg-emerald-50 p-3 text-sm leading-relaxed text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
          <Sparkles className="size-3.5" />
          Почему этот
        </div>
        {contractor.explanation}
      </div>
    </article>
  );
}
