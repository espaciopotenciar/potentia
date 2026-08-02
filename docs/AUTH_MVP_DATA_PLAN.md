# Potentia — Fundaciones de datos en Supabase (Etapa 1 de auth-mvp)

Estado: **SQL preparado, sin ejecutar.** Nada de este documento ni de los
archivos que describe se aplicó todavía contra el proyecto Supabase
(`rwxiatwaqlhyazwywsyh`). No se usó ninguna credencial: este trabajo no
necesitó ninguna, solo se escribieron archivos `.sql` y un script generador
en el repositorio, en la rama `auth-mvp`.

Decisiones aprobadas que quedaron incorporadas a este diseño:

- Todo el contenido funcional (lecciones, módulos, teoría 4x4, objeciones,
  matriz de acciones con sus plantillas, conceptos del buscador) pasa a ser
  **privado** — sin ninguna parte gratuita dentro de la app.
- Estados de membresía: `trial | active | past_due | suspended | cancelled`,
  con "vencido" calculado por `access_until`, no almacenado como estado
  aparte.
- Nada de esto se ejecuta ni se despliega todavía — es la Etapa 1
  ("Fundaciones de datos"), separada de login, panel admin, migración de
  rutas y del nuevo hosting.

---

## 1. El SQL completo

Vive en `supabase/migrations/`, en 5 archivos que se aplican en orden (los
números son el orden de ejecución):

| Archivo | Contenido |
|---|---|
| `0001_profiles_subscriptions.sql` | Extensión `pgcrypto`, tabla `profiles`, tabla `subscriptions` |
| `0002_content_tables.sql` | `modules`, `lessons`, `action_matrix_entries`, `objections`, `search_concepts` |
| `0003_progress_audit.sql` | `learning_progress`, `admin_audit_log` |
| `0004_functions_triggers.sql` | Funciones auxiliares + triggers |
| `0005_rls_policies.sql` | `ENABLE ROW LEVEL SECURITY` + todas las políticas |
| `rollback.sql` | Reversión completa (no se ejecuta automáticamente en ningún flujo) |

Cada archivo está escrito para poder correrse más de una vez sin romper
nada (`create table if not exists`, `create index if not exists`,
`create or replace function`, `drop trigger/policy if exists` antes de
recrearlo) — no son migraciones "de un solo uso".

## 2. Explicación de cada tabla

| Tabla | Para qué sirve | Decisión de diseño clave |
|---|---|---|
| **`profiles`** | Perfil de aplicación de cada usuario de `auth.users` (email, nombre, rol) | `id` es el mismo `uuid` que `auth.users.id` (1:1); `role` restringido por `check` a `user`/`admin` |
| **`subscriptions`** | Estado de membresía actual | **Una sola fila por usuario** (`unique(user_id)`), no un historial de filas — el historial de cambios queda en `admin_audit_log`, no acá. Simplifica muchísimo la función que decide si alguien tiene acceso. |
| **`modules`** | Los 5 módulos de Aprender | Igual forma que `src/data/modules.ts` hoy |
| **`lessons`** | Las 33 lecciones (incluida toda la teoría 4x4) | `content` es `jsonb` (array de párrafos), igual que el `content: string[]` actual |
| **`action_matrix_entries`** | Las filas de la matriz de Accionar, con las 3 plantillas de mensaje de cada una | `unanswered_messages`, `sale_type`, `channel` y `has_agreed_date` se guardan como **texto**, no boolean/int, porque el motor de decisión usa el comodín `"cualquiera"` — así la lógica de `resolveAction()` se puede portar al servidor casi sin reescribirla |
| **`objections`** | Las 12 objeciones con sus 3 respuestas cada una | Misma estructura que `src/data/objections.ts` |
| **`search_concepts`** | Índice curado de `/buscar` | `lesson_id` es una FK real a `lessons.id` (en el TS actual era un `lessonSlug` suelto, sin garantía de integridad) |
| **`learning_progress`** | Progreso por usuario y lección | `unique(user_id, lesson_id)` — permite hacer upsert en vez de acumular filas duplicadas al marcar/desmarcar |
| **`admin_audit_log`** | Historial de acciones administrativas | Tabla de solo inserción (append-only): ninguna política permite `UPDATE` ni `DELETE` |

**Nota sobre integridad referencial de `related_lesson_ids`:** en `lessons`,
`action_matrix_entries` y `objections`, ese campo es un `text[]` con IDs de
lecciones relacionadas. Postgres no soporta claves foráneas sobre columnas
array de forma nativa (haría falta una tabla puente aparte). Para este MVP
se deja sin FK forzada a nivel de base — la integridad se valida en
`scripts/generateContentSeed.ts` (ver punto 5), que lanza un error si algún
ID no existe, antes de generar el SQL.

## 3. Explicación de cada función

Todas viven en `0004_functions_triggers.sql`.

