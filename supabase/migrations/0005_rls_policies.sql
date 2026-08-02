-- =====================================================================
-- 0005_rls_policies.sql
-- Activa Row Level Security en todas las tablas y define las políticas.
--
-- Principio general aplicado en todo este archivo: "negar por defecto".
-- RLS activado sin políticas = nadie (salvo service_role, que siempre
-- bypassea RLS) puede leer ni escribir nada. Cada política de abajo es
-- una excepción explícita y mínima a esa regla.
--
-- Cada "create policy" va precedido de "drop policy if exists" para que
-- este archivo se pueda volver a correr sin fallar por "ya existe" —
-- igual que el resto de las migraciones.
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
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_current_user_admin());

-- Deliberadamente SIN política de UPDATE para 'authenticated' sobre esta
-- tabla. RLS opera por fila, no por columna: una política de UPDATE
-- "id = auth.uid()" dejaría editable cualquier columna de la propia fila,
-- incluida role. En vez de eso, la única escritura permitida a un usuario
-- común es la función public.update_own_full_name(text) (ver
-- 0004_functions_triggers.sql), que solo puede tocar full_name. role,
-- email, id y created_at quedan fuera de cualquier ruta de escritura
-- alcanzable con la publishable key.

-- Sin políticas de INSERT ni DELETE para 'authenticated': los perfiles se
-- crean únicamente vía el trigger handle_new_user (SECURITY DEFINER) y no
-- se borran desde la aplicación.

-- ---------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------
-- Un usuario ve SU propio estado de membresía; un admin ve todas.
drop policy if exists "subscriptions_select_own_or_admin" on public.subscriptions;
create policy "subscriptions_select_own_or_admin"
  on public.subscriptions for select
  to authenticated
  using (user_id = auth.uid() or public.is_current_user_admin());

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
drop policy if exists "modules_select_members" on public.modules;
create policy "modules_select_members"
  on public.modules for select
  to authenticated
  using (active and public.current_user_has_content_access());

drop policy if exists "lessons_select_members" on public.lessons;
create policy "lessons_select_members"
  on public.lessons for select
  to authenticated
  using (active and public.current_user_has_content_access());

drop policy if exists "action_matrix_select_members" on public.action_matrix_entries;
create policy "action_matrix_select_members"
  on public.action_matrix_entries for select
  to authenticated
  using (active and public.current_user_has_content_access());

drop policy if exists "objections_select_members" on public.objections;
create policy "objections_select_members"
  on public.objections for select
  to authenticated
  using (active and public.current_user_has_content_access());

drop policy if exists "search_concepts_select_members" on public.search_concepts;
create policy "search_concepts_select_members"
  on public.search_concepts for select
  to authenticated
  using (public.current_user_has_content_access());

-- Sin políticas de escritura en ninguna tabla de contenido: el contenido
-- se administra por migraciones/seed (service role) hoy, y por un futuro
-- panel administrativo server-side más adelante — nunca desde el cliente.

-- ---------------------------------------------------------------------
-- learning_progress
-- ---------------------------------------------------------------------
-- CRUD completo, pero estrictamente acotado a las propias filas del
-- usuario. Esto es autoservicio legítimo (marcar/desmarcar una lección
-- propia), a diferencia de subscriptions.
drop policy if exists "learning_progress_select_own" on public.learning_progress;
create policy "learning_progress_select_own"
  on public.learning_progress for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "learning_progress_insert_own" on public.learning_progress;
create policy "learning_progress_insert_own"
  on public.learning_progress for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "learning_progress_update_own" on public.learning_progress;
create policy "learning_progress_update_own"
  on public.learning_progress for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "learning_progress_delete_own" on public.learning_progress;
create policy "learning_progress_delete_own"
  on public.learning_progress for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- admin_audit_log
-- ---------------------------------------------------------------------
-- Solo lectura para admins. SIN ninguna política de INSERT, UPDATE ni
-- DELETE para 'authenticated' — ni siquiera para admins. La única forma
-- de insertar en esta tabla es service_role (o, más adelante, una función
-- SECURITY DEFINER administrativa que la propia Etapa 5 va a crear).
--
-- Que esta tabla sea append-only NO depende de estas políticas RLS: RLS
-- no aplica a service_role (tiene el atributo BYPASSRLS), así que aunque
-- acá no exista ninguna política de UPDATE/DELETE, una conexión con la
-- clave de service role técnicamente podría modificar o borrar filas si
-- eso fuera lo único que las protegiera. La inmutabilidad real está
-- implementada con un TRIGGER (prevent_audit_log_mutation, en
-- 0004_functions_triggers.sql), que rechaza cualquier UPDATE/DELETE para
-- cualquier rol — los triggers no se saltean por BYPASSRLS.
drop policy if exists "admin_audit_log_select_admin_only" on public.admin_audit_log;
create policy "admin_audit_log_select_admin_only"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_current_user_admin());

-- (Deliberadamente no hay policy de INSERT/UPDATE/DELETE acá. Ver nota arriba.)
