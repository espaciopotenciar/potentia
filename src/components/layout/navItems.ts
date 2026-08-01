import type { IconName } from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/aprender", label: "Aprender", icon: "book" },
  { href: "/accionar", label: "Accionar", icon: "zap" },
  { href: "/objeciones", label: "Objeciones", icon: "message-circle-question" },
  { href: "/buscar", label: "Buscar", icon: "search" },
];
