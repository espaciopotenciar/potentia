/** @type {import('next').NextConfig} */

// Nombre exacto del repositorio de GitHub, usado como subcarpeta de publicación
// en GitHub Pages: https://espaciopotenciar.github.io/potentia/
const repoName = "potentia";

// El workflow de GitHub Actions (.github/workflows/deploy-pages.yml) define
// GITHUB_PAGES=true al construir para publicar. En local (npm run dev / npm
// run build sin esa variable) la app se sirve en la raíz, sin basePath, para
// no depender de configuración adicional en tu máquina.
const isGithubPagesBuild = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPagesBuild ? `/${repoName}` : "";

const nextConfig = {
  reactStrictMode: true,
  // Exportación estática: genera la carpeta "out" con HTML/CSS/JS puro,
  // sin depender de un servidor Node.js en producción (requisito de GitHub Pages).
  output: "export",
  // GitHub Pages sirve archivos estáticos: cada ruta necesita resolver a una
  // carpeta con index.html (por ejemplo /aprender/ -> aprender/index.html).
  trailingSlash: true,
  // GitHub Pages no tiene el optimizador de imágenes de Next.js corriendo en
  // un servidor; se deja unoptimized para exportación 100% estática.
  images: { unoptimized: true },
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

module.exports = nextConfig;
