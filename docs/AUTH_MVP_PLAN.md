# Potentia — Auditoría y plan técnico: versión privada con Supabase Auth

Estado: **diagnóstico y plan, sin implementar.** Ningún cambio de este documento
afecta la app publicada en `main`. Este archivo vive en la rama `auth-mvp`.

---

## 1. Resumen ejecutivo

Potentia hoy es un sitio 100% estático (Next.js `output: "export"`), público,
sin login, publicado en GitHub Pages. Todo el contenido educativo, la matriz
de acciones y las objeciones están embebidos en los archivos HTML/JS que se
descargan al navegador — **cualquier persona puede leerlos hoy sin necesidad
de iniciar sesión**, inspeccionando el código fuente o la carpeta `out/`.

Convertir Potentia en una app privada con membresías reales requiere dos
cambios estructurales, no solo agregar una pantalla de login:

1. **Mover el contenido protegido a Supabase** (o a un origen que solo el
   servidor pueda leer), en vez de compilarlo dentro del bundle público.
2. **Salir de GitHub Pages** hacia un hosting con runtime de servidor, porque
   la exportación estática no puede ejecutar código de servidor ni ocultar
   claves privadas.

Row Level Security (RLS) en Supabase es lo que realmente va a proteger los
datos; el login por sí solo es solo la puerta de entrada, no el candado.

La propuesta completa (arquitectura, hosting, modelo de datos, rutas,
variables de entorno, plan por etapas) está detallada abajo. **No se
implementó nada de autenticación, base de datos ni hosting todavía** — se
preparó únicamente la rama `auth-mvp` y `.env.example`.

---

## 2–4. Arquitectura actual detectada

| Aspecto | Valor detectado |
|---|---|
| Framework | Next.js |
| Versión de Next.js | 14.2.5 |
| Versión de React | 18.3.1 |
| Versión de TypeScript | ^5.5.3 |
| Router | **App Router** (`src/app/`), no Pages Router |
| Tailwind CSS | Sí (v3.4.4) |
| Modo de build | `next build` con `output: "export"` → genera `out/` |
| `basePath` / `assetPrefix` | Sí, condicionales a `GITHUB_PAGES=true` (ver `next.config.js`) — para servir bajo `/potentia/` |
| Publicación | GitHub Actions (`.github/workflows/deploy-pages.yml`) → GitHub Pages, en cada push a `main` |
| API Routes | No existen |
| Server Actions | No existen |
| Middleware | No existe |
| Rutas dinámicas | `/aprender/[slug]`, `/objeciones/[slug]`, ambas con `generateStaticParams` (prerenderizadas 100% en build) |
| Client Components (`"use client"`) | 19 archivos — todo lo interactivo: wizard de Accionar, buscador, marcado de lecciones completadas, navegación, hooks de `localStorage` |
| Dependencia del navegador | Total: progreso en `localStorage`, sin backend, sin fetch a ningún servidor propio |

**Cómo se ejecuta/compila/publica hoy:** `npm run dev` en local; `npm run
build` genera `out/` (HTML/CSS/JS estático); el workflow de GitHub Actions
corre `install → lint → test → build` y publica `out/` en GitHub Pages en
cada push a `main`. No hay ningún servidor Node.js corriendo en producción.

### Archivos principales y responsabilidades

| Área | Archivo(s) | Responsabilidad |
|---|---|---|
| Contenido educativo | `src/data/lessons.ts` (587 líneas, 33 lecciones), `src/data/modules.ts` | Texto completo de las 5 módulos y el Sistema 4x4 |
| Matriz de acciones | `src/data/actionMatrix.ts` (1178 líneas) | Reglas + **las tres plantillas de mensaje por escenario** (empático/neutro/directo), consejos, errores a evitar |
| Objeciones | `src/data/objections.ts` (584 líneas) | 12 objeciones con respuestas completas en los tres estilos |
| Conceptos de búsqueda | `src/data/concepts.ts` | Índice curado para `/buscar` |
| Lógica de decisión | `src/lib/decisionEngine.ts` | Función pura `resolveAction()`, sin efectos secundarios, sin dependencia de red |
| Búsqueda | `src/lib/textUtils.ts` + `src/app/buscar/page.tsx` | Normalización de texto + filtrado en memoria, 100% cliente |
| Progreso | `src/hooks/useProgress.ts`, `src/hooks/useLocalStorage.ts`, `src/lib/storage.ts` | Lee/escribe `localStorage`, sin identidad de usuario, sin servidor |
| Capa de datos | `src/lib/dataProvider.ts` | Único punto de acceso a `src/data/*.ts` (`LocalDataProvider`) — ya preparado para sustituirse por otro proveedor |

