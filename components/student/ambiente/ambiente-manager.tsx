"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Youtube, Music2, LinkIcon, Plus, Trash2, ExternalLink, Headphones } from "lucide-react";
import { addResource, deleteResource } from "@/actions/ambiente.actions";

type Resource = {
  id: string;
  kind: "LINK" | "YOUTUBE" | "SPOTIFY";
  title: string;
  url: string;
};

function ytEmbed(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|live\/|shorts\/))([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}
function spotifyEmbed(url: string): string | null {
  const m = url.match(/open\.spotify\.com\/(intl-[a-z]+\/)?(track|playlist|album|episode|show|artist)\/([\w]+)/);
  return m ? `https://open.spotify.com/embed/${m[2]}/${m[3]}` : null;
}

export function AmbienteManager({ resources }: { resources: Resource[] }) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const media = resources.filter((r) => r.kind !== "LINK");
  const links = resources.filter((r) => r.kind === "LINK");

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
    <div className="mx-auto max-w-7xl p-6 sm:p-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <Headphones className="h-6 w-6 text-primary" /> Ambiente de estudo
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Cria o teu espaço: música lo-fi do YouTube/Spotify e os teus links de estudo, num só lugar.
      </p>

      {/* Adicionar */}
      <form onSubmit={add} className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
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
            placeholder="Cola um link do YouTube, Spotify ou outro"
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
          Dica: cola o link de uma playlist lo-fi do YouTube/Spotify para teres música enquanto estudas.
        </p>
      </form>

      {resources.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-card p-10 text-center shadow-sm">
          <Headphones className="mx-auto h-8 w-8 text-primary/70" />
          <p className="mt-3 text-sm text-muted-foreground">
            Ainda não tens nada aqui. Adiciona uma playlist lo-fi e os teus materiais de estudo.
          </p>
        </div>
      ) : (
        <>
          {/* Ambiente (embeds) */}
          {media.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">A tocar</h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {media.map((r) => {
                  const yt = r.kind === "YOUTUBE" ? ytEmbed(r.url) : null;
                  const sp = r.kind === "SPOTIFY" ? spotifyEmbed(r.url) : null;
                  return (
                    <div key={r.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
                        <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                          {r.kind === "YOUTUBE" ? (
                            <Youtube className="h-4 w-4 shrink-0 text-red-500" />
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
                      ) : (
                        <div className="p-4 text-sm text-muted-foreground">Não foi possível embeber este link.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Os meus materiais (links) */}
          {links.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">Os meus materiais</h2>
              <ul className="space-y-2">
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
  );
}
