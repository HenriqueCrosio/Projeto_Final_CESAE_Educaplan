import { StudentSidebar } from "@/components/student/student-sidebar";
import { StudentBottomNav } from "@/components/student/student-bottom-nav";

export const dynamic = "force-dynamic";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full">
      <StudentSidebar />
      <main className="min-h-[calc(100dvh-3.5rem)] flex-1 overflow-y-auto bg-muted/20 pb-20 md:pb-0">
        {children}
      </main>
      <StudentBottomNav />
    </div>
  );
}
