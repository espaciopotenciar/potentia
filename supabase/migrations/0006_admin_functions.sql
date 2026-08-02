-- =====================================================================
-- 0006_admin_functions.sql
-- Funciones administrativas para el panel /admin (Etapa 3).
--
-- LECTURA: no hace falta ninguna función nueva. Las políticas RLS
-- "profiles_select_own_or_admin" y "subscriptions_select_own_or_admin"
-- (0005_rls_policies.sql) ya permiten que una sesión con role='admin'
-- lea TODAS las filas de profiles y subscriptions, no solo la propia. El
-- panel admin hace SELECT directo sobre esas dos tablas con el cliente
-- autenticado normal.
--
-- ESCRITURA: profiles y subscriptions siguen sin ninguna política de
-- UPDATE/INSERT/DELETE para 'authenticated' (ni para admin) — eso no
-- cambia acá. Las únicas escrituras posibles son a través de esta
-- función SECURITY DEFINER, que:
--   1. verifica is_current_user_admin() explícitamente (no depende de
--      ningún GRANT diferenciado por rol: cualquier authenticated puede
--      llamar la función, pero solo un admin pasa la verificación
--      interna, igual que update_own_full_name valida auth.uid());
--   2. lee el valor anterior;
--   3. aplica el cambio;
--   4. inserta el registro de auditoría;
--   5. todo en una única transacción implícita (si cualquier paso
--      falla, Postgres revierte todo — no puede quedar un cambio sin su
--      auditoría, ni una auditoría sin el cambio real).
-- Este es exactamente el patrón documentado como referencia en
-- docs/AUTH_MVP_DATA_PLAN.md (Etapa 1, sección 7) — ahora implementado.
-- =====================================================================

create or replace function public.admin_set_subscription_status(
  p_target_user_id uuid,
  p_new_status text,
  p_access_until timestamptz default null,
  p_plan_code text default null,
  p_notes text default null
)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_previous public.subscriptions;
  v_updated  public.subscriptions;
begin
  -- 1. Verificación del rol admin.
  if not public.is_current_user_admin() then
    raise exception 'Solo una administradora puede ejecutar esta acción.';
  end if;

  if p_new_status not in ('trial', 'active', 'past_due', 'suspended', 'cancelled') then
    raise exception 'Estado de membresía inválido: %', p_new_status;
  end if;

  -- 2. Lectura del valor anterior (para el log).
  select * into v_previous from public.subscriptions where user_id = p_target_user_id;
  if v_previous is null then
    raise exception 'El usuario % no tiene una fila de subscription.', p_target_user_id;
  end if;

  -- No permitir que un admin se otorgue o quite membresía a sí mismo
  -- desde este panel: es la misma regla de "un usuario no puede
  -- modificar su propia membresía", que también aplica a un admin
  -- respecto de SU PROPIA fila. Gestionar la propia membresía de un
  -- admin sigue siendo, a propósito, un paso manual (SQL Editor) como
  -- el resto de las cuentas admin — ver docs/AUTH_MVP_STAGE2.md sección 8.
  if p_target_user_id = auth.uid() then
    raise exception 'No podés modificar tu propia membresía desde el panel de administración.';
  end if;

  -- 3. Modificación de subscription.
  update public.subscriptions
  set status = p_new_status,
      access_until = p_access_until,
      plan_code = coalesce(p_plan_code, plan_code),
      starts_at = case
        when p_new_status = 'active' and starts_at is null then now()
        else starts_at
      end,
      notes = coalesce(p_notes, notes)
  where user_id = p_target_user_id
  returning * into v_updated;

  -- 4. Inserción del admin_audit_log, en la MISMA transacción.
  insert into public.admin_audit_log (admin_user_id, target_user_id, action, previous_value, new_value)
  values (auth.uid(), p_target_user_id, 'subscription_status_change', to_jsonb(v_previous), to_jsonb(v_updated));

  -- 5. Confirmación transaccional: implícita.
  return v_updated;
end;
$$;

revoke all on function public.admin_set_subscription_status(uuid, text, timestamptz, text, text) from public;
revoke all on function public.admin_set_subscription_status(uuid, text, timestamptz, text, text) from anon;
grant execute on function public.admin_set_subscription_status(uuid, text, timestamptz, text, text) to authenticated;
