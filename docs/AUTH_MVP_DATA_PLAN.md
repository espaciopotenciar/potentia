# Potentia — Fundaciones de datos en Supabase (Etapa 1 de auth-mvp)

Estado: **SQL preparado, sin ejecutar.** Nada de este documento ni de los
archivos que describe se aplicó todavía contra el proyecto Supabase
(`rwxiatwaqlhyazwywsyh`). No se usó ninguna credencial: este trabajo no
necesitó ninguna, solo se escribieron archivos `.sql` y scripts en el
repositorio, en la rama `auth-mvp`.

Decisiones aprobadas incorporadas a este diseño:

- Todo el contenido funcional (lecciones, módulos, teoría 4x4, objeciones,
  matriz de acciones con sus plantillas, conceptos del buscador) pasa a ser
  **privado** — sin ninguna parte gratuita dentro de la app.
- Estados de membresía: `trial | active | past_due | suspended | cancelled`,
  con "vencido" calculado por `access_until`, no almacenado como estado
  aparte.
- Nada de esto se ejecuta ni se despliega todavía — es la Etapa 1
  ("Fundaciones de datos"), separada de login, panel admin, migración de
  rutas y del nuevo hosting.

## Revisión aplicada sobre la primera versión de este plan

Esta es la segunda versión del SQL, con las correcciones pedidas:

1. **`handle_new_user` ya no crea membresía en `trial`.** Crea la cuenta
   `suspended`, sin plan ni fechas. Habilitar el acceso es un paso manual
   aparte, hecho por una administradora.
2. **Verificado y documentado** cuándo se dispara el trigger sobre
   `auth.users` en el flujo de invitación: al **enviar** la invitación, no
   al aceptarla (detalle en el punto 3 de abajo).
3. **`plan_code` y `starts_at` pasan a ser nullable** (`access_until` ya lo
   era). Sin valores falsos para satisfacer `NOT NULL`.
4. **Se sacó la política de `UPDATE` genérica sobre `profiles`.** Un usuario
   común ya no tiene ningún camino de escritura directa sobre la tabla —
   solo puede llamar a la función `update_own_full_name()`, que únicamente
   toca `full_name`.
5. **Confirmado explícitamente** (tabla en el punto 6) que ninguna acción
   administrativa es alcanzable con la publishable key.
6. **El `content_seed.sql` completo ya se generó y se verificó** — ver
   punto 5, con conteos reales, no estimados.

Importante: para poder generar y verificar el seed completo (punto 6) hizo
falta un runtime de Node.js, que este entorno no tenía. Con tu aprobación
se instaló Node.js LTS localmente (vía winget) **solo para poder correr el
generador y las verificaciones de abajo con datos reales** — no se conectó
a Supabase ni se usó para nada más que leer `src/data/*.ts` y escribir
archivos `.sql` en el repositorio.

---

## 1. El SQL completo

Vive en `supabase/migrations/`, en 5 archivos que se aplican en orden:

| Archivo | Contenido |
|---|---|
| `0001_profiles_subscriptions.sql` | Extensión `pgcrypto`, tabla `profiles`, tabla `subscriptions` |
| `0002_content_tables.sql` | `modules`, `lessons`, `action_matrix_entries`, `objections`, `search_concepts` |
| `0003_progress_audit.sql` | `learning_progress`, `admin_audit_log` |
| `0004_functions_triggers.sql` | Funciones auxiliares + triggers |
| `0005_rls_policies.sql` | `ENABLE ROW LEVEL SECURITY` + todas las políticas |
| `rollback.sql` | Reversión completa (no se ejecuta automáticamente en ningún flujo) |

Cada archivo está escrito para poder correrse más de una vez sin romper
nada (`create table if not exists`, `create or replace function`,
`drop trigger/policy if exists` antes de recrearlo).

## 2. Explicación de cada tabla

