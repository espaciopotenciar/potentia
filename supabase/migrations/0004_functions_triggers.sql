-- =====================================================================
-- 0004_functions_triggers.sql
-- Funciones auxiliares y triggers de seguridad/consistencia.
--
-- Principio de permisos aplicado a TODA función de este archivo, sin
-- excepción: Postgres otorga EXECUTE a PUBLIC por defecto en toda función
-- nueva, y Supabase además otorga EXECUTE directo a anon/authenticated/
-- service_role sobre toda función nueva del schema public (default
-- privileges propias del proyecto). "revoke ... from public" revoca
-- SOLO el primero — no alcanza para quitarle el permiso directo a anon
-- ni a authenticated. Por eso cada función de acá revoca explícitamente
-- los tres roles (public, anon, authenticated) y vuelve a otorgar solo
-- lo mínimo necesario:
--   - Funciones de trigger (nunca deben llamarse como RPC): sin GRANT a
--     nadie (ni anon ni authenticated). Los triggers se disparan igual,
--     no dependen de EXECUTE.
--   - Helpers de sesión (is_current_user_admin, etc.): GRANT solo a
--     'authenticated'. 'anon' nunca las puede ejecutar.
--   - update_own_full_name: GRANT solo a 'authenticated'.
-- 'anon' no tiene GRANT en ninguna función de este archivo.
--
-- Todas las funciones SECURITY DEFINER fijan además SET search_path =
-- public (mitiga "search_path hijacking" sobre funciones con privilegios
-- elevados).
-- =====================================================================

-- ---------------------------------------------------------------------
-- set_updated_at(): trigger genérico para mantener updated_at al día.
-- No es SECURITY DEFINER (no necesita privilegios elevados), pero de
-- todas formas no tiene por qué ser invocable como RPC por nadie.
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- IMPORTANTE: Supabase otorga EXECUTE a anon/authenticated/service_role
-- de forma automática (default privileges) sobre toda función nueva del
-- schema public, ADEMÁS del GRANT implícito a PUBLIC de Postgres.
-- "revoke ... from public" revoca únicamente ese segundo grant — no
-- alcanza para quitarle el permiso directo a anon/authenticated. Por eso
-- cada función de trigger de este archivo revoca explícitamente los tres.
revoke all on function public.set_updated_at() from public;
revoke all on function public.set_updated_at() from anon;
revoke all on function public.set_updated_at() from authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists learning_progress_set_updated_at on public.learning_progress;
create trigger learning_progress_set_updated_at
  before update on public.learning_progress
  for each row execute function public.set_updated_at();

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

drop trigger if exists action_matrix_set_updated_at on public.action_matrix_entries;
create trigger action_matrix_set_updated_at
  before update on public.action_matrix_entries
  for each row execute function public.set_updated_at();

drop trigger if exists objections_set_updated_at on public.objections;
create trigger objections_set_updated_at
  before update on public.objections
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- handle_new_user(): crea automáticamente profiles + subscriptions
-- cuando Supabase Auth inserta un usuario nuevo. Patrón estándar
-- recomendado por la documentación de Supabase.
--
-- CUÁNDO SE DISPARA ESTE TRIGGER (verificado, no asumido):
-- Este trigger es "AFTER INSERT ON auth.users". La pregunta relevante es
-- CUÁNDO se inserta esa fila en el flujo de invitación administrativa:
--
--   supabase.auth.admin.inviteUserByEmail(email) — el método que se va a
--   usar para crear usuarios en este proyecto (alta solo por invitación,
--   sin registro público) — inserta la fila en auth.users de INMEDIATO,
--   en el momento en que la administradora envía la invitación. La
--   persona invitada todavía no aceptó nada, no tiene contraseña, no
--   confirmó su email. auth.users ya existe igual.
--
-- Esto significa que este trigger corre AL ENVIAR la invitación, no al
-- aceptarla. El diseño de este archivo tiene que ser seguro bajo ese
-- supuesto — y lo es: la fila de subscriptions que se crea acá nace en
-- status='suspended' (ver abajo), es decir CERO acceso, independientemente
-- de si la persona invitada llega a aceptar la invitación en algún
-- momento o nunca.
--
-- PERMISOS: SECURITY DEFINER porque necesita escribir en public.profiles
-- y public.subscriptions desde el contexto interno de Auth. Revocado de
-- PUBLIC y SIN ningún GRANT — nadie debería poder invocar esta función
-- directamente vía RPC; solo el trigger la dispara. Revocar EXECUTE no
-- rompe el trigger: el mecanismo de triggers no pasa por el chequeo de
-- privilegios de una llamada RPC normal.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  -- Crear la cuenta y habilitar el acceso son dos acciones distintas:
  -- nace suspendida, sin plan ni fechas — una administradora la activa
  -- manualmente después (cambiando status a 'trial' o 'active', siempre
  -- del lado del servidor, ver 0005_rls_policies.sql).
  insert into public.subscriptions (user_id, status, plan_code, starts_at, access_until)
  values (new.id, 'suspended', null, null, null)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;
