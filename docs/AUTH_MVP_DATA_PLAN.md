# Potentia — Fundaciones de datos en Supabase (Etapa 1 de auth-mvp)

Estado: **EJECUTADO** contra el proyecto Supabase `rwxiatwaqlhyazwywsyh`
(migraciones 0001–0005 + `content_seed.sql`), vía SQL Editor de Supabase
Studio (sin usar ninguna credencial privada — no hubo CLI ni acceso
programático). Verificado con `supabase/verify_stage1.sql`: 9 tablas, RLS
activo en las 9, 9 funciones, 10 triggers (11 filas por el evento doble de
`admin_audit_log_prevent_mutation`), 12 políticas, 92 registros de
contenido sin duplicados ni huérfanos, y los `GRANT`/`REVOKE` finales
confirmados uno por uno. Detalle completo al final de este documento.
Ningún usuario ni administrador fue creado todavía.

Decisiones aprobadas incorporadas a este diseño:

- Todo el contenido funcional pasa a ser **privado** — sin ninguna parte
  gratuita dentro de la app.
- Estados de membresía: `trial | active | past_due | suspended | cancelled`,
  con "vencido" calculado por `access_until`.
- Toda cuenta nace `suspended`, sin plan ni fechas — crear la cuenta y
  habilitar el acceso son dos acciones administrativas distintas.
- Nada de esto se ejecuta ni se despliega todavía.

## Historial de revisiones

- **v1:** primera versión (tablas, funciones con parámetro, RLS básico).
- **v2:** alta inicial en `suspended` (no `trial`), campos nullable en
  `subscriptions`, `update_own_full_name` en vez de política de `UPDATE`
  genérica, seed completo generado y verificado con Node real.
- **v3:** dos correcciones de seguridad antes de ejecutar:
  1. `is_admin(uuid)`, `has_active_membership(uuid)`, `has_content_access(uuid)`
     reemplazadas por versiones **sin parámetro** (`is_current_user_admin()`,
     `current_user_has_active_membership()`, `current_user_has_content_access()`),
     para que nadie pueda consultar la condición de otro usuario pasando su
     UUID como argumento.
  2. `admin_audit_log` ya no acepta `INSERT` de ningún `authenticated`
     (ni siquiera admin) — solo `service_role` o una futura función
     administrativa puede escribir ahí.
  3. Cada función tiene ahora `REVOKE`/`GRANT` explícito, incluyendo un
     `revoke ... from anon` explícito además de `revoke ... from public`.
- **v4 (esta versión):** corrección de un error real señalado en la
  revisión: el documento afirmaba que `service_role` no podía hacer
  `UPDATE`/`DELETE` en `admin_audit_log` "porque no existen políticas
  RLS". Eso es incorrecto — `service_role` tiene el atributo `BYPASSRLS`
  y no le aplica ninguna política, exista o no. La inmutabilidad ahora se
  implementa con un **trigger** (`prevent_audit_log_mutation`), que
  rechaza cualquier `UPDATE`/`DELETE` para cualquier rol, `service_role`
  incluido — los triggers no se saltean por `BYPASSRLS`. Detalle completo
  en la sección 7.

---

## 1. El SQL completo

Vive en `supabase/migrations/`, en 5 archivos que se aplican en orden:

| Archivo | Contenido |
|---|---|
| `0001_profiles_subscriptions.sql` | Extensión `pgcrypto`, tabla `profiles`, tabla `subscriptions` |
| `0002_content_tables.sql` | `modules`, `lessons`, `action_matrix_entries`, `objections`, `search_concepts` |
| `0003_progress_audit.sql` | `learning_progress`, `admin_audit_log` |
| `0004_functions_triggers.sql` | Funciones auxiliares + triggers + todos los `REVOKE`/`GRANT` |
| `0005_rls_policies.sql` | `ENABLE ROW LEVEL SECURITY` + todas las políticas |
| `rollback.sql` | Reversión completa (no se ejecuta automáticamente en ningún flujo) |

Cada archivo está escrito para poder correrse más de una vez sin romper
nada (`create table if not exists`, `create or replace function`,
`drop trigger/policy/function if exists` antes de recrear).

## 2. Explicación de cada tabla

