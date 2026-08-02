-- =====================================================================
-- 0005_rls_policies.sql
-- Activa Row Level Security en todas las tablas y define las políticas.
--
-- Principio general aplicado en todo este archivo: "negar por defecto".
-- RLS activado sin políticas = nadie (salvo service_role, que siempre
-- bypassea RLS) puede leer ni escribir nada. Cada política de abajo es
-- una excepción explícita y mínima a esa regla.
-- =====================================================================

alter table public.profiles              enable row level security;
alter table public.subscriptions         enable row level security;
alter table public.modules               enable row level security;
alter table public.lessons               enable row level security;
alter table public.action_matrix_entries enable row level security;
alter table public.objections            enable row level security;
alter table public.search_concepts       enable row level security;
alter table public.learning_progress     enable row level security;
alter table public.admin_audit_log       enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
-- Un usuario ve su propio perfil; un admin ve todos.
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

-- Un usuario puede actualizar SU propia fila (por ejemplo full_name desde
-- /mi-cuenta más adelante). La columna role está protegida aparte por el
-- trigger prevent_self_role_change, porque RLS no puede restringir columnas
-- individuales dentro de una misma fila.
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Sin políticas de INSERT ni DELETE para 'authenticated': los perfiles se
-- crean únicamente vía el trigger handle_new_user (SECURITY DEFINER) y no
-- se borran desde la aplicación.

-- ---------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------
-- Un usuario ve SU propio estado de membresía; un admin ve todas.
create policy "subscriptions_select_own_or_admin"
  on public.subscriptions for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- Deliberadamente NO hay políticas de INSERT/UPDATE/DELETE para
-- 'authenticated' (ni siquiera para admin): las altas/suspensiones/
-- reactivaciones/cancelaciones son "funciones administrativas solo del
-- lado del servidor" (requisito de seguridad aprobado), y esas funciones
-- futuras van a usar la service role, que bypassea RLS. Esto es lo que
-- hace imposible, a nivel de base de datos, que un usuario o un admin
-- autenticado por API actúe directamente sobre esta tabla.

-- ---------------------------------------------------------------------
-- Tablas de contenido: modules, lessons, action_matrix_entries,
-- objections, search_concepts.
-- Todas comparten la misma regla: solo lectura, solo para usuarios
-- autenticados con membresía activa (o admin), y solo filas activas.
-- Sin ninguna política para 'anon': un visitante sin sesión obtiene
-- siempre 0 filas, sin importar qué pida el frontend.
-- ---------------------------------------------------------------------
create policy "modules_select_members"
  on public.modules for select
  to authenticated
  using (active and public.has_content_access(auth.uid()));

create policy "lessons_select_members"
  on public.lessons for select
  to authenticated
  using (active and public.has_content_access(auth.uid()));

create policy "action_matrix_select_members"
  on public.action_matrix_entries for select
  to authenticated
  using (active and public.has_content_access(auth.uid()));

create policy "objections_select_members"
  on public.objections for select
  to authenticated
  using (active and public.has_content_access(auth.uid()));

create policy "search_concepts_select_members"
  on public.search_concepts for select
  to authenticated
  using (public.has_content_access(auth.uid()));

-- Sin políticas de escritura en ninguna tabla de contenido: el contenido
-- se administra por migraciones/seed (service role) hoy, y por un futuro
-- panel administrativo server-side más adelante — nunca desde el cliente.

-- ---------------------------------------------------------------------
-- learning_progress
-- ---------------------------------------------------------------------
-- CRUD completo, pero estrictamente acotado a las propias filas del
-- usuario. Esto es autoservicio legítimo (marcar/desmarcar una lección
-- propia), a diferencia de subscriptions.
create policy "learning_progress_select_own"
  on public.learning_progress for select
  to authenticated
  using (user_id = auth.uid());

create policy "learning_progress_insert_own"
  on public.learning_progress for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "learning_progress_update_own"
  on public.learning_progress for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "learning_progress_delete_own"
  on public.learning_progress for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- admin_audit_log
-- ---------------------------------------------------------------------
-- Solo lectura para admins. Inserción permitida solo si la fila que se
-- intenta insertar declara al propio admin autenticado como autor
-- (admin_user_id = auth.uid()) — evita que un admin registre una acción
-- "a nombre de" otro admin. Sin UPDATE ni DELETE: registro append-only.
create policy "admin_audit_log_select_admin_only"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_admin(auth.uid()));

create policy "admin_audit_log_insert_admin_only"
  on public.admin_audit_log for insert
  to authenticated
  with check (public.is_admin(auth.uid()) and admin_user_id = auth.uid());
