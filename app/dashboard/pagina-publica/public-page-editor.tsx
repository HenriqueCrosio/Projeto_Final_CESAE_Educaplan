"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Globe, ExternalLink, Eye, Loader2, Check, GraduationCap } from "lucide-react";
import { updateOrgPublicProfile } from "@/actions/public-page.actions";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrgProfile {
  id: string;
  name: string;
  slug: string;
  isPublic: boolean;
  headline: string | null;
  description: string | null;
  bannerUrl: string | null;
  logoUrl: string | null;
  brandColor: string | null;
}

const DEFAULT_BRAND = "#fa850f"; // âmbar (cor de marca do Educaplan)
const isHex = (v: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v);

export function PublicPageEditor({ org }: { org: OrgProfile }) {
  const [isPublic, setIsPublic] = useState(org.isPublic);
  const [headline, setHeadline] = useState(org.headline ?? "");
  const [description, setDescription] = useState(org.description ?? "");
  const [bannerUrl, setBannerUrl] = useState(org.bannerUrl ?? "");
  const [logoUrl, setLogoUrl] = useState(org.logoUrl ?? "");
  const [brandColor, setBrandColor] = useState(org.brandColor ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accent = brandColor.trim() || DEFAULT_BRAND;
  const banner = bannerUrl.trim();
  const logo = logoUrl.trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateOrgPublicProfile({ isPublic, headline, description, bannerUrl, logoUrl, brandColor });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-6 sm:p-8">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-primary">
          <Globe className="h-5 w-5" />
          <span className="text-sm font-medium">Vitrine</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Página pública</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          A montra da sua organização. O conteúdo dos cursos continua privado — aqui só aparece a
          identidade e os cursos publicados.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        {/* ── Formulário ── */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Visibilidade */}
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
            <div>
              <p className="font-medium">Página visível ao público</p>
              <p className="text-sm text-muted-foreground">
                Quando ativa, qualquer pessoa pode ver <code className="text-xs">/p/{org.slug}</code>.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              aria-label="Página visível ao público"
              onClick={() => setIsPublic((v) => !v)}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isPublic ? "bg-primary" : "bg-input",
              )}
            >
              <span
                className={cn(
                  "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  isPublic && "translate-x-5",
                )}
              />
            </button>
          </label>

          {/* Identidade visual */}
          <section className="space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Identidade visual
            </h2>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL do logótipo</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bannerUrl">URL do banner</Label>
              <Input
                id="bannerUrl"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">Cole o link de uma imagem (sem upload).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandColor">Cor de marca</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={isHex(accent) ? accent : DEFAULT_BRAND}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-md border border-border bg-transparent"
                  aria-label="Escolher cor de marca"
                />
                <Input
                  id="brandColor"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  placeholder={DEFAULT_BRAND}
                  className="max-w-[10rem] font-mono"
                />
              </div>
            </div>
          </section>

          {/* Conteúdo */}
          <section className="space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Conteúdo
            </h2>

            <div className="space-y-2">
              <Label htmlFor="headline">Frase de destaque</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ex.: Formação prática em tecnologia"
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conte o que torna a sua organização especial."
                rows={4}
                maxLength={2000}
              />
            </div>
          </section>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> A guardar…
                </>
              ) : saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Guardado
                </>
              ) : (
                "Guardar alterações"
              )}
            </Button>
            {isPublic && (
              <Button asChild variant="outline">
                <Link href={`/p/${org.slug}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" /> Ver página
                </Link>
              </Button>
            )}
          </div>
        </form>

        {/* ── Pré-visualização (espelha o hero da página real) ── */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Eye className="h-4 w-4" /> Pré-visualização
          </p>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Hero em miniatura */}
            <div className="relative flex h-40 flex-col justify-end overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: banner
                    ? `url("${banner}")`
                    : `linear-gradient(135deg, ${accent}, color-mix(in oklab, ${accent} 55%, black))`,
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.35) 65%, rgba(0,0,0,0.8) 100%)",
                }}
              />
              <div className="relative flex items-end gap-2.5 p-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-white/25"
                  style={{ backgroundColor: logo ? "rgba(255,255,255,0.08)" : accent }}
                >
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-white">
                      {org.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 pb-0.5">
                  <p className="truncate text-base font-bold leading-tight text-white">{org.name}</p>
                  {headline.trim() && (
                    <p className="truncate text-xs text-white/85">{headline}</p>
                  )}
                </div>
              </div>
            </div>
            {/* Corpo em miniatura */}
            <div className="space-y-3 p-4">
              {description.trim() && (
                <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
              )}
              <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" style={{ color: accent }} />
                Cursos publicados aparecem aqui.
              </div>
            </div>
          </div>
          {!isPublic && (
            <p className="mt-2 text-xs text-muted-foreground">
              A página está privada — ative para a publicar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
