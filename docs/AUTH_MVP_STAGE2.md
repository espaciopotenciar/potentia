# Potentia — Etapa 2: entorno de prueba y autenticación básica

Estado: código completo y probado en local (sin usuarios reales todavía).
**Falta que vos completes tres acciones que no puedo hacer yo:** crear la
cuenta/proyecto en Vercel (sección 1), **actualizar la plantilla "Invite
user" en Supabase** (sección 0 — imprescindible antes de volver a invitar
a nadie) y decirme qué email invitar como primer administrador (sección 8).

---

## 0. Corrección: el flujo de invitación no terminaba en /actualizar-clave

### Causa exacta

Una invitación enviada desde **Authentication → Users → Invite user** del
Dashboard de Supabase no involucra, en el momento de generarse, ningún
navegador de la persona invitada — la dispara una administradora desde
otra sesión completamente distinta. Por eso no existe ningún
`code_verifier` de PKCE para emparejar con esa invitación (a diferencia de
`resetPasswordForEmail()`, que se llama *desde el navegador de la propia
persona*, con su `code_verifier` ya guardado en una cookie antes de que
el email salga).

La plantilla "Invite user" **por defecto** de Supabase usa la variable
`{{ .ConfirmationURL }}`, que apunta al endpoint de verificación de
Supabase (`/auth/v1/verify`) y dispara el **flujo implícito** clásico:
Supabase valida el token del lado de su propio servidor y redirige al
`Site URL` con la sesión completa **en el fragmento de la URL**
(`#access_token=...&refresh_token=...`), no en un parámetro `?code=`.

`/auth/callback` (el que ya existía) espera exactamente lo contrario:
`?code=...`, para pasarlo a `exchangeCodeForSession()`. Un enlace de
invitación con `#access_token=` nunca llega a activar esa lógica —
literalmente no hay ningún `code` en la URL — y como nada en el servidor
procesa el fragmento (los fragmentos `#...` ni siquiera se envían al
servidor por diseño de HTTP), la persona quedaba en la portada pública
con los tokens colgando, visibles, en la barra de direcciones.

### Por qué no se reutilizó /auth/callback

Confirmado: no es compatible. `/auth/callback` sigue existiendo tal cual,
sin tocar, y sigue siendo el correcto **solo para recuperación de
contraseña** (que sí genera un `code` compatible, por el motivo explicado
arriba). Se implementó un endpoint nuevo y distinto para invitaciones.

### Archivos modificados/creados

| Archivo | Cambio |
|---|---|
| `src/app/(public)/auth/confirm/route.ts` (nuevo) | Recibe `token_hash` + `type` + `next`, llama a `supabase.auth.verifyOtp({ type, token_hash })` con el cliente de servidor. La sesión queda establecida vía **cookies** (mismo mecanismo `@supabase/ssr` que ya usa `/auth/callback`), nunca en la URL. |
| `src/lib/auth/redirects.ts` | Nueva `resolveConfirmRedirect(type, next)`: para `type === "invite"` **ignora `next`** y fuerza siempre `/actualizar-clave`, sin excepción — ni siquiera si alguien arma un enlace de invitación con un `next` manipulado. |
| `src/components/auth/ActualizarClaveForm.tsx` | Al guardar la contraseña ya no manda a `/login` — la persona ya está autenticada por cookies desde `/auth/confirm`. Redirige a `/app`; el layout de `(private)` revalida la membresía del lado del servidor y manda a `/membresia-inactiva` si corresponde. |
| `src/components/auth/LoginForm.tsx` | Banner de error para `?error=invite_link_invalid` / `auth_callback_failed` (enlace vencido o ya usado). |
| `src/lib/auth/membership.test.ts`, `src/lib/auth/redirects.test.ts` (nuevos) | Ver sección de pruebas más abajo. |

`/auth/callback` **no se modificó**.

### Flujo final (invitación)

