# Potentia — Etapa 3: migración de la app real al área privada

Estado: **completa y verificada**. Migración `0006_admin_functions.sql`
aplicada en Supabase (confirmado por consulta de grants), rutas
`/app/*` y `/admin` probadas en vivo por la usuaria. Rama `auth-mvp`,
`main` sin tocar.

---

## 1. Qué cambió

Antes de esta etapa, Aprender/Accionar/Objeciones/Buscar eran rutas
**públicas** que leían de arrays TypeScript locales
(`src/data/*.ts`) y guardaban el progreso en `localStorage` del
navegador. Ahora son rutas **privadas**, detrás de sesión +
membresía activa, que leen contenido real desde Supabase y guardan el
progreso en una tabla con RLS.

`/` dejó de ser una landing: es una redirección pura según el estado
de la sesión.

Se sumó un panel `/admin` mínimo para activar/suspender membresías y
ver el historial de auditoría, con su propia regla de autorización
(no depende de tener membresía activa, solo de `role = 'admin'`).

Se subió Next.js de 14.2.5 a 15.5.22 porque la rama 14.x había dejado
de recibir parches para varias CVEs activas.

---

## 2. Mapa de rutas final

| Ruta | Grupo | Quién entra |
|---|---|---|
| `/` | — | redirección: sin sesión → `/login`; con sesión sin membresía activa → `/membresia-inactiva`; con todo → `/app` |
| `/login`, `/recuperar-clave`, `/actualizar-clave` | `(public)` | pública |
| `/membresia-inactiva` | `(public)` | sesión sin membresía activa |
| `/auth/callback` | `(public)` | callback PKCE (recuperación de contraseña) — **sin cambios en esta etapa** |
| `/auth/confirm` | `(public)` | callback `token_hash`/`verifyOtp` (invitación) — **sin cambios en esta etapa** |
| `/app` | `(private)` | sesión + membresía activa |
| `/app/aprender`, `/app/aprender/[slug]` | `(private)` | sesión + membresía activa |
| `/app/accionar` | `(private)` | sesión + membresía activa |
| `/app/objeciones`, `/app/objeciones/[slug]` | `(private)` | sesión + membresía activa |
| `/app/buscar` | `(private)` | sesión + membresía activa |
| `/mi-cuenta` | `(private)` | sesión + membresía activa |
| `/admin` | — (autorización propia) | sesión + `role = 'admin'`, **sin importar** el estado de membresía propia del admin |

Rutas públicas eliminadas por completo: `/aprender`, `/aprender/[slug]`,
`/accionar`, `/objeciones`, `/objeciones/[slug]`, `/buscar`. No queda
contenido educativo en el bundle público — se verificó con `npm run
build` que esas rutas ya no existen y con `grep` que ningún componente
público importa `src/data/*` para contenido.

---

## 3. Capa de acceso a contenido (nueva)

Reemplaza a `src/lib/dataProvider.ts` (eliminado) para todo lo que se
sirve dentro de `(private)`.

- **`src/lib/content/mappers.ts`** — convierte filas de Supabase
  (snake_case) a los mismos tipos TypeScript que ya usaban los
  componentes (`Lesson`, `ActionMatrixEntry`, `Objection`,
  `ConceptSummary`), por eso casi ningún componente visual cambió de
  forma, solo de origen de datos.
- **`src/lib/content/repository.ts`** (`server-only`) —
  `getModules()`, `getLessons()`, `getLessonBySlug(slug)`,
  `getActionMatrix()`, `getObjections()`, `getObjectionBySlug(slug)`,
  `getSearchConcepts()`. Ninguna repite "y `active = true`" ni
  verifica membresía en el `WHERE`: las políticas RLS de
  `modules`/`lessons`/`action_matrix_entries`/`objections`/
  `search_concepts` (`0005_rls_policies.sql`, Etapa 1) ya devuelven
  cero filas si la sesión no tiene membresía activa.
- **`src/lib/content/searchContent.ts`** — la búsqueda de `/app/buscar`
  es una función pura sobre arrays ya cargados una vez por la página;
  no dispara una consulta a Supabase por cada letra tipeada.
- **`src/lib/content/progress.ts`** (`server-only`) /
  **`progressClient.ts`** (`"use client"`) — `learning_progress` es la
  única fuente de verdad del progreso. Lectura filtrada por RLS a
  `user_id = auth.uid()`; escritura (marcar/desmarcar lección) vía
  upsert/delete directo contra la tabla, amparada por las políticas
  RLS de Etapa 1 (no hizo falta ninguna función nueva para esto).
  `localStorage` (`useLastVisitedLesson`) quedó **solo** como hint de
  UX ("última lección visitada"), nunca como fuente de progreso real.

