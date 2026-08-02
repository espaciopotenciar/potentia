"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border border-potentia-sand px-5 text-sm font-medium text-potentia-ink hover:bg-potentia-sand/60 disabled:opacity-60"
    >
      {loading ? "Cerrando sesión…" : "Cerrar sesión"}
    </button>
  );
}