| Función | Tipo | Qué hace | Por qué `SECURITY DEFINER` |
|---|---|---|---|
| `set_updated_at()` | Trigger genérico | Actualiza `updated_at = now()` en cada `UPDATE` | No aplica (no necesita privilegios extra) |
| `handle_new_user()` | Trigger sobre `auth.users` | Al crearse un usuario (invitación aceptada), crea automáticamente su fila en `profiles` y una fila en `subscriptions` con `status = 'trial'` | Sí: necesita escribir en `public.profiles`/`public.subscriptions` desde un trigger que corre en el contexto interno de Auth, no como un usuario autenticado normal. Es el patrón estándar documentado por Supabase. |
| `is_admin(uuid)` | Helper para RLS | `true` si el usuario tiene `role = 'admin'` | Sí: se llama desde dentro de políticas RLS de `profiles`; sin `SECURITY DEFINER` se generaría una evaluación recursiva de RLS sobre la propia tabla `profiles` |
| `has_active_membership(uuid)` | Helper para RLS | Implementa **exactamente** la regla de acceso aprobada por estado (ver tabla abajo) | Sí, mismo motivo que `is_admin` |
| `has_content_access(uuid)` | Helper para RLS | `true` si hay membresía activa **o** el usuario es admin. Es el único punto que usan las políticas de las tablas de contenido — si el día de mañana cambia la regla de acceso, se edita acá una sola vez | Sí |
| `prevent_self_role_change()` | Trigger sobre `profiles` | Bloquea cualquier `UPDATE` que cambie `role` cuando quien ejecuta la sesión es el propio dueño de la fila | No (no necesita leer nada fuera de la fila que ya está editando) |
| `prevent_self_subscription_change()` | Trigger sobre `subscriptions` | Bloquea cualquier `UPDATE` sobre la propia fila de membresía del usuario autenticado | No |

Todas las funciones `SECURITY DEFINER` fijan `set search_path = public`
explícitamente — es la mitigación estándar contra el ataque de
"search_path hijacking" sobre funciones con privilegios elevados (si no se
fija, alguien podría crear un objeto con el mismo nombre en otro schema y
hacer que la función lo use en su lugar).

**Regla de acceso implementada en `has_active_membership`:**

| `status` | ¿Acceso permitido? |
|---|---|
| `trial` | Sí, si `access_until` es `null` o futuro |
| `active` | Sí, si `access_until` es `null` o futuro |
| `past_due` | No, siempre |
| `suspended` | No, siempre |
| `cancelled` | Sí, únicamente si `access_until` es futuro (si es `null`, se bloquea — un cancelado sin fecha de fin no tiene un período pago definido) |
| sin fila en `subscriptions` | No (no debería pasar, `handle_new_user` siempre crea una) |

## 4. Políticas RLS

Todas en `0005_rls_policies.sql`. Principio aplicado en todo el archivo:
**negar por defecto** — activar RLS sin políticas ya bloquea todo para
cualquiera que no sea `service_role`; cada política es una excepción mínima
y explícita.

| Tabla | Quién puede leer | Quién puede escribir |
|---|---|---|
| `profiles` | El propio usuario, o un admin (todas) | El propio usuario puede actualizar su fila — **excepto** `role`, bloqueado por trigger, no por RLS (RLS no puede restringir una sola columna) |
| `subscriptions` | El propio usuario, o un admin (todas) | **Nadie autenticado.** Ni siquiera un admin puede escribir vía API — las altas/suspensiones son "funciones administrativas server-side" y van a usar la service role más adelante, que bypassea RLS |
| `modules` / `lessons` / `action_matrix_entries` / `objections` | Usuarios autenticados con `has_content_access()` en `true`, y solo filas `active` | Nadie autenticado — el contenido se administra por seed/migraciones (hoy) o por un futuro panel admin server-side |
| `search_concepts` | Igual que el resto del contenido | Nadie autenticado |
| `learning_progress` | El propio usuario (`SELECT`/`INSERT`/`UPDATE`/`DELETE` de sus propias filas) | Igual — es autoservicio legítimo |
| `admin_audit_log` | Solo admins | Solo `INSERT`, solo admins, y solo declarándose a sí mismos como autor (`admin_user_id = auth.uid()`). Sin `UPDATE` ni `DELETE`: es un log, no se edita el pasado |

**Punto central para lo que pediste proteger:** ninguna tabla tiene una
política para el rol `anon`. Un visitante sin sesión iniciada obtiene
siempre **cero filas** de cualquier tabla de contenido, la decisión la toma
Postgres, no el frontend — exactamente el problema que se diagnosticó en la
auditoría anterior (contenido embebido en el bundle público) queda resuelto
a nivel de base de datos, no solo con una pantalla de login.

## 5. El seed propuesto

