"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen, Trophy, Star, Flame, Brain, Target, Rocket, Crown, Gem, Award,
  Check, Ban, Image as ImageIcon, Palette as PaletteIcon, Sparkles, Pencil,
  GraduationCap, ClipboardList, Clock, CheckCircle2, CalendarDays, ArrowRight,
  Settings2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RARITY } from "@/lib/rarity";
import { setHubBanner, setHubPalette, toggleFavoriteBadge, type OwnedCosmetic } from "@/actions/hub.actions";
import { setMyDisplayName } from "@/actions/profile.actions";

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame, Star, BookOpen, Brain, Target, Rocket, Crown, Gem, Award,
};

const p = (x: unknown) => (x ?? {}) as Record<string, string>;

/** Fundo de um banner: imagem/GIF (futuro) tem prioridade sobre o gradiente. */
function bannerStyle(banner: OwnedCosmetic | undefined): React.CSSProperties {
  if (!banner) {
    return { backgroundImage: "linear-gradient(135deg,hsl(var(--primary)/0.45),hsl(var(--primary)/0.15),transparent)" };
  }
  const pay = p(banner.payload);
  if (pay.image) return { backgroundImage: `url("${pay.image}")`, backgroundSize: "cover", backgroundPosition: "center" };
  return { backgroundImage: pay.gradient };
}

function Badge({ item, size = "md" }: { item: OwnedCosmetic; size?: "sm" | "md" }) {
  const pay = p(item.payload);
  const Icon = BADGE_ICONS[pay.icon] ?? Star;
  const color = pay.color ?? "hsl(var(--primary))";
  const r = RARITY[item.rarity] ?? RARITY.COMMON;
  const dim = size === "sm" ? "h-10 w-10" : "h-14 w-14";
  return (
    <div
      className={cn("flex items-center justify-center rounded-full ring-2", dim, r.ring, item.rarity === "LEGENDARY" && r.glow)}
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <Icon className={size === "sm" ? "h-5 w-5" : "h-7 w-7"} />
    </div>
  );
}

interface Summary {
  displayName: string | null;
  classCount: number;
  todo: number;
  inProgress: number;
  graded: number;
  upcoming: { id: string; name: string; course: string | null; date: Date | null; maxScore: number | null }[];
}
interface Game {
  level: number; xp: number; books: number; currentStreak: number;
  levelInto: number; levelNeeded: number;
}
interface Hub {
  bannerItemId: string | null;
  paletteItemId: string | null;
  favoriteBadgeIds: string[];
  banners: OwnedCosmetic[];
  palettes: OwnedCosmetic[];
  badges: OwnedCosmetic[];
}

