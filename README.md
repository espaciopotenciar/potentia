# Potentia — by Espacio Potenciar

MVP funcional de **Potentia**, una web app educativa y de acción comercial. Potentia
**no es un CRM**: no registra oportunidades, contactos ni historiales. Ayuda a que la
persona que vende entienda qué está pasando, elija su próxima acción y se comunique con
claridad, siguiendo la metodología de seguimiento **Sistema 4x4**.

Flujo central: **APRENDER → INTERPRETAR → ACCIONAR**.

Repositorio: [github.com/espaciopotenciar/potentia](https://github.com/espaciopotenciar/potentia)
Publicado en: **https://espaciopotenciar.github.io/potentia/**

## 1. Publicar en GitHub Pages (sin instalar Node.js)

La app está configurada para compilarse y publicarse sola con GitHub Actions cada vez
que se sube un cambio a `main`. No hace falta instalar nada ni abrir una terminal.

**Pasos:**

1. Subí o modificá archivos directamente en GitHub (editor web o subiendo archivos).
2. Andá a **Settings → Pages** del repositorio.
3. En **Source**, elegí **GitHub Actions** (solo hay que hacerlo una vez).
4. Andá a la pestaña **Actions** y verificá que el workflow **"Deploy Potentia to
   GitHub Pages"** se haya disparado y esté corriendo (o ya terminado).
5. Esperá a que termine (ícono verde ✅). Tarda un par de minutos.
6. Abrí la URL publicada: **https://espaciopotenciar.github.io/potentia/**

**Para volver a publicar manualmente** (sin subir ningún cambio nuevo):

1. Andá a la pestaña **Actions** del repositorio.
2. En el panel izquierdo, hacé clic en **"Deploy Potentia to GitHub Pages"**.
3. Hacé clic en el botón **"Run workflow"** (arriba a la derecha de la lista de runs),
   elegí la rama `main` y confirmá.
4. Esperá a que el run termine en verde y volvé a abrir la URL publicada.

Si el workflow termina en rojo ❌, entrá al run y mirá el paso que falló (lint, tests o
build): el log indica exactamente el archivo y la línea del problema, sin necesitar tu
computadora.

## 2. Instalación y ejecución local (opcional)

Este paso **no es necesario** para publicar en GitHub Pages — solo sirve si en algún
momento querés desarrollar o previsualizar la app en tu propia máquina.

Requisitos: [Node.js](https://nodejs.org) 18 o superior y npm.

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

Otros comandos disponibles:

```bash
npm run build   # build de producción (genera la carpeta out/, exportación estática)
npm run lint    # linting con Next.js/ESLint
npm run test    # corre los tests de la lógica de decisión (vitest)
```

> `npm run start` no aplica en este proyecto: al estar configurado con exportación
> estática (`output: "export"`), no hay un servidor Node.js en producción — el sitio
> son archivos HTML/CSS/JS puros servidos por GitHub Pages.

## 3. Arquitectura del proyecto

Next.js (App Router) + TypeScript + Tailwind CSS, exportado como sitio 100% estático.
Sin backend, sin base de datos, sin login. Todo el contenido vive en archivos
TypeScript locales y el progreso educativo se guarda en `localStorage` del navegador.

```
potentia/
├─ .github/workflows/deploy-pages.yml  # ⭐ Publicación automática en GitHub Pages
├─ src/
│  ├─ app/                     # Rutas (App Router)
│  │  ├─ page.tsx              # Inicio (/)
│  │  ├─ aprender/
│  │  │  ├─ page.tsx           # /aprender
│  │  │  └─ [slug]/page.tsx    # /aprender/[slug]
│  │  ├─ accionar/page.tsx     # /accionar
│  │  ├─ objeciones/
│  │  │  ├─ page.tsx           # /objeciones
│  │  │  └─ [slug]/page.tsx    # /objeciones/[slug]
│  │  ├─ buscar/page.tsx       # /buscar
│  │  ├─ not-found.tsx         # 404 de marca
│  │  └─ layout.tsx / globals.css
│  ├─ components/
│  │  ├─ layout/               # AppHeader, AppNavigation, MobileNavigation, logo
│  │  ├─ shared/                # ProgressBar, EmptyState, CopyButton, AdviceCard, etc.
│  │  ├─ learn/                 # ModuleCard, LessonCard, LessonViewer, CompletionButton...
│  │  ├─ action/                # QuestionStep, OptionCard, ActionWizard, ActionResult...
│  │  ├─ objections/            # ObjectionCard, ObjectionResult
│  │  └─ search/                # SearchBar, SearchResults
│  ├─ data/                     # ⭐ Contenido editable (ver sección 5)
│  │  ├─ modules.ts
│  │  ├─ lessons.ts
│  │  ├─ actionMatrix.ts
│  │  ├─ objections.ts
│  │  └─ concepts.ts
│  ├─ lib/
│  │  ├─ dataProvider.ts       # ⭐ Capa de acceso a datos (ver sección 6)
│  │  ├─ decisionEngine.ts     # ⭐ Lógica de decisión de Accionar (ver sección 7)
│  │  ├─ decisionEngine.test.ts
│  │  ├─ template.ts           # Reemplazo de variables {{var}} en plantillas
│  │  ├─ textUtils.ts          # Normalización de texto para el buscador
│  │  └─ storage.ts            # Acceso seguro a localStorage
│  ├─ hooks/
│  │  ├─ useLocalStorage.ts
│  │  └─ useProgress.ts
│  └─ types/                    # Tipos TypeScript (Lesson, ActionMatrixEntry, Objection...)
├─ public/.nojekyll             # Evita que GitHub Pages procese /_next con Jekyll
├─ next.config.js               # ⭐ Exportación estática + basePath para GitHub Pages
├─ package.json
├─ tailwind.config.ts
└─ tsconfig.json
```

## 4. Configuración de publicación estática (GitHub Pages)

[`next.config.js`](next.config.js) configura la app para exportarse como sitio
totalmente estático:

- `output: "export"` — genera una carpeta `out/` con HTML/CSS/JS puro en el build,
  sin necesitar un servidor Node.js corriendo en producción.
- `trailingSlash: true` — cada ruta resuelve a una carpeta con `index.html` (por
  ejemplo `/aprender/` → `aprender/index.html`), tal como espera un hosting de
  archivos estáticos como GitHub Pages.
- `images: { unoptimized: true }` — desactiva el optimizador de imágenes de Next.js
  (requiere un servidor), sin afectar la app porque no usa `next/image`.
- `basePath` / `assetPrefix` — el repositorio se llama **`potentia`** y pertenece a la
  cuenta **`espaciopotenciar`**, así que el sitio se publica en una subcarpeta:
  `https://espaciopotenciar.github.io/potentia/`. El workflow de GitHub Actions define
  la variable de entorno `GITHUB_PAGES=true` al construir, y `next.config.js` usa esa
  variable para agregar `basePath: "/potentia"` **solo** en ese build. En local
  (`npm run dev` / `npm run build` sin esa variable) la app sigue sirviéndose en la
  raíz, sin necesitar configuración adicional en tu máquina.

Como toda la navegación interna usa el componente `<Link>` de Next.js (no hay ningún
`<a href="...">` manual ni `window.location`), Next.js agrega automáticamente el
`basePath` a todos los enlaces, rutas y archivos estáticos generados — no hizo falta
tocar ninguna URL a mano en los componentes.

### Compatibilidad revisada para exportación estática

Se revisó todo el proyecto y **no** existía nada incompatible con `output: "export"`,
por lo que no hubo que eliminar ni reemplazar funcionalidad:

- Sin API routes (`app/api/**/route.ts`).
- Sin Server Actions (`"use server"`).
- Sin Middleware.
- Sin `rewrites`/`redirects`/`headers` dependientes de servidor en `next.config.js`.
- Sin `getServerSideProps` (no aplica en App Router).
- Sin `next/image` (los íconos son SVG inline en `src/components/icons.tsx`, sin
  optimización de servidor).
- Las dos rutas dinámicas (`/aprender/[slug]` y `/objeciones/[slug]`) ya usaban
  `generateStaticParams`, que es justamente lo que necesita `output: "export"` para
  generar cada página en build time.
- `localStorage` sigue funcionando igual: solo se usa en el navegador, después de que
  la página ya cargó, y siempre detrás de un chequeo de `typeof window` (ver
  `src/lib/storage.ts`), por lo que no depende de ningún servidor.

## 5. Dónde editar los contenidos

Todo el contenido de demostración está centralizado en `src/data/`. No hace falta tocar
componentes visuales para editar textos.

- **Lecciones y módulos** → [`src/data/lessons.ts`](src/data/lessons.ts) y
  [`src/data/modules.ts`](src/data/modules.ts). Cada lección tiene `id`, `slug`, `title`,
  `description`, `moduleId`, `order`, `estimatedMinutes`, `content` (array de párrafos),
  `keywords`, `relatedLessonIds` y `active`. Para ocultar una lección sin borrarla, poné
  `active: false`.
- **Matriz de acciones (Accionar)** → [`src/data/actionMatrix.ts`](src/data/actionMatrix.ts).
  Ver sección 7 más abajo para entender cómo se arma cada registro.
- **Objeciones** → [`src/data/objections.ts`](src/data/objections.ts). Cada objeción tiene
  las tres respuestas (empática, neutra, directa), preguntas para profundizar, qué evitar,
  etc.
- **Conceptos destacados del buscador** → [`src/data/concepts.ts`](src/data/concepts.ts).

Cualquiera de estos archivos se puede editar directamente desde GitHub (botón del
lápiz ✏️ en la vista del archivo). Al hacer commit sobre `main`, el workflow de
publicación se dispara solo.

## 6. Capa de acceso a datos (`dataProvider`)

Ningún componente importa los archivos de `src/data/*.ts` directamente. Todos pasan por
[`src/lib/dataProvider.ts`](src/lib/dataProvider.ts), que expone una interfaz
`DataProvider`:

```ts
getModules()
getLessons()
getLessonBySlug(slug)
getActionMatrix()
getObjections()
getObjectionBySlug(slug)
searchContent(query)
```

Hoy la implementa `LocalDataProvider`, que lee los archivos `.ts` locales. Esto deja el
proyecto preparado para, en el futuro, sustituirla por una `GoogleSheetsDataProvider` sin
tocar ningún componente visual ni la lógica de decisión.

### Cómo se reemplazaría por Google Sheets en el futuro

1. Crear una hoja de cálculo con tres pestañas: `LECCIONES`, `MATRIZ_ACCIONES` y
   `OBJECIONES`, con columnas equivalentes a los campos de los tipos en `src/types/`.
2. Implementar una clase `GoogleSheetsDataProvider` (por ejemplo en
   `src/lib/googleSheetsDataProvider.ts`) que implemente la misma interfaz
   `DataProvider`, obteniendo los datos vía la API de Google Sheets (o un export a JSON
   intermedio) y devolviendo objetos con la misma forma que los tipos actuales.
3. Cambiar `getDataProvider()` en `dataProvider.ts` para instanciar
   `GoogleSheetsDataProvider` en vez de `LocalDataProvider` (por ejemplo, según una
   variable de entorno).
4. No haría falta modificar ningún componente de `src/components/` ni las páginas de
   `src/app/`, porque todos consumen la interfaz `DataProvider`, no los archivos locales.

Este MVP **no** implementa credenciales ni conexión real a Google Sheets, ni expone
ninguna clave. Nota: si en el futuro se conecta una fuente de datos remota, dejaría de
ser compatible con la exportación 100% estática actual y habría que revisar esta
configuración de GitHub Pages.

## 7. Lógica de decisión de Accionar

Vive en [`src/lib/decisionEngine.ts`](src/lib/decisionEngine.ts), como una función pura
y testeable: `resolveAction(answers, matrix)`.

Prioridad de decisión:

1. **Conversación previa**: si no existió, no aplica el 4x4 (se corta el flujo antes que
   nada, sin importar el resto de las respuestas).
2. **Fecha o próximo paso acordado**: si la persona ya indicó una fecha concreta, se
   recomienda respetarla en lugar de aplicar la cadencia estándar.
3. **Etapa de la oportunidad** + **cantidad de mensajes sin respuesta**: determinan si
   corresponde M1, M2, M3, M4 o nurturing.
4. **Tipo de venta y canal**: afinan la coincidencia cuando existe un registro más
   específico en la matriz.

Cada registro de `actionMatrix.ts` puede usar `"cualquiera"` en cualquier campo de
condición para indicar que no restringe la coincidencia. El motor calcula, para cada
registro activo, un puntaje de especificidad y se queda con el más específico que
coincide. Si ningún registro coincide, devuelve una recomendación general seleccionada
explícitamente en la matriz (`recommendedStage: "sin_coincidencia"`), nunca inventa una
recomendación.

Tests: [`src/lib/decisionEngine.test.ts`](src/lib/decisionEngine.test.ts) cubre sin
conversación previa, fecha acordada, 0/1/2/3/4+ mensajes sin respuesta y situación sin
coincidencia exacta. Corre automáticamente en cada publicación (ver el workflow) y
también con `npm run test` en local.

## 8. Progreso educativo (localStorage)

`src/hooks/useProgress.ts` guarda en `localStorage` (vía `src/lib/storage.ts`):

- IDs de lecciones completadas.
- Slug de la última lección visitada.

No se usa la IP ni ningún identificador de dispositivo. El progreso vive solo en ese
navegador y ese dispositivo, y se pierde si la persona borra los datos de navegación —
esto se comunica en pantalla con el componente `LocalStorageNotice`. Esto sigue
funcionando igual publicado en GitHub Pages, ya que `localStorage` es una API del
navegador, no del servidor.

## 9. Elementos preparados para conectar Google Sheets

- Interfaz `DataProvider` en `src/lib/dataProvider.ts`, desacoplada de la fuente de
  datos.
- Tipos TypeScript en `src/types/` que reflejan exactamente los campos que tendría cada
  pestaña de Sheets.
- Ningún componente de `src/components/` ni `src/app/` importa `src/data/*.ts`
  directamente: todos usan `getDataProvider()`.

## 10. Limitaciones reales del MVP

- No hay backend, base de datos ni autenticación: todo el contenido es estático y el
  progreso vive solo en el navegador actual.
- La matriz de acciones cubre en detalle los escenarios pedidos (A–I del requerimiento)
  y varias variantes por canal/tipo de venta, pero no cubre absolutamente todas las
  combinaciones posibles; para casos fuera de esas rutas, Potentia muestra una
  recomendación general segura en vez de inventar una respuesta.
- La búsqueda es por coincidencia parcial de texto (sin tildes, sin mayúsculas); no usa
  IA ni búsqueda semántica.
- Al ser exportación 100% estática, si en el futuro se agrega cualquier funcionalidad
  que necesite un servidor (formularios que escriban datos, autenticación real,
  contenido que cambie sin volver a publicar), habría que quitar `output: "export"` de
  `next.config.js` y usar otro hosting (Vercel, Netlify, etc.) en vez de GitHub Pages.
- El proyecto se generó originalmente en un entorno sin Node.js instalado, por lo que el
  build no se pudo ejecutar de forma local en ese momento; el workflow de GitHub Actions
  (`.github/workflows/deploy-pages.yml`) corre `npm install`, `lint`, `test` y `build` en
  cada publicación, así que cualquier error de compilación queda visible ahí sin
  necesitar tu computadora.
- Por el mismo motivo, todavía no hay un `package-lock.json` committeado (se genera
  recién la primera vez que alguien corre `npm install`, local o en el workflow). El
  workflow usa `npm install` en vez de `npm ci` para no depender de ese archivo. Si en
  algún momento corrés `npm install` en tu máquina y subís el `package-lock.json`
  generado, se puede volver a usar `npm ci` (más rápido y reproducible) — el workflow
  ya tiene un comentario indicando ese cambio.

## 11. El repositorio en GitHub

El proyecto ya está subido en
[github.com/espaciopotenciar/potentia](https://github.com/espaciopotenciar/potentia),
rama `main`. Para clonarlo en otra máquina (opcional, solo si en algún momento querés
desarrollar en local):

```bash
git clone https://github.com/espaciopotenciar/potentia.git
cd potentia
npm install
npm run dev
```

El `.gitignore` ya excluye `node_modules`, `.next`, `out` y archivos de entorno.
