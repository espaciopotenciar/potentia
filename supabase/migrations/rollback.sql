-- =====================================================================
-- rollback.sql
-- Revierte por completo 0001-0005. Pensado para correrse manualmente
-- (Supabase SQL editor o `supabase db execute`) si hace falta deshacer
-- toda la migración durante la etapa de prueba en auth-mvp.
--
-- No se ejecuta automáticamente en ningún paso de este proyecto. Es una
-- herramienta de emergencia/desarrollo, no parte del flujo normal.
--
-- Orden: inverso al de creación, por dependencias de FK.
-- =====================================================================

-- Triggers primero (dependen de las funciones y de las tablas)
drop trigger if exists subscriptions_prevent_self_change on public.subscriptions;
drop trigger if exists profiles_prevent_self_role_change on public.profiles;
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists objections_set_updated_at on public.objections;
drop trigger if exists action_matrix_set_updated_at on public.action_matrix_entries;
drop trigger if exists lessons_set_updated_at on public.lessons;
drop trigger if exists learning_progress_set_updated_at on public.learning_progress;
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
drop trigger if exists profiles_set_updated_at on public.profiles;

-- Funciones
drop function if exists public.prevent_self_subscription_change();
drop function if exists public.prevent_self_role_change();
drop function if exists public.has_content_access(uuid);
drop function if exists public.has_active_membership(uuid);
drop function if exists public.is_admin(uuid);
drop function if exists public.handle_new_user();
drop function if exists public.set_updated_at();

-- Tablas (orden inverso a las dependencias de FK).
-- CASCADE elimina también las políticas RLS de cada tabla; no elimina
-- datos de otras tablas.
drop table if exists public.admin_audit_log cascade;
drop table if exists public.learning_progress cascade;
drop table if exists public.search_concepts cascade;
drop table if exists public.objections cascade;
drop table if exists public.action_matrix_entries cascade;
drop table if exists public.lessons cascade;
drop table if exists public.modules cascade;
drop table if exists public.subscriptions cascade;
drop table if exists public.profiles cascade;

-- Nota: no se hace drop de la extensión pgcrypto por si otra parte del
-- proyecto Supabase ya la usaba antes de esta migración.
