import { getStudentHomeSummary } from "@/actions/student-view.actions";
import { getMyGameProfile, recordDailyCheckin } from "@/actions/gamification.actions";
import { getHubConfig } from "@/actions/hub.actions";
import { StudentHome } from "@/components/student/student-home";

export const dynamic = "force-dynamic";

export default async function StudentHomePage() {
  // Check-in diário (idempotente) ANTES de ler o perfil, para refletir hoje.
  await recordDailyCheckin();
  const [summary, game, hub] = await Promise.all([
    getStudentHomeSummary(),
    getMyGameProfile(),
    getHubConfig(),
  ]);

  return <StudentHome summary={summary} game={game} hub={hub} />;
}