| Tabla | Para qué sirve | Decisión de diseño clave |
|---|---|---|
| **`profiles`** | Perfil de aplicación de cada usuario de `auth.users` | `id` es el mismo `uuid` que `auth.users.id`; `role` restringido por `check` a `user`/`admin` |
| **`subscriptions`** | Estado de membresía actual | Una sola fila por usuario (`unique(user_id)`). **Nace `suspended`, con `plan_code`, `starts_at` y `access_until` en `null`** — crear la cuenta y habilitar el acceso son dos acciones distintas (ver punto 3) |
| **`modules`** | Los 5 módulos de Aprender | Igual forma que `src/data/modules.ts` |
| **`lessons`** | Las 33 lecciones (incluida toda la teoría 4x4) | `content` es `jsonb` (array de párrafos) |
| **`action_matrix_entries`** | Las 33 filas de la matriz de Accionar, con sus 3 plantillas de mensaje cada una | `unanswered_messages`, `sale_type`, `channel`, `has_agreed_date` en texto (no boolean/int) para preservar el comodín `"cualquiera"` del motor de decisión actual |
| **`objections`** | Las 12 objeciones con sus 3 respuestas cada una | Misma estructura que `src/data/objections.ts` |
| **`search_concepts`** | Índice curado de `/buscar` | `lesson_id` es una FK real a `lessons.id` |
| **`learning_progress`** | Progreso por usuario y lección | `unique(user_id, lesson_id)` |
| **`admin_audit_log`** | Historial de acciones administrativas | Append-only: sin `UPDATE` ni `DELETE` en ninguna política |

**`subscriptions.plan_code` y `subscriptions.starts_at` ahora son
nullable** (`access_until` ya lo era desde la primera versión). Una fila
recién creada no tiene plan ni fecha de inicio todavía — obligar un valor
no nulo ahí habría significado inventar una fecha o un plan falso.

**Integridad referencial de `related_lesson_ids`:** en `lessons`,
`action_matrix_entries` y `objections`, ese campo es `text[]`. Postgres no
soporta FK sobre columnas array de forma nativa. La integridad se valida en
`scripts/verifyContentSeed.ts` (ver punto 5) — corrida y confirmada sin
errores contra el contenido real.

## 3. Explicación de cada función

Todas viven en `0004_functions_triggers.sql`.

| Función | Tipo | Qué hace | `SECURITY DEFINER` |
|---|---|---|---|
| `set_updated_at()` | Trigger genérico | Actualiza `updated_at = now()` en cada `UPDATE` | No |
| `handle_new_user()` | Trigger sobre `auth.users` | Crea `profiles` y una fila de `subscriptions` **`suspended`**, sin plan ni fechas | Sí (patrón estándar de Supabase) |
| `is_admin(uuid)` | Helper RLS | `true` si `role = 'admin'` | Sí (evita recursión de RLS sobre `profiles`) |
| `has_active_membership(uuid)` | Helper RLS | Regla exacta de acceso por estado (tabla abajo) | Sí |
| `has_content_access(uuid)` | Helper RLS | `true` si hay membresía activa o el usuario es admin | Sí |
| `update_own_full_name(text)` | RPC (nueva) | Único camino de escritura de un usuario común sobre su propia fila de `profiles`; toca solamente `full_name` | Sí |
| `prevent_self_role_change()` | Trigger sobre `profiles` | Bloquea que alguien cambie su propio `role` | No |
| `prevent_self_subscription_change()` | Trigger sobre `subscriptions` | Bloquea que alguien modifique su propia membresía | No |

### ¿Cuándo se dispara `handle_new_user`? (verificado, no asumido)

El trigger es `AFTER INSERT ON auth.users`. La pregunta era si esa fila se
crea al **enviar** la invitación o al **aceptarla**. Con el método que este
proyecto va a usar para altas administrativas —
`supabase.auth.admin.inviteUserByEmail(email)` — Supabase inserta la fila
en `auth.users` **de inmediato, al enviar la invitación**. La persona
invitada todavía no puso una contraseña, no confirmó nada — la fila ya
existe y el trigger ya corrió.

Esto es exactamente por lo que la corrección del punto 1 (nacer
`suspended`, no `trial`) importa: bajo el diseño anterior, una invitación
enviada y nunca aceptada habría dejado, técnicamente, una membresía en
estado `trial` (acceso permitido) sin que nadie la hubiera activado. Con el
diseño actual, esa misma situación deja una fila `suspended` (acceso
bloqueado) — el diseño es seguro sin importar si la invitación se acepta en
5 minutos, en 3 meses, o nunca.

### Regla de acceso implementada en `has_active_membership`

