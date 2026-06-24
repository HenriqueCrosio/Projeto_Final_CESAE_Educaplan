import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen, GraduationCap } from "lucide-react";
import { getPublicOrgBySlug } from "@/actions/public-page.actions";

const DEFAULT_BRAND = "#fa850f"; // âmbar Educaplan

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const org = await getPublicOrgBySlug(slug);
  if (!org) return { title: "Página não encontrada · Educaplan" };
  return {
    title: `${org.name} · Educaplan`,
    description: org.headline ?? org.description ?? undefined,
  };
}

export default async function PublicOrgPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const org = await getPublicOrgBySlug(slug);
  if (!org) notFound();

  const accent = org.brandColor ?? DEFAULT_BRAND;
  const initial = org.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-full bg-background" style={{ ["--brand" as string]: accent }}>
      {/* ── Hero full-bleed: imagem da org (ou gradiente da marca) + scrim ── */}
      <header className="relative isolate flex min-h-[clamp(20rem,42vh,28rem)] flex-col justify-end overflow-hidden">
        {/* Camada de fundo */}
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage: org.bannerUrl
              ? `url("${org.bannerUrl}")`
              : `linear-gradient(135deg, var(--brand), color-mix(in oklab, var(--brand) 55%, black))`,
          }}
        />
        {/* Scrim: tinta de marca + escurecimento na base para legibilidade */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--brand) 22%, transparent) 0%, transparent 30%, rgba(0,0,0,0.35) 62%, rgba(0,0,0,0.78) 100%)",
          }}
        />

        <div className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-6 sm:pb-10">
          <div className="ep-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/25 sm:h-24 sm:w-24"
              style={{ backgroundColor: org.logoUrl ? "rgba(255,255,255,0.08)" : accent }}
            >
              {org.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={org.logoUrl} alt={`Logótipo de ${org.name}`} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{initial}</span>
              )}
            </div>
            <div className="min-w-0 pb-0.5">
              <h1
                className="text-3xl font-bold tracking-tight text-white sm:text-5xl"
                style={{ textWrap: "balance" }}
              >
                {org.name}
              </h1>
              {org.headline && (
                <p className="mt-1.5 max-w-2xl text-base text-white/85 sm:text-lg">{org.headline}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Corpo ── */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {org.description && (
          <p
            className="ep-rise mt-8 max-w-[68ch] whitespace-pre-line text-lg leading-relaxed text-foreground/80"
            style={{ animationDelay: "80ms" }}
          >
            {org.description}
          </p>
        )}

        {/* Catálogo de cursos publicados */}
        <section className="ep-rise mt-14" style={{ animationDelay: "140ms" }}>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Cursos</h2>
            {org.courses.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {org.courses.length} {org.courses.length === 1 ? "curso" : "cursos"}
              </span>
            )}
          </div>

          {org.courses.length === 0 ? (
            <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `color-mix(in oklab, ${accent} 12%, transparent)`, color: accent }}
              >
                <GraduationCap className="h-6 w-6" />
              </div>
              <p className="mt-3 font-medium">Catálogo a chegar</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Esta organização ainda não publicou cursos.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
              {org.courses.map((course) => (
                <article
                  key={course.id}
                  className="group rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ ["--brand" as string]: accent }}
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                    style={{ backgroundColor: `color-mix(in oklab, ${accent} 12%, transparent)`, color: accent }}
                  >
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {course.category}
                  </span>
                  <h3 className="mt-1 font-semibold leading-snug">{course.name}</h3>
                  {course.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {course.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-20 flex items-center gap-2 border-t border-border py-6 text-sm text-muted-foreground">
          <GraduationCap className="h-4 w-4" style={{ color: accent }} />
          <span>
            Página pública no <span className="font-medium text-foreground">Educaplan</span> · o acesso
            ao conteúdo é por convite.
          </span>
        </footer>
      </div>
    </div>
  );
}