```
Dashboard de Supabase envía el email de invitación
        │
        ▼
Persona hace clic en el enlace del email
        │
        ▼
GET /auth/confirm?token_hash=...&type=invite&next=/actualizar-clave
        │  (el "next" de acá se IGNORA para type=invite — ver resolveConfirmRedirect)
        ▼
supabase.auth.verifyOtp({ type: "invite", token_hash })  ← corre en el servidor
        │
        ├─ éxito → sesión establecida vía cookies → redirect a /actualizar-clave
        │                                                      │
        │                                                      ▼
        │                                    Define contraseña (ActualizarClaveForm)
        │                                                      │
        │                                                      ▼
        │                                    router.push("/app") — con sesión ya activa
        │                                                      │
        │                                                      ▼
        │                              (private)/layout.tsx revalida membresía server-side
        │                                          │                         │
        │                                     activa/trial               suspended/past_due/
        │                                          │                     sin subscription
        │                                          ▼                         ▼
        │                                        /app               /membresia-inactiva
        │
        └─ error (vencido / ya usado / token inválido)
                   → redirect a /login?error=invite_link_invalid (banner visible, sin tokens en la URL)
```

Ningún paso de este flujo pasa por `/` (la portada pública).

### Template exacto para pegar en Supabase

**Authentication → Email Templates → Invite user.** Reemplazar el enlace
que usa `{{ .ConfirmationURL }}` por uno que apunte a `/auth/confirm` con
`{{ .TokenHash }}`:

```html
<h2>Te invitaron a Potentia</h2>

<p>
  Te invitaron a crear tu cuenta en Potentia, by Espacio Potenciar.
  Para aceptar la invitación y elegir tu contraseña, hacé clic en el
  siguiente enlace:
</p>

<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/actualizar-clave">
    Aceptar invitación
  </a>
</p>

<p>Si no esperabas esta invitación, podés ignorar este email.</p>
```

Puntos importantes:

- `{{ .SiteURL }}` toma el valor configurado en **Authentication → URL
  Configuration → Site URL** (sección 9 más abajo) — por eso ese campo
  tiene que apuntar a la URL real del entorno de prueba (o
  `http://localhost:3000` mientras se prueba en local).
- El `&type=invite&next=/actualizar-clave` va **literal**, no es una
  variable de plantilla — son los parámetros fijos que el nuevo endpoint
  necesita.
- No tocar la plantilla **"Reset Password"**: esa sigue usando el flujo
  PKCE existente sin cambios.

### Pruebas realizadas

| Caso pedido | Cómo se probó | Resultado |
|---|---|---|
| Invitación válida | **No probado todavía** — requiere invitar una cuenta real, que sigue postergado hasta que confirmes el email (sección 8) | Pendiente |
| Invitación vencida | Se navegó a `/auth/confirm?token_hash=<valor inválido>&type=invite` contra el proyecto Supabase real | `verifyOtp` devuelve error → redirige a `/login?error=invite_link_invalid`, banner visible |
| Invitación ya utilizada | Mismo mecanismo: Supabase invalida el `token_hash` después del primer uso exitoso, así que un segundo click cae en la misma rama de error que "vencida" (mismo comportamiento verificado arriba) | Cubierto por el mismo caso de arriba — Supabase no distingue "vencido" de "ya usado" en la respuesta, así que la app tampoco (mensaje único, a propósito) |
| Usuario `suspended` | Probado a nivel de lógica: `hasActiveMembership({status:"suspended", ...})` → `false` en las 12 pruebas de `membership.test.ts` (todas las combinaciones con `access_until`) | 12/12 pasan |
| Usuario `active` | Ídem — `hasActiveMembership({status:"active", ...})` → `true` si `access_until` es `null` o futuro | Cubierto en `membership.test.ts` |
| URL sin tokens visibles después de confirmar | Verificado en el navegador tras el intento con token inválido: `window.location.href` quedó en `http://localhost:3000/login?error=invite_link_invalid` — sin `token_hash`, `access_token` ni `refresh_token` en ningún lado. El camino de éxito construye la URL de redirección solo con `next` (`/actualizar-clave`), nunca agrega tokens — confirmado por lectura de código, ya que ese camino específico no se pudo ejercitar sin una invitación real | Verificado (camino de error en vivo + camino de éxito por revisión de código) |

Además: **31/31 tests** automatizados pasan (`npm test`) — incluye los 22
nuevos (`membership.test.ts`, `redirects.test.ts`) más los 9 ya
existentes. Build limpio (`npm run build`). Se confirmó que `/app` sin
sesión sigue yendo a `/login` y que `/recuperar-clave` sigue funcionando
sin cambios (no se rompió nada de lo ya probado).