function formatDate(date: Date | null): string {
  if (!date) return "Sem data";
  return new Date(date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}

export function StudentHome({ summary, game, hub }: { summary: Summary; game: Game; hub: Hub }) {
  const reduce = useReducedMotion();
  const [editing, setEditing] = React.useState(false);
  const [bannerId, setBannerId] = React.useState(hub.bannerItemId);
  const [paletteId, setPaletteId] = React.useState(hub.paletteItemId);
  const [favs, setFavs] = React.useState<string[]>(hub.favoriteBadgeIds);
  const [name, setName] = React.useState<string | null>(summary.displayName);
  const [draft, setDraft] = React.useState(summary.displayName ?? "");
  const [editingName, setEditingName] = React.useState(false);

  const banner = hub.banners.find((b) => b.id === bannerId);
  const palette = hub.palettes.find((pp) => pp.id === paletteId);
  const pal = palette ? p(palette.payload) : null;
  const favBadges = hub.badges.filter((b) => favs.includes(b.id));
  const ownedCount = hub.banners.length + hub.palettes.length + hub.badges.length;

  const levelPct = game.levelNeeded ? Math.min(100, Math.round((game.levelInto / game.levelNeeded) * 100)) : 0;

  async function chooseBanner(id: string | null) { setBannerId(id); await setHubBanner(id).catch(() => {}); }
  async function choosePalette(id: string | null) { setPaletteId(id); await setHubPalette(id).catch(() => {}); }
  async function toggleFav(id: string) {
    const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id].slice(0, 6);
    setFavs(next);
    await toggleFavoriteBadge(id).catch(() => {});
  }
  async function saveName() {
    const v = draft.trim();
    setEditingName(false);
    if (!v || v === name) return;
    setName(v);
    await setMyDisplayName(v).catch(() => {});
  }

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* ── Banner pessoal grande + perfil ── */}
      <motion.section
        layout
        className="overflow-hidden rounded-3xl border shadow-sm"
        style={pal ? { backgroundColor: pal.bg, borderColor: pal.border } : undefined}
      >
        <div className="relative h-44 w-full sm:h-56" style={bannerStyle(banner)}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <button
            onClick={() => setEditing((v) => !v)}
            className={cn(
              "absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium shadow-sm backdrop-blur transition",
              editing ? "bg-primary text-primary-foreground" : "bg-card/85 text-foreground hover:bg-card",
            )}
          >
            {editing ? <><X className="h-4 w-4" /> Concluir</> : <><Settings2 className="h-4 w-4" /> Personalizar</>}
          </button>
        </div>

        <div className="relative px-5 pb-5">
          <div
            className="absolute -top-12 left-5 z-10 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-card text-4xl font-bold text-white shadow-xl ring-1 ring-black/5 sm:h-28 sm:w-28 sm:text-5xl"
            style={{ backgroundColor: pal ? pal.accent : "hsl(var(--primary))" }}
          >
            {(name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3 pl-28 pt-3 sm:pl-32">
            <div className="min-w-0">
            {editing && editingName ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                maxLength={60}
                placeholder="O teu nome"
                className="w-full max-w-xs rounded-md border bg-background px-2 py-1 text-2xl font-bold outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <button
                onClick={() => { if (editing) { setDraft(name ?? ""); setEditingName(true); } }}
                className={cn("group flex items-center gap-2 text-2xl font-bold", !editing && "cursor-default")}
                style={pal ? { color: pal.accent } : undefined}
              >
                {name ?? (editing ? "Define o teu nome" : "Olá!")}
                {editing && <Pencil className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />}
              </button>
            )}
            {/* Stats de jogo */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Trophy className="h-4 w-4 text-primary" /> Nível {game.level}
              </span>
              <span className="text-muted-foreground">{game.xp} XP</span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" /> <span className="font-medium">{game.books}</span>
                <span className="text-muted-foreground">books</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500" /> <span className="font-medium">{game.currentStreak}</span>
                <span className="text-muted-foreground">{game.currentStreak === 1 ? "dia" : "dias"}</span>
              </span>
            </div>
          </div>
            {favBadges.length > 0 && (
              <div className="flex gap-2 pb-1">
                {favBadges.map((b) => <Badge key={b.id} item={b} size="sm" />)}
              </div>
            )}
          </div>
        </div>

        {/* Barra de progresso de nível */}
        <div className="px-5 pb-5">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{game.levelNeeded - game.levelInto} XP para o nível {game.level + 1}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
              initial={{ width: 0 }}
              animate={{ width: `${levelPct}%` }}
              transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </motion.section>

      {/* ── Modo Personalizar: equipar inline (a coleção é o painel) ── */}
      {editing && (
        <motion.section
          initial={reduce ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-6 rounded-2xl border bg-muted/30 p-5"
        >
          {ownedCount === 0 ? (
            <div className="py-6 text-center">
              <Sparkles className="mx-auto h-7 w-7 text-primary/70" />
              <p className="mt-2 text-sm text-muted-foreground">
                Ainda não tens itens. Vai a <Link href="/student/recompensas" className="font-medium text-primary hover:underline">Recompensas</Link> e desbloqueia banners, paletas e badges.
              </p>
            </div>
          ) : (
            <>
              <EditGroup icon={ImageIcon} title="Banner">
                <NoneOption active={!bannerId} onClick={() => chooseBanner(null)} />
                {hub.banners.map((b) => {
                  const r = RARITY[b.rarity] ?? RARITY.COMMON;
                  return (
                    <button
                      key={b.id}
                      onClick={() => chooseBanner(b.id)}
                      title={`${b.name} · ${r.label}`}
                      className={cn("h-14 w-24 shrink-0 rounded-xl ring-2 transition", bannerId === b.id ? "ring-primary" : cn(r.ring, b.rarity === "LEGENDARY" && r.glow))}
                      style={bannerStyle(b)}
                    />
                  );
                })}
              </EditGroup>

              <EditGroup icon={PaletteIcon} title="Paleta">
                <NoneOption active={!paletteId} onClick={() => choosePalette(null)} />
                {hub.palettes.map((pp) => {
                  const c = p(pp.payload);
                  const r = RARITY[pp.rarity] ?? RARITY.COMMON;
                  return (
                    <button
                      key={pp.id}
                      onClick={() => choosePalette(pp.id)}
                      title={`${pp.name} · ${r.label}`}
                      className={cn("flex h-14 w-14 shrink-0 items-center justify-center gap-1 rounded-xl p-2 ring-2 transition", paletteId === pp.id ? "ring-primary" : cn(r.ring, pp.rarity === "LEGENDARY" && r.glow))}
                      style={{ backgroundColor: c.bg }}
                    >
                      <span className="h-6 w-2.5 rounded-full" style={{ backgroundColor: c.accent }} />
                      <span className="h-6 w-2.5 rounded-full" style={{ backgroundColor: c.border }} />
                    </button>
                  );
                })}
              </EditGroup>

              <EditGroup icon={Award} title={`Badges favoritas (${favs.length}/6)`}>
                {hub.badges.length === 0 ? (
                  <span className="text-sm text-muted-foreground">Sem badges ainda.</span>
                ) : (
                  hub.badges.map((b) => {
                    const on = favs.includes(b.id);
                    return (
                      <button key={b.id} onClick={() => toggleFav(b.id)} className="relative shrink-0" title={b.name}>
                        <span className={cn("block rounded-full ring-offset-2 ring-offset-background transition", on && "ring-2 ring-primary")}>
                          <Badge item={b} />
                        </span>
                        {on && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </EditGroup>
            </>
          )}
        </motion.section>
      )}

      {/* ── Resumo (o que fazer) ── */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Turmas" value={summary.classCount} tint="bg-primary/10 text-primary" />
        <StatCard icon={ClipboardList} label="Exames por fazer" value={summary.todo} tint="bg-blue-500/10 text-blue-500" />
        <StatCard icon={Clock} label="A aguardar nota" value={summary.inProgress} tint="bg-amber-500/10 text-amber-500" />
        <StatCard icon={CheckCircle2} label="Avaliados" value={summary.graded} tint="bg-emerald-500/10 text-emerald-500" />
      </div>

      {/* ── Próximos exames ── */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Próximos exames</h2>
        {summary.upcoming.length === 0 ? (
          <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
            Não tens exames por fazer. 🎉
          </div>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border bg-card shadow-sm">
            {summary.upcoming.map((e) => (
              <li key={e.id}>
                <Link href={`/student/exames/${e.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{e.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {e.course ?? "—"} · {formatDate(e.date)}{e.maxScore ? ` · ${e.maxScore} pts` : ""}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── A minha coleção (montra; equipar via Personalizar) ── */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">A minha coleção</h2>
          {ownedCount > 0 && !editing && (
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <Settings2 className="h-4 w-4" /> Personalizar
            </button>
          )}
        </div>
        {ownedCount === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <Trophy className="mx-auto h-8 w-8 text-primary/70" />
            <p className="mt-3 text-sm text-muted-foreground">
              A tua coleção está vazia. Ganha books e desbloqueia recompensas em{" "}
              <Link href="/student/recompensas" className="font-medium text-primary hover:underline">Recompensas</Link>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[...hub.badges, ...hub.banners, ...hub.palettes].map((item) => {
              const r = RARITY[item.rarity] ?? RARITY.COMMON;
              const equipped = item.id === bannerId || item.id === paletteId || favs.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center shadow-sm ring-2 ring-inset",
                    r.ring, item.rarity === "LEGENDARY" && r.glow,
                  )}
                >
                  {equipped && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                      <Check className="h-3 w-3" /> Equipado
                    </span>
                  )}
                  <CosmeticPreview item={item} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{item.name}</div>
                    <div className={cn("mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", r.chip)}>{r.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Atalho turmas */}
      <div className="mt-8">
        <Link href="/student/turmas" className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          Ver as minhas turmas
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

function CosmeticPreview({ item }: { item: OwnedCosmetic }) {
  if (item.type === "BADGE") return <Badge item={item} />;
  if (item.type === "BANNER") return <div className="h-12 w-full rounded-lg" style={bannerStyle(item)} />;
  if (item.type === "PALETTE") {
    const c = p(item.payload);
    return (
      <div className="flex h-12 w-full items-center justify-center gap-1.5 rounded-lg" style={{ backgroundColor: c.bg }}>
        <span className="h-7 w-3 rounded-full" style={{ backgroundColor: c.accent }} />
        <span className="h-7 w-3 rounded-full" style={{ backgroundColor: c.border }} />
      </div>
    );
  }
  return null;
}

function StatCard({ icon: Icon, label, value, tint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tint: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tint)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-3 text-3xl font-bold leading-none">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function EditGroup({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function NoneOption({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-dashed transition", active ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-foreground/30")} title="Nenhum">
      <Ban className="h-5 w-5" />
    </button>
  );
}