| `status` | ¿Acceso permitido? |
|---|---|
| `trial` | Sí, si `access_until` es `null` o futuro |
| `active` | Sí, si `access_until` es `null` o futuro |
| `past_due` | No, siempre |
| `suspended` | No, siempre (incluye el estado inicial de toda cuenta nueva) |
| `cancelled` | Sí, únicamente si `access_until` es futuro |
| sin fila en `subscriptions` | No |

Sin cambios respecto de la versión anterior — esta regla ya estaba
aprobada; lo que cambió es el estado en el que nace la fila, no la regla
que evalúa los estados.

## 4. Políticas RLS

Todas en `0005_rls_policies.sql`, con el mismo principio de "negar por
defecto".

| Tabla | Quién puede leer | Quién puede escribir |
|---|---|---|
| `profiles` | El propio usuario, o un admin (todas) | **Nadie directamente.** Sin política de `UPDATE` para `authenticated`. El único camino es `update_own_full_name()`, que solo puede tocar `full_name` |
| `subscriptions` | El propio usuario, o un admin (todas) | Nadie autenticado — únicamente `service_role` |
| Tablas de contenido (`modules`, `lessons`, `action_matrix_entries`, `objections`, `search_concepts`) | Usuarios con `has_content_access()` en `true`, solo filas `active` | Nadie autenticado |
| `learning_progress` | El propio usuario | El propio usuario (`INSERT`/`UPDATE`/`DELETE` de sus propias filas) — autoservicio legítimo |
| `admin_audit_log` | Solo admins | Solo `INSERT`, solo admins, declarándose a sí mismos como autor |

### Por qué `profiles` cambió de "política de UPDATE + trigger" a "sin política + función RPC"

La versión anterior tenía una política `profiles_update_own` que permitía
`UPDATE` sobre la fila propia, confiando en el trigger
`prevent_self_role_change` para bloquear específicamente la columna `role`.
Funcionaba, pero dejaba potencialmente escribibles otras columnas sensibles
(`email`, `created_at`) que no tenían un trigger dedicado.

RLS evalúa por **fila**, no por columna — no hay forma de decir "esta fila
sí, pero esta columna no" directamente en una política. La solución más
clara es no dar ningún permiso de `UPDATE` directo, y exponer una única
función `SECURITY DEFINER` que solo sabe hacer una cosa (actualizar
`full_name` de quien la llama). Es el mismo patrón que ya se pedía para las
acciones administrativas (server-side, con un contrato explícito) aplicado
también al autoservicio del usuario común.

`prevent_self_role_change` se mantiene igual, ahora como defensa en
profundidad: con el diseño actual ya no hay ningún camino de `UPDATE`
directo sobre `profiles` para un usuario autenticado, así que el trigger no
tiene nada que bloquear en el uso normal — pero si en el futuro alguien
agrega una política de `UPDATE` sin pensarlo dos veces, el trigger sigue
ahí.

## 5. El seed — ya generado y verificado (no aplicado)

### Resumen de registros (real, verificado — no estimado)

```
modules:      5
lessons:      33
actionMatrix: 33   ← no 23; ver nota abajo
objections:   12
concepts:     9
```

**Nota sobre el número de la matriz de acciones:** en el diagnóstico
anterior yo había escrito "23 filas" — era una estimación incorrecta de mi
parte, no un conteo real. El conteo real, verificado ahora con
`grep -c` sobre `src/data/actionMatrix.ts` y confirmado por el generador,
es **33**. Ya corregí las dos menciones a "23" en `docs/AUTH_MVP_PLAN.md` y
en este documento.

### Verificación de integridad ejecutada

`scripts/verifyContentSeed.ts` (nuevo) — no se conecta a Supabase, solo lee
`src/data/*.ts` — corrobora:

- Sin IDs duplicados en `lessons`, `actionMatrix`, `objections`, `concepts`.
- Sin slugs de `lessons` duplicados.
- Todo `lessons[].moduleId` referencia un `modules.id` real.
- Todo `related_lesson_ids` (en `lessons`, `actionMatrix` y `objections`)
  referencia un `lessons.id` real.
- Todo `concepts[].lessonSlug` referencia un `lessons.slug` real.
- Ninguna plantilla de mensaje de `actionMatrix` supera las 5 variables
  requeridas (regla original de Accionar).