| Tabla | Para qué sirve | Decisión de diseño clave |
|---|---|---|
| **`profiles`** | Perfil de aplicación de cada usuario de `auth.users` | `id` es el mismo `uuid` que `auth.users.id`; `role` restringido por `check` a `user`/`admin` |
| **`subscriptions`** | Estado de membresía actual | Una sola fila por usuario (`unique(user_id)`). Nace `suspended`, con `plan_code`, `starts_at` y `access_until` en `null` |
| **`modules`** | Los 5 módulos de Aprender | Igual forma que `src/data/modules.ts` |
| **`lessons`** | Las 33 lecciones (incluida toda la teoría 4x4) | `content` es `jsonb` (array de párrafos) |
| **`action_matrix_entries`** | Las 33 filas de la matriz de Accionar, con sus 3 plantillas cada una | Campos de condición en texto (no boolean/int) para preservar el comodín `"cualquiera"` del motor de decisión actual |
| **`objections`** | Las 12 objeciones con sus 3 respuestas cada una | Misma estructura que `src/data/objections.ts` |
| **`search_concepts`** | Índice curado de `/buscar` | `lesson_id` es una FK real a `lessons.id` |
| **`learning_progress`** | Progreso por usuario y lección | `unique(user_id, lesson_id)` |
| **`admin_audit_log`** | Historial de acciones administrativas | Append-only: ninguna política permite `UPDATE`/`DELETE`, y desde v3 tampoco `INSERT` para `authenticated` |

`subscriptions.plan_code` y `subscriptions.starts_at` son nullable
(`access_until` ya lo era) — una fila recién creada no tiene plan ni fecha
de inicio todavía.

**Integridad referencial de `related_lesson_ids`:** es `text[]` en
`lessons`, `action_matrix_entries` y `objections`. Postgres no soporta FK
sobre columnas array. La integridad se valida con
`scripts/verifyContentSeed.ts` (ver punto 8) — corrida real, sin errores.

## 3. Explicación de cada función

Todas en `0004_functions_triggers.sql`.

| Función | Qué hace | `SECURITY DEFINER` |
|---|---|---|
| `set_updated_at()` | Actualiza `updated_at` en cada `UPDATE` | No |
| `handle_new_user()` | Crea `profiles` + `subscriptions` (`suspended`, sin plan ni fechas) al insertarse una fila en `auth.users` | Sí |
| `is_current_user_admin()` | `true` si quien ejecuta la sesión tiene `role = 'admin'` | Sí |
| `current_user_has_active_membership()` | Regla exacta de acceso por estado, para la sesión actual | Sí |
| `current_user_has_content_access()` | `true` si hay membresía activa o la sesión es admin | Sí |
| `update_own_full_name(text)` | Único camino de escritura de un usuario común sobre su propia fila de `profiles`; solo toca `full_name` | Sí |
| `prevent_self_role_change()` | Bloquea que alguien cambie su propio `role` | No |
| `prevent_self_subscription_change()` | Bloquea que alguien modifique su propia membresía | No |
| `prevent_audit_log_mutation()` (v4) | Rechaza cualquier `UPDATE`/`DELETE` sobre `admin_audit_log`, para cualquier rol incluido `service_role` | No |

**Cambio v3:** `is_admin`, `has_active_membership` y `has_content_access`
ya no existen con parámetro `uuid` — se reemplazaron por las tres
versiones sin parámetro de la tabla de arriba. Detalle completo del porqué
en la sección 6.

### ¿Cuándo se dispara `handle_new_user`? (verificado, no asumido)

El trigger es `AFTER INSERT ON auth.users`. Con
`supabase.auth.admin.inviteUserByEmail(email)` — el método que este
proyecto usa para altas administrativas — Supabase inserta la fila en
`auth.users` **al enviar la invitación**, no al aceptarla. El diseño es
seguro bajo ese supuesto porque el estado inicial es `suspended` (cero
acceso), sin importar si la invitación se acepta o no.

### Regla de acceso implementada en `current_user_has_active_membership`

| `status` | ¿Acceso permitido? |
|---|---|
| `trial` | Sí, si `access_until` es `null` o futuro |
| `active` | Sí, si `access_until` es `null` o futuro |
| `past_due` | No, siempre |
| `suspended` | No, siempre (incluye el estado inicial de toda cuenta nueva) |
| `cancelled` | Sí, únicamente si `access_until` es futuro |
| sin fila en `subscriptions` | No |

## 4. Políticas RLS

Todas en `0005_rls_policies.sql`, principio "negar por defecto".