---

## 5. Diagnóstico de seguridad actual

**Todo el contenido es público hoy, sin excepción.** Verificado directamente
en el código, no es una suposición:

- `src/app/accionar/page.tsx` (Server Component) llama a
  `getDataProvider().getActionMatrix()` — que trae **las 23 filas completas
  de la matriz, con sus tres plantillas de mensaje cada una** — y se las pasa
  como prop a `<ActionWizard>`, que es `"use client"`. Next.js serializa esa
  matriz completa dentro del payload de React (RSC) que viaja al navegador,
  sin importar qué camino elija el usuario en el wizard.
- `src/app/buscar/page.tsx` es `"use client"` y llama a `getDataProvider()`
  **directamente en el cliente**. Eso significa que `src/lib/dataProvider.ts`
  y, en consecuencia, `lessons.ts`, `objections.ts` y `concepts.ts` completos
  quedan incluidos en el bundle JavaScript de esa página.
- Con `output: "export"`, además, **todas** las páginas de lecciones y
  objeciones se prerenderizan en build time: su HTML final ya contiene el
  texto completo de cada una.

**Respondiendo directamente a lo que pediste que no evite:**

- **¿Se puede descargar/inspeccionar el contenido hoy?** Sí, sin ninguna
  dificultad técnica: "Ver código fuente", la carpeta `out/`, o el tab
  Network del navegador muestran el texto completo de las 33 lecciones, las
  12 objeciones y las plantillas de mensaje de los 23 escenarios de la
  matriz.
- **¿Una pantalla de login agregada sobre la versión actual protegería el
  contenido?** **No.** Si el contenido sigue viviendo en `src/data/*.ts` y
  compilándose dentro de `out/`, un login es cosmético: los archivos
  estáticos ya están en el CDN de GitHub Pages, descargables por cualquiera
  que conozca (o adivine) la URL de un chunk JS, con o sin sesión iniciada.
  Un login sin mover el contenido protegido fuera del bundle es una falsa
  sensación de seguridad.
- **Riesgo de depender solo de `localStorage`:** hoy es bajo porque no hay
  nada sensible ahí (solo IDs de lecciones vistas). Pero **no puede ser la
  fuente de verdad de una membresía**: es editable libremente desde
  DevTools, no tiene identidad de usuario real, no es compartido entre
  dispositivos, y no puede usarse para decidir server-side si alguien paga o
  no.
- **Riesgo de mantener GitHub Pages como hosting definitivo:** GitHub Pages
  solo sirve archivos estáticos. No puede ejecutar código de servidor, no
  puede leer variables de entorno privadas en runtime, no puede validar una
  sesión antes de servir HTML. Cualquier clave que necesite mantenerse
  secreta (p. ej. `SUPABASE_SECRET_KEY`) **no tiene dónde vivir de forma
  segura** en este hosting.
- **¿Qué claves podrían quedar expuestas?** Ninguna hoy (no hay ninguna
  cargada en el repo). El riesgo es a futuro: si alguna clave privada de
  Supabase se cargara con prefijo `NEXT_PUBLIC_`, o se hardcodeara en un
  archivo, terminaría en el bundle público exactamente igual que el
  contenido educativo hoy.

**Conclusión:** proteger Potentia requiere sacar el contenido pago del
bundle (Supabase + RLS) y sacar la app de un hosting 100% estático (para
poder tener rutas/funciones de servidor y guardar secretos). Las dos cosas
son necesarias; ninguna alcanza sola.

---

## 6. Arquitectura futura propuesta

