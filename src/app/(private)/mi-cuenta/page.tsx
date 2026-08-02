import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth/session";
import { UpdateFullNameForm } from "@/components/auth/UpdateFullNameForm";

export const metadata: Metadata = {
  title: "Mi cuenta — Potentia",
};

export default async function MiCuentaPage() {
  const { profile } = await getAuthContext();

  if (!profile) {
    redirect("/membresia-inactiva");
  }

  return (
    <div className="container-app max-w-lg py-10">
      <Link href="/app" className="text-sm font-medium text-potentia-muted hover:text-potentia-deep">
        ← Volver
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-potentia-ink">Mi cuenta</h1>
      <p className="mt-2 text-sm text-potentia-muted">
        Por ahora solo podés editar tu nombre. El email y el rol no son editables
        desde acá.
      </p>

      <div className="mt-6 rounded-2xl border border-potentia-sand bg-white p-6">
        <UpdateFullNameForm initialFullName={profile.full_name} />
      </div>
    </div>
  );
}
