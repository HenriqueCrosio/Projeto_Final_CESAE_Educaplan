"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BookOpen, Trophy, Lock, Check, Sparkles, Star, Flame, Brain, Target,
  Rocket, Crown, Gem, Palette as PaletteIcon, Image as ImageIcon, Award,
  Package, Zap, Gift, X, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RARITY } from "@/lib/rarity";
import {
  buyItem, buyBoost, openChest, type ShopItem, type ChestReward,
} from "@/actions/shop.actions";

// ── Ícones dos badges (o payload guarda o nome do ícone Lucide) ──
const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame, Star, BookOpen, Brain, Target, Rocket, Crown, Gem, Award, Zap, Package,
};

type PayloadAny = Record<string, string> | null | undefined;
const pl = (p: unknown) => (p ?? {}) as Record<string, string>;

type Tab = "BADGE" | "PALETTE" | "BANNER" | "CHEST" | "BOOST";
const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "BADGE", label: "Badges", icon: Award },
  { id: "PALETTE", label: "Paletas", icon: PaletteIcon },
  { id: "BANNER", label: "Banners", icon: ImageIcon },
  { id: "CHEST", label: "Baús", icon: Package },
  { id: "BOOST", label: "Boosts", icon: Zap },
];

function timeLeft(expiresAt: Date): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "terminado";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ── Visual de um item conforme o tipo ──
function ItemVisual({ item, size = "md" }: { item: { type: string; rarity: string; payload: unknown }; size?: "md" | "lg" }) {
  const r = RARITY[item.rarity] ?? RARITY.COMMON;
  const p = pl(item.payload);
  const dim = size === "lg" ? "h-20 w-20" : "h-16 w-16";

  if (item.type === "BADGE") {
    const Icon = BADGE_ICONS[p.icon] ?? Star;
    const color = p.color ?? "#6366f1";
    return (
      <div
        className={cn("flex items-center justify-center rounded-full ring-2", dim, r.ring, r.glow)}
        style={{ backgroundColor: `${color}1f`, color }}
      >
        <Icon className={size === "lg" ? "h-9 w-9" : "h-7 w-7"} />
      </div>
    );
  }
  if (item.type === "PALETTE") {
    return (
      <div className={cn("flex items-center justify-center gap-1 rounded-2xl ring-2 p-2", dim, r.ring, r.glow)} style={{ backgroundColor: p.bg }}>
        <span className="h-7 w-3 rounded-full" style={{ backgroundColor: p.accent }} />
        <span className="h-7 w-3 rounded-full" style={{ backgroundColor: p.border }} />
        <span className="h-7 w-3 rounded-full border" style={{ backgroundColor: p.bg, borderColor: p.border }} />
      </div>
    );
  }
  // BANNER
  return (
    <div
      className={cn("rounded-2xl ring-2", size === "lg" ? "h-20 w-32" : "h-16 w-24", r.ring, r.glow)}
      style={{ backgroundImage: p.gradient }}
    />
  );
}

// ── Cartão de pré-visualização do Hub (reflete paleta/banner em foco) ──
function HubPreview({ palette, banner }: { palette?: PayloadAny; banner?: PayloadAny }) {
  const pal = palette ?? undefined;
  return (
    <div className="overflow-hidden rounded-2xl border shadow-sm" style={pal ? { backgroundColor: pal.bg, borderColor: pal.border } : undefined}>
      <div className="h-20" style={{ backgroundImage: banner?.gradient ?? "linear-gradient(135deg,hsl(var(--primary)/0.3),hsl(var(--primary)/0.1),transparent)" }} />
      <div className="flex items-end gap-3 p-4">
        <div className="-mt-9 flex h-12 w-12 items-center justify-center rounded-xl border-4 border-card bg-primary text-lg font-bold text-primary-foreground" style={pal ? { backgroundColor: pal.accent } : undefined}>
          A
        </div>
        <div className="pb-0.5">
          <div className="text-sm font-semibold" style={pal ? { color: pal.accent } : undefined}>O teu Hub</div>
          <div className="text-xs text-muted-foreground">pré-visualização ao vivo</div>
        </div>
      </div>
    </div>
  );
}

