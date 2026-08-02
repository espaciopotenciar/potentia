import type { Metadata } from "next";
import { PotentiaLogo } from "@/components/layout/PotentiaLogo";
import { ActualizarClaveForm } from "@/components/auth/ActualizarClaveForm";

export const metadata: Metadata = {
  title: "Actualizar contraseña — Potentia",
};

export default function ActualizarClavePage() {
  return (
    <div className="container-app flex min-h-[70vh] max-w-md flex-col justify-center py-10">
      <div className="mb-8 text-center">
        <PotentiaLogo />
      </div>
      <div className="rounded-2xl border border-potentia-sand bg-white p-6 shadow-card">
        <h1 className="mb-1 text-xl font-semibold text-potentia-ink">Elegí una contraseña nueva</h1>
        <p className="mb-6 text-sm text-potentia-muted">
          Tiene que tener al menos 8 caracteres.
        </p>
        <ActualizarClaveForm />
      </div>
    </div>
  );
}
