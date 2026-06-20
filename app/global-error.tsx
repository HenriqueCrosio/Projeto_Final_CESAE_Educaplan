"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Algo correu mal</h1>
          <p className="text-neutral-500">{error?.message ?? "Erro inesperado."}</p>
          <button
            onClick={() => reset()}
            className="rounded-md border px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
