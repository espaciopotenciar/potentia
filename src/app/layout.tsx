import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import "./globals.css";

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
        <AppHeader />
        <main id="main-content" className="pb-24 md:pb-12">
          {children}
        </main>
        <MobileNavigation />
      </body>
    </html>
  );
}
