-- =====================================================================
-- 0004_functions_triggers.sql
-- Funciones auxiliares y triggers de seguridad/consistencia.
--
-- Todas las funciones que se usan dentro de políticas RLS o que deben
-- leer/escribir por fuera de lo que el usuario actual podría ver quedan
-- como SECURITY DEFINER con search_path fijo a 'public' (evita el
-- ataque clásico de "search_path hijacking" sobre funciones definer).
-- =====================================================================

-- ---------------------------------------------------------------------
-- set_updated_at(): trigger genérico para mantener updated_at al día.
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
-- momento o nunca. Si en cambio hubiera nacido en 'trial' (como en la
-- primera versión de este plan), una invitación enviada y nunca aceptada
-- habría dejado, técnicamente, una cuenta con acceso "trial" flotando sin
-- que nadie la haya activado — exactamente el problema que se pidió
-- evitar en la revisión de este punto.
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- is_admin(p_user_id): true si el usuario tiene role = 'admin'.
-- Se usa dentro de políticas RLS; SECURITY DEFINER para poder leer
-- profiles sin volver a evaluar RLS de forma recursiva.
-- ---------------------------------------------------------------------
create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user_id and role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- has_active_membership(p_user_id): implementa exactamente las reglas
-- de acceso aprobadas por estado de membresía.
--   trial     -> permitido si access_until es null o futuro
--   active    -> permitido si access_until es null o futuro
--   past_due  -> bloqueado siempre
--   suspended -> bloqueado siempre
--   cancelled -> permitido únicamente si access_until es futuro
--   sin fila  -> bloqueado (no debería pasar: handle_new_user siempre crea una)
-- ---------------------------------------------------------------------
create or replace function public.has_active_membership(p_user_id uuid)
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
      where s.user_id = p_user_id
    ),
    false
  );
$$;

revoke all on function public.has_active_membership(uuid) from public;
grant execute on function public.has_active_membership(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- has_content_access(p_user_id): punto único usado por las políticas de
-- las tablas de contenido. Hoy es equivalente a has_active_membership,
-- pero mantenerlo separado permite sumar reglas futuras (por ejemplo,
-- un rol "admin" que siempre tenga acceso de lectura) sin tocar cada
-- política de contenido una por una.
-- ---------------------------------------------------------------------
create or replace function public.has_content_access(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select p_user_id is not null
     and (public.has_active_membership(p_user_id) or public.is_admin(p_user_id));
$$;

revoke all on function public.has_content_access(uuid) from public;
grant execute on function public.has_content_access(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- update_own_full_name(p_full_name): única forma en que un usuario común
-- puede tocar su propia fila de profiles.
--
-- En vez de una política RLS de UPDATE genérica sobre profiles (que
-- permitiría, a nivel de fila, editar CUALQUIER columna propia — RLS no
-- puede restringir columnas individuales dentro de la misma fila), esta
-- migración NO define ninguna política de UPDATE para 'authenticated'
-- sobre public.profiles (ver 0005_rls_policies.sql). El único camino de
-- escritura es esta función: SECURITY DEFINER, actualiza únicamente
-- full_name, únicamente en la fila del usuario que la llama.
--
-- Esto deja columnas sensibles (role, email, id, created_at) fuera de
-- cualquier ruta de escritura alcanzable con la publishable key, sin
-- depender de que un trigger recuerde bloquear cada columna una por una.
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
grant execute on function public.update_own_full_name(text) to authenticated;

-- ---------------------------------------------------------------------
-- prevent_self_role_change(): defensa adicional ("belt and suspenders").
-- Con el diseño de arriba, un usuario común ya no tiene NINGÚN camino de
-- UPDATE directo sobre profiles (ni siquiera hacia full_name — eso pasa
-- por la función de arriba), así que este trigger es redundante en el
-- diseño actual. Se mantiene igual: si en el futuro alguien agrega una
-- política de UPDATE sobre profiles sin pensarlo dos veces, esto sigue
-- bloqueando el cambio de role específicamente. auth.uid() es null
-- cuando la conexión usa la service role, así que las herramientas
-- administrativas server-side no quedan bloqueadas.
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

drop trigger if exists subscriptions_prevent_self_change on public.subscriptions;
create trigger subscriptions_prevent_self_change
  before update on public.subscriptions
  for each row execute function public.prevent_self_subscription_change();
