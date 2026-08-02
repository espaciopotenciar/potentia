import { describe, expect, it } from "vitest";
import { hasActiveMembership } from "@/lib/auth/membership";

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