```
                    ┌─────────────────────────────┐
                    │        Next.js (app)         │
                    │  UI · navegación · wizard    │
                    │  validación de sesión         │
                    │  validación de membresía      │
                    │  panel administrativo          │
                    └───────────┬─────────┬─────────┘
                                │         │
                     sesión/JWT│         │solo server (nunca browser)
                                ▼         ▼
                    ┌───────────────┐  ┌─────────────────────┐
                    │ Supabase Auth │  │ Supabase Database     │
                    │ usuario        │  │ (Postgres + RLS)       │
                    │ contraseña     │  │ perfiles · membresías  │
                    │ sesión         │  │ progreso · contenido   │
                    │ recuperación   │  │ auditoría admin        │
                    │ invitación     │  └─────────────────────┘
                    └───────────────┘
                                                    ▲
                                          (futuro, no ahora)
                                          ┌─────────────────┐
                                          │      Odoo        │
                                          │ fuente de verdad  │
                                          │ del pago          │
                                          └─────────────────┘
```

- **Supabase Auth**: usuario, contraseña, sesión, recuperación, invitación.
  Sin registro público — los usuarios se crean solo por invitación
  administrativa.
- **Supabase Database**: perfil, rol, estado de membresía, progreso,
  contenido protegido, auditoría administrativa — todo detrás de RLS.
- **Next.js**: interfaz, navegación, lógica visual, validación de sesión y
  membresía (en el servidor, no solo visualmente), panel administrativo,
  consulta segura de contenido (nunca con la service role en el navegador).
- **Odoo (futuro)**: será la fuente de verdad del pago; Supabase seguirá
  siendo la fuente de verdad del acceso. La arquitectura de abajo (roles,
  `subscriptions.status`, `admin_audit_log`) ya deja un lugar natural para
  que una función de servidor futura reciba un evento de Odoo y actualice
  `subscriptions` — sin necesitar rediseñar nada hoy.

Potentia sigue sin ser un CRM: nada de esto agrega registro de oportunidades,
pipelines ni contactos comerciales del usuario. Es exclusivamente
autenticación + membresía + progreso propio.

---

## 7. Estrategia de hosting

**GitHub Pages deja de ser viable como hosting definitivo** apenas la app
necesite alguna de estas cosas (todas están en el alcance de esta
migración): login con verificación de servidor, rutas protegidas reales,
funciones administrativas, claves privadas, invitaciones con enlaces
temporales. GitHub Pages solo puede servir archivos ya compilados y
públicos; no ejecuta ningún código en el momento en que alguien visita el
sitio.

| | **Vercel** | **Netlify** | **Cloudflare Pages/Workers** |
|---|---|---|---|
| Soporte Next.js (App Router, Server Actions) | Nativo, sin configuración (mismo equipo que crea Next.js) | Bueno, vía su adaptador; suele ir un paso detrás de las features más nuevas | Vía adaptador (`@opennextjs/cloudflare`); buen soporte pero con más casos límite (algunas APIs de Node no están disponibles en el runtime de Workers) |
| Variables privadas | Sí, por entorno (Production/Preview/Dev) | Sí | Sí |
| Funciones de servidor | Sí (serverless/edge) | Sí | Sí (Workers) |
| Dominio propio | Sí, en el plan gratuito | Sí, en el plan gratuito | Sí, en el plan gratuito |
| Costo inicial | Gratis (Hobby) para uso personal/no comercial; **uso comercial requiere plan Pro (~USD 20/mes por miembro)** | Gratis (Starter) con límites generosos; plan Pro ~USD 19/mes si se necesita más | Gratis con los límites más generosos de los tres (incluye ancho de banda ilimitado en Pages) |
| Cambios que requeriría | Quitar `output: "export"` y el `basePath` condicional de GitHub Pages | Igual que Vercel + configurar el plugin de Netlify para Next.js | Igual que Vercel + adaptar con `@opennextjs/cloudflare`, revisar compatibilidad de cada API de servidor usada |
| Adecuada para app comercial | Sí, pero conviene presupuestar el plan Pro apenas haya usuarios pagos reales | Sí | Sí, buena opción si el criterio principal es minimizar costo a escala |

**Recomendación:** **Vercel**, por ser la integración más directa y con
menos fricción para Next.js App Router (Server Actions, rutas dinámicas,
variables de entorno, todo funciona "de fábrica"), lo cual reduce el riesgo
técnico de esta migración. La única salvedad real es el límite de uso no
comercial del plan gratuito: en cuanto Potentia empiece a cobrar
membresías, corresponde pasar al plan Pro (~USD 20/mes). Si minimizar costo
desde el día uno es más importante que la simplicidad de configuración,
**Cloudflare Pages** es la alternativa más económica a escala. Netlify queda
como alternativa intermedia, igual de viable, si en algún momento Vercel no
resultara conveniente por algún motivo comercial o de soporte.

