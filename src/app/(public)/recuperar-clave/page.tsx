import type { Metadata } from "next";
import Link from "next/link";
import { PotentiaLogo } from "@/components/layout/PotentiaLogo";
import { RecuperarClaveForm } from "@/components/auth/RecuperarClaveForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña — Potentia",
};

export default function RecuperarClavePage() {
  return (
    <div className="container-app flex min-h-[70vh] max-w-md flex-col justify-center py-10">
      <div className="mb-8 text-center">
        <PotentiaLogo />
      </div>
      <div className="rounded-2xl border border-potentia-sand bg-white p-6 shadow-card">
        <h1 className="mb-1 text-xl font-semibold text-potentia-ink">Recuperar contraseña</h1>
        <p className="mb-6 text-sm text-potentia-muted">
          Ingresá el email de tu cuenta y te enviamos un enlace para elegir una
          contraseña nueva.
        </p>
        <RecuperarClaveForm />
        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-medium text-potentia-deep hover:underline">
            Volver a ingresar
          </Link>
        </p>
      </div>
    </div>
  );
}