| Tabla | Quién puede leer | Quién puede escribir |
|---|---|---|
| `profiles` | El propio usuario, o un admin (todas) | Nadie directamente — solo `update_own_full_name()` |
| `subscriptions` | El propio usuario, o un admin (todas) | Nadie autenticado — solo `service_role` |
| Tablas de contenido | Con `current_user_has_content_access()` en `true`, solo filas `active` | Nadie autenticado |
| `learning_progress` | El propio usuario | El propio usuario (autoservicio legítimo) |
| `admin_audit_log` | Solo admins | **Nadie autenticado, ni siquiera admin** (cambio v3) — solo `service_role` |

Ninguna tabla tiene política para `anon`: un visitante sin sesión obtiene
siempre cero filas de cualquier tabla de contenido.

## 5. Políticas que llaman a las funciones de membresía

```sql
-- profiles
using (id = auth.uid() or public.is_current_user_admin())

-- subscriptions
using (user_id = auth.uid() or public.is_current_user_admin())

-- modules / lessons / action_matrix_entries / objections
using (active and public.current_user_has_content_access())

-- search_concepts
using (public.current_user_has_content_access())

-- admin_audit_log (solo SELECT)
using (public.is_current_user_admin())
```

## 6. Permisos de funciones `SECURITY DEFINER` (corrección v3)

### Por qué el reemplazo por funciones sin parámetro, no solo "restringir el uso"

No hay ninguna forma en Postgres de decir "esta función se puede llamar,
pero solo pasando el propio `auth.uid()` como argumento" — `GRANT EXECUTE`
es binario. Con `is_admin(uuid)` y `GRANT EXECUTE` a `authenticated`,
cualquier usuario podía hacer:

```
supabase.rpc('is_admin', { p_user_id: '<uuid de otra persona>' })
```

y enterarse del rol de esa persona sin pasar por ninguna tabla ni
política — una fuga de información real. La solución de fondo es que la
función no reciba ningún identificador de usuario del cliente: por eso el
reemplazo completo, sin mantener las variantes con parámetro. Ninguna
política RLS de este proyecto necesita evaluar la condición de un usuario
distinto del que ejecuta la consulta, así que no había motivo técnico para
conservarlas. Las futuras funciones administrativas (Etapa 5) que sí
necesitan operar sobre un `target_user_id` van a ser funciones nuevas y
dedicadas (ver el patrón de la sección 7), no una reutilización de estos
helpers de sesión.

### REVOKE y GRANT exactos

```sql
-- is_current_user_admin()
revoke all on function public.is_current_user_admin() from public;
revoke all on function public.is_current_user_admin() from anon;
grant execute on function public.is_current_user_admin() to authenticated;

-- current_user_has_active_membership()
revoke all on function public.current_user_has_active_membership() from public;
revoke all on function public.current_user_has_active_membership() from anon;
grant execute on function public.current_user_has_active_membership() to authenticated;

-- current_user_has_content_access()
revoke all on function public.current_user_has_content_access() from public;
revoke all on function public.current_user_has_content_access() from anon;
grant execute on function public.current_user_has_content_access() to authenticated;

-- update_own_full_name(text)
revoke all on function public.update_own_full_name(text) from public;
revoke all on function public.update_own_full_name(text) from anon;
grant execute on function public.update_own_full_name(text) to authenticated;

-- handle_new_user() — función de trigger, nunca debe llamarse como RPC
revoke all on function public.handle_new_user() from public;
-- Sin GRANT a nadie. El trigger la dispara igual: el mecanismo de
-- triggers no pasa por el chequeo de EXECUTE de una llamada RPC normal.

-- Funciones de trigger auxiliares (defensa en profundidad, mismo motivo):
revoke all on function public.set_updated_at() from public;
revoke all on function public.prevent_self_role_change() from public;
revoke all on function public.prevent_self_subscription_change() from public;

-- prevent_audit_log_mutation() (v4) — explícito para los tres roles de
-- aplicación, no solo "from public", porque este REVOKE es el punto
-- central de la corrección de esta versión:
revoke all on function public.prevent_audit_log_mutation() from public;
revoke all on function public.prevent_audit_log_mutation() from anon;
revoke all on function public.prevent_audit_log_mutation() from authenticated;
```

`revoke ... from public` ya bloquea a `anon` (`PUBLIC` es un pseudo-rol
del que todo rol es miembro), pero se agregó el `revoke ... from anon`
explícito en las cuatro funciones con algún `GRANT`, para que quede
inequívoco en el propio SQL.

