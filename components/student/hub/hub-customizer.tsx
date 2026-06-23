"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen, Trophy, Star, Flame, Brain, Target, Rocket, Crown, Gem, Award,
  Check, Image as ImageIcon, Palette as PaletteIcon, Ban, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setHubBanner, setHubPalette, toggleFavoriteBadge, type OwnedCosmetic } from "@/actions/hub.actions";

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame, Star, BookOpen, Brain, Target, Rocket, Crown, Gem, Award,
};
const RARITY_RING: Record<string, string> = {
  COMMON: "ring-slate-300 dark:ring-slate-600",
  RARE: "ring-sky-400",
  EPIC: "ring-violet-400",
  LEGENDARY: "ring-amber-400",
};

const p = (x: unknown) => (x ?? {}) as Record<string, string>;

function Badge({ item, size = "md" }: { item: OwnedCosmetic; size?: "sm" | "md" }) {
  const pay = p(item.payload);
  const Icon = BADGE_ICONS[pay.icon] ?? Star;
  const color = pay.color ?? "#6366f1";
  const dim = size === "sm" ? "h-10 w-10" : "h-14 w-14";
  return (
    <div className={cn("flex items-center justify-center rounded-full ring-2", dim, RARITY_RING[item.rarity] ?? RARITY_RING.COMMON)} style={{ backgroundColor: `${color}1f`, color }}>
      <Icon className={size === "sm" ? "h-5 w-5" : "h-7 w-7"} />
    </div>
  );
}

export function HubCustomizer(props: {
  displayName: string;
  level: number;
  xp: number;
  books: number;
  bannerItemId: string | null;
  paletteItemId: string | null;
  favoriteBadgeIds: string[];
  banners: OwnedCosmetic[];
  palettes: OwnedCosmetic[];
  badges: OwnedCosmetic[];
}) {
  const reduce = useReducedMotion();
  const [bannerId, setBannerId] = React.useState(props.bannerItemId);
  const [paletteId, setPaletteId] = React.useState(props.paletteItemId);
  const [favs, setFavs] = React.useState<string[]>(props.favoriteBadgeIds);

  const banner = props.banners.find((b) => b.id === bannerId);
  const palette = props.palettes.find((pp) => pp.id === paletteId);
  const pal = palette ? p(palette.payload) : null;
  const favBadges = props.badges.filter((b) => favs.includes(b.id));

  const hasNothing = props.banners.length + props.palettes.length + props.badges.length === 0;

  async function chooseBanner(id: string | null) {
    setBannerId(id);
    await setHubBanner(id).catch(() => {});
  }
  async function choosePalette(id: string | null) {
    setPaletteId(id);
    await setHubPalette(id).catch(() => {});
  }
  async function toggleFav(id: string) {
    const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id].slice(0, 6);
    setFavs(next);
    await toggleFavoriteBadge(id).catch(() => {});
  }

  return (
    <div className="mx-auto max-w-7xl p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight">Hub de Estudos</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        O teu espaço pessoal. Equipa o que desbloqueaste na loja.
      </p>

      {/* Cartão pessoal (live) */}
      <motion.div
        layout
        className="mt-6 overflow-hidden rounded-2xl border shadow-sm"
        style={pal ? { backgroundColor: pal.bg, borderColor: pal.border } : undefined}
      >
        <div className="h-28 sm:h-32" style={{ backgroundImage: banner ? p(banner.payload).gradient : "linear-gradient(135deg,hsl(var(--primary)/0.35),hsl(var(--primary)/0.12),transparent)" }} />
        <div className="flex flex-wrap items-end gap-4 p-5">
          <div
            className="-mt-14 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card text-3xl font-bold text-white shadow-lg"
            style={{ backgroundColor: pal ? pal.accent : "hsl(var(--primary))" }}
          >
            {props.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-bold" style={pal ? { color: pal.accent } : undefined}>{props.displayName}</div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> Nível {props.level}</span>
              <span>{props.xp} XP</span>
              <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {props.books} books</span>
            </div>
          </div>
          {/* Badges favoritas */}
          {favBadges.length > 0 && (
            <div className="flex gap-2">
              {favBadges.map((b) => (
                <Badge key={b.id} item={b} size="sm" />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {hasNothing ? (
        <div className="mt-8 rounded-2xl border bg-card p-10 text-center shadow-sm">
          <Sparkles className="mx-auto h-8 w-8 text-primary/70" />
          <p className="mt-3 text-sm text-muted-foreground">
            Ainda não tens itens para equipar. Vai a <strong>Recompensas</strong>, ganha books e desbloqueia banners, paletas e badges.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Banner */}
          <Section icon={ImageIcon} title="Banner">
            <OptionRow>
              <NoneOption active={!bannerId} onClick={() => chooseBanner(null)} />
              {props.banners.map((b) => (
                <button key={b.id} onClick={() => chooseBanner(b.id)} className={cn("h-14 w-24 shrink-0 rounded-xl ring-2 transition", bannerId === b.id ? "ring-primary" : "ring-transparent hover:ring-border")} style={{ backgroundImage: p(b.payload).gradient }} title={b.name} />
              ))}
            </OptionRow>
          </Section>

          {/* Paleta */}
          <Section icon={PaletteIcon} title="Paleta de cores">
            <OptionRow>
              <NoneOption active={!paletteId} onClick={() => choosePalette(null)} />
              {props.palettes.map((pp) => {
                const c = p(pp.payload);
                return (
                  <button key={pp.id} onClick={() => choosePalette(pp.id)} className={cn("flex h-14 w-14 shrink-0 items-center justify-center gap-1 rounded-xl ring-2 p-2 transition", paletteId === pp.id ? "ring-primary" : "ring-transparent hover:ring-border")} style={{ backgroundColor: c.bg }} title={pp.name}>
                    <span className="h-6 w-2.5 rounded-full" style={{ backgroundColor: c.accent }} />
                    <span className="h-6 w-2.5 rounded-full" style={{ backgroundColor: c.border }} />
                  </button>
                );
              })}
            </OptionRow>
          </Section>

          {/* Badges favoritas */}
          <Section icon={Award} title={`Badges favoritas (${favs.length}/6)`}>
            <OptionRow>
              {props.badges.length === 0 ? (
                <span className="text-sm text-muted-foreground">Sem badges ainda — desbloqueia na loja.</span>
              ) : (
                props.badges.map((b) => {
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
            </OptionRow>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h2>
      {children}
    </div>
  );
}

function OptionRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

function NoneOption({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-dashed transition", active ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-foreground/30")} title="Nenhum">
      <Ban className="h-5 w-5" />
    </button>
  );
}
