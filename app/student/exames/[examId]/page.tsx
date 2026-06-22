import { notFound } from "next/navigation";
import { getExamForTaking } from "@/actions/submission.actions";
import { ExamRunner } from "./exam-runner";

export const dynamic = "force-dynamic";

export default async function StudentExamPage({ params }: { params: { examId: string } }) {
  const data = await getExamForTaking(params.examId);
  if (!data) notFound();

  return <ExamRunner data={data} />;
}