---

## 1. Hosting de prueba

**Vercel**, plan Hobby (USD 0). Motivo, costo, soporte de Next.js 14,
variables privadas, dominio de preview y limitaciones comerciales: ver el
mensaje de esta conversación donde se presentó antes de tocar código —
se mantiene sin cambios.

**Pasos para vos** (no puedo crear la cuenta ni conectar el repo yo mismo):

1. **vercel.com** → **Sign up** (con GitHub, para que el import sea directo).
2. **Add New → Project** → repo `espaciopotenciar/potentia`.
3. **Branch to deploy: `auth-mvp`** (no `main`).
4. **Environment Variables** (Production + Preview + Development, las tres):

   | Nombre | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://rwxiatwaqlhyazwywsyh.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_NB1e26Y2odqUZRdLOLiopw_XpVX5tWI` |
   | `NEXT_PUBLIC_SITE_URL` | la URL que Vercel te asigne (la sabés recién después del primer deploy — podés volver a este paso y editarla) |

   `SUPABASE_SECRET_KEY` **no se carga** — no se usa en ningún lado todavía.
5. **Deploy**. Vercel te da una URL tipo `https://potentia-<hash>.vercel.app`
   (o `https://potentia-git-auth-mvp-<team>.vercel.app` si conectás por
   rama). Esa es la "URL de prueba" — pasámela cuando la tengas, la
   necesito para la sección 11 (configuración de Supabase) y para probar
   el flujo de invitación de punta a punta.

`main` sigue publicándose en GitHub Pages sin ningún cambio — es un
proyecto de Vercel completamente aparte, apuntando a una rama distinta.

---

## 2. Cambios en `next.config.js`

Se quitó `output: "export"`, `trailingSlash`, `images.unoptimized` y el
`basePath`/`assetPrefix` de GitHub Pages — específicos de esa exportación
estática, que esta rama ya no usa. Quedó en:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
module.exports = nextConfig;
```

Solo afecta a `auth-mvp` (archivo por rama). `main` conserva su
`next.config.js` con la configuración de GitHub Pages intacta.

El workflow `.github/workflows/deploy-pages.yml` sigue existiendo en
`auth-mvp` sin cambios: se dispara únicamente con `push` a `main`, así que
no interfiere. (Si alguna vez se dispara manualmente contra `auth-mvp`, va
a fallar en el paso de build porque ya no se genera `out/` — no debería
pasar, nadie debería dispararlo así.)

## 3. Paquetes instalados

- `@supabase/supabase-js` (cliente oficial de Supabase)
- `@supabase/ssr` (integración oficial para Next.js App Router — maneja
  cookies de sesión en servidor y navegador)
- `server-only` (paquete de 0 dependencias que hace fallar el build si
  `src/lib/auth/session.ts` — que lee datos de sesión del servidor —
  llegara a importarse por accidente desde un componente cliente)

## 4. Variables de entorno configuradas

`.env.local` (local, gitignorado, no se subió a GitHub):

```
NEXT_PUBLIC_SUPABASE_URL=https://rwxiatwaqlhyazwywsyh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_NB1e26Y2odqUZRdLOLiopw_XpVX5tWI
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.example` no necesitó cambios (ya tenía estas cuatro variables desde
la Etapa 1, sin valores). Confirmado: `.env.local` no aparece en
`git status` ni se commiteó.

## 5. Archivos creados

```
src/lib/supabase/client.ts        Cliente Supabase para navegador
src/lib/supabase/server.ts        Cliente Supabase para Server Components / Route Handlers
src/lib/supabase/middleware.ts    Helper de refresco de sesión para el middleware
src/middleware.ts                 Middleware de Next.js (aplica el helper de arriba)

src/lib/auth/session.ts           getAuthContext(): único punto para leer usuario+perfil+membresía en el servidor
src/lib/auth/membership.ts        hasActiveMembership(): regla de acceso, espeja current_user_has_active_membership()
src/lib/auth/redirects.ts         sanitizeInternalRedirect(): lista blanca contra open redirects

