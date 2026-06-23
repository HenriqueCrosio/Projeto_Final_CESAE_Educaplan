"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { markLessonDone, markMaterialRead } from "@/actions/gamification.actions";

/**
 * Marca uma aula como vista ou um material como lido (G1.5). Otimista: ao
 * concluir mostra o estado e um "+X XP" efémero.
 */
export function MarkButton({
  kind,
  id,
  done: initialDone,
}: {
  kind: "lesson" | "material";
  id: string;
  done: boolean;
}) {
  const reduce = useReducedMotion();
  const [done, setDone] = React.useState(initialDone);
  const [busy, setBusy] = React.useState(false);
  const [gain, setGain] = React.useState<number | null>(null);

  const doneLabel = kind === "lesson" ? "Vista" : "Lido";
  const actionLabel = kind === "lesson" ? "Marcar vista" : "Marcar lido";

  async function mark() {
    if (done || busy) return;
    setBusy(true);
    const res = kind === "lesson" ? await markLessonDone(id) : await markMaterialRead(id);
    setBusy(false);
    if (res.ok) {
      setDone(true);
      if (!res.already && res.xp > 0) {
        setGain(res.xp);
        setTimeout(() => setGain(null), 1800);
      }
    }
  }

  if (done) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
        <Check className="h-4 w-4" /> {doneLabel}
      </span>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        onClick={mark}
        disabled={busy}
        className={cn(
          "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
          "hover:border-primary/40 hover:bg-accent disabled:opacity-60",
        )}
      >
        {busy ? "…" : actionLabel}
      </button>
      <AnimatePresence>
        {gain !== null && (
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -18 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -top-1 left-1/2 flex -translate-x-1/2 items-center gap-0.5 text-xs font-bold text-primary"
          >
            <Plus className="h-3 w-3" />
            {gain} XP
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
