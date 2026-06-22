import { notFound } from "next/navigation";
import { getSubmissionForGrading } from "@/actions/grading.actions";
import { GradingForm } from "./grading-form";

export const dynamic = "force-dynamic";

export default async function GradeSubmissionPage({ params }: { params: { submissionId: string } }) {
  const submission = await getSubmissionForGrading(params.submissionId);
  if (!submission) notFound();

  return <GradingForm submission={submission} />;
}
