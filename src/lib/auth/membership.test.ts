import { describe, expect, it } from "vitest";
import { hasActiveMembership, resolveAdminAccess, resolveAppAccess } from "@/lib/auth/membership";

const FUTURE = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
const PAST = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();

describe("hasActiveMembership", () => {
  it("sin fila de subscription: bloqueado", () => {
    expect(hasActiveMembership(null)).toBe(false);
  });

  it("trial sin access_until: permitido", () => {
    expect(hasActiveMembership({ status: "trial", access_until: null })).toBe(true);
  });

  it("trial con access_until futuro: permitido", () => {
    expect(hasActiveMembership({ status: "trial", access_until: FUTURE })).toBe(true);
  });

  it("trial con access_until pasado: bloqueado (vencido)", () => {
    expect(hasActiveMembership({ status: "trial", access_until: PAST })).toBe(false);
  });

  it("active sin access_until: permitido", () => {
    expect(hasActiveMembership({ status: "active", access_until: null })).toBe(true);
  });

  it("active con access_until futuro: permitido", () => {
    expect(hasActiveMembership({ status: "active", access_until: FUTURE })).toBe(true);
  });

  it("active con access_until pasado: bloqueado", () => {
    expect(hasActiveMembership({ status: "active", access_until: PAST })).toBe(false);
  });

  it("suspended: bloqueado siempre, aunque access_until sea futuro", () => {
    expect(hasActiveMembership({ status: "suspended", access_until: FUTURE })).toBe(false);
    expect(hasActiveMembership({ status: "suspended", access_until: null })).toBe(false);
  });

  it("past_due: bloqueado siempre, aunque access_until sea futuro", () => {
    expect(hasActiveMembership({ status: "past_due", access_until: FUTURE })).toBe(false);
    expect(hasActiveMembership({ status: "past_due", access_until: null })).toBe(false);
  });

  it("cancelled con access_until futuro: permitido", () => {
    expect(hasActiveMembership({ status: "cancelled", access_until: FUTURE })).toBe(true);
  });

  it("cancelled con access_until pasado: bloqueado", () => {
    expect(hasActiveMembership({ status: "cancelled", access_until: PAST })).toBe(false);
  });

  it("cancelled sin access_until: bloqueado (sin período pago definido)", () => {
    expect(hasActiveMembership({ status: "cancelled", access_until: null })).toBe(false);
  });
});

/**
 * Matriz de acceso a /app/* (src/app/(private)/layout.tsx), pedida
 * explícitamente en la Etapa 3: sin sesión, cada estado de membresía,
 * y el caso "sin fila de profile" (sesión válida pero sin registro en
 * public.profiles todavía, p. ej. antes de que corra el trigger
 * handle_new_user).
 */
describe("resolveAppAccess", () => {
  it("sin sesión: /login", () => {
    expect(resolveAppAccess(null, null)).toBe("login");
    expect(resolveAppAccess(null, { role: "user", subscription: { status: "active", access_until: null } })).toBe(
      "login"
    );
  });

  it("con sesión pero sin fila de profile: /membresia-inactiva", () => {
    expect(resolveAppAccess("user-1", null)).toBe("membership-inactive");
  });

  it("membresía active: acceso permitido", () => {
    expect(
      resolveAppAccess("user-1", { role: "user", subscription: { status: "active", access_until: null } })
    ).toBe("ok");
  });

  it("membresía suspended: /membresia-inactiva", () => {
    expect(
      resolveAppAccess("user-1", { role: "user", subscription: { status: "suspended", access_until: null } })
    ).toBe("membership-inactive");
  });

  it("membresía cancelled con access_until futuro: acceso permitido", () => {
    expect(
      resolveAppAccess("user-1", { role: "user", subscription: { status: "cancelled", access_until: FUTURE } })
    ).toBe("ok");
  });

  it("membresía cancelled con access_until vencido: /membresia-inactiva", () => {
    expect(
      resolveAppAccess("user-1", { role: "user", subscription: { status: "cancelled", access_until: PAST } })
    ).toBe("membership-inactive");
  });

  it("un admin sin membresía propia activa también queda afuera de /app: la regla es igual para todos los roles", () => {
    expect(
      resolveAppAccess("admin-1", { role: "admin", subscription: { status: "suspended", access_until: null } })
    ).toBe("membership-inactive");
  });
});

/**
 * Matriz de acceso a /admin (src/app/admin/layout.tsx): sesión +
 * role === 'admin', sin importar el estado de membresía propia.
 */
describe("resolveAdminAccess", () => {
  it("sin sesión: /login", () => {
    expect(resolveAdminAccess(null, null)).toBe("login");
  });

  it("usuario común (role user): forbidden, aunque tenga membresía activa", () => {
    expect(
      resolveAdminAccess("user-1", { role: "user", subscription: { status: "active", access_until: null } })
    ).toBe("forbidden");
  });

  it("admin: acceso permitido aunque su propia membresía esté suspended", () => {
    expect(
      resolveAdminAccess("admin-1", { role: "admin", subscription: { status: "suspended", access_until: null } })
    ).toBe("ok");
  });

  it("admin sin fila de subscription: acceso igual permitido (no depende de membresía)", () => {
    expect(resolveAdminAccess("admin-1", { role: "admin", subscription: null })).toBe("ok");
  });
});
