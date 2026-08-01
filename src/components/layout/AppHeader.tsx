import Link from "next/link";
import { PotentiaLogo } from "@/components/layout/PotentiaLogo";
import { LearningProgressBadge } from "@/components/shared/LearningProgressBadge";
import { DesktopNav } from "@/components/layout/AppNavigation";
import { getDataProvider } from "@/lib/dataProvider";
import { Icon } from "@/components/icons";

export function AppHeader() {
  const lessons = getDataProvider().getLessons();

  return (
    <header className="sticky top-0 z-40 border-b border-potentia-sand/80 bg-potentia-cream/90 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <PotentiaLogo />
        <DesktopNav />
        <div className="flex items-center gap-3">
          <LearningProgressBadge lessons={lessons} />
          <Link
            href="/accionar"
            className="inline-flex items-center gap-1.5 rounded-full bg-potentia-deep px-4 py-2 text-sm font-medium text-white shadow-card transition-transform hover:-translate-y-0.5 hover:bg-potentia-deepDark focus-visible:-translate-y-0.5"
          >
            <Icon name="zap" className="h-4 w-4" />
            Accionar
          </Link>
        </div>
      </div>
    </header>
  );
}
