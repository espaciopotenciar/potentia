-- =====================================================================
-- 0001_profiles_subscriptions.sql
-- Perfiles de usuario y estado de membresía.
-- Depende de: auth.users (ya existe, la gestiona Supabase Auth).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles: un perfil por usuario de auth.users. Se crea automáticamente
-- via trigger (ver 0004_functions_triggers.sql, handle_new_user) en el
-- momento en que se inserta la fila en auth.users — es decir, cuando una
-- administradora ENVÍA la invitación (supabase.auth.admin.inviteUserByEmail
-- crea la fila de auth.users de inmediato), no cuando la persona invitada
-- la acepta. Ver la nota de seguridad completa en 0004_functions_triggers.sql.
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
-- plan_code y starts_at son nullable a propósito: la fila que
-- handle_new_user crea al registrarse un usuario está SUSPENDIDA y sin
-- ningún dato de plan todavía (nadie eligió ni activó nada). Forzar un
-- valor no nulo ahí obligaría a inventar una fecha o un plan falso solo
-- para satisfacer la restricción — exactamente lo que se pidió evitar.
-- access_until ya era nullable desde el diseño original.
create table if not exists public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references public.profiles (id) on delete cascade,
  status       text not null default 'suspended'
                 check (status in ('trial', 'active', 'past_due', 'suspended', 'cancelled')),
  plan_code    text,
  starts_at    timestamptz,
  access_until timestamptz,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.subscriptions is
  'Estado de membresía actual por usuario. Una fila por usuario (unique user_id). '
  'Sin escritura directa de usuarios ni de admins via API: solo service role '
  '(ver 0005_rls_policies.sql). "Vencido" es calculado por access_until, no un '
  'valor de status adicional. Toda fila nueva nace en status=''suspended'', '
  'plan_code/starts_at/access_until en null: crear la cuenta y habilitar el '
  'acceso son dos acciones distintas (ver handle_new_user en '
  '0004_functions_triggers.sql).';
comment on column public.subscriptions.plan_code is
  'Nullable: una suscripción recién creada (suspended) todavía no tiene plan asignado.';
comment on column public.subscriptions.starts_at is
  'Nullable: se completa cuando una administradora activa la membresía, no al crear la cuenta.';
comment on column public.subscriptions.access_until is
  'NULL = sin fecha de vencimiento definida. Ver has_active_membership() para '
  'la regla exacta de acceso por estado.';

create index if not exists subscriptions_status_idx
  on public.subscriptions (status);