src/components/auth/LoginForm.tsx
src/components/auth/RecuperarClaveForm.tsx
src/components/auth/ActualizarClaveForm.tsx
src/components/auth/UpdateFullNameForm.tsx
src/components/auth/SignOutButton.tsx

src/app/(public)/login/page.tsx
src/app/(public)/recuperar-clave/page.tsx
src/app/(public)/actualizar-clave/page.tsx
src/app/(public)/auth/callback/route.ts
src/app/(public)/membresia-inactiva/page.tsx

src/app/(private)/layout.tsx      Validación server-side de sesión + membresía
src/app/(private)/app/page.tsx    Página temporal: nombre/email/rol/estado/access_until/cerrar sesión
src/app/(private)/mi-cuenta/page.tsx  Prueba de update_own_full_name

docs/AUTH_MVP_STAGE2.md           Este documento
.env.local                        (local, no commiteado)
```

## 6. Archivos modificados

`next.config.js`, `package.json`, `package-lock.json`, `docs/AUTH_MVP_DATA_PLAN.md`
(corrección de lenguaje de la sección 1 de este pedido).

## 7. Flujos

**Login** (`/login`): email + contraseña + botón "Ingresar" con estado de
carga. Sin registro público, sin botón "Crear cuenta". Error genérico
("No pudimos iniciar sesión. Revisá el email y la contraseña.") que no
distingue email inexistente de contraseña incorrecta. Redirección después
del login pasa por `sanitizeInternalRedirect()` (lista blanca: `/app`,
`/mi-cuenta`, `/actualizar-clave`). Enlace a `/recuperar-clave`.

**Recuperación** (`/recuperar-clave`): pide el email, llama a
`supabase.auth.resetPasswordForEmail()` con `redirectTo` apuntando a
`/auth/callback?next=/actualizar-clave`, y siempre muestra el mismo
mensaje neutro ("Si ese email está registrado…"), exista o no la cuenta.

**Actualización de contraseña** (`/actualizar-clave`): al montar, verifica
si hay una sesión activa (la que dejó el callback). Si no hay, muestra
"el enlace venció o ya se usó" con link para pedir uno nuevo. Si hay,
pide contraseña nueva + confirmación (mínimo 8 caracteres, deben
coincidir), llama a `supabase.auth.updateUser({ password })`, y muestra
éxito con link a `/login`.

**Callback** (`/auth/callback`, Route Handler): recibe `code` y `next`,
intercambia el código por sesión con `exchangeCodeForSession()`. `next` se
sanitiza contra la misma lista blanca — nunca redirige a una URL externa.
Si falla el intercambio, redirige a `/login?error=auth_callback_failed`.

**Validación de sesión**: `getAuthContext()` (`src/lib/auth/session.ts`)
llama a `supabase.auth.getUser()` del lado del servidor (revalida el
token contra Supabase, no confía solo en la cookie) y, si hay usuario,
trae `profiles` + `subscriptions` en paralelo.

**Validación de membresía**: el layout de `(private)` llama a
`getAuthContext()` y aplica `hasActiveMembership()` sobre la suscripción
devuelta. Esa función en TypeScript espeja exactamente
`current_user_has_active_membership()` de la base — pero la fuente de
verdad real sigue siendo la base: aunque este layout tuviera un bug, RLS
le seguiría negando filas de contenido a cualquiera sin membresía activa.
Reglas aplicadas (idénticas a las acordadas): sin sesión → `/login`;
`trial`/`active` → permitido si `access_until` es `null` o futuro;
`past_due`/`suspended` → siempre `/membresia-inactiva`; `cancelled` →
permitido solo si `access_until` es futuro; sin fila de `subscription` →
`/membresia-inactiva`.

**Pantalla de membresía inactiva**: si hay sesión, muestra el estado real
(`suspendida`, `con un pago pendiente`, etc.) y un botón para cerrar
sesión. Si no hay sesión, muestra un mensaje genérico con link a
`/login`. No depende de la tabla de contenido ni de ninguna otra
consulta — solo de `profiles`/`subscriptions`, que el propio usuario
puede leer por su política de `SELECT`.

## 8. Creación del primer administrador — esperando tu confirmación

**Antes de invitar a nadie (de nuevo):** actualizá la plantilla "Invite
user" con el HTML exacto de la sección 0 — si se invita con la plantilla
vieja, va a fallar exactamente igual que la vez anterior.

Todavía **no invité a nadie**. Cuando me digas qué email usar:

1. Vas a **Authentication → Users → Invite user** en el dashboard de
   Supabase y cargás ese email vos mismo (no lo hago yo por vos — es la
   creación de una cuenta real).
2. Una vez que confirmes que la invitación se envió, te preparo el SQL
   exacto para: `role = 'admin'`, manteniendo `status = 'suspended'`
   inicialmente.
3. Después de que confirmes que esa persona aceptó la invitación, te
   preparo el SQL para activarla: `status = 'active'`, `starts_at =
   now()`, `access_until = null`, `plan_code = 'admin'` (plan interno para
   distinguir cuentas de administración de membresías pagas reales — se
   puede ajustar el código si preferís otro).

No voy a correr ningún `UPDATE` sobre un email que vos no hayas confirmado
antes.

## 9. Configuración exacta en Supabase (Authentication)

### URL Configuration

| Campo | Valor |
|---|---|
| **Site URL** | `http://localhost:3000` por ahora. Cuando tengas la URL de Vercel, la cambiamos a esa (es el default que usan los enlaces de los emails si no se especifica `redirectTo`). |
| **Redirect URLs** | `http://localhost:3000/auth/callback`, `http://localhost:3000/actualizar-clave`, y — apenas tengas la URL de Vercel — `https://<tu-url-de-vercel>/auth/callback` y `https://<tu-url-de-vercel>/actualizar-clave` |

