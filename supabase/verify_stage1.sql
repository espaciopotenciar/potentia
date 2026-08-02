-- =====================================================================
-- verify_stage1.sql
-- Verificación de la Etapa 1, consolidada en una sola consulta (una
-- sola tabla de resultado) para poder correrla de una vez en el SQL
-- Editor y pegar un único resultado. Solo lecturas, no modifica nada.
-- =====================================================================

select 'table' as check_type, tablename as key, null as value
from pg_tables where schemaname = 'public'

union all
select 'rls_enabled', relname, relrowsecurity::text
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'

union all
select 'function', proname, prosecdef::text as value -- value = es SECURITY DEFINER
from pg_proc where pronamespace = 'public'::regnamespace

union all
select 'trigger', trigger_name, event_object_table
from information_schema.triggers
where trigger_schema in ('public', 'auth')

union all
select 'count', 'modules', count(*)::text from public.modules
union all
select 'count', 'lessons', count(*)::text from public.lessons
union all
select 'count', 'action_matrix_entries', count(*)::text from public.action_matrix_entries
union all
select 'count', 'objections', count(*)::text from public.objections
union all
select 'count', 'search_concepts', count(*)::text from public.search_concepts

union all
select 'dup_id_lessons', id, count(*)::text from public.lessons group by id having count(*) > 1
union all
select 'dup_id_action_matrix_entries', id, count(*)::text from public.action_matrix_entries group by id having count(*) > 1
union all
select 'dup_id_objections', id, count(*)::text from public.objections group by id having count(*) > 1
union all
select 'dup_id_search_concepts', id, count(*)::text from public.search_concepts group by id having count(*) > 1

union all
select 'dup_slug_lessons', slug, count(*)::text from public.lessons group by slug having count(*) > 1
union all
select 'dup_slug_objections', slug, count(*)::text from public.objections group by slug having count(*) > 1

union all
select 'active_vs_total', 'modules', count(*) filter (where active)::text || ' / ' || count(*)::text from public.modules
union all
select 'active_vs_total', 'lessons', count(*) filter (where active)::text || ' / ' || count(*)::text from public.lessons
union all
select 'active_vs_total', 'action_matrix_entries', count(*) filter (where active)::text || ' / ' || count(*)::text from public.action_matrix_entries
union all
select 'active_vs_total', 'objections', count(*) filter (where active)::text || ' / ' || count(*)::text from public.objections

union all
select 'orphan_fk_count', 'lessons.module_id', count(*)::text
from public.lessons l left join public.modules m on m.id = l.module_id
where m.id is null

union all
select 'orphan_fk_count', 'search_concepts.lesson_id', count(*)::text
from public.search_concepts sc left join public.lessons l on l.id = sc.lesson_id
where l.id is null

union all
select 'policy', policyname, tablename || ' | ' || cmd || ' | ' || array_to_string(roles, ',')
from pg_policies where schemaname = 'public'

union all
select 'grant_execute', routine_name, grantee
from information_schema.role_routine_grants
where routine_schema = 'public' and privilege_type = 'EXECUTE'

order by 1, 2;
