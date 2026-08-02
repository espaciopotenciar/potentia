import { describe, expect, it } from "vitest";
import { resolveConfirmRedirect, sanitizeInternalRedirect } from "@/lib/auth/redirects";

describe("sanitizeInternalRedirect", () => {
  it("acepta rutas internas de la lista blanca", () => {
    expect(sanitizeInternalRedirect("/app")).toBe("/app");
    expect(sanitizeInternalRedirect("/mi-cuenta")).toBe("/mi-cuenta");
    expect(sanitizeInternalRedirect("/actualizar-clave")).toBe("/actualizar-clave");
  });

  it("cae al fallback si no hay valor", () => {
    expect(sanitizeInternalRedirect(null)).toBe("/app");
    expect(sanitizeInternalRedirect(undefined)).toBe("/app");
    expect(sanitizeInternalRedirect("")).toBe("/app");
  });

  it("bloquea rutas internas no permitidas", () => {
    expect(sanitizeInternalRedirect("/admin")).toBe("/app");
    expect(sanitizeInternalRedirect("/aprender")).toBe("/app");
  });

  it("bloquea URLs externas (open redirect)", () => {
    expect(sanitizeInternalRedirect("https://sitio-malicioso.com")).toBe("/app");
    expect(sanitizeInternalRedirect("http://sitio-malicioso.com/app")).toBe("/app");
  });

  it("bloquea URLs protocol-relative (//host)", () => {
    expect(sanitizeInternalRedirect("//sitio-malicioso.com")).toBe("/app");
  });

  it("respeta un fallback distinto cuando se pasa explícitamente", () => {
    expect(sanitizeInternalRedirect(null, "/actualizar-clave")).toBe("/actualizar-clave");
    expect(sanitizeInternalRedirect("https://evil.com", "/actualizar-clave")).toBe("/actualizar-clave");
  });
});

describe("resolveConfirmRedirect", () => {
  it("type=invite siempre termina en /actualizar-clave, sin importar next", () => {
    expect(resolveConfirmRedirect("invite", null)).toBe("/actualizar-clave");
    expect(resolveConfirmRedirect("invite", "/app")).toBe("/actualizar-clave");
    expect(resolveConfirmRedirect("invite", "https://evil.com")).toBe("/actualizar-clave");
  });

  it("type=recovery respeta next si es una ruta interna permitida", () => {
    expect(resolveConfirmRedirect("recovery", "/actualizar-clave")).toBe("/actualizar-clave");
  });

  it("type=recovery sin next cae al fallback /actualizar-clave", () => {
    expect(resolveConfirmRedirect("recovery", null)).toBe("/actualizar-clave");
  });

  it("cualquier type con next externo cae al fallback seguro", () => {
    expect(resolveConfirmRedirect("recovery", "https://evil.com")).toBe("/actualizar-clave");
  });
});
