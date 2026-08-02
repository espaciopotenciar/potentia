import type { Metadata } from "next";
import { Suspense } from "react";
import { PotentiaLogo } from "@/components/layout/PotentiaLogo";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Ingresar — Potentia",
};

export default function LoginPage() {
  return (
    <div className="container-app flex min-h-[70vh] max-w-md flex-col justify-center py-10">
      <div className="mb-8 text-center">
        <PotentiaLogo />
      </div>
      <div className="rounded-2xl border border-potentia-sand bg-white p-6 shadow-card">
        <h1 className="mb-1 text-xl font-semibold text-potentia-ink">Ingresá a tu cuenta</h1>
        <p className="mb-6 text-sm text-potentia-muted">
          Potentia es de acceso por invitación. Si todavía no recibiste la tuya,
          consultá con tu administradora.
        </p>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