No uses comodines abiertos tipo `https://*.vercel.app/**` salvo que lo
necesites puntualmente para preview deployments — para este entorno de
prueba, con la URL fija del proyecto alcanza y es más seguro.

### Providers → Email

| Campo | Valor recomendado | Por qué |
|---|---|---|
| **Enable Email provider** | ON | Necesario para login con contraseña |
| **Allow new users to sign up** | **OFF** | Esto es importante: aunque la app no tenga botón de registro, si esta opción queda en ON cualquiera podría llamar a `supabase.auth.signUp()` directamente desde la consola del navegador con la publishable key y crearse una cuenta igual. Apagarlo bloquea el registro público a nivel de Supabase, no solo a nivel de interfaz. |
| **Confirm email** | Puede quedar ON | No afecta el flujo de invitación (Supabase marca a la persona invitada como confirmada al aceptar) |

### Duración de enlaces

Por default, los enlaces de recuperación/invitación de Supabase vencen a
la **1 hora** (configurable en Authentication → Email Templates /
"Email OTP Expiration"). No hace falta cambiarlo para esta etapa.

### Limitaciones del SMTP estándar de Supabase

El proveedor de email incorporado de Supabase (sin configurar SMTP
propio) tiene un límite bajo de envíos por hora, pensado para desarrollo
y pruebas — no para producción con muchos usuarios. Para el puñado de
invitaciones de esta etapa alcanza perfecto. Cuando el volumen crezca,
ahí es donde entraría un SMTP propio (SendGrid u otro) — explícitamente
**no** se configura en esta etapa.

## 10. Riesgos y limitaciones encontrados

- El middleware protege por prefijo de ruta (`/app`, `/mi-cuenta`); si en
  el futuro se agregan más rutas privadas fuera de esas dos, hay que
  sumarlas a `PRIVATE_PATH_PREFIXES` en `src/lib/supabase/middleware.ts`
  (y, más importante, ponerlas dentro del grupo `(private)` para que el
  layout las valide igual).
- `getAuthContext()` hace 3 consultas (usuario + perfil + suscripción) en
  cada Server Component que la llama (layout y cada página privada la
  llaman por separado). Para el volumen de esta etapa no es un problema;
  si más adelante se nota lentitud, se puede memoizar con `cache()` de
  React dentro de un mismo request.
- El plan Hobby de Vercel es de uso no comercial — hay que recordar pasar
  a Pro antes de cobrar membresías reales (ya estaba anotado en el
  diagnóstico original).
- El SMTP estándar de Supabase tiene un límite de envíos bajo (ver
  sección 9) — no es un problema ahora, sí lo sería con más usuarios.