-- Sin GRANT a authenticated ni a anon: solo el trigger la invoca.

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- is_current_user_admin() / current_user_has_active_membership() /
-- current_user_has_content_access(): SIN parámetro, a propósito.
--
-- La primera versión de estas funciones tomaba un p_user_id uuid como
-- parámetro. Cualquier función SQL/plpgsql con GRANT EXECUTE a
-- 'authenticated' puede llamarse directamente como RPC
-- (supabase.rpc('is_admin', { p_user_id: '<uuid-de-otra-persona>' })) con
-- la publishable key, sin pasar por ninguna tabla ni política — eso
-- permitía que cualquier usuario autenticado consultara el rol o el
-- estado de membresía de CUALQUIER OTRO usuario del sistema, solo
-- conociendo su UUID. La única "protección" era que la respuesta era un
-- boolean sin más detalle, pero seguía siendo una fuga de información
-- (enumeración de roles/membresías ajenas).
--
-- La versión sin parámetro resuelve esto de raíz: usa auth.uid()
-- internamente, así que la función solo puede responder sobre la sesión
-- que la está llamando. No hace falta "restringir" el uso como RPC
-- pública — es segura incluso siendo pública, porque no acepta ningún
-- identificador arbitrario del cliente. No se mantiene ninguna variante
-- con parámetro: ninguna política RLS de este proyecto necesita evaluar
-- la condición de un usuario distinto del que ejecuta la consulta, y las
-- futuras funciones administrativas (Etapa 5) van a usar service_role,
-- que bypassea RLS y no necesita estos helpers.
-- ---------------------------------------------------------------------
drop function if exists public.is_admin(uuid);
drop function if exists public.has_active_membership(uuid);
drop function if exists public.has_content_access(uuid);

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_current_user_admin() from public;
revoke all on function public.is_current_user_admin() from anon;
grant execute on function public.is_current_user_admin() to authenticated;

-- Regla de acceso por estado (sin cambios respecto de la versión anterior):
--   trial     -> permitido si access_until es null o futuro
--   active    -> permitido si access_until es null o futuro
--   past_due  -> bloqueado siempre
--   suspended -> bloqueado siempre (incluye el estado inicial de toda cuenta nueva)
--   cancelled -> permitido únicamente si access_until es futuro
--   sin fila  -> bloqueado
create or replace function public.current_user_has_active_membership()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select case s.status
        when 'trial'  then s.access_until is null or s.access_until > now()
        when 'active' then s.access_until is null or s.access_until > now()
        when 'cancelled' then s.access_until is not null and s.access_until > now()
        else false -- past_due, suspended
      end
      from public.subscriptions s
      where s.user_id = auth.uid()
    ),
    false
  );
$$;

revoke all on function public.current_user_has_active_membership() from public;
revoke all on function public.current_user_has_active_membership() from anon;
grant execute on function public.current_user_has_active_membership() to authenticated;

-- Punto único usado por las políticas de las tablas de contenido.
create or replace function public.current_user_has_content_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
     and (public.current_user_has_active_membership() or public.is_current_user_admin());
$$;

revoke all on function public.current_user_has_content_access() from public;
revoke all on function public.current_user_has_content_access() from anon;
grant execute on function public.current_user_has_content_access() to authenticated;

