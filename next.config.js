/** @type {import('next').NextConfig} */

// Esta rama (auth-mvp) deja de depender de "output: export": necesita un
// servidor Next.js real para Route Handlers (/auth/callback), Server
// Components con validación de sesión, y el middleware de refresco de
// cookies de Supabase. Se despliega en un hosting compatible con Next.js
// (Vercel para el entorno de prueba), no en GitHub Pages.
//
// La configuración de exportación estática (output: "export", basePath,
// assetPrefix para /potentia/) sigue existiendo tal cual en `main` — este
// archivo es específico de esta rama y no la afecta.
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
