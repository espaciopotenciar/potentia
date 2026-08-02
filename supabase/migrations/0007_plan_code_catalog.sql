-- =====================================================================
-- 0007_plan_code_catalog.sql
-- Convierte subscriptions.plan_code de texto libre a un catálogo
-- controlado. No modifica 0001-0006: agrega el constraint acá y
-- reemplaza admin_set_subscription_status() por completo vía
-- CREATE OR REPLACE (misma firma, cuerpo actualizado).
--
-- Catálogo (los seis valores + null):
--   admin      cuenta interna de administración
--   trial      período de prueba
--   monthly    membresía mensual
--   quarterly  membresía trimestral
--   annual     membresía anual
--   courtesy   acceso sin cargo otorgado manualmente
--
-- IMPORTANTE — orden de aplicación: antes de correr esto, revisar los
-- valores actuales con:
--
--   select plan_code, count(*) from public.subscriptions
--   group by plan_code order by plan_code;
--
-- Si aparece cualquier valor fuera de {admin, trial, monthly, quarterly,
-- annual, courtesy, null}, el ALTER TABLE de más abajo va a fallar (el
-- constraint no se puede aplicar sobre filas que ya lo violan) — eso es
-- intencional, no hay ningún UPDATE de limpieza automática acá. Si
-- falla, no se corrió nada más: PostgreSQL revierte todo el archivo
-- porque corre dentro de una única transacción implícita del SQL
-- Editor.
--
-- plan_code sigue sin tener ningún efecto sobre autorización: quién
-- entra a /app depende únicamente de status + access_until
-- (current_user_has_active_membership(), 0004_functions_triggers.sql).
-- Este catálogo es puramente informativo/comercial.
-- =====================================================================

alter table public.subscriptions
  add constraint subscriptions_plan_code_check
  check (plan_code is null or plan_code in (
    'admin', 'trial', 'monthly', 'quarterly', 'annual', 'courtesy'
  ));

comment on column public.subscriptions.plan_code is
  'Catálogo controlado (ver constraint subscriptions_plan_code_check): '
  'admin, trial, monthly, quarterly, annual, courtesy, o null. Puramente '
  'informativo/comercial — no participa en la regla de acceso, que depende '
  'solo de status y access_until.';

-- ---------------------------------------------------------------------
-- admin_set_subscription_status(): misma firma que 0006, cuerpo
-- actualizado para validar p_plan_code contra el mismo catálogo, y para
-- que enviar plan_code = null desde el panel efectivamente lo borre
-- (antes: `coalesce(p_plan_code, plan_code)` ignoraba un null entrante
-- y dejaba el valor viejo — no permitía nunca vaciar el plan; el panel
-- admin ahora manda siempre el valor completo del selector, incluida la
-- opción "Sin plan", así que corresponde una asignación directa).
-- ---------------------------------------------------------------------
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

  -- Mismo catálogo que el constraint subscriptions_plan_code_check.
  if p_plan_code is not null
     and p_plan_code not in ('admin', 'trial', 'monthly', 'quarterly', 'annual', 'courtesy') then
    raise exception 'Plan inválido: %', p_plan_code;
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
      plan_code = p_plan_code,
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
