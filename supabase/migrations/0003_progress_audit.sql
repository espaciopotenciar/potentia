-- =====================================================================
-- 0003_progress_audit.sql
-- Progreso educativo por usuario y auditoría administrativa.
-- Depende de: profiles (0001), lessons (0002).
-- =====================================================================

-- ---------------------------------------------------------------------
-- learning_progress
-- ---------------------------------------------------------------------
create table if not exists public.learning_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  lesson_id    text not null references public.lessons (id) on delete cascade,
  completed    boolean not null default true,
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  unique (user_id, lesson_id)
);

comment on table public.learning_progress is
  'Progreso por usuario y lección. Reemplaza a localStorage como fuente de '
  'verdad (localStorage puede seguir usándose como caché/migración, no como '
  'origen definitivo).';

create index if not exists learning_progress_user_idx on public.learning_progress (user_id);

-- ---------------------------------------------------------------------
-- admin_audit_log
-- ---------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id              uuid primary key default gen_random_uuid(),
  admin_user_id   uuid references public.profiles (id) on delete set null,
  target_user_id  uuid references public.profiles (id) on delete set null,
  action          text not null,
  previous_value  jsonb,
  new_value       jsonb,
  created_at      timestamptz not null default now()
);

comment on table public.admin_audit_log is
  'Registro de acciones administrativas (alta, suspensión, reactivación, '
  'cancelación, cambio de rol). Tabla de solo lectura/inserción — nunca se '
  'actualiza ni se borra una fila existente (append-only).';

create index if not exists admin_audit_log_target_idx  on public.admin_audit_log (target_user_id);
create index if not exists admin_audit_log_admin_idx   on public.admin_audit_log (admin_user_id);
create index if not exists admin_audit_log_created_idx on public.admin_audit_log (created_at desc);