Resultado real de la corrida: **`OK: sin errores de referencias cruzadas ni
duplicados.`**

### Idempotencia — verificada, no solo declarada

Se corrió `npm run seed:generate` dos veces seguidas y se compararon los
dos archivos generados con `diff`: **son byte a byte idénticos.** El
generador es determinístico. Además, cada `INSERT` individual usa
`ON CONFLICT (id) DO UPDATE`, así que aplicar el `content_seed.sql`
resultante contra la base una, dos o diez veces deja el mismo estado final.

### Los archivos

1. **`supabase/seed/sample_seed_preview.sql`** — muestra a mano de 5
   registros (1 módulo, 1 lección, 1 fila de matriz, 1 objeción, 1
   concepto), copiada y verificada línea por línea contra el código fuente.
   Sigue sirviendo para revisar el patrón sin mirar un archivo de 375
   líneas.
2. **`supabase/seed/content_seed.sql`** — **el seed completo, ya generado**
   (92 `INSERT`, uno por cada registro real de `src/data/*.ts`: 5 + 33 + 33
   + 12 + 9). Generado con `scripts/generateContentSeed.ts`, verificado con
   `scripts/verifyContentSeed.ts`. **No se aplicó contra Supabase** —
   sigue esperando aprobación, igual que el resto de las migraciones.

```bash
npm run seed:generate   # regenera supabase/seed/content_seed.sql desde src/data/*.ts
npx tsx scripts/verifyContentSeed.ts   # corre las verificaciones de arriba
```

## 6. Confirmación: acciones administrativas, solo del lado del servidor

| Acción | ¿Alcanzable con la publishable key desde el cliente? | Por qué no |
|---|---|---|
| Activar membresía | No | Sin política de `INSERT`/`UPDATE` en `subscriptions` para `authenticated` |
| Suspender | No | Igual |
| Cancelar | No | Igual |
| Reactivar | No | Igual |
| Cambiar plan (`plan_code`) | No | Igual |
| Cambiar `access_until` | No | Igual |
| Cambiar `role` | No | Sin política de `UPDATE` en `profiles`; y aunque existiera, `prevent_self_role_change` bloquea el auto-cambio |

Las siete quedan exclusivamente accesibles vía `service_role` — hoy desde
el SQL Editor de Supabase Studio (operación manual del punto 7), más
adelante desde funciones server-side del panel administrativo (Etapa 5),
nunca desde el navegador con la publishable key.

## 7. Estrategia de rollback

Sin cambios respecto de la versión anterior. `supabase/migrations/rollback.sql`
revierte 0001–0005 completo, en orden inverso, no se ejecuta automáticamente
en ningún flujo, no borra la extensión `pgcrypto`, y es estrictamente para
el entorno de prueba (borra todo el contenido y usuarios de las tablas de
esta migración).

## 8. Cómo crear el primer administrador de forma segura

Ajustado al nuevo estado inicial (ya no hay un `trial` automático que
mencionar):

1. **Authentication → Users → Invite user** en el dashboard de Supabase,
   con el email real del primer administrador. Esto dispara
   `handle_new_user`: se crea su `profiles` (`role = 'user'`) y su
   `subscriptions` (`suspended`, sin plan ni fechas) — igual que cualquier
   otro usuario nuevo, sin ningún trato especial todavía.
2. La persona acepta la invitación y confirma su cuenta.
3. En el **SQL Editor** de Supabase Studio (corre como `postgres`, no como
   un usuario autenticado — el trigger `prevent_self_role_change` no
   aplica ahí), ejecutar una sola vez:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'el-email-real-de-la-persona@dominio.com';
   ```

4. Si además esa persona va a poder usar la app (no sería obligatorio para
   administrar), habilitar también su propio acceso:

   ```sql
   update public.subscriptions
   set status = 'active', starts_at = now()
   where user_id = (select id from public.profiles where email = 'el-email-real-de-la-persona@dominio.com');
   ```

5. Confirmar con `select id, email, role from public.profiles where role =
   'admin';`.

Este paso no se automatiza ni se deja en un script versionado a propósito.

---

**No se ejecutó nada de este SQL contra Supabase.** Queda a la espera de tu
aprobación para aplicarlo en el entorno de prueba.