### Quién puede ejecutar qué

| Función | `anon` | `authenticated` | `service_role` |
|---|---|---|---|
| `is_current_user_admin()` | ❌ | ✅ | ✅ |
| `current_user_has_active_membership()` | ❌ | ✅ | ✅ |
| `current_user_has_content_access()` | ❌ | ✅ | ✅ |
| `update_own_full_name(text)` | ❌ | ✅ | ✅ |
| `handle_new_user()` | ❌ | ❌ | ✅ (solo vía trigger) |
| `set_updated_at()` / `prevent_self_role_change()` / `prevent_self_subscription_change()` | ❌ | ❌ | ✅ (solo vía trigger) |
| `prevent_audit_log_mutation()` (v4) | ❌ | ❌ | ✅ (solo vía trigger — ni siquiera `service_role` la llama directo, el trigger la dispara sola) |

`authenticated` necesita `GRANT EXECUTE` sobre las tres funciones de
sesión porque Postgres exige permiso de `EXECUTE` a quien ejecuta la
consulta que dispara la política RLS, sin importar que la función sea
`SECURITY DEFINER` (eso solo cambia con qué privilegios corre el *cuerpo*
de la función). Que queden invocables como RPC directa ya no es un
problema: al no aceptar ningún UUID ajeno, un usuario solo puede
enterarse de *su propio* estado.

## 7. `admin_audit_log` (corrección v3)

### Políticas finales

```sql
alter table public.admin_audit_log enable row level security;

drop policy if exists "admin_audit_log_select_admin_only" on public.admin_audit_log;
create policy "admin_audit_log_select_admin_only"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_current_user_admin());

-- Sin ninguna policy de INSERT, UPDATE ni DELETE para 'authenticated'.
```

La v2 tenía una política de `INSERT` para admins (con `WITH CHECK
(is_admin(auth.uid()) AND admin_user_id = auth.uid())`) que ya impedía
insertar "a nombre de" otro admin, pero seguía dejando la escritura
alcanzable con la publishable key. Ahora no existe ningún camino de
escritura para `authenticated`, ni siquiera admin.

| Acción | `anon` | `authenticated` (no admin) | `authenticated` (admin) | `service_role` |
|---|---|---|---|---|
| `SELECT` | ❌ (sin política) | ❌ (sin política) | ✅ (política RLS) | ✅ (bypassea RLS) |
| `INSERT` | ❌ (sin política) | ❌ (sin política) | ❌ (sin política) | ✅ (bypassea RLS — este es el camino real de escritura) |
| `UPDATE` / `DELETE` | ❌ | ❌ | ❌ | **❌ — bloqueado por el trigger `prevent_audit_log_mutation`, no por RLS** |

**Corrección v4:** la fila de `UPDATE`/`DELETE` para `service_role` en la
versión anterior de esta tabla decía "❌ (nadie — append-only)" atribuido
implícitamente a la ausencia de políticas RLS. Eso era incorrecto:
`service_role` tiene el atributo `BYPASSRLS`, así que la ausencia de una
política de `UPDATE`/`DELETE` no lo detiene — RLS simplemente no se evalúa
para ese rol. El motivo real, correcto, es el trigger de la sección
siguiente, que no depende de RLS en absoluto.

### Inmutabilidad real frente a `service_role`: trigger `prevent_audit_log_mutation`

```sql
-- Función de trigger: rechaza incondicionalmente cualquier UPDATE/DELETE,
-- para cualquier rol, incluido service_role. Los triggers no forman parte
-- de RLS y no se saltean con BYPASSRLS — se disparan para toda sentencia
-- UPDATE/DELETE contra la tabla, sin importar quién la ejecute.
create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'admin_audit_log es de solo inserción: no se permite UPDATE ni DELETE, ni siquiera con service_role.';
end;
$$;

-- Ningún rol de aplicación puede invocarla directamente como RPC: no
-- tiene ninguna razón de ser fuera de este trigger. El trigger la
-- ejecuta igual, sin depender de estos GRANT.
revoke all on function public.prevent_audit_log_mutation() from public;
revoke all on function public.prevent_audit_log_mutation() from anon;
revoke all on function public.prevent_audit_log_mutation() from authenticated;

drop trigger if exists admin_audit_log_prevent_mutation on public.admin_audit_log;
create trigger admin_audit_log_prevent_mutation
  before update or delete on public.admin_audit_log
  for each row execute function public.prevent_audit_log_mutation();
```

