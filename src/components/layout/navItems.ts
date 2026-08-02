import type { IconName } from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Coincide exacto en vez de por prefijo (evita que "Inicio" quede
   * marcado activo en /app/aprender, ya que ambos empiezan con /app). */
  exact?: boolean;
}

export const navItems: NavItem[] = [
  { href: "/app", label: "Inicio", icon: "home", exact: true },
  { href: "/app/aprender", label: "Aprender", icon: "book" },
  { href: "/app/accionar", label: "Accionar", icon: "zap" },
  { href: "/app/objeciones", label: "Objeciones", icon: "message-circle-question" },
  { href: "/app/buscar", label: "Buscar", icon: "search" },
];