export function RewardShop({
  items: initialItems, books: initialBooks, level, xp, levelInto, levelNeeded,
  chests: initialChests, boosts: initialBoosts, activeBoost: initialBoost,
}: {
  items: ShopItem[];
  books: number;
  level: number;
  xp: number;
  levelInto: number;
  levelNeeded: number;
  chests: ShopItem[];
  boosts: ShopItem[];
  activeBoost: { multiplier: number; expiresAt: Date } | null;
}) {
  const reduce = useReducedMotion();
  const [items, setItems] = React.useState(initialItems);
  const [chests] = React.useState(initialChests);
  const [boosts, setBoosts] = React.useState(initialBoosts);
  const [activeBoost, setActiveBoost] = React.useState(initialBoost);
  const [books, setBooks] = React.useState(initialBooks);
  const [tab, setTab] = React.useState<Tab>("BADGE");
  const [buying, setBuying] = React.useState<string | null>(null);
  const [bought, setBought] = React.useState<string | null>(null);
  const [hovered, setHovered] = React.useState<ShopItem | null>(null);
  const [toast, setToast] = React.useState<{ msg: string; ok: boolean } | null>(null);
  const [chestOpen, setChestOpen] = React.useState<{ chest: ShopItem; reward: ChestReward | null } | null>(null);
  const [pending, setPending] = React.useState<{ item: ShopItem; type: "buy" | "boost" | "chest" } | null>(null);

  const setAffordability = (b: number) =>
    setItems((prev) => prev.map((i) => ({ ...i, affordable: b >= i.cost })));

  async function handleBuyBoost(item: ShopItem) {
    if (buying || item.locked || !item.affordable) return;
    setBuying(item.id);
    const res = await buyBoost(item.id);
    setBuying(null);
    if (res.ok) {
      setBooks(res.books);
      setAffordability(res.books);
      setBoosts((prev) => prev.map((b) => ({ ...b, affordable: res.books >= b.cost })));
      const p = (item.payload ?? {}) as Record<string, number>;
      const hours = Number(p.durationH) || 24;
      setActiveBoost((cur) => {
        const base = cur ? new Date(cur.expiresAt).getTime() : Date.now();
        return { multiplier: Number(p.multiplier) || 2, expiresAt: new Date(base + hours * 3_600_000) };
      });
      setToast({ msg: `Boost ativado: ${res.itemName}!`, ok: true });
    } else {
      setToast({ msg: res.error, ok: false });
    }
  }

  async function handleOpenChest(chest: ShopItem) {
    if (chestOpen || chest.locked || !chest.affordable) return;
    setChestOpen({ chest, reward: null });
    const wait = new Promise((r) => setTimeout(r, reduce ? 0 : 1400));
    const [res] = await Promise.all([openChest(chest.id), wait]);
    if (res.ok) {
      setBooks(res.books);
      setAffordability(res.books);
      setBoosts((prev) => prev.map((b) => ({ ...b, affordable: res.books >= b.cost })));
      if (res.reward.kind === "item") {
        // novo cosmético desbloqueado: reflete em "owned" no catálogo
        const wonName = res.reward.itemName;
        setItems((prev) => prev.map((i) => (i.name === wonName ? { ...i, owned: true } : i)));
      }
      setChestOpen({ chest, reward: res.reward });
    } else {
      setChestOpen(null);
      setToast({ msg: res.error, ok: false });
    }
  }

  const levelPct = levelNeeded ? Math.min(100, Math.round((levelInto / levelNeeded) * 100)) : 0;
  const featured = items.filter((i) => i.featured && !i.owned);
  const tabItems = items.filter((i) => i.type === tab);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  React.useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPending(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending]);

  async function handleBuy(item: ShopItem) {
    if (buying || item.owned || item.locked || !item.affordable) return;
    setBuying(item.id);
    const res = await buyItem(item.id);
    setBuying(null);
    if (res.ok) {
      setBooks(res.books);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, owned: true } : { ...i, affordable: res.books >= i.cost })));
      setBought(item.id);
      setTimeout(() => setBought(null), 1400);
      setToast({ msg: `Desbloqueaste "${res.itemName}"!`, ok: true });
    } else {
      setToast({ msg: res.error, ok: false });
    }
  }

  // Confirmação antes de gastar books (irreversível) — prevenção de erro.
  function confirmPending() {
    if (!pending) return;
    const { item, type } = pending;
    setPending(null);
    if (type === "buy") handleBuy(item);
    else if (type === "boost") handleBuyBoost(item);
    else handleOpenChest(item);
  }
  const confirmVerb = pending?.type === "chest" ? "Abrir" : pending?.type === "boost" ? "Ativar" : "Comprar";

  const fade = reduce ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="mx-auto max-w-7xl p-6 sm:p-8">
      {/* Hero imersivo da loja */}
      <div className="relative overflow-hidden rounded-3xl border bg-card p-6 sm:p-8">
        {/* Backdrop animado (decorativo) */}
        {!reduce && (
          <>
            <motion.div aria-hidden className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl" animate={{ x: [0, 28, 0], y: [0, 18, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div aria-hidden className="pointer-events-none absolute -bottom-28 -right-10 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" animate={{ x: [0, -22, 0], y: [0, -14, 0] }} transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }} />
          </>
        )}
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-md">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Loja de Recompensas</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Gasta <strong>books</strong> a desbloquear emblemas, cores, banners e baús. O XP marca o teu nível — e nunca se perde.
              </p>
            </div>
            {/* Saldo de books sempre à vista */}
            <div className="flex items-center gap-2 rounded-2xl border bg-background/70 px-4 py-2.5 shadow-sm backdrop-blur">
              <BookOpen className="h-6 w-6 text-primary" />
              <motion.span key={books} initial={reduce ? false : { scale: 1.3 }} animate={{ scale: 1 }} className="text-2xl font-bold tabular-nums">
                {books}
              </motion.span>
              <span className="text-sm text-muted-foreground">books</span>
            </div>
          </div>
          {/* Progressão do nível */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium"><Trophy className="h-4 w-4 text-primary" /> Nível {level}</span>
              <span className="text-muted-foreground">{xp} XP · faltam {levelNeeded - levelInto} para o nível {level + 1}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300" initial={{ width: 0 }} animate={{ width: `${levelPct}%` }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }} />
            </div>
          </div>
        </div>
      </div>

      {/* Boost ativo */}
      {activeBoost && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/20 text-amber-500">
            <Zap className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <span className="font-semibold text-amber-600 dark:text-amber-400">XP a dobrar ativo</span>
            <span className="text-muted-foreground"> · ×{activeBoost.multiplier} em todas as atividades</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {timeLeft(activeBoost.expiresAt)}</span>
        </div>
      )}

      {/* Em destaque */}
      {featured.length > 0 && (
        <div className="mt-7">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className="text-lg font-semibold">Em destaque</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map((item) => (
              <FeaturedCard key={item.id} item={item} onBuy={(i) => setPending({ item: i, type: "buy" })} buying={buying === item.id} />
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-1 rounded-xl border bg-muted/40 p-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.span layoutId="shop-tab" className="absolute inset-0 -z-10 rounded-lg bg-primary" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
              )}
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da tab */}
      {tab === "CHEST" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chests.map((c) => (
            <ChestCard key={c.id} chest={c} busy={!!chestOpen} onOpen={(i) => setPending({ item: i, type: "chest" })} />
          ))}
        </div>
      ) : tab === "BOOST" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boosts.map((b) => (
            <BoostCard key={b.id} boost={b} buying={buying === b.id} onBuy={(i) => setPending({ item: i, type: "boost" })} />
          ))}
        </div>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {tabItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  {...fade}
                  transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setHovered(item)}
                >
                  <RewardCard item={item} buying={buying === item.id} bought={bought === item.id} onBuy={(i) => setPending({ item: i, type: "buy" })} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pré-visualização ao vivo (paletas/banners) */}
          {(tab === "PALETTE" || tab === "BANNER") && (
            <aside className="hidden lg:block">
              <div className="sticky top-6">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Pré-visualização</div>
                <HubPreview
                  palette={tab === "PALETTE" && hovered?.type === "PALETTE" ? (pl(hovered.payload) as PayloadAny) : undefined}
                  banner={tab === "BANNER" && hovered?.type === "BANNER" ? (pl(hovered.payload) as PayloadAny) : undefined}
                />
                <p className="mt-2 text-xs text-muted-foreground">Passa o rato num item para ver aplicado.</p>
              </div>
            </aside>
          )}
        </div>
      )}

      {/* Toast inline */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            className={cn(
              "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-medium shadow-lg",
              toast.ok ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground",
            )}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmação de gasto (prevenção de erro) */}
      <AnimatePresence>
        {pending && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm"
            onClick={() => setPending(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={reduce ? false : { scale: 0.95, y: 8 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-2xl border bg-card p-6 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold">{confirmVerb} “{pending.item.name}”?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vais gastar <strong>{pending.item.cost} books</strong> · ficas com {books - pending.item.cost}.
              </p>
              <div className="mt-5 flex gap-2">
                <button onClick={() => setPending(null)} className="flex-1 rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-accent">
                  Cancelar
                </button>
                <button autoFocus onClick={confirmPending} className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  {confirmVerb}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Abertura de baú */}
      <AnimatePresence>
        {chestOpen && (
          <ChestOpener
            chest={chestOpen.chest}
            reward={chestOpen.reward}
            onClose={() => setChestOpen(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Cartão de baú ──
function ChestCard({ chest, busy, onOpen }: { chest: ShopItem; busy: boolean; onOpen: (c: ShopItem) => void }) {
  const reduce = useReducedMotion();
  const r = RARITY[chest.rarity] ?? RARITY.COMMON;
  const color = (pl(chest.payload).color as string) ?? "#b45309";
  return (
    <div className="flex flex-col items-center rounded-2xl border bg-card p-6 text-center shadow-sm">
      <motion.div
        animate={chest.locked || reduce ? undefined : { y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        className={cn("flex h-20 w-20 items-center justify-center rounded-2xl ring-2", r.ring, r.glow, chest.locked && "opacity-40 grayscale")}
        style={{ backgroundColor: `${color}1f`, color }}
      >
        <Package className="h-10 w-10" />
      </motion.div>
      <div className="mt-4 font-semibold">{chest.name}</div>
      <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{chest.description}</div>
      <div className="mt-4 w-full">
        {chest.locked ? (
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-muted py-2 text-sm font-medium text-muted-foreground">
            <Lock className="h-4 w-4" /> Nível {chest.requiredLevel}
          </div>
        ) : (
          <button
            onClick={() => onOpen(chest)}
            disabled={!chest.affordable || busy}
            className={cn("flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors",
              chest.affordable ? "bg-primary text-primary-foreground hover:bg-primary/90" : "cursor-not-allowed bg-muted text-muted-foreground")}
          >
            <Gift className="h-4 w-4" /> Abrir · {chest.cost}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Cartão de boost ──
function BoostCard({ boost, buying, onBuy }: { boost: ShopItem; buying: boolean; onBuy: (b: ShopItem) => void }) {
  const r = RARITY[boost.rarity] ?? RARITY.COMMON;
  return (
    <div className="flex flex-col items-center rounded-2xl border bg-card p-6 text-center shadow-sm">
      <div className={cn("flex h-16 w-16 items-center justify-center rounded-full ring-2", r.ring, r.glow, boost.locked && "opacity-40 grayscale")} style={{ backgroundColor: "#f59e0b1f", color: "#f59e0b" }}>
        <Zap className="h-7 w-7" />
      </div>
      <div className="mt-4 font-semibold">{boost.name}</div>
      <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{boost.description}</div>
      <div className="mt-4 w-full">
        {boost.locked ? (
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-muted py-2 text-sm font-medium text-muted-foreground">
            <Lock className="h-4 w-4" /> Nível {boost.requiredLevel}
          </div>
        ) : (
          <button
            onClick={() => onBuy(boost)}
            disabled={!boost.affordable || buying}
            className={cn("flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors",
              boost.affordable ? "bg-primary text-primary-foreground hover:bg-primary/90" : "cursor-not-allowed bg-muted text-muted-foreground")}
          >
            <Zap className="h-4 w-4" /> {buying ? "A ativar…" : `Ativar · ${boost.cost}`}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Overlay de abertura de baú (suspense → revelação) ──
function ChestOpener({ chest, reward, onClose }: { chest: ShopItem; reward: ChestReward | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  const color = (pl(chest.payload).color as string) ?? "#b45309";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm"
      onClick={reward ? onClose : undefined}
    >
      <motion.div
        initial={reduce ? false : { scale: 0.9, y: 12 }} animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-sm rounded-3xl border bg-card p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {reward && (
          <button onClick={onClose} aria-label="Fechar" className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}

        {!reward ? (
          // Suspense: o baú a tremer
          <div className="flex flex-col items-center py-6">
            <motion.div
              animate={reduce ? undefined : { rotate: [-6, 6, -6], scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="flex h-28 w-28 items-center justify-center rounded-3xl shadow-lg"
              style={{ backgroundColor: `${color}2a`, color }}
            >
              <Package className="h-14 w-14" />
            </motion.div>
            <p className="mt-6 font-medium">A abrir {chest.name}…</p>
          </div>
        ) : (
          // Revelação
          <div className="flex flex-col items-center py-4">
            <motion.div
              initial={reduce ? false : { scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <RewardReveal reward={reward} />
            </motion.div>
            <div className="mt-5 text-lg font-bold">{revealTitle(reward)}</div>
            <div className="mt-1 text-sm text-muted-foreground">{revealSubtitle(reward)}</div>
            <button onClick={onClose} className="mt-6 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Boa!
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function RewardReveal({ reward }: { reward: ChestReward }) {
  if (reward.kind === "item") {
    const r = RARITY[reward.rarity] ?? RARITY.COMMON;
    return (
      <div className={cn("relative")}>
        <span className="absolute -inset-6 -z-10 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.4), transparent 70%)" }} />
        <ItemVisual item={{ type: reward.type, rarity: reward.rarity, payload: reward.payload }} size="lg" />
      </div>
    );
  }
  const icon = reward.kind === "boost" ? <Zap className="h-10 w-10" /> : <BookOpen className="h-10 w-10" />;
  const tint = reward.kind === "boost" ? "#f59e0b" : "hsl(var(--primary))";
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl" style={{ backgroundColor: reward.kind === "boost" ? "#f59e0b1f" : "hsl(var(--primary)/0.12)", color: tint }}>
      {icon}
    </div>
  );
}

function revealTitle(reward: ChestReward): string {
  switch (reward.kind) {
    case "books": return `+${reward.books} books`;
    case "boost": return reward.itemName;
    case "duplicate": return reward.itemName;
    case "item": return reward.itemName;
  }
}
function revealSubtitle(reward: ChestReward): string {
  switch (reward.kind) {
    case "books": return "Moedas para a loja";
    case "boost": return "Boost ativado!";
    case "duplicate": return `Já tinhas — recebeste +${reward.refund} books`;
    case "item": return `${RARITY[reward.rarity]?.label ?? reward.rarity} desbloqueado`;
  }
}

// ── Cartão de item da loja ──
function RewardCard({ item, buying, bought, onBuy }: { item: ShopItem; buying: boolean; bought: boolean; onBuy: (i: ShopItem) => void }) {
  const reduce = useReducedMotion();
  const r = RARITY[item.rarity] ?? RARITY.COMMON;

  return (
    <div className={cn("group relative flex h-full flex-col items-center rounded-2xl border bg-card p-5 text-center shadow-sm transition-shadow", !item.locked && "hover:shadow-md")}>
      <span className={cn("absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold", r.chip)}>{r.label}</span>

      <motion.div whileHover={item.locked || reduce ? undefined : { y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className={cn("mt-2", item.locked && "opacity-40 grayscale")}>
        <ItemVisual item={item} />
      </motion.div>

      <div className="mt-4 font-semibold">{item.name}</div>
      <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</div>

      <div className="mt-4 w-full">
        {item.owned ? (
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" /> No teu inventário
          </div>
        ) : item.locked ? (
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-muted py-2 text-sm font-medium text-muted-foreground">
            <Lock className="h-4 w-4" /> Nível {item.requiredLevel}
          </div>
        ) : (
          <button
            onClick={() => onBuy(item)}
            disabled={!item.affordable || buying}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors",
              item.affordable ? "bg-primary text-primary-foreground hover:bg-primary/90" : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            <BookOpen className="h-4 w-4" />
            {buying ? "A comprar…" : item.cost}
          </button>
        )}
      </div>

      {/* Brilho ao comprar */}
      <AnimatePresence>
        {bought && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.4 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-emerald-500/15"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
              <Check className="h-7 w-7" />
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Cartão de destaque (maior) ──
function FeaturedCard({ item, onBuy, buying }: { item: ShopItem; onBuy: (i: ShopItem) => void; buying: boolean }) {
  const r = RARITY[item.rarity] ?? RARITY.COMMON;
  return (
    <div className="relative flex items-center gap-5 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 shadow-sm">
      <ItemVisual item={item} size="lg" />
      <div className="min-w-0 flex-1">
        <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold", r.chip)}>{r.label}</span>
        <div className="mt-1.5 truncate text-lg font-bold">{item.name}</div>
        <div className="line-clamp-2 text-xs text-muted-foreground">{item.description}</div>
        <div className="mt-3">
          {item.owned ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400"><Check className="h-4 w-4" /> No inventário</span>
          ) : item.locked ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Lock className="h-4 w-4" /> Nível {item.requiredLevel}</span>
          ) : (
            <button onClick={() => onBuy(item)} disabled={!item.affordable || buying} className={cn("inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors", item.affordable ? "bg-primary text-primary-foreground hover:bg-primary/90" : "cursor-not-allowed bg-muted text-muted-foreground")}>
              <BookOpen className="h-4 w-4" /> {buying ? "A comprar…" : `${item.cost} books`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

