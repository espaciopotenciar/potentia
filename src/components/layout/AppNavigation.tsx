"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/layout/navItems";
import { Icon } from "@/components/icons";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-potentia-deep text-white"
                : "text-potentia-ink hover:bg-potentia-sand"
            }`}
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
