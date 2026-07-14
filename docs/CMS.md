# CMS — Integración Sanity (DA-7)

> **Estado:** 🟢 Integración construida y probada · ⏳ **sin proyecto Sanity real**
> (DA-7 ratificada por el comité, **pendiente de ratificación única del cliente**,
> Bible §49). Nada de este documento contradice el Bible; ante discrepancia,
> **prevalece el Bible** (política documental).
>
> **SSOT:** Bible §11–§13 (arquitectura), §15 (integraciones), §28 (entidades),
> §38 (variables), §43 ADR-001/003 (Jamstack *rebuild-on-webhook* / CMS headless),
> §49 DA-4 (workflow editorial) y DA-7 (Sanity).

---

## 1. Arquitectura

```
┌────────────────┐  publica   ┌──────────────────┐  GROQ (build)  ┌─────────────┐
│ Sanity Studio  │──────────▶│  Content Lake     │───────────────▶│  astro build │
│ (cms/, DA-4)   │           │  (dataset)        │                │  (SSG §11)   │
└────────────────┘           └──────────────────┘                └─────────────┘
        │ webhook firmado (HMAC)         ▲                              ▲
        ▼                                │ CMS_API_URL/TOKEN            │
┌──────────────────────────────┐         │                              │
│ POST /api/internal/cms/       │────────┘        POST DEPLOY_HOOK_URL  │
│ webhook (verifica firma)      │──────────────────────────────────────┘
└──────────────────────────────┘         (rebuild ADR-001)
```

- **Lectura (build):** los loaders (`src/server/integrations/sanity/content.ts`)
  consultan GROQ sobre `CMS_API_URL`, validan con zod contra los tipos del
  frontend y **hacen fallback honesto** a las fuentes locales si el CMS no está
  configurado (build idéntico al actual).
- **Escritura/publicación:** el Studio (`cms/`) con el workflow DA-4; al
  publicar, un webhook firmado dispara el *deploy hook* → rebuild SSG completo.
- Las páginas siguen **100 % estáticas**; solo `/api/*` es *on-demand*.

## 2. Alta del proyecto (runbook, al ratificar DA-7)

1. **Crear proyecto**: `cd cms && npx sanity init` (o sanity.io/manage) —
   organización del cliente, dataset `production`, región UE si está disponible.
2. **Configurar el Studio**: copiar `cms/.env.example` → `cms/.env` con
   `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`,
   `SANITY_STUDIO_PREVIEW_URL` (staging DA-3).
3. **Validar esquemas**: `npm run typecheck` + `npm run schema:check`
   (CLI oficial; requiere red) o `npm run schema:check:local` (offline).
4. **Desplegar Studio**: `npm run deploy` (URL `*.sanity.studio`) o hosting propio.
5. **Token de lectura**: sanity.io/manage → API → Tokens → *Viewer* (solo
   lectura). Va a `CMS_API_TOKEN` del **sitio** (§38). El dataset puede ser
   privado; el sitio lee con token en build.
6. **CMS_API_URL** (§38): endpoint completo de query —
   `https://<projectId>.api.sanity.io/v<api-version>/data/query/<dataset>`.
7. **CORS**: añadir el origen del Studio y `SITE_URL` en API → CORS origins
   (sin credenciales para el sitio; el token viaja por header).

## 3. Esquemas (`cms/schemas/`)

| Documento | Entidad §28 | Notas de honestidad |
|---|---|---|
| `service` | Servicio | Iconos restringidos al registro §7 del design system (import directo). Slug = ruta §24 (aviso de rotura). |
| `sector` | Sector | Taxonomía controlada (habilita el filtro RF-03 en F2). |
| `caseStudy` | Proyecto/caso | `client` **opcional** (casos anonimizados); métricas **1–4** (§13.4); bloques narrativos obligatorios; **alt obligatorio** en galería (WCAG §20). |
| `article` | Artículo/Recurso | Autor firmado obligatorio; secciones = encabezado + párrafos (contrato del ToC; *rich text* es evolución F3). |
| `teamMember` | Miembro del equipo | Consumo en F2 (§13.5). Alt obligatorio. |
| `certification` | Certificación | **H6 es hipótesis bloqueante**: solo cargar certificaciones con documento verificable. |

Los esquemas usan *helpers* tipados locales (`schemas/define.ts`), por lo que la
suite raíz los verifica **sin instalar el Studio** (20 tests de contrato:
esquema ⇄ GROQ ⇄ zod). El workspace `cms/` los typechecka además contra los
tipos reales de `sanity` v4 y los compila con `@sanity/schema`.

## 4. Workflow editorial (DA-4: aprobación en dos niveles)

Estados (`estadoEditorial`, solo modificable por acciones):

```
borrador ──«Solicitar revisión»──▶ en_revision ──«Aprobar» (nivel 2)──▶ aprobado ──Publish──▶ publicado
```

- **Publish está deshabilitado** hasta `aprobado` (acción envuelta en el Studio).
- El escritorio incluye la cola **«Pendientes de revisión»** y cada documento
  muestra su **badge** de estado.