Vive en `0004_functions_triggers.sql` (junto al resto de las funciones y
triggers), no en un archivo nuevo — el proyecto sigue teniendo los mismos
5 archivos de migración numerados (0001–0005) más `rollback.sql`.

Por qué no se usó `WITH CHECK`/RLS para esto: una política RLS de
`UPDATE`/`DELETE` con `USING (false)` tendría el mismo problema que
cualquier otra política — `service_role` la ignora por completo. Un
trigger `BEFORE UPDATE OR DELETE` es la única herramienta de Postgres que
sigue aplicando incluso cuando RLS no aplica. `DROP TABLE` (usado en
`rollback.sql`) no pasa por este trigger porque es DDL, no DML — el
rollback del entorno de prueba sigue funcionando sin problema.

**Confirmación pedida:** las futuras funciones administrativas (Etapa 5,
patrón de la sección siguiente) van a poder seguir haciendo `INSERT` en
`admin_audit_log` sin ningún cambio — el trigger nuevo solo intercepta
`UPDATE` y `DELETE`. Van a poder agregar registros nuevos, pero nunca
modificar ni borrar uno ya existente, ni siquiera ellas mismas (son
`SECURITY DEFINER`, pero corren como el mismo rol de base que
`service_role`/`postgres`, y el trigger no hace excepciones por rol).

### El patrón para las futuras operaciones administrativas (Etapa 5 — referencia, no se crea todavía)

El requisito de que el registro de auditoría "no dependa de una segunda
llamada desde el frontend" es una decisión de arquitectura que conviene
dejar documentada ahora. Cada operación administrativa va a ser **una sola
función `SECURITY DEFINER`**: al ser `plpgsql`, todo su cuerpo corre como
una transacción implícita — si cualquier paso falla, Postgres revierte
todo, incluida la inserción del audit log.

```sql
-- REFERENCIA — no se crea en esta etapa, no se ejecuta.
create or replace function public.admin_set_subscription_status(
  p_target_user_id uuid,
  p_new_status text,
  p_access_until timestamptz default null,
  p_notes text default null
)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_previous public.subscriptions;
  v_updated  public.subscriptions;
begin
  -- 1. Verificación del rol admin.
  if not public.is_current_user_admin() then
    raise exception 'Solo una administradora puede ejecutar esta acción.';
  end if;

  -- 2. Lectura del valor anterior (para el log).
  select * into v_previous from public.subscriptions where user_id = p_target_user_id;

  -- 3. Modificación de subscription.
  update public.subscriptions
  set status = p_new_status, access_until = p_access_until, notes = coalesce(p_notes, notes)
  where user_id = p_target_user_id
  returning * into v_updated;

  -- 4. Inserción del admin_audit_log, en la MISMA transacción.
  insert into public.admin_audit_log (admin_user_id, target_user_id, action, previous_value, new_value)
  values (auth.uid(), p_target_user_id, 'subscription_status_change', to_jsonb(v_previous), to_jsonb(v_updated));

  -- 5. Confirmación transaccional: implícita. Si algo falló arriba, todo
  -- se revierte solo; si se llega hasta acá, Postgres confirma el cambio
  -- y el log juntos.
  return v_updated;
end;
$$;

revoke all on function public.admin_set_subscription_status(uuid, text, timestamptz, text) from public;
revoke all on function public.admin_set_subscription_status(uuid, text, timestamptz, text) from anon;
grant execute on function public.admin_set_subscription_status(uuid, text, timestamptz, text) to authenticated;
```

El `GRANT EXECUTE` es a `authenticated`, no a un rol "admin" aparte — la
verificación pasa **dentro** de la función (paso 1); cualquier
`authenticated` que no sea admin recibe la excepción y no llega a tocar
nada. El frontend hace una sola llamada RPC, nunca dos pasos separados
donde el segundo (el log) dependa del éxito del primero.

## 8. El seed — generado y verificado

### Resumen de registros (real, verificado)

```
modules:      5
lessons:      33
actionMatrix: 33
objections:   12
concepts:     9
```

### Verificación ejecutada

`scripts/verifyContentSeed.ts` — sin conectarse a Supabase, solo lee
`src/data/*.ts` — corrobora: sin IDs/slugs duplicados; todo `moduleId`,
`related_lesson_ids` y `lessonSlug` resuelve a un registro real; ninguna
plantilla de mensaje supera las 5 variables requeridas. Resultado real:
`OK: sin errores de referencias cruzadas ni duplicados.`