**GitHub se mantiene como repositorio en cualquier caso** — el cambio es
solo de dónde se *aloja* la app compilada, no de dónde vive el código.
Ninguno de estos cambios se implementa en esta etapa.

---

## 8. Estrategia de ramas

```
main         ── versión pública actual (GitHub Pages, sin login) ── sigue publicando sola
                 │
                 └── auth-mvp  ── desarrollo de autenticación y membresías
                                   │
                                   ├─ Supabase Auth + tablas + RLS
                                   ├─ rutas /login, /app/*, /admin
                                   ├─ nuevo hosting (Vercel u otro), en un
                                   │  entorno de "Preview" separado de main
                                   ├─ validación manual del flujo completo
                                   │
                                   └─ merge a main recién cuando esté
                                      validado y decidido el corte a
                                      producción
```

`main` sigue publicando la versión pública actual sin cambios mientras
`auth-mvp` se desarrolla y prueba en un entorno separado (por ejemplo, un
proyecto/deploy de "Preview" en el hosting elegido, con su propia instancia
o esquema de Supabase). El pase a producción (mover `auth-mvp` → `main`, y
apagar GitHub Pages a favor del nuevo hosting) es una decisión explícita y
posterior, no automática. No se tocó la configuración actual de GitHub
Pages.

*(Ya ejecutado en esta etapa: la rama `auth-mvp` fue creada a partir de
`main`. Contiene únicamente este documento y `.env.example` — ningún cambio
de comportamiento.)*

---

## 9. Preparación para autenticación (rutas)

| Tipo | Rutas |
|---|---|
| Públicas | `/login`, `/recuperar-clave`, `/actualizar-clave`, `/auth/callback`, `/membresia-inactiva` |
| Privadas | `/app`, `/app/aprender`, `/app/accionar`, `/app/objeciones`, `/app/buscar`, `/mi-cuenta` |
| Administrativa | `/admin` |

**Recomendación:** mover las rutas actuales debajo de `/app` usando un
**grupo de rutas de Next.js** con layout propio, por ejemplo:

```
src/app/
├─ (public)/
│  ├─ login/page.tsx
│  ├─ recuperar-clave/page.tsx
│  ├─ actualizar-clave/page.tsx
│  ├─ auth/callback/route.ts
│  └─ membresia-inactiva/page.tsx
├─ (private)/
│  ├─ layout.tsx        ← valida sesión + membresía server-side
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ aprender/...
│  │  ├─ accionar/...
│  │  ├─ objeciones/...
│  │  └─ buscar/...
│  └─ mi-cuenta/page.tsx
└─ admin/
   ├─ layout.tsx         ← valida sesión + rol admin server-side
   └─ page.tsx
```

Los grupos de rutas `(public)`/`(private)` no cambian la URL (no agregan un
segmento visible), solo permiten compartir un `layout.tsx` de validación
distinto para cada bloque — así la verificación de sesión/membresía queda
en un solo lugar por grupo, en vez de repetirse página por página. Esto **no
se implementa todavía**; es la estructura recomendada para cuando se
implemente.

---

## 10. Preparación de la capa de datos

Hoy toda la app pasa por una única capa (`getDataProvider()` en
`src/lib/dataProvider.ts`), lo cual ya es una base ordenada. Lo que hace
falta es **separar responsabilidades por dominio** en vez de tener un solo
proveedor "de todo":

| Repositorio propuesto | Reemplaza/envuelve | Notas |
|---|---|---|
| `AuthRepository` | — (nuevo) | Envuelve `supabase.auth.*`: login, logout, recuperación, sesión actual. Solo se usa desde código que corre en el servidor o en el cliente autenticado, nunca expone la service role. |
| `SubscriptionRepository` | — (nuevo) | Lee/escribe `subscriptions`. Las escrituras (alta/suspensión/cancelación) solo desde funciones server-side con rol admin. |
| `ProgressRepository` | `useProgress.ts` + `storage.ts` | Hoy 100% `localStorage`. Pasa a consultar `learning_progress` en Supabase cuando hay sesión; `localStorage` queda como caché local / fuente para migrar el progreso de un usuario que ya venía usando la versión pública. |
| `ContentRepository` | `LocalDataProvider` (contenido) | El contenido gratuito puede seguir viniendo de `src/data/*.ts` (no hace falta migrarlo si se mantiene abierto); el contenido que deba quedar exclusivamente para usuarios con membresía activa se sirve consultando Supabase desde el servidor, nunca embebido en el bundle. |
| `AdminRepository` | — (nuevo) | Alta, suspensión, reactivación, cancelación de usuarios; siempre server-side, siempre dejando registro en `admin_audit_log`. |

