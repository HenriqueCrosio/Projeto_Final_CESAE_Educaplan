export const dynamic = "force-dynamic";

// Vitrine pública: scroll próprio (o body é overflow-hidden, cada área gere o seu).
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-[calc(100dvh-3.5rem)] overflow-y-auto">{children}</div>;
}