**Idempotencia verificada:** se corrió el generador dos veces y se
compararon los archivos con `diff` — idénticos byte a byte. Cada `INSERT`
usa `ON CONFLICT (id) DO UPDATE`.

### Los archivos

1. `supabase/seed/sample_seed_preview.sql` — muestra a mano de 5 registros,
   verificada línea por línea.
2. `supabase/seed/content_seed.sql` — el seed completo, 92 `INSERT` (5+33+33+12+9),
   generado con `scripts/generateContentSeed.ts`. **No se aplicó contra
   Supabase.**

```bash
npm run seed:generate                    # regenera content_seed.sql
npx tsx scripts/verifyContentSeed.ts     # corre las verificaciones
```

## 9. Estrategia de rollback

`supabase/migrations/rollback.sql` revierte 0001–0005 completo, en orden
inverso, respetando las dependencias de FK. Actualizado en v3 para dropear
los nombres de función nuevos (y conserva los nombres viejos por si se
corre contra un entorno que todavía tuviera la v1). No se ejecuta
automáticamente en ningún flujo; no borra la extensión `pgcrypto`; borra
todo el contenido y usuarios de las tablas de esta migración — estrictamente
para el entorno de prueba.

## 10. Cómo crear el primer administrador de forma segura

1. **Authentication → Users → Invite user** en el dashboard de Supabase.
   Dispara `handle_new_user`: se crea `profiles` (`role = 'user'`) y
   `subscriptions` (`suspended`, sin plan ni fechas) — sin trato especial.
