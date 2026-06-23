import { getHubConfig } from "@/actions/hub.actions";
import { HubCustomizer } from "@/components/student/hub/hub-customizer";

export const dynamic = "force-dynamic";

export default async function StudentHubPage() {
  const config = await getHubConfig();
  return <HubCustomizer {...config} />;
}
