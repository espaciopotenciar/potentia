import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "book"
  | "compass"
  | "route"
  | "layout-grid"
  | "repeat"
  | "message-circle-question"
  | "zap"
  | "search"
  | "menu"
  | "check"
  | "x"
  | "chevron-left"
  | "chevron-right"
  | "copy"
  | "rotate-ccw"
  | "sparkles"
  | "clock"
  | "arrow-right";

const paths: Record<IconName, JSX.Element> = {
  home: (
    <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
  ),
  book: (
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 6-6 2 2-6 6-2Z" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h7a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4h-1" />
    </>
  ),
  "layout-grid": (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  repeat: (
    <path d="m17 2 4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
  ),
  "message-circle-question": (
    <>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 1.7-2 3.2M12.5 15h.01" />
    </>
  ),
  zap: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  "chevron-left": <path d="m15 18-6-6 6-6" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  "rotate-ccw": <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />,
  sparkles: (
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
};

export function Icon({
  name,
  className,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
