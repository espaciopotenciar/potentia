-- =====================================================================
-- verify_stage1.sql
-- Verificación de la Etapa 1 (fundaciones de datos). Solo lecturas,
-- no modifica nada. Pensado para correrse en el SQL Editor de Supabase
-- Studio y revisar el resultado de cada bloque.
-- =====================================================================

-- 1) Tablas creadas en el schema public
select tablename
from pg_tables
where schemaname = 'public'
order by 1;

-- 2) RLS habilitado por tabla (debe ser "t" en las 9)
select relname as table_name, relrowsecurity as rls_enabled
from pg_class
where relnamespace = 'public'::regnamespace
  and relkind = 'r'
order by 1;

-- 3) Funciones creadas en public (con si son SECURITY DEFINER)
select proname as function_name, prosecdef as security_definer
from pg_proc
where pronamespace = 'public'::regnamespace
order by 1;

-- 4) Triggers creados (no internos) sobre tablas de public y auth.users
select event_object_table as table_name, trigger_name
from information_schema.triggers
where trigger_schema in ('public', 'auth')
order by 1, 2;

-- 5) Conteo de contenido
select 'modules' as tabla, count(*) from public.modules
union all
select 'lessons', count(*) from public.lessons
union all
select 'action_matrix_entries', count(*) from public.action_matrix_entries
union all
select 'objections', count(*) from public.objections
union all
select 'search_concepts', count(*) from public.search_concepts;

-- 6) IDs duplicados (debe devolver 0 filas en cada una)
select 'lessons' as tabla, id, count(*) from public.lessons group by id having count(*) > 1
union all
select 'action_matrix_entries', id, count(*) from public.action_matrix_entries group by id having count(*) > 1
union all
select 'objections', id, count(*) from public.objections group by id having count(*) > 1
union all
select 'search_concepts', id, count(*) from public.search_concepts group by id having count(*) > 1;

-- 7) Slugs duplicados (debe devolver 0 filas)
select 'lessons' as tabla, slug, count(*) from public.lessons group by slug having count(*) > 1
union all
select 'objections', slug, count(*) from public.objections group by slug having count(*) > 1;

-- 8) Todas las filas de contenido activas (deben coincidir con el total del punto 5)
select 'modules' as tabla, count(*) filter (where active) as activas, count(*) as total from public.modules
union all
select 'lessons', count(*) filter (where active), count(*) from public.lessons
union all
select 'action_matrix_entries', count(*) filter (where active), count(*) from public.action_matrix_entries
union all
select 'objections', count(*) filter (where active), count(*) from public.objections;

-- 9) FK de lessons.module_id: no debería haber huérfanos (0 filas)
select l.id, l.module_id
from public.lessons l
left join public.modules m on m.id = l.module_id
where m.id is null;

-- 10) FK de search_concepts.lesson_id: no debería haber huérfanos (0 filas)
select sc.id, sc.lesson_id
from public.search_concepts sc
left join public.lessons l on l.id = sc.lesson_id
where l.id is null;

-- 11) Políticas creadas por tabla
select tablename, policyname, cmd as command, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 12) GRANT de EXECUTE sobre las funciones (para confirmar anon vs authenticated)
select routine_name, grantee, privilege_type
from information_schema.role_routine_grants
where routine_schema = 'public'
order by routine_name, grantee;
