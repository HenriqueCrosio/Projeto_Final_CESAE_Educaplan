"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Youtube, Music2, Apple, LinkIcon, Plus, Trash2, ExternalLink, Headphones } from "lucide-react";
import { addResource, deleteResource } from "@/actions/ambiente.actions";
import { cn } from "@/lib/utils";

type Resource = {
  id: string;
  kind: "LINK" | "YOUTUBE" | "SPOTIFY" | "APPLE_MUSIC";
  title: string;
  url: string;
};
type Payload = Record<string, string> | null;

function ytEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/|shorts\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}
function spotifyEmbed(url: string): string | null {
  const m = url.match(/open\.spotify\.com\/(intl-[a-z]+\/)?(track|playlist|album|episode|show|artist)\/([\w]+)/);
  return m ? `https://open.spotify.com/embed/${m[2]}/${m[3]}` : null;
}
function appleEmbed(url: string): string | null {
  if (!/music\.apple\.com/i.test(url)) return null;
  return url.replace(/^https?:\/\/music\.apple\.com/i, "https://embed.music.apple.com");
}

/** Fundo do banner herdado: imagem/GIF (futuro) tem prioridade sobre o gradiente. */
function bannerBg(banner: Payload): React.CSSProperties {
  if (banner?.image) return { backgroundImage: `url("${banner.image}")`, backgroundSize: "cover", backgroundPosition: "center" };
  if (banner?.gradient) return { backgroundImage: banner.gradient };
  return { backgroundImage: "linear-gradient(135deg,hsl(var(--primary)/0.6),hsl(var(--primary)/0.25),transparent)" };
}

export function AmbienteManager({
  resources,
  banner,
  palette,
}: {
  resources: Resource[];
  banner: Payload;
  palette: Payload;
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const media = resources.filter((r) => r.kind !== "LINK");
  const links = resources.filter((r) => r.kind === "LINK");
  const accent = palette?.accent;
  // Títulos sobre a parede pastel da moldura: usam o accent (legível em qualquer tema).
  const headingStyle = accent ? { color: accent } : undefined;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await addResource(title, url);
    setBusy(false);
    if (res.ok) {
      setTitle("");
      setUrl("");
      router.refresh();
    } else {
      setError(res.error);
    }
  }
  async function remove(id: string) {
    await deleteResource(id);
    router.refresh();
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      {/* ── Moldura: o "quarto" do aluno. O fundo é a paleta equipada (muda no Início). ── */}
      <div
        className={cn(
          "rounded-[1.75rem] border-2 p-4 shadow-sm sm:p-6",
          !palette && "border-border bg-muted/40",
        )}
        style={palette ? { backgroundColor: palette.bg, borderColor: palette.border } : undefined}
      >
        {/* Backdrop herdado: a "cara" cozy do aluno */}
        <header className="relative overflow-hidden rounded-2xl border border-black/5 shadow-sm">
          <div className="h-40 w-full sm:h-52" style={bannerBg(banner)} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
              <Headphones className="h-6 w-6" /> O teu ambiente de estudo
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/85">
              Música, foco e os teus materiais — no espaço que tu montas. Muda o banner e a paleta no teu Início.
            </p>
          </div>
        </header>

        {/* Adicionar */}
        <form onSubmit={add} className="mt-5 rounded-2xl border bg-card p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome (ex.: Lo-fi para focar)"
              maxLength={100}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Cola um link do YouTube, Spotify, Apple Music ou outro"
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={busy}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> {busy ? "A adicionar…" : "Adicionar"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          <p className="mt-2 text-xs text-muted-foreground">
            Dica: cola uma playlist lo-fi (YouTube/Spotify/Apple Music) para teres música enquanto estudas.
          </p>
        </form>

        {resources.length === 0 ? (
          <div className="mt-5 rounded-2xl border bg-card p-10 text-center shadow-sm">
            <Headphones className="mx-auto h-8 w-8" style={accent ? { color: accent } : undefined} />
            <p className="mt-3 text-sm text-muted-foreground">
              Ainda não tens nada aqui. Adiciona uma playlist e os teus materiais de estudo.
            </p>
          </div>
        ) : (
          <>
            {media.length > 0 && (
              <section className="mt-6">
                <h2 className="mb-3 text-lg font-semibold" style={headingStyle}>A tocar</h2>
                <div className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {media.map((r) => {
                    const yt = r.kind === "YOUTUBE" ? ytEmbed(r.url) : null;
                    const sp = r.kind === "SPOTIFY" ? spotifyEmbed(r.url) : null;
                    const ap = r.kind === "APPLE_MUSIC" ? appleEmbed(r.url) : null;
                    return (
                      <div key={r.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
                          <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                            {r.kind === "YOUTUBE" ? (
                              <Youtube className="h-4 w-4 shrink-0 text-red-500" />
                            ) : r.kind === "APPLE_MUSIC" ? (
                              <Apple className="h-4 w-4 shrink-0 text-pink-500" />
                            ) : (
                              <Music2 className="h-4 w-4 shrink-0 text-emerald-500" />
                            )}
                            <span className="truncate">{r.title}</span>
                          </span>
                          <button onClick={() => remove(r.id)} aria-label="Remover" className="shrink-0 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {yt ? (
                          <div className="aspect-video w-full">
                            <iframe
                              src={yt}
                              title={r.title}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : sp ? (
                          <iframe src={sp} title={r.title} className="w-full" height={152} allow="encrypted-media" />
                        ) : ap ? (
                          <iframe
                            src={ap}
                            title={r.title}
                            className="w-full"
                            height={175}
                            allow="autoplay *; encrypted-media *;"
                            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                          />
                        ) : (
                          <div className="p-4 text-sm text-muted-foreground">Não foi possível embeber este link.</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {links.length > 0 && (
              <section className="mt-6">
                <h2 className="mb-3 text-lg font-semibold" style={headingStyle}>Os meus materiais</h2>
                <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {links.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <LinkIcon className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate font-medium">{r.title}</span>
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-primary hover:bg-accent"
                        >
                          Abrir <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button onClick={() => remove(r.id)} aria-label="Remover" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