Los componentes de UI no deberían llamar a Supabase directamente (ni con la
clave publishable ni mucho menos con la secreta): deberían llamar a estos
repositorios, igual que hoy llaman a `getDataProvider()` en vez de importar
`src/data/*.ts`. Esto es una propuesta de estructura — **no se crean estas
clases todavía.**

---

## 11. Variables de entorno

Ya creado en esta etapa: [`/.env.example`](../.env.example) (en la raíz del
proyecto), solo con nombres de variables, sin valores reales:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=
```

Verificado:

- `.env.local` ya está en `.gitignore` (heredado de la config original del
  proyecto).
- No hay ningún secreto hardcodeado en el código actual.
- Ninguna variable privada usa el prefijo `NEXT_PUBLIC_`.
- No hay ninguna clave impresa en consola en el código actual.
- `SUPABASE_SECRET_KEY` queda como **nombre de variable únicamente**; su
  valor real no se cargó ni se cargará en el repositorio en esta etapa.

---

## 12. Modelo de usuarios y membresías (revisión de lo propuesto)

El modelo que planteaste (`profiles`, `subscriptions`, `learning_progress`,
`content`, `admin_audit_log`) es **suficiente para este MVP** y ya cubre los
puntos clave (roles, estados de membresía, auditoría). Ajustes sugeridos
para cuando se implemente (ninguno cambia la esencia del modelo):

- `subscriptions.status`: tu lista de estados en la sección 12
  (`trial/active/past_due/suspended/cancelled`) y la de la sección 2
  (`activos/prueba/suspendidos/vencidos/cancelados`) no son exactamente
  iguales — conviene fijar un único enum antes de crear la tabla. Sugerencia:
  `trial | active | past_due | suspended | cancelled`, y tratar "vencido"
  como un *cálculo* (¿`access_until` ya pasó?) más que como un estado
  guardado aparte, para no tener dos fuentes de verdad de si alguien venció.
- `profiles.role`: limitarlo por `check constraint` a `user | admin` (la
  sección 14 pide justamente que un usuario no pueda auto-asignarse `admin`;
  eso se refuerza con RLS + este constraint).
- `learning_progress`: agregar una restricción única `(user_id, lesson_id)`
  para que "completar" una lección sea un upsert, no filas duplicadas.
- `content`: tiene sentido **solo si** en algún momento se decide mover
  contenido a la base (por ejemplo, contenido exclusivo que no debe
  compilarse en el bundle). Si todo el contenido educativo actual se
  mantiene igual de abierto que hoy, esta tabla puede posponerse sin
  bloquear el resto del MVP de autenticación.
- La regla de acceso que planteás (sesión válida + perfil + `status` en
  `active`/`trial` + `access_until` nulo o futuro) es correcta y es
  exactamente lo que debería validar el `layout.tsx` del grupo `(private)`
  **y**, además, reforzarse con RLS a nivel de fila — no alcanza con
  validarlo solo en el layout (ver sección de seguridad).

No se crea ninguna tabla en esta etapa.

---

## 13. Escalabilidad

Para 10, 100 y 1.000 usuarios este modelo no necesita rediseño — Supabase
(Postgres administrado) está pensado justo para este rango.

- **Escala sin cambios:** autenticación, lectura de perfil propio,
  lectura/escritura de `learning_progress` propio (siempre son consultas
  filtradas por `user_id`, con índice natural en la clave primaria/FK).
- **Consultas a paginar:** el listado administrativo de usuarios
  (`/admin`) en cuanto supere unos pocos cientos de filas — paginar desde el
  principio evita tener que rehacerlo después.
- **Índices necesarios:** `subscriptions.user_id`, `learning_progress.(user_id, lesson_id)`,
  `admin_audit_log.target_user_id` — son consultas frecuentes y de bajo
  costo si están indexadas.
- **Qué cachear:** el contenido educativo que siga siendo público/abierto
  no necesita cachear nada especial (sigue siendo estático o server-rendered
  simple); si se agrega contenido exclusivo servido desde Supabase, tiene
  sentido cachearlo por lección (los textos no cambian por usuario).
- **Límites del plan gratuito de Supabase** relevantes para este proyecto:
  500 MB de base de datos, 50.000 usuarios activos mensuales de Auth,
  proyecto pausado por inactividad tras 7 días sin uso en el free tier. Para
  cientos o pocos miles de usuarios de Potentia, el contenido de texto (no
  hay imágenes/video pesados) ocupa muy poco espacio — el límite que
  probablemente se toque primero es la pausa por inactividad en desarrollo,
  no el almacenamiento.
- **Cuándo pasar a plan pago:** cuando el proyecto deba mantenerse siempre
  activo en producción (el free tier se pausa por inactividad) o al superar
  los límites de almacenamiento/autenticación — para los volúmenes descriptos
  (10/100/1.000 usuarios) esto normalmente coincide con "ya es un producto
  real cobrando", momento en el que el costo (Supabase Pro, ~USD 25/mes) es
  razonable frente al ingreso.
- **Riesgos de costo:** bajos a esta escala; el mayor riesgo no es Supabase
  sino terminar pagando dos hostings en paralelo (GitHub Pages ya no se usa
  + nuevo hosting) — hay que recordar despedir GitHub Pages cuando se haga
  el corte final (`main` deja de apuntar ahí).
- **Qué monitorear:** uso de autenticación (usuarios activos), tamaño de
  base de datos, cantidad de invitaciones pendientes, intentos de login
  fallidos (para detectar fuerza bruta).

No se propone Docker, Kubernetes ni microservicios — no hacen falta para
este volumen ni para este tipo de producto.

---

## 14. Seguridad futura obligatoria (checklist para la etapa de implementación)

Todo lo siguiente queda **documentado como requisito**, no implementado
todavía:

- [ ] Supabase Auth como único mecanismo de login (sin registro público).
- [ ] Row Level Security activado en **todas** las tablas con datos de
      usuario (`profiles`, `subscriptions`, `learning_progress`,
      `admin_audit_log`).
- [ ] Verificación de sesión en el servidor (layout del grupo `(private)`),
      no solo en el cliente.
- [ ] Verificación de membresía en el servidor, con la misma regla descripta
      en la sección 12, evaluada en cada request, no cacheada indefinidamente.
- [ ] Roles `user`/`admin` con políticas RLS que impidan que un usuario
      modifique su propia fila de `profiles.role` o `subscriptions.status`.
- [ ] Contenido protegido inaccesible para usuarios anónimos a nivel de
      base de datos (RLS), no solo a nivel de ruta.
- [ ] Progreso privado por usuario (RLS: cada usuario solo puede leer/escribir
      sus propias filas de `learning_progress`).
- [ ] Funciones administrativas (invitar, suspender, cancelar) exclusivamente
      server-side, usando la service role solo ahí — nunca en un componente
      cliente.
- [ ] Claves secretas solo como variables de entorno de servidor, nunca
      `NEXT_PUBLIC_`.
- [ ] Auditoría administrativa: cada acción de alta/suspensión/reactivación/
      cancelación queda registrada en `admin_audit_log`.
- [ ] Recuperación de contraseña vía flujo estándar de Supabase Auth (enlace
      con token de un solo uso y expiración).
- [ ] Invitaciones con enlaces temporales (expiración configurada, de un solo
      uso).
- [ ] Protección contra intentos repetidos de login (rate limiting —
      Supabase Auth ya aplica límites por defecto; revisar si hace falta
      reforzarlo).
- [ ] Validación del lado del servidor como principio general: **no confiar
      solamente** en componentes ocultos en el cliente, ni solamente en
      `localStorage`, ni solamente en middleware — la verificación real
      ocurre también a nivel de base de datos (RLS), que es la última línea
      de defensa incluso si algo falla más arriba.

---

## 15. Lo que NO se hizo en esta etapa (confirmación)

No se realizó ninguna de estas acciones: migraciones SQL, creación de
tablas, políticas RLS, login, registro público, invitaciones, panel
administrativo, carga de contenido a Supabase, migración de progreso, Odoo,
SendGrid, Mercado Pago, Stripe, webhooks, funciones Edge, eliminación de
contenido local, cambios de diseño, de nombre, de lógica comercial, de
preguntas, de plantillas, ni de la metodología 4x4.

Lo único creado en esta etapa: la rama `auth-mvp`, este documento, y
`.env.example` (sin valores reales).

---

## 16–22. Plan de implementación por etapas (para aprobar antes de ejecutar)

**Etapa 0 — (completada en esta conversación):** auditoría, plan técnico,
rama `auth-mvp`, `.env.example`.

**Etapa 1 — Fundaciones de datos (Supabase):**
crear las tablas (`profiles`, `subscriptions`, `learning_progress`,
`admin_audit_log`; `content` si se decide usarla), políticas RLS, trigger
para crear `profiles` automáticamente al crear un usuario en Auth.

**Etapa 2 — Autenticación básica:**
`AuthRepository`, páginas `/login`, `/recuperar-clave`, `/actualizar-clave`,
`/auth/callback`, layout del grupo `(private)` con validación de sesión.

**Etapa 3 — Membresía y acceso:**
`SubscriptionRepository`, validación de membresía en el layout privado,
página `/membresia-inactiva`, migración de las rutas actuales a `/app/*`.

**Etapa 4 — Progreso por usuario:**
`ProgressRepository` sobre `learning_progress`, con `localStorage` como
respaldo/migración para quien ya tenía progreso guardado en el navegador.

**Etapa 5 — Panel administrativo:**
`AdminRepository`, `/admin` (listado, alta por invitación, suspensión,
reactivación, cancelación), `admin_audit_log`.

**Etapa 6 — Cambio de hosting:**
quitar `output: "export"`, desplegar en el hosting elegido (Vercel u
alternativa), configurar variables de entorno de producción, validar todo
el flujo en un entorno de prueba antes de mover `main`.

**Etapa 7 — Corte a producción:**
merge de `auth-mvp` a `main`, apagar la publicación a GitHub Pages (el
repositorio en sí se mantiene).

### Riesgos técnicos

- Cambiar de exportación estática a un hosting con servidor implica revisar
  cada página para decidir qué sigue siendo estática y qué pasa a
  renderizarse dinámicamente según sesión — no es un cambio de una sola
  línea.
- Migrar progreso de `localStorage` a Supabase para usuarios que ya lo
  tenían guardado requiere una estrategia explícita de "primer login"
  (¿se importa automáticamente? ¿se pierde?) que hay que decidir, no es
  automática.
- Doble mantenimiento temporal (main + auth-mvp) mientras dura el
  desarrollo — mitigado por mantener `auth-mvp` lo más corta posible en el
  tiempo.

### Costos iniciales estimados (mientras el proyecto no cobra membresías)

- Supabase: **USD 0** (free tier, alcanza sobradamente para el MVP).
- Hosting (Vercel Hobby / Cloudflare Pages free / Netlify free): **USD 0**,
  con la salvedad de uso no comercial mencionada en la sección 7.
- GitHub: **USD 0** (ya en uso).
- **Total estimado: USD 0/mes** hasta que Potentia empiece a monetizarse,
  momento en el que correspondería evaluar el plan pago del hosting elegido.

### Limitaciones del MVP (a aceptar conscientemente)

- Membresía 100% manual: no hay cobro automático ni recordatorios
  automáticos de vencimiento en esta etapa.
- Sin integración con Odoo todavía (la arquitectura la deja preparada, no
  la implementa).
- Sin recuperación de contraseña personalizada más allá del flujo estándar
  de Supabase (suficiente para el MVP).
- El contenido gratuito puede seguir compilado en el bundle si se decide
  que Potentia mantiene una parte abierta; solo el contenido exclusivo de
  usuarios con membresía necesita moverse a Supabase.

---

## 23. Confirmación explícita

- ✅ No se expusieron ni se expondrán claves privadas en el repositorio.
- ✅ No se usará la service role de Supabase en el navegador bajo ninguna
  circunstancia.
- ✅ No se dejará contenido pago completo en el bundle público — es
  justamente el problema diagnosticado en la sección 5, y el motivo
  principal de mover contenido protegido a Supabase.
- ✅ No se permitirá registro público de usuarios — la creación de cuentas
  queda exclusivamente por invitación administrativa.
- ✅ No se implementó ni se implementará Odoo en esta etapa.

---

**Fin del diagnóstico. Quedo a la espera de tu aprobación antes de continuar
con la Etapa 1.**
