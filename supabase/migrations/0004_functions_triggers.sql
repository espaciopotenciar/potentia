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
-- (en trial) cuando Supabase Auth crea un usuario nuevo (por invitación).
-- Patrón estándar recomendado por la documentación de Supabase.
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

  insert into public.subscriptions (user_id, status)
  values (new.id, 'trial')
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
-- prevent_self_role_change(): un usuario autenticado nunca puede
-- modificar su propio role, ni siquiera si en el futuro se agregara una
-- política RLS que lo permitiera por error. auth.uid() es null cuando la
-- conexión usa la service role, así que las herramientas administrativas
-- server-side (o el SQL editor de Supabase) no quedan bloqueadas.
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
