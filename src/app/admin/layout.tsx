import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { resolveAdminAccess } from "@/lib/auth/membership";
import { PotentiaLogo } from "@/components/layout/PotentiaLogo";
import { SignOutButton } from "@/components/auth/SignOutButton";

/**
 * /admin NO cuelga del grupo (private): la regla de acceso es distinta.
 * (private) exige sesión + MEMBRESÍA ACTIVA; acá se exige sesión + ROL
 * ADMIN, sin importar el estado de la membresía propia del admin (un
 * admin no debería quedar afuera del panel solo porque su propia cuenta
 * de prueba esté suspended). Es una autorización paralela, no una
 * variante de la otra.
 *
 * Middleware (src/lib/supabase/middleware.ts) ya redirige a /login sin
 * sesión; acá se revalida sesión + rol desde cero contra la base — la
 * validación real, igual que en (private)/layout.tsx.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, profile } = await getAuthContext();
  const access = resolveAdminAccess(userId, profile);

  if (access === "login") {
    redirect("/login");
  }
  if (access === "forbidden") {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-potentia-sand/30">
      <header className="border-b border-potentia-sand bg-white">
        <div className="container-app flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <PotentiaLogo compact />
            <span className="text-xs font-semibold uppercase tracking-wide text-potentia-deep">
              Panel administrativo
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app" className="text-sm font-medium text-potentia-muted hover:text-potentia-deep">
              Volver a la app
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="container-app py-10">{children}</main>
    </div>
  );
}
