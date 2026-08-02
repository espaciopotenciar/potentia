import type { Metadata } from "next";
import "./globals.css";

/**
 * Layout raíz — deliberadamente mínimo. Ya no incluye AppHeader ni
 * MobileNavigation (la navegación real de la app, con Aprender/Accionar/
 * Objeciones/Buscar): esas rutas ahora viven exclusivamente bajo
 * src/app/(private)/app, detrás de sesión + membresía, y su navegación
 * vive en src/app/(private)/layout.tsx. Este layout raíz solo envuelve
 * páginas públicas (/, /login, /recuperar-clave, /actualizar-clave,
 * /membresia-inactiva), que ya traen su propio encabezado simple.
 */
export const metadata: Metadata = {
  title: "Potentia — by Espacio Potenciar",
  description:
    "Potentia te ayuda a liderar tus oportunidades comerciales: entender qué está pasando, elegir tu próxima acción y comunicarte con claridad.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-potentia-deep focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido principal
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
