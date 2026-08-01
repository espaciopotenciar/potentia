# Potentia — by Espacio Potenciar

MVP funcional de **Potentia**, una web app educativa y de acción comercial. Potentia
**no es un CRM**: no registra oportunidades, contactos ni historiales. Ayuda a que la
persona que vende entienda qué está pasando, elija su próxima acción y se comunique con
claridad, siguiendo la metodología de seguimiento **Sistema 4x4**.

Flujo central: **APRENDER → INTERPRETAR → ACCIONAR**.

## 1. Instalación y ejecución local

Requisitos: [Node.js](https://nodejs.org) 18 o superior y npm.

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

Otros comandos disponibles:

```bash
npm run build   # build de producción
npm run start   # sirve el build de producción
npm run lint    # linting con Next.js/ESLint
npm run test    # corre los tests de la lógica de decisión (vitest)
```

> Este proyecto se generó sin poder ejecutar `npm install` ni `npm run build` en el
> entorno donde se creó (no había Node.js instalado). El código está completo y
> tipado, pero te recomendamos correr `npm run build` y `npm run test` apenas lo
> instales localmente para confirmar que compila limpio en tu máquina.

## 2. Arquitectura del proyecto

Next.js (App Router) + TypeScript + Tailwind CSS. Sin backend, sin base de datos, sin
login. Todo el contenido vive en archivos TypeScript locales y el progreso educativo se
guarda en `localStorage` del navegador.

```
potentia/
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
│  ├─ data/                     # ⭐ Contenido editable (ver sección 3)
│  │  ├─ modules.ts
│  │  ├─ lessons.ts
│  │  ├─ actionMatrix.ts
│  │  ├─ objections.ts
│  │  └─ concepts.ts
│  ├─ lib/
│  │  ├─ dataProvider.ts       # ⭐ Capa de acceso a datos (ver sección 4)
│  │  ├─ decisionEngine.ts     # ⭐ Lógica de decisión de Accionar (ver sección 5)
│  │  ├─ decisionEngine.test.ts
│  │  ├─ template.ts           # Reemplazo de variables {{var}} en plantillas
│  │  ├─ textUtils.ts          # Normalización de texto para el buscador
│  │  └─ storage.ts            # Acceso seguro a localStorage
│  ├─ hooks/
│  │  ├─ useLocalStorage.ts
│  │  └─ useProgress.ts
│  └─ types/                    # Tipos TypeScript (Lesson, ActionMatrixEntry, Objection...)
├─ package.json
├─ tailwind.config.ts
└─ tsconfig.json
```

## 3. Dónde editar los contenidos

Todo el contenido de demostración está centralizado en `src/data/`. No hace falta tocar
componentes visuales para editar textos.

- **Lecciones y módulos** → [`src/data/lessons.ts`](src/data/lessons.ts) y
  [`src/data/modules.ts`](src/data/modules.ts). Cada lección tiene `id`, `slug`, `title`,
  `description`, `moduleId`, `order`, `estimatedMinutes`, `content` (array de párrafos),
  `keywords`, `relatedLessonIds` y `active`. Para ocultar una lección sin borrarla, poné
  `active: false`.
- **Matriz de acciones (Accionar)** → [`src/data/actionMatrix.ts`](src/data/actionMatrix.ts).
  Ver sección 5 más abajo para entender cómo se arma cada registro.
- **Objeciones** → [`src/data/objections.ts`](src/data/objections.ts). Cada objeción tiene
  las tres respuestas (empática, neutra, directa), preguntas para profundizar, qué evitar,
  etc.
- **Conceptos destacados del buscador** → [`src/data/concepts.ts`](src/data/concepts.ts).

## 4. Capa de acceso a datos (`dataProvider`)

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
ninguna clave.

## 5. Lógica de decisión de Accionar

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
coincidencia exacta. Correr con `npm run test`.

## 6. Progreso educativo (localStorage)

`src/hooks/useProgress.ts` guarda en `localStorage` (vía `src/lib/storage.ts`):

- IDs de lecciones completadas.
- Slug de la última lección visitada.

No se usa la IP ni ningún identificador de dispositivo. El progreso vive solo en ese
navegador y ese dispositivo, y se pierde si la persona borra los datos de navegación —
esto se comunica en pantalla con el componente `LocalStorageNotice`.

## 7. Elementos preparados para conectar Google Sheets

- Interfaz `DataProvider` en `src/lib/dataProvider.ts`, desacoplada de la fuente de
  datos.
- Tipos TypeScript en `src/types/` que reflejan exactamente los campos que tendría cada
  pestaña de Sheets.
- Ningún componente de `src/components/` ni `src/app/` importa `src/data/*.ts`
  directamente: todos usan `getDataProvider()`.

## 8. Limitaciones reales del MVP

- No hay backend, base de datos ni autenticación: todo el contenido es estático y el
  progreso vive solo en el navegador actual.
- La matriz de acciones cubre en detalle los escenarios pedidos (A–I del requerimiento)
  y varias variantes por canal/tipo de venta, pero no cubre absolutamente todas las
  combinaciones posibles; para casos fuera de esas rutas, Potentia muestra una
  recomendación general segura en vez de inventar una respuesta.
- La búsqueda es por coincidencia parcial de texto (sin tildes, sin mayúsculas); no usa
  IA ni búsqueda semántica.
- Este entorno de generación no tenía Node.js instalado, por lo que no se pudo correr
  `npm install`, `npm run build` ni `npm run test` para verificar la compilación de
  forma automática antes de la entrega. Se recomienda correr ambos comandos apenas se
  clone el proyecto.

## 9. Preparar el proyecto para subirlo a GitHub

```bash
git init
git add .
git commit -m "Potentia MVP"
git branch -M main
git remote add origin <url-de-tu-repositorio>
git push -u origin main
```

El `.gitignore` ya excluye `node_modules`, `.next` y archivos de entorno.