Dos piezas, por un motivo concreto: los datos actuales (`src/data/*.ts`)
suman más de 2400 líneas — transcribirlas a mano a SQL tiene riesgo real de
error de tipeo justo en el contenido pago (plantillas de mensajes,
respuestas a objeciones). Por eso:

1. **`supabase/seed/sample_seed_preview.sql`** — muestra a mano, **copiada y
   verificada línea por línea** contra el código fuente actual (no
   inventada): 1 módulo completo, 1 lección completa, 1 fila completa de la
   matriz de acciones (con sus 3 plantillas), 1 objeción completa y 1
   concepto de búsqueda. Sirve para revisar el patrón exacto de idempotencia
   (`ON CONFLICT (id) DO UPDATE`) con datos reales, ya mismo, sin depender de
   nada más.

2. **`scripts/generateContentSeed.ts`** — un generador que importa
   directamente `modules`, `lessons`, `actionMatrix`, `objections` y
   `concepts` desde `src/data/*.ts` (la misma fuente que ya usa la app hoy)
   y escribe `supabase/seed/content_seed.sql` con un `INSERT ... ON CONFLICT
   (id) DO UPDATE` por cada una de las **33 lecciones + 23 filas de la
   matriz + 12 objeciones + 9 conceptos + 5 módulos**. Se corre con:

   ```bash
   npm run seed:generate
   ```

   Este script **no se ejecutó todavía** — el entorno donde se preparó este
   plan no tiene Node.js instalado (la misma limitación que ya veníamos
   arrastrando desde el build inicial del proyecto). Quedó listo para
   correrse la primera vez que vos o yo tengamos Node disponible; en cuanto
   se genere, el `content_seed.sql` resultante también se muestra para
   revisión antes de aplicarse — no se ejecuta solo contra Supabase.

Ambos son **idempotentes**: correrlos una, dos o diez veces deja la base en
el mismo estado (actualiza por `id`, nunca duplica ni falla por
"ya existe").

## 6. Estrategia de rollback

`supabase/migrations/rollback.sql` revierte 0001–0005 completo, en el orden
inverso de creación (triggers → funciones → tablas, respetando las
dependencias de FK). Puntos importantes:

- **No se ejecuta automáticamente en ningún flujo.** Es una herramienta
  manual para el entorno de prueba de `auth-mvp`, no parte del deploy.
- Usa `DROP ... IF EXISTS ... CASCADE` en las tablas, lo que también borra
  las políticas RLS asociadas (pero nunca toca datos de otras tablas fuera
  de esta migración).
- No borra la extensión `pgcrypto` (por si el proyecto Supabase ya la usaba
  antes, para no afectar algo ajeno a esta migración).
- Al ejecutarse, **se pierde todo el contenido y todos los usuarios/progreso
  cargados hasta ese momento** en las tablas de esta migración — por eso es
  estrictamente para el entorno de prueba, nunca para producción una vez que
  haya usuarios reales.
- Forma de aplicarlo cuando haga falta: pegarlo en el SQL Editor de Supabase
  Studio del proyecto de prueba, o `supabase db execute -f
  supabase/migrations/rollback.sql` si se usa la Supabase CLI localmente.

## 7. Cómo crear el primer administrador de forma segura

No hay panel administrativo todavía (Etapa 5), así que el primer admin se
crea **manualmente, una sola vez**, directamente en Supabase — nunca
hardcodeando un email real en un archivo del repositorio:

1. En el dashboard de Supabase del proyecto, ir a **Authentication → Users
   → Invite user** y crear el usuario con el email real del primer
   administrador (esto ya dispara `handle_new_user`, que le crea su
   `profiles` con `role = 'user'` y su `subscriptions` en `trial`).
2. Esa persona acepta la invitación y define su contraseña (una vez que
   exista la pantalla de login — hasta entonces, el enlace de invitación de
   Supabase alcanza para confirmar la cuenta).
3. En el **SQL Editor** de Supabase Studio del mismo proyecto (corre con
   privilegios de `postgres`, no como un usuario autenticado normal — por
   eso el trigger `prevent_self_role_change` no lo bloquea), ejecutar una
   sola vez:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'el-email-real-de-la-persona@dominio.com';
   ```

4. Confirmar con `select id, email, role from public.profiles where role =
   'admin';` que quedó exactamente una fila (o las que correspondan).

Este paso **no se automatiza ni se deja en un script versionado** a
propósito: es la única vez que hace falta "saltarse" el circuito normal
(que, una vez que exista el panel admin de la Etapa 5, va a ser la única
forma de promover a alguien a admin, siempre con auditoría en
`admin_audit_log`).

---

**No se ejecutó nada de este SQL contra Supabase.** Queda a la espera de tu
aprobación para aplicarlo en el entorno de prueba (una vez montado, según lo
acordado, en un hosting compatible con Next.js separado de GitHub Pages).