---

## 4. Panel `/admin`

- **`supabase/migrations/0006_admin_functions.sql`** — función
  `admin_set_subscription_status(p_target_user_id, p_new_status,
  p_access_until, p_plan_code, p_notes)`, `SECURITY DEFINER`, sigue el
  patrón ya documentado como referencia en la Etapa 1
  (`AUTH_MVP_DATA_PLAN.md` §7):
  1. Verifica `is_current_user_admin()` — cualquier `authenticated`
     puede *llamar* la función, pero solo pasa la verificación interna
     si es admin.
  2. Valida que `p_new_status` sea uno de los cinco estados válidos.
  3. Lee el valor anterior de `subscriptions` (para el log).
  4. Bloquea explícitamente `p_target_user_id = auth.uid()`: un admin
     no puede tocar su propia membresía desde el panel.
  5. Aplica el `UPDATE`.
  6. Inserta en `admin_audit_log` en la **misma transacción** — si
     cualquier paso falla, Postgres revierte todo.
  - `REVOKE ALL ... FROM public, anon` + `GRANT EXECUTE ... TO
    authenticated`.
  - **Aplicada y verificada** el 2026-08-02: `authenticated` tiene
    `EXECUTE`; `anon`/`public` no aparecen en
    `information_schema.role_routine_grants`.
- **Lectura de usuarios** (`src/app/admin/page.tsx`): `SELECT` directo
  sobre `profiles` y `subscriptions` con el cliente autenticado normal
  — sin función nueva, porque las políticas
  `profiles_select_own_or_admin` / `subscriptions_select_own_or_admin`
  (Etapa 1) ya dejan que una sesión admin lea todas las filas.
- **`src/components/admin/AdminUsersTable.tsx`** — tabla con edición
  inline (estado, `plan_code`, `access_until`) por fila, deshabilitada
  para la fila del propio admin. Nunca hace un `UPDATE` directo:
  siempre llama a `supabase.rpc("admin_set_subscription_status", …)`.
- **`src/app/admin/layout.tsx`** — deliberadamente **fuera** del grupo
  `(private)`: la regla de acceso es sesión + `role = 'admin'`, no
  sesión + membresía activa (un admin no debería quedar afuera del
  panel solo porque su propia cuenta de prueba esté `suspended`).

---

## 5. Next.js 14.2.5 → 15.5.22

Al revisar `npm audit` para "subir a una versión parcheada" se
encontró que **14.2.35** (el último patch de la rama 14) seguía
expuesta a 21 avisos activos — DoS en Server Components, SSRF en
Server Actions, cache poisoning de RSC, request smuggling en
rewrites, entre otros — porque esas correcciones **solo existen en la
rama 15.5.x**, nunca se retroportaron a 14.x. Se consultó a la usuaria
y se optó por migrar a Next 15 estable en vez de quedarse en 14
documentando el riesgo.

**15.5.22** es la última 15.x parcheada disponible; tras el upgrade,
`npm audit` ya no reporta ningún avisos directo de `next` (lo que
queda son transitivos de `postcss`/`sharp`, sin relación con Next.js).

### Cambios de compatibilidad requeridos

Next 15 vuelve async varias APIs que antes eran síncronas:

- **`params`/`searchParams` en rutas dinámicas ahora son `Promise`.**
  Se actualizaron `generateMetadata` y los `page.tsx` de
  `/app/aprender/[slug]` y `/app/objeciones/[slug]` para hacer `await
  params` antes de leer `slug`.
- **`cookies()` de `next/headers` ahora es async.**
  `src/lib/supabase/server.ts` → `createClient()` pasó a ser
  `async function` (`await cookies()`). Se actualizaron los 6 call
  sites de contexto servidor que quedaban sin el `await`:
  `repository.ts`, `progress.ts`, `session.ts`, `app/admin/page.tsx`,
  `auth/callback/route.ts`, `auth/confirm/route.ts`. Los componentes
  `"use client"` (que usan `src/lib/supabase/client.ts`, el cliente de
  browser) no se tocaron — ese archivo no depende de `next/headers`.

React se mantiene en **18.3** — `next@15` acepta `^18.2.0` como peer
dependency, no hizo falta subir a React 19 para esta etapa.

---

## 6. Tests

`npm test`: **42/42 passing** (eran 31 al cierre de la Etapa 2).