- Solo los documentos **publicados** llegan a las queries de build (perspectiva
  `published` por defecto): nada a medio aprobar puede aparecer en la web.

## 5. Roles

| Rol Sanity | Nivel DA-4 | Puede |
|---|---|---|
| `administrator` | Dirección | Todo (incluye gestión de miembros/tokens). |
| `editor` | Nivel 2 (revisor) | Aprobar y publicar; editar todo. |
| `redactor` *(custom)* | Nivel 1 (autor) | Crear/editar borradores y solicitar revisión. **No ve Publish.** |

- La ocultación de *Publish* para `redactor` es UX del Studio; la **imposición
  real es server-side** en Sanity con los permisos del rol.
- ⚠️ **Reserva DA-7 (Bible §49):** los roles *custom* requieren plan **Growth**.
  Con plan gratuito, el nivel 1 puede operarse con `editor` + disciplina del
  gate de publish (que sigue activo), asumiendo el riesgo documentado.

## 6. Preview

- **Hoy:** «Open preview» en el Studio resuelve la ruta pública §24
  (`service→/servicios/…`, `caseStudy→/proyectos/…`, `article→/recursos/…`)
  contra `SANITY_STUDIO_PREVIEW_URL`.
- **Borradores (F2):** el cliente del BFF ya soporta `perspective: 'drafts'`
  (con token). El plan: un despliegue de *preview* protegido que construye con
  esa perspectiva (o Presentation tool con overlays). Requiere el hosting DA-3
  operativo; se diseñará como iteración propia.

## 7. Webhooks (publicación → rebuild)

Configurar en sanity.io/manage → API → Webhooks:

| Campo | Valor |
|---|---|
| URL | `{SITE_URL}/api/internal/cms/webhook` |
| Trigger | `create`, `update`, `delete` (documentos publicados) |
| Filter | `_type in ["service","caseStudy","article","teamMember","certification","sector"]` |
| Projection | `{_type, "slug": slug.current}` (solo identificadores editoriales) |
| Secret | El valor de `CMS_WEBHOOK_SECRET` (§38) |
| HTTP method | POST |

El endpoint verifica la firma `sanity-webhook-signature`
(HMAC-SHA256 de `t.body`, base64url, ventana anti-replay ±5 min, comparación en
tiempo constante), y con firma válida hace POST a `DEPLOY_HOOK_URL` → rebuild.
Respuestas: `202` (build disparado) · `401` (firma inválida; el hook NO se
llama) · `502` (deploy hook caído → **Sanity reintenta la entrega él mismo**)
· `503` (secretos sin configurar).

## 8. Revalidación e ISR

- **Mecanismo canónico (ADR-001):** *rebuild-on-webhook* — el contenido cambia
  cuando se publica, no por tráfico; un rebuild completo (~1 min con 19+
  páginas) es el modelo correcto y host-agnóstico. **Implementado** (§7).
- **ISR = optimización dependiente del proveedor (ADR-001/DA-3), NO
  arquitectura.** En Vercel puede activarse al desplegar
  (`@astrojs/vercel` → `isr: { expiration: … }`) para regenerar páginas bajo
  demanda **además** del rebuild: con `getStaticPaths` los listados/rutas nuevas
  siguen necesitando el rebuild del webhook, así que ISR solo acelera
  refrescos de páginas existentes. Decisión de activarlo: junto al despliegue
  DA-3, midiendo coste/beneficio. No se configura en el repo para no acoplar
  la arquitectura al proveedor.

## 9. Testing

| Capa | Dónde | Qué cubre |
|---|---|---|
| Contrato de esquemas | `tests/unit/cms/schemas.test.ts` | Esquemas ⇄ GROQ ⇄ zod: nombres, requireds, referencias, iconos §7, alt WCAG, presupuesto de métricas, campo DA-4. |
| Cliente + loaders | `tests/unit/server/sanity.test.ts` | GROQ/params/token, mapeo validado, fallback honesto, errores. |
| Webhook | `tests/unit/server/cms-webhook.test.ts` + `tests/integration/cms-webhook.test.ts` | Firma (aceptación/manipulación/replay), 202+hook, 401 sin llamar al hook, 503/502, 405. |
| Studio | `cms/`: `npm run typecheck` · `schema:check[:local]` | Tipos reales de sanity v4; compilación estructural de esquemas. |
| e2e | `tests/e2e/api.spec.ts` | Webhook cerrado sin secreto sobre el servidor real. |

## 10. Variables (§38 — nombres canónicos)

| Variable | Lado | Uso |
|---|---|---|
| `CMS_API_URL` / `CMS_API_TOKEN` | Sitio (build) | Query GROQ + token *Viewer*. |
| `CMS_WEBHOOK_SECRET` | Sitio (runtime) | Firma HMAC de los webhooks. |
| `DEPLOY_HOOK_URL` | Sitio (runtime) | *Deploy hook* del hosting (DA-3). |
| `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` / `SANITY_STUDIO_PREVIEW_URL` | Studio (`cms/.env`) | Identidad del proyecto + preview. |