-- ---------------------------------------------------------------------
-- update_own_full_name(p_full_name): única forma en que un usuario común
-- puede tocar su propia fila de profiles.
--
-- Este SÍ recibe un parámetro (el nuevo nombre) porque es un dato que
-- solo el cliente puede proveer — pero no recibe ningún identificador de
-- usuario: siempre opera sobre auth.uid(), nunca sobre un id pasado por
-- parámetro. No hay forma de llamarla para editar el perfil de otra
-- persona.
--
-- En vez de una política RLS de UPDATE genérica sobre profiles (que
-- permitiría, a nivel de fila, editar CUALQUIER columna propia — RLS no
-- puede restringir columnas individuales dentro de la misma fila), esta
-- migración NO define ninguna política de UPDATE para 'authenticated'
-- sobre public.profiles (ver 0005_rls_policies.sql). El único camino de
-- escritura es esta función.
-- ---------------------------------------------------------------------
create or replace function public.update_own_full_name(p_full_name text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Se requiere una sesión iniciada.';
  end if;

  update public.profiles
  set full_name = p_full_name
  where id = auth.uid()
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke all on function public.update_own_full_name(text) from public;
revoke all on function public.update_own_full_name(text) from anon;
grant execute on function public.update_own_full_name(text) to authenticated;

-- ---------------------------------------------------------------------
-- prevent_self_role_change(): defensa adicional ("belt and suspenders").
-- Con el diseño de arriba, un usuario común ya no tiene NINGÚN camino de
-- UPDATE directo sobre profiles (ni siquiera hacia full_name — eso pasa
-- por la función de arriba), así que este trigger es redundante en el
-- uso normal. Se mantiene: si en el futuro alguien agrega una política de
-- UPDATE sobre profiles sin pensarlo dos veces, esto sigue bloqueando el
-- cambio de role específicamente. auth.uid() es null cuando la conexión
-- usa la service role, así que las herramientas administrativas
-- server-side no quedan bloqueadas.
-- No es SECURITY DEFINER (solo lee NEW/OLD de la fila que ya se está
-- editando) y, como cualquier función de trigger, no necesita GRANT para
-- que el trigger la dispare.
-- ---------------------------------------------------------------------
create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.uid() = old.id then
    raise exception 'No podés modificar tu propio rol.';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_self_role_change() from public;
revoke all on function public.prevent_self_role_change() from anon;
revoke all on function public.prevent_self_role_change() from authenticated;

drop trigger if exists profiles_prevent_self_role_change on public.profiles;
create trigger profiles_prevent_self_role_change
  before update on public.profiles
  for each row execute function public.prevent_self_role_change();

-- ---------------------------------------------------------------------
-- prevent_self_subscription_change(): un usuario autenticado nunca
-- puede modificar su propia fila de subscriptions. Hoy esto ya está
-- garantizado porque no existe ninguna política RLS de UPDATE para
-- 'authenticated' sobre subscriptions (ver 0005) — este trigger es una
-- segunda barrera por si alguna vez se agrega esa política sin cuidado.
-- ---------------------------------------------------------------------
create or replace function public.prevent_self_subscription_change()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() = old.user_id then
    raise exception 'No podés modificar tu propia membresía.';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_self_subscription_change() from public;
revoke all on function public.prevent_self_subscription_change() from anon;
revoke all on function public.prevent_self_subscription_change() from authenticated;

drop trigger if exists subscriptions_prevent_self_change on public.subscriptions;
create trigger subscriptions_prevent_self_change
  before update on public.subscriptions
  for each row execute function public.prevent_self_subscription_change();

-- ---------------------------------------------------------------------
-- prevent_audit_log_mutation(): admin_audit_log tiene que ser append-only
-- de verdad, no solo "sin política RLS de UPDATE/DELETE". RLS y
-- service_role son ortogonales: service_role tiene el atributo BYPASSRLS,
-- así que ninguna política de este archivo lo detiene — una conexión con
-- la clave de service role SÍ podría hacer UPDATE o DELETE directo sobre
-- esta tabla si lo único que la protegiera fuera RLS.
--
-- Los triggers, en cambio, no son parte de RLS y no se saltean por
-- BYPASSRLS: se disparan para CUALQUIER rol que ejecute la sentencia,
-- incluido service_role (y hasta el superusuario postgres, salvo que
-- alguien deshabilite el trigger explícitamente con ALTER TABLE, algo
-- que requiere ser dueño de la tabla, no solo tener BYPASSRLS). Por eso
-- la inmutabilidad real de esta tabla se implementa acá, con un trigger
-- que rechaza incondicionalmente cualquier UPDATE o DELETE, para
-- cualquier rol.
--
-- INSERT no se toca: service_role y las futuras funciones administrativas
-- SECURITY DEFINER (Etapa 5) siguen pudiendo agregar registros nuevos —
-- lo único que queda bloqueado es tocar un registro ya existente.
-- ---------------------------------------------------------------------
create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'admin_audit_log es de solo inserción: no se permite UPDATE ni DELETE, ni siquiera con service_role.';
end;
$$;

-- Ningún rol de aplicación puede invocarla directamente como RPC —ni
-- siquiera authenticated, que sí tiene GRANT en otras funciones de este
-- archivo—: no tiene ninguna razón de ser fuera de este trigger. El
-- trigger la ejecuta igual, sin depender de estos GRANT.
revoke all on function public.prevent_audit_log_mutation() from public;
revoke all on function public.prevent_audit_log_mutation() from anon;
revoke all on function public.prevent_audit_log_mutation() from authenticated;

drop trigger if exists admin_audit_log_prevent_mutation on public.admin_audit_log;
create trigger admin_audit_log_prevent_mutation
  before update or delete on public.admin_audit_log
  for each row execute function public.prevent_audit_log_mutation();