Se agregó la matriz de reglas de acceso pedida explícitamente. La
lógica de autorización de `(private)/layout.tsx` y `admin/layout.tsx`
vivía inline (`if`/`redirect` dentro del Server Component), sin forma
de probarla sin montar el layout completo. Se extrajo a dos funciones
puras en `src/lib/auth/membership.ts` (mismo archivo/estilo que
`hasActiveMembership`, que ya espeja
`current_user_has_active_membership()` de la base):

- `resolveAppAccess(userId, profile)` → `"login" |
  "membership-inactive" | "ok"`
- `resolveAdminAccess(userId, profile)` → `"login" | "forbidden" |
  "ok"`

Casos cubiertos en `membership.test.ts`: sin sesión, sin fila de
`profile`, membresía `active`, `suspended`, `cancelled` con acceso
vigente, `cancelled` vencida, acceso admin, admin con membresía propia
`suspended` (igual entra a `/admin`, no a `/app`), usuario común
intentando `/admin` (forbidden).

**Lo que un test unitario no puede garantizar**, porque la garantía
real vive en RLS/SQL y no en TypeScript — verificado manualmente en el
SQL Editor con el mismo patrón de consultas de la Etapa 1:

- que un usuario solo pueda leer/escribir su propia fila de
  `learning_progress` (políticas `learning_progress_*`,
  `0005_rls_policies.sql`)
- que el contenido (`lessons`/`objections`/`action_matrix_entries`/
  `search_concepts`) sea invisible sin membresía activa (políticas
  `*_select_active_members`)
- que `admin_set_subscription_status()` efectivamente inserte en
  `admin_audit_log` en la misma transacción que el cambio

---

## 7. Verificación en vivo (2026-08-02)

- Migración `0006_admin_functions.sql` aplicada; consulta de grants
  confirmó `authenticated` con `EXECUTE`, `anon`/`public` sin acceso.
- Usuaria probó en Vercel: navegación de `/app/*` y `/admin`
  funcionando con cuenta real.

---

## 8. Archivos creados/modificados (resumen)

**Nuevos:** `src/lib/content/{mappers,repository,searchContent,progress,progressClient}.ts`,
`src/hooks/useLastVisitedLesson.ts`, `src/app/(private)/app/{aprender/[slug],buscar,objeciones/[slug]}/page.tsx`,
`src/app/admin/{layout,page}.tsx`, `src/components/admin/AdminUsersTable.tsx`,
`src/components/search/BuscarClient.tsx`, `supabase/migrations/0006_admin_functions.sql`.

**Eliminados:** `src/hooks/useProgress.ts`, `src/lib/dataProvider.ts`,
rutas públicas `src/app/{aprender,accionar,objeciones,buscar}/*`.

**Modificados (relevantes):** `src/app/layout.tsx`, `src/app/page.tsx`,
`src/app/(private)/layout.tsx`, `src/lib/auth/{redirects,membership,session}.ts`,
`src/lib/supabase/{server,middleware}.ts`, `src/lib/storage.ts`,
componentes de `learn/`, `action/`, `objections/`, `layout/` (para recibir
progreso/lecciones relacionadas por props en vez de leer `localStorage`
o `dataProvider` internamente), `package.json` (Next 15.5.22).

`src/data/*.ts` **no se tocó**: sigue siendo la fuente que usa
`scripts/generateContentSeed.ts` para regenerar el seed de Supabase.

---

## 9. Riesgos pendientes / fuera de alcance de esta etapa

- Brevo SMTP sigue pendiente de activación por soporte (arrastrado de
  Etapa 2).
- No hay tests de integración contra una base Supabase real (ni de
  test ni de CI) — todo lo relacionado a RLS se verifica manualmente.
- `next lint` está deprecado desde Next 15 (se elimina en Next 16); en
  algún momento conviene migrar a la CLI de ESLint standalone, pero no
  era parte del alcance de esta etapa.
- Pagos, Odoo, webhooks: explícitamente fuera de alcance, sin
  configurar.

---

## 10. Commits de esta etapa (rama `auth-mvp`)

```
32d7a87  Etapa 3 (1/2): migrar la app real al área privada, contenido desde Supabase
e8ec65c  Etapa 3 (2/2): upgrade Next.js 14.2.5 -> 15.5.22 (CVEs sin parche en 14.x)
f925c0e  Etapa 3: matriz de tests de reglas de acceso (resolveAppAccess/resolveAdminAccess)
```

`main` no se modificó en ningún momento de esta etapa.
