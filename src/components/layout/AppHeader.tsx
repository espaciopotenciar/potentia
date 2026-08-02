import Link from "next/link";
import { PotentiaLogo } from "@/components/layout/PotentiaLogo";
import { LearningProgressBadge } from "@/components/shared/LearningProgressBadge";
import { DesktopNav } from "@/components/layout/AppNavigation";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { getLessons } from "@/lib/content/repository";
import { getCompletedLessonIds } from "@/lib/content/progress";
import { Icon } from "@/components/icons";

/**
 * Header del área privada — vive únicamente dentro de
 * src/app/(private)/layout.tsx (el layout ya validó sesión + membresía
 * antes de llegar acá). El progreso que muestra viene de Supabase
 * (learning_progress), no de localStorage.
 */
export async function AppHeader({ role }: { role: "user" | "admin" }) {
  const [lessons, completedIds] = await Promise.all([getLessons(), getCompletedLessonIds()]);
  const percent = lessons.length === 0 ? 0 : Math.round((completedIds.size / lessons.length) * 100);

  return (
    <header className="sticky top-0 z-40 border-b border-potentia-sand/80 bg-potentia-cream/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link href="/app">
          <PotentiaLogo />
        </Link>
        <DesktopNav />
        <div className="flex items-center gap-3">
          <LearningProgressBadge percent={percent} />
          {role === "admin" && (
            <Link
              href="/admin"
              className="hidden items-center gap-1.5 rounded-full border border-potentia-sand px-3.5 py-2 text-sm font-medium text-potentia-ink hover:bg-potentia-sand md:inline-flex"
            >
              <Icon name="layout-grid" className="h-4 w-4" />
              Admin
            </Link>
          )}
          <Link
            href="/app/accionar"
            className="inline-flex items-center gap-1.5 rounded-full bg-potentia-deep px-4 py-2 text-sm font-medium text-white shadow-card transition-transform hover:-translate-y-0.5 hover:bg-potentia-deepDark focus-visible:-translate-y-0.5"
          >
            <Icon name="zap" className="h-4 w-4" />
            Accionar
          </Link>
          <div className="hidden md:block">
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
