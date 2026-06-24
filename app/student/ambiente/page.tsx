import { getMyResources } from "@/actions/ambiente.actions";
import { getHubConfig } from "@/actions/hub.actions";
import { AmbienteManager } from "@/components/student/ambiente/ambiente-manager";

export const dynamic = "force-dynamic";

const pay = (x: unknown) => (x ?? {}) as Record<string, string>;

export default async function AmbientePage() {
  const [resources, hub] = await Promise.all([getMyResources(), getHubConfig()]);

  // Banner + paleta equipados no Hub → herdados como "cara" cozy do Ambiente.
  const banner = hub.banners.find((b) => b.id === hub.bannerItemId);
  const palette = hub.palettes.find((p) => p.id === hub.paletteItemId);

  return (
    <AmbienteManager
      resources={resources}
      banner={banner ? pay(banner.payload) : null}
      palette={palette ? pay(palette.payload) : null}
    />
  );
}
