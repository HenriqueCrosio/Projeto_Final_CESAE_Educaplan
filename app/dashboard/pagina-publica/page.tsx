import { getMyOrgPublicProfile } from "@/actions/public-page.actions";
import { PublicPageEditor } from "./public-page-editor";

export const dynamic = "force-dynamic";

export default async function PaginaPublicaPage() {
  const org = await getMyOrgPublicProfile();

  if (!org) {
    return (
      <div className="mx-auto max-w-3xl p-6 sm:p-8">
        <p className="text-muted-foreground">Não foi possível carregar a sua organização.</p>
      </div>
    );
  }

  return <PublicPageEditor org={org} />;
}
