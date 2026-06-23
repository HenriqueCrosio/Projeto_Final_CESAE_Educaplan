import { getMyResources } from "@/actions/ambiente.actions";
import { AmbienteManager } from "@/components/student/ambiente/ambiente-manager";

export const dynamic = "force-dynamic";

export default async function AmbientePage() {
  const resources = await getMyResources();
  return <AmbienteManager resources={resources} />;
}
