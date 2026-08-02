-- =====================================================================
-- 0001_profiles_subscriptions.sql
-- Perfiles de usuario y estado de membresía.
-- Depende de: auth.users (ya existe, la gestiona Supabase Auth).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles: un perfil por usuario de auth.users. Se crea automáticamente
-- via trigger (ver 0004_functions_triggers.sql) cuando alguien acepta
-- una invitación / se crea en Supabase Auth.
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil de aplicación por usuario. role controla acceso al panel /admin.';
comment on column public.profiles.role is
  'user | admin. Un usuario nunca puede modificar su propio role (ver trigger prevent_self_role_change).';

create unique index if not exists profiles_email_key
  on public.profiles (lower(email));

-- ---------------------------------------------------------------------
-- subscriptions: estado de membresía. Diseño: UNA fila por usuario
-- (unique en user_id) que representa el estado ACTUAL de la membresía.
-- El historial de cambios queda en admin_audit_log, no en filas nuevas
-- acá — así hay una única fuente de verdad de "cuál es mi estado hoy".
-- ---------------------------------------------------------------------
create table if not exists public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references public.profiles (id) on delete cascade,
  status       text not null default 'trial'
                 check (status in ('trial', 'active', 'past_due', 'suspended', 'cancelled')),
  plan_code    text,
  starts_at    timestamptz not null default now(),
  access_until timestamptz,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.subscriptions is
  'Estado de membresía actual por usuario. Una fila por usuario (unique user_id). '
  'Sin escritura directa de usuarios ni de admins via API: solo service role '
  '(ver 0005_rls_policies.sql). "Vencido" es calculado por access_until, no un '
  'valor de status adicional.';
comment on column public.subscriptions.access_until is
  'NULL = sin fecha de vencimiento definida. Ver has_active_membership() para '
  'la regla exacta de acceso por estado.';

create index if not exists subscriptions_status_idx
  on public.subscriptions (status);
