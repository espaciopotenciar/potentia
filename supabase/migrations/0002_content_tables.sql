-- =====================================================================
-- 0002_content_tables.sql
-- Contenido funcional de Potentia (todo pasa a ser privado): módulos,
-- lecciones, matriz de acciones, objeciones y conceptos del buscador.
-- Se mantienen los mismos "id" de texto que ya usa src/data/*.ts
-- (por ejemplo 'm1-l1', 'a-propuesta-2') para que el seed sea un mapeo
-- directo y las referencias cruzadas (related_lesson_ids, etc.) no
-- necesiten traducirse a otro identificador.
-- =====================================================================

-- ---------------------------------------------------------------------
-- modules
-- ---------------------------------------------------------------------
create table if not exists public.modules (
  id          text primary key,
  sort_order  int not null,
  title       text not null,
  description text not null,
  icon        text not null,
  active      boolean not null default true
);

comment on table public.modules is 'Los 5 módulos de Aprender. Contenido privado (requiere membresía activa).';

-- ---------------------------------------------------------------------
-- lessons
-- ---------------------------------------------------------------------
create table if not exists public.lessons (
  id                 text primary key,
  slug               text not null unique,
  title              text not null,
  description        text not null,
  module_id          text not null references public.modules (id) on delete restrict,
  sort_order         int not null,
  estimated_minutes  int not null,
  content            jsonb not null,              -- array de párrafos: ["...", "..."]
  keywords           text[] not null default '{}',
  related_lesson_ids text[] not null default '{}',-- IDs de public.lessons; no se fuerza FK (ver nota abajo)
  active             boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.lessons is
  'Las 33 lecciones (incluye toda la teoría del Sistema 4x4). Contenido privado.';
comment on column public.lessons.related_lesson_ids is
  'Array de lessons.id. Postgres no soporta FK sobre columnas array de forma '
  'nativa; la integridad referencial de este campo se valida en el generador '
  'del seed (scripts/generateContentSeed.ts), no en la base.';

create index if not exists lessons_module_idx  on public.lessons (module_id, sort_order);
create index if not exists lessons_active_idx  on public.lessons (active);

-- ---------------------------------------------------------------------
-- action_matrix_entries
-- ---------------------------------------------------------------------
-- unanswered_messages, sale_type, channel y has_agreed_date se guardan
-- como texto (no boolean/int) porque el motor de decisión usa el valor
-- especial "cualquiera" como comodín — igual que en
-- src/types/action.ts / src/lib/decisionEngine.ts hoy. Esto permite
-- portar la lógica de resolveAction() al servidor casi sin cambios.
create table if not exists public.action_matrix_entries (
  id                         text primary key,
  has_previous_conversation  boolean not null,
  sale_type                  text not null,   -- 'persona' | 'empresa' | 'cualquiera'
  opportunity_stage          text not null,   -- valor de OpportunityStage | 'cualquiera'
  unanswered_messages        text not null,   -- '0'..'4' | 'cualquiera'
  channel                    text not null,   -- valor de Channel | 'cualquiera'
  has_agreed_date            text not null,   -- 'true' | 'false' | 'cualquiera'
  applies_4x4                boolean not null,
  recommended_stage          text not null,
  stage_name                 text not null,
  interpretation             text not null,
  objective                  text not null,
  suggested_action           text not null,
  advice                     text not null,
  mistake_to_avoid           text not null,
  empathetic_message         jsonb not null,  -- {"template":"...","example":"...","requiredVariables":[...]}
  neutral_message            jsonb not null,
  direct_message             jsonb not null,
  related_lesson_ids         text[] not null default '{}',
  active                     boolean not null default true,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

comment on table public.action_matrix_entries is
  'Las filas de la matriz de Accionar, incluidas las 3 plantillas de mensaje '
  'de cada una. Es el contenido más sensible de la app: nunca debe volver a '
  'compilarse completo dentro de un bundle público.';

create index if not exists action_matrix_active_idx on public.action_matrix_entries (active);
create index if not exists action_matrix_stage_idx  on public.action_matrix_entries (opportunity_stage);

-- ---------------------------------------------------------------------
-- objections
-- ---------------------------------------------------------------------
create table if not exists public.objections (
  id                  text primary key,
  slug                text not null unique,
  title               text not null,
  category            text not null,
  common_phrase       text not null,
  is_open_ended       boolean not null default false,
  what_it_may_express text[] not null default '{}',
  what_not_to_assume  text[] not null default '{}',
  questions_to_explore text[] not null default '{}',
  what_to_avoid       text[] not null default '{}',
  next_goal           text not null,
  empathetic_response jsonb not null,   -- {"template":"...","example":"..."}
  neutral_response    jsonb not null,
  direct_response     jsonb not null,
  mistake_to_avoid    text not null,
  related_lesson_ids  text[] not null default '{}',
  keywords            text[] not null default '{}',
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.objections is 'Las 12 objeciones con sus 3 respuestas cada una. Contenido privado.';

create index if not exists objections_active_idx on public.objections (active);

-- ---------------------------------------------------------------------
-- search_concepts
-- ---------------------------------------------------------------------
create table if not exists public.search_concepts (
  id       text primary key,
  title    text not null,
  snippet  text not null,
  keywords text[] not null default '{}',
  lesson_id text not null references public.lessons (id) on delete cascade
);

comment on table public.search_concepts is
  'Índice curado usado por /buscar en el grupo "Conceptos y recomendaciones". Contenido privado.';