2. La persona acepta la invitación y confirma su cuenta.
3. En el **SQL Editor** de Supabase Studio (corre como `postgres`, no
   pasa por RLS ni por los `GRANT` de `authenticated`/`anon`), ejecutar
   una sola vez:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'el-email-real-de-la-persona@dominio.com';
   ```

4. Si esa persona también va a usar la app, habilitar su acceso:

   ```sql
   update public.subscriptions
   set status = 'active', starts_at = now()
   where user_id = (select id from public.profiles where email = 'el-email-real-de-la-persona@dominio.com');
   ```

5. Confirmar con `select id, email, role from public.profiles where role = 'admin';`.

Este paso no se automatiza ni se deja en un script versionado a propósito.

## 11. Confirmaciones finales pedidas

- **`anon` no puede ejecutar ninguna RPC interna:** confirmado — las nueve
  funciones de `0004_functions_triggers.sql` tienen `revoke ... from
  public` y ninguna tiene `grant ... to anon`. Las cuatro con algún
  `GRANT` lo tienen exclusivamente hacia `authenticated`.
- **`authenticated` no puede escribir auditoría:** confirmado —
  `0005_rls_policies.sql` no define ninguna política de
  `INSERT`/`UPDATE`/`DELETE` para `authenticated` sobre `admin_audit_log`.
  RLS activado sin política = denegado por defecto.
- **`admin_audit_log` es append-only también frente a `service_role`
  (corrección v4):** confirmado — el trigger `prevent_audit_log_mutation`
  rechaza cualquier `UPDATE`/`DELETE` sobre esa tabla para cualquier rol,
  sin depender de RLS. Solo `INSERT` sigue permitido, para `service_role`
  hoy y para las futuras funciones administrativas de la Etapa 5.
- **La publishable key no puede modificar roles ni membresías:**
  confirmado — ninguna tabla tiene política de `UPDATE` para
  `authenticated` que alcance `role` (`profiles`) ni ningún campo de
  `subscriptions`. El único camino de escritura de un usuario común sobre
  su propia fila es `update_own_full_name(text)`, que solo toca
  `full_name`. Todo cambio de `role` o de `subscriptions` requiere
  `service_role` (hoy, manual — sección 10) o, más adelante, una función
  `SECURITY DEFINER` administrativa como la de la sección 7, siempre
  validando `is_current_user_admin()` antes de escribir.

---

## 12. Resultado de la ejecución (Etapa 1 completada)

**Método:** SQL Editor de Supabase Studio, archivo por archivo (0001 →
0002 → 0003 → 0004 → 0005), con confirmación entre cada uno. Después,
`content_seed.sql` completo. Ninguna credencial privada fue compartida ni
usada — no hubo CLI ni conexión programática.

**Hallazgo durante la verificación (ya corregido):** `handle_new_user()`,
`set_updated_at()`, `prevent_self_role_change()` y
`prevent_self_subscription_change()` tenían `EXECUTE` otorgado a `anon` y
`authenticated` pese al `revoke ... from public` que ya tenían. Causa: los
"default privileges" que Supabase aplica automáticamente a toda función
nueva del schema `public` otorgan `EXECUTE` directo a `anon`/
`authenticated`/`service_role`, además del `GRANT` implícito de Postgres a
`PUBLIC` — revocar de `PUBLIC` no alcanza para quitar esos grants directos.
Se corrigió agregando `revoke ... from anon` y `revoke ... from
authenticated` explícitos a las cuatro funciones (en el repo y contra el
proyecto real), replicando el patrón que `prevent_audit_log_mutation` ya
tenía. Verificado después de la corrección: las cuatro quedaron con
`EXECUTE` únicamente para `postgres`/`service_role`.

**Verificación final (`verify_stage1.sql`), confirmada con datos reales del proyecto:**

- 9 tablas creadas: `profiles`, `subscriptions`, `modules`, `lessons`,
  `action_matrix_entries`, `objections`, `search_concepts`,
  `learning_progress`, `admin_audit_log`.
- RLS habilitado (`true`) en las 9.
- 9 funciones creadas, con `SECURITY DEFINER` exactamente donde
  correspondía (las 5 que necesitan leer/escribir por fuera del usuario
  actual: `handle_new_user`, `is_current_user_admin`,
  `current_user_has_active_membership`, `current_user_has_content_access`,
  `update_own_full_name`; las 4 funciones de trigger puro, sin).
- 10 triggers creados (11 filas en `information_schema.triggers` porque
  `admin_audit_log_prevent_mutation` cuenta una vez por evento —
  `UPDATE` y `DELETE`).
- Conteo de contenido: `modules` 5, `lessons` 33, `action_matrix_entries`
  33, `objections` 12, `search_concepts` 9 — **92 registros**, coincide
  exactamente con lo esperado.
- Sin IDs duplicados ni slugs duplicados en ninguna tabla de contenido.
- Activas = total en las 4 tablas de contenido con columna `active`
  (`modules` 5/5, `lessons` 33/33, `action_matrix_entries` 33/33,
  `objections` 12/12).
- FK sin huérfanos: `lessons.module_id` → 0, `search_concepts.lesson_id` → 0.
- 12 políticas creadas, **todas `to authenticated`** — ninguna política
  para `anon` en ninguna tabla.
- `GRANT EXECUTE` final por función, confirmado:

  | Función | Roles con EXECUTE |
  |---|---|
  | `is_current_user_admin` | `authenticated`, `postgres`, `service_role` |
  | `current_user_has_active_membership` | `authenticated`, `postgres`, `service_role` |
  | `current_user_has_content_access` | `authenticated`, `postgres`, `service_role` |
  | `update_own_full_name` | `authenticated`, `postgres`, `service_role` |
  | `handle_new_user` | `postgres`, `service_role` |
  | `set_updated_at` | `postgres`, `service_role` |
  | `prevent_self_role_change` | `postgres`, `service_role` |
  | `prevent_self_subscription_change` | `postgres`, `service_role` |
  | `prevent_audit_log_mutation` | `postgres`, `service_role` |

  Ningún `anon` en ninguna fila. `authenticated` únicamente en las cuatro
  funciones "de usuario" — exactamente lo pedido.

**Prueba del log inmutable (postergada según lo acordado):** no se insertó
ningún registro de prueba en `admin_audit_log` porque hubiera requerido
inventar UUIDs de `admin_user_id`/`target_user_id` sin usuarios reales
todavía. Se confirmó, en cambio, que `prevent_audit_log_mutation()` existe
(`security_definer = false`, como corresponde a una función de trigger
simple) y que el trigger `admin_audit_log_prevent_mutation` está activo
sobre `admin_audit_log` para los eventos `UPDATE` y `DELETE`. La prueba con
un `INSERT`/`UPDATE`/`DELETE` real queda pendiente para cuando existan
usuarios reales.

**Errores encontrados:** uno (el de permisos de las 4 funciones de
trigger, arriba), corregido y reverificado. Ningún otro error en las 5
migraciones ni en el seed.

**Usuarios creados:** ninguno. **`rollback.sql`:** no se ejecutó.
**`main`:** no se modificó.
