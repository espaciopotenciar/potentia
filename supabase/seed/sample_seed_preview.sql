-- =====================================================================
-- sample_seed_preview.sql
-- Muestra a mano, verificada contra src/data/*.ts línea por línea, del
-- patrón exacto que va a usar el seed completo (ver explicación en
-- docs/AUTH_MVP_DATA_PLAN.md, punto 5). Contiene:
--   - 1 módulo completo  ("mentalidad")
--   - 1 lección completa ("m1-l1" / Liderar el proceso comercial)
--   - 1 fila de la matriz de acciones completa ("h-sin-conversacion")
--   - 1 objeción completa ("obj-caro" / Es muy caro)
--   - 1 concepto de búsqueda ("concept-4x4")
--
-- Este archivo SÍ se puede ejecutar tal cual (es idempotente: se puede
-- correr más de una vez sin duplicar filas ni fallar), pero es solo una
-- muestra para revisar el patrón — no reemplaza el seed completo, que
-- se genera con scripts/generateContentSeed.ts (ver explicación).
-- =====================================================================

-- ---------------------------------------------------------------------
-- modules
-- ---------------------------------------------------------------------
insert into public.modules (id, sort_order, title, description, icon, active)
values (
  'mentalidad',
  1,
  'Mentalidad de la venta proactiva',
  'La base de todo: por qué liderar el proceso comercial es tu responsabilidad, no la del cliente.',
  'compass',
  true
)
on conflict (id) do update set
  sort_order  = excluded.sort_order,
  title       = excluded.title,
  description = excluded.description,
  icon        = excluded.icon,
  active      = excluded.active;

-- ---------------------------------------------------------------------
-- lessons
-- ---------------------------------------------------------------------
insert into public.lessons (
  id, slug, title, description, module_id, sort_order, estimated_minutes,
  content, keywords, related_lesson_ids, active
)
values (
  'm1-l1',
  'liderar-el-proceso-comercial',
  'Liderar el proceso comercial',
  'Por qué la persona que vende es quien debe marcar el ritmo de la conversación.',
  'mentalidad',
  1,
  4,
  '[
    "Cuando una oportunidad comercial se estanca, es habitual pensar que la solución es esperar. Esperar a que la otra persona escriba, a que revise la propuesta, a que tenga un momento. Esa espera, sostenida en el tiempo, es la principal causa de que las oportunidades se enfríen.",
    "Liderar el proceso comercial significa asumir que a vos te corresponde proponer el próximo paso. No se trata de apurar una decisión, sino de facilitarla: dar la información que falta, proponer una fecha, ofrecer un recurso concreto.",
    "Una persona que lidera su proceso comercial no depende del estado de ánimo o la agenda del cliente para avanzar. Define de antemano qué acción va a tomar si no recibe respuesta, y la ejecuta con calma.",
    "Esto no tiene relación con la insistencia. Insistir es repetir lo mismo esperando un resultado distinto. Liderar es aportar algo nuevo en cada intervención para que la persona tenga motivos reales para responder."
  ]'::jsonb,
  array['liderar', 'proceso comercial', 'proactividad', 'mentalidad'],
  array['m1-l2', 'm1-l3', 'm2-l3'],
  true
)
on conflict (id) do update set
  slug               = excluded.slug,
  title              = excluded.title,
  description        = excluded.description,
  module_id          = excluded.module_id,
  sort_order         = excluded.sort_order,
  estimated_minutes  = excluded.estimated_minutes,
  content            = excluded.content,
  keywords           = excluded.keywords,
  related_lesson_ids = excluded.related_lesson_ids,
  active             = excluded.active;

-- ---------------------------------------------------------------------
-- action_matrix_entries
-- ---------------------------------------------------------------------
insert into public.action_matrix_entries (
  id, has_previous_conversation, sale_type, opportunity_stage,
  unanswered_messages, channel, has_agreed_date, applies_4x4,
  recommended_stage, stage_name, interpretation, objective,
  suggested_action, advice, mistake_to_avoid,
  empathetic_message, neutral_message, direct_message,
  related_lesson_ids, active
)
values (
  'h-sin-conversacion',
  false,
  'cualquiera',
  'cualquiera',
  'cualquiera',
  'cualquiera',
  'cualquiera',
  false,
  'no_aplica_4x4',
  'Todavía no corresponde aplicar el 4x4',
  'El Sistema 4x4 se utiliza cuando ya existió una conversación, una respuesta o una manifestación de interés. Si la persona nunca respondió, estás frente a una instancia de contacto o reactivación, no de seguimiento.',
  'Lograr una primera respuesta real, no insistir como si hubiera una oportunidad activa.',
  'Revisá si el contacto es el adecuado, cambiá el ángulo del mensaje y aportá contexto o valor en lugar de repetir el pedido inicial.',
  'Un contacto que nunca respondió necesita un mensaje distinto, no una repetición del primero.',
  'Enviar cuatro mensajes de seguimiento como si ya existiera una oportunidad activa.',
  '{
    "template": "Hola {{nombre}}, te escribo porque {{contexto}}. Entiendo que puede no ser el mejor momento, así que quería simplemente dejarte esta puerta abierta por si te resulta de valor.",
    "example": "Hola Lucas, te escribo porque vi que tu equipo está creciendo este semestre. Entiendo que puede no ser el mejor momento, así que quería simplemente dejarte esta puerta abierta por si te resulta de valor.",
    "requiredVariables": ["nombre", "contexto"]
  }'::jsonb,
  '{
    "template": "Hola {{nombre}}, mi nombre es (tu nombre) y trabajo en {{servicio}}. Te escribo para presentarme brevemente, sin ningún compromiso. Si te interesa, con gusto te cuento más.",
    "example": "Hola Lucas, mi nombre es (tu nombre) y trabajo en consultoría comercial. Te escribo para presentarme brevemente, sin ningún compromiso. Si te interesa, con gusto te cuento más.",
    "requiredVariables": ["nombre", "servicio"]
  }'::jsonb,
  '{
    "template": "Hola {{nombre}}, ¿tenés unos minutos esta semana para contarte cómo puedo ayudarte con {{necesidad}}?",
    "example": "Hola Lucas, ¿tenés unos minutos esta semana para contarte cómo puedo ayudarte con la organización comercial de tu equipo?",
    "requiredVariables": ["nombre", "necesidad"]
  }'::jsonb,
  array['m4-l2', 'm4-l3'],
  true
)
on conflict (id) do update set
  has_previous_conversation = excluded.has_previous_conversation,
  sale_type                 = excluded.sale_type,
  opportunity_stage         = excluded.opportunity_stage,
  unanswered_messages       = excluded.unanswered_messages,
  channel                   = excluded.channel,
  has_agreed_date           = excluded.has_agreed_date,
  applies_4x4               = excluded.applies_4x4,
  recommended_stage         = excluded.recommended_stage,
  stage_name                = excluded.stage_name,
  interpretation            = excluded.interpretation,
  objective                 = excluded.objective,
  suggested_action          = excluded.suggested_action,
  advice                    = excluded.advice,
  mistake_to_avoid          = excluded.mistake_to_avoid,
  empathetic_message        = excluded.empathetic_message,
  neutral_message            = excluded.neutral_message,
  direct_message             = excluded.direct_message,
  related_lesson_ids         = excluded.related_lesson_ids,
  active                     = excluded.active;

-- ---------------------------------------------------------------------
-- objections
-- ---------------------------------------------------------------------
insert into public.objections (
  id, slug, title, category, common_phrase, is_open_ended,
  what_it_may_express, what_not_to_assume, questions_to_explore, what_to_avoid,
  next_goal, empathetic_response, neutral_response, direct_response,
  mistake_to_avoid, related_lesson_ids, keywords, active
)
values (
  'obj-caro',
  'es-muy-caro',
  'Es muy caro',
  'Precio',
  '"Es muy caro" / "Está por encima de lo que pensaba"',
  false,
  array[
    'No percibe todavía el valor completo de la propuesta.',
    'Lo está comparando con una opción de menor precio.',
    'El monto total le genera impacto, aunque el valor por unidad de tiempo sea razonable.',
    'Puede ser una forma cortés de decir que no es prioridad ahora.'
  ],
  array[
    'No asumas que no tiene el dinero: puede tratarse de percepción de valor, no de capacidad de pago.',
    'No asumas que hay que bajar el precio de inmediato.',
    'No asumas que está comparando con un competidor directo: puede estar comparando con no hacer nada.'
  ],
  array[
    '¿Con qué lo estás comparando?',
    '¿Qué parte de la propuesta te genera más dudas en relación con el valor?',
    'Si el precio no fuera un tema, ¿avanzarías con la propuesta tal como está?'
  ],
  array[
    'Bajar el precio de forma automática, sin entender el motivo real.',
    'Justificar el precio con una lista extensa de argumentos.',
    'Compararte de forma negativa con la competencia.'
  ],
  'Entender si el freno es de percepción de valor, de prioridad o de presupuesto real, y ajustar la propuesta o la comunicación en consecuencia.',
  '{
    "template": "Hola {{nombre}}, entiendo perfectamente que el monto te genere dudas. Me gustaría entender mejor: ¿con qué lo estás comparando? Así puedo mostrarte {{recurso}} para que tengas más elementos antes de decidir sobre {{propuesta}}.",
    "example": "Hola Martina, entiendo perfectamente que el monto te genere dudas. Me gustaría entender mejor: ¿con qué lo estás comparando? Así puedo mostrarte cómo se distribuye la inversión en el proceso para que tengas más elementos antes de decidir sobre la propuesta."
  }'::jsonb,
  '{
    "template": "Hola {{nombre}}, gracias por la sinceridad respecto al {{propuesta}}. Para entender mejor tu situación: ¿el tema es el monto total o la forma de pago? Cualquiera de las dos cosas la podemos revisar.",
    "example": "Hola Martina, gracias por la sinceridad respecto a la propuesta. Para entender mejor tu situación: ¿el tema es el monto total o la forma de pago? Cualquiera de las dos cosas la podemos revisar."
  }'::jsonb,
  '{
    "template": "Hola {{nombre}}, te propongo algo simple: contame en una línea qué parte del precio te genera más dudas, y vemos juntos si hay una forma de ajustar {{propuesta}} a tu situación.",
    "example": "Hola Martina, te propongo algo simple: contame en una línea qué parte del precio te genera más dudas, y vemos juntos si hay una forma de ajustar la propuesta a tu situación."
  }'::jsonb,
  'Ofrecer un descuento antes de entender si el problema es realmente el precio.',
  array['m5-l2', 'm5-l6'],
  array['caro', 'precio', 'costo', 'presupuesto alto'],
  true
)
on conflict (id) do update set
  slug                 = excluded.slug,
  title                = excluded.title,
  category             = excluded.category,
  common_phrase        = excluded.common_phrase,
  is_open_ended        = excluded.is_open_ended,
  what_it_may_express  = excluded.what_it_may_express,
  what_not_to_assume   = excluded.what_not_to_assume,
  questions_to_explore = excluded.questions_to_explore,
  what_to_avoid        = excluded.what_to_avoid,
  next_goal            = excluded.next_goal,
  empathetic_response  = excluded.empathetic_response,
  neutral_response     = excluded.neutral_response,
  direct_response      = excluded.direct_response,
  mistake_to_avoid     = excluded.mistake_to_avoid,
  related_lesson_ids   = excluded.related_lesson_ids,
  keywords             = excluded.keywords,
  active               = excluded.active;

-- ---------------------------------------------------------------------
-- search_concepts
-- ---------------------------------------------------------------------
-- Nota: en src/data/concepts.ts el campo es "lessonSlug"; acá se resuelve
-- a lesson_id ('m4-l1') porque search_concepts.lesson_id referencia
-- lessons.id con una FK real. El generador completo hace esta misma
-- resolución slug -> id para las 9 filas de concepts.ts.
insert into public.search_concepts (id, title, snippet, keywords, lesson_id)
values (
  'concept-4x4',
  'Sistema 4x4',
  'Cuatro mensajes de seguimiento, cada cuatro días hábiles, cuando ya existió una conversación previa.',
  array['4x4', 'seguimiento', 'cadencia'],
  'm4-l1'
)
on conflict (id) do update set
  title    = excluded.title,
  snippet  = excluded.snippet,
  keywords = excluded.keywords,
  lesson_id = excluded.lesson_id;
