# DESIGN SYSTEM — Sistema de Diseño de la Plataforma

> **Documento derivado del SSOT.** Este sistema de diseño implementa visualmente el `PROJECT_BIBLE.md` (v1.0.0). **No introduce estrategia nueva**: cada decisión se justifica con una referencia explícita al Bible (`[Bible §n]`). Si una decisión visual entra en conflicto con el Bible, prevalece el Bible.

| Metadato | Valor |
|---|---|
| **Documento** | `docs/DESIGN_SYSTEM.md` |
| **Versión** | 1.0.0 |
| **Estado** | 🟢 Alineado con el SSOT (Bible v1.0 oficial). ⚠️ **Tokens de marca provisionales** (paleta y tipografía) por depender de la hipótesis **H10** y del manual de marca pendiente `[Bible §44, §45]`; se sustituirán sin romper el sistema (arquitectura de tokens). |
| **Fecha** | 2026-07-08 |
| **Depende de** | `PROJECT_BIBLE.md` **v1.0 oficial (SSOT)** (§9, §16, §18, §20–§24, §35, §38, §46) |
| **Audiencia** | UX/UI, frontend, contenido, QA |

**Convención de trazabilidad:** toda regla lleva su justificación en línea con el formato `[Bible §n]`. Las decisiones que el Bible deja abiertas se marcan `⚠️ PROVISIONAL (H10)` y se sustituirán al aprobarse el manual de marca sin romper el sistema (por eso todo se define como **tokens** `[Bible §22]`).

---

## Tabla de contenidos

1. [Principios de diseño](#1-principios-de-diseño)
2. [Design tokens: fundamentos](#2-design-tokens-fundamentos)
3. [Color](#3-color)
4. [Tipografía](#4-tipografía)
5. [Espaciado y rejilla](#5-espaciado-y-rejilla)
6. [Responsive y breakpoints](#6-responsive-y-breakpoints)
7. [Iconografía](#7-iconografía)
8. [Elevación, bordes y superficies](#8-elevación-bordes-y-superficies)
9. [Animación y movimiento](#9-animación-y-movimiento)
10. [Estados interactivos](#10-estados-interactivos)
11. [Componentes](#11-componentes)
12. [Patrones de layout](#12-patrones-de-layout)
13. [Pantallas](#13-pantallas)
14. [Accesibilidad aplicada](#14-accesibilidad-aplicada)
15. [Gobernanza del sistema](#15-gobernanza-del-sistema)

---

## 1. Principios de diseño

Derivados directamente de los principios UX del Bible `[Bible §21]` y del posicionamiento «premium técnico con resultados medibles» `[Bible §1, §3]`:

| # | Principio | Qué significa | Origen |
|---|---|---|---|
| P1 | **Claridad sobre creatividad** | La información gana al ornamento. Nada de efectos que no comuniquen. | `[Bible §21]` |
| P2 | **Datos como estética** | Las cifras (kWh, %, €, plazos) son el elemento visual protagonista: grandes, tipográficas, verificables. El «premium» de una ingeniería es el rigor, no el brillo. | `[Bible §1, §3, §6]` |
| P3 | **Conversión visible, no agresiva** | Cada pantalla tiene un objetivo y un CTA principal claro; un solo CTA primario por vista. | `[Bible §21]` |
| P4 | **Sobriedad premium** | Mucho blanco, pocos colores, jerarquía tipográfica fuerte, fotografía real de proyectos. Premium = contención + precisión, no decoración. | `[Bible §22]` |
| P5 | **Rápido por diseño** | Ninguna decisión visual puede romper el performance budget (LCP < 2,5 s; < 1,5 MB). El diseño se valida contra CWV. | `[Bible §9, §18]` |
| P6 | **Accesible por defecto** | WCAG 2.2 AA es criterio de aceptación, no mejora posterior. Todo token de color nace con su ratio de contraste verificado. | `[Bible §9, §20]` |
| P7 | **Mobile-first real** | Se diseña primero el móvil; el desktop es la expansión, no al revés. | `[Bible §21, §23]` |
| P8 | **Consistencia por tokens** | Nada se estiliza ad hoc: color, tipo, espacio, radio, sombra y movimiento salen de tokens compartidos diseño↔código. | `[Bible §22, §30]` |

---

## 2. Design tokens: fundamentos

**Decisión.** Los tokens son la fuente única compartida entre diseño y desarrollo `[Bible §22]`, implementados como variables CSS/`theme` de Tailwind `[Bible §12]`. Tres niveles:

1. **Tokens primitivos** — valores brutos (`blue-700`, `space-4`). No se usan directamente en componentes.
2. **Tokens semánticos** — rol funcional (`color-action`, `text-primary`, `surface-raised`). **Es el único nivel que consumen los componentes.**
3. **Tokens de componente** — solo cuando un componente necesita excepciones documentadas (`button-primary-bg`).

**Justificación.** El nivel semántico permite sustituir la paleta provisional (H10) por la de marca definitiva **cambiando solo el mapeo primitivo→semántico**, sin tocar componentes `[Bible §44 H10, §45]`. También habilita temas (claro/oscuro) si se decidieran en el futuro `[Bible §22]`.

**Decisión sobre modo oscuro:** **diferido**. El Bible lo menciona como posibilidad habilitada por tokens, no como requisito `[Bible §22]`; el público B2B consulta mayoritariamente en contexto de oficina y el coste de duplicar verificación AA no se justifica en MVP. La arquitectura de tokens lo deja abierto. *(Alternativa descartada: lanzar con dark mode — coste de QA de contraste ×2 sin requisito que lo respalde.)*

---

## 3. Color

### 3.1 Filosofía

⚠️ **PROVISIONAL (H10)** — El Bible fija la dirección: *azul técnico primario, acento verde (sostenibilidad), neutros grises* `[Bible §22, §44 H10]`. Este sistema la concreta en valores verificados AA `[Bible §20]`, listos para ser sustituidos por el manual de marca.

Proporción de uso: **~80 % neutros / ~15 % azul / ~5 % verde**. El verde se reserva **exclusivamente para datos de sostenibilidad y éxito** (ahorros, métricas positivas, confirmaciones): así el color refuerza el territorio de marca «resultados con datos» en lugar de decorar `[Bible §1, §3]`.

### 3.2 Primitivos

| Token | Hex | Uso previsto |
|---|---|---|
| `blue-900` | `#0C2D48` | Fondos oscuros de bloque (hero alternativo, footer). |
| `blue-800` | `#1E40AF` | Texto sobre claro de máximo énfasis de marca. |
| `blue-700` | `#1D4ED8` | **Color de acción** (botones, enlaces). |
| `blue-600` | `#2563EB` | Hover/activos secundarios, iconos de marca. |
| `blue-100` | `#DBEAFE` | Fondos suaves de resaltado (chips, filas activas). |
| `blue-50`  | `#EFF6FF` | Fondos de sección alternos muy sutiles. |
| `green-700` | `#15803D` | **Acento sostenibilidad/éxito** (texto y métricas). |
| `green-600` | `#16A34A` | Iconos/gráficos grandes de éxito (no texto pequeño). |
| `green-50` | `#F0FDF4` | Fondo de bloques de métrica de ahorro. |
| `gray-900` | `#111827` | Texto principal. |
| `gray-600` | `#4B5563` | Texto secundario. |
| `gray-500` | `#6B7280` | Texto terciario/placeholder (mínimo permitido en cuerpo). |
| `gray-300` | `#D1D5DB` | Bordes y divisores. |
| `gray-100` | `#F3F4F6` | Superficies elevadas suaves, fondos de tarjeta alternos. |
| `gray-50`  | `#F9FAFB` | Fondo de secciones alternas. |
| `white` | `#FFFFFF` | Fondo base. |
| `red-600` | `#DC2626` | Error. |
| `amber-700` | `#B45309` | Aviso. |
| `blue-info` = `blue-700` | — | Información (reutiliza acción; evita paleta extra). |

### 3.3 Semánticos (los que usan los componentes)

| Token semántico | Mapea a | Contraste sobre su fondo | Cumple |
|---|---|---|---|
| `text-primary` | `gray-900` sobre `white` | 17,7:1 | AA/AAA ✅ |
| `text-secondary` | `gray-600` sobre `white` | 7,6:1 | AA/AAA ✅ |
| `text-muted` | `gray-500` sobre `white` | 4,8:1 | AA ✅ (mínimo; no usar en < 14 px) |
| `text-on-action` | `white` sobre `blue-700` | 6,3:1 | AA ✅ |
| `text-on-dark` | `white` sobre `blue-900` | 14,9:1 | AA/AAA ✅ |
| `color-action` | `blue-700` sobre `white` | 6,3:1 | AA ✅ |
| `color-action-hover` | `blue-800` | 8,6:1 | AA ✅ |
| `color-success-text` | `green-700` sobre `white` | 4,9:1 | AA ✅ |
| `color-error` | `red-600` sobre `white` | 4,5:1 | AA ✅ |
| `color-warning` | `amber-700` sobre `white` | 4,6:1 | AA ✅ |
| `border-default` | `gray-300` | 1,5:1 (no textual) | — |
| `focus-ring` | `blue-700`, 2 px + 2 px offset | ≥ 3:1 vs adyacentes | AA (2.2 · 2.4.13) ✅ |

**Reglas duras:**
- Prohibido texto informativo por debajo de 4,5:1 (3:1 solo texto grande ≥ 24 px/19 px bold) `[Bible §20]`.
- **El color nunca es el único portador de significado** (errores llevan icono + texto; enlaces en cuerpo llevan subrayado) `[Bible §20]`.
- `green-600` **no** se usa para texto pequeño (3,1:1): solo iconos grandes, barras y cifras ≥ 24 px.

*Alternativas descartadas:* paleta multicolor por servicio — descartada: fragmenta la marca y complica el AA; los servicios se diferencian por iconografía y fotografía, no por color `[Bible §22: consistencia]`.

---

## 4. Tipografía

### 4.1 Familia

⚠️ **PROVISIONAL (H10)** — El Bible pide *sans-serif geométrica, legible, de licencia abierta* `[Bible §22]`.

**Decisión: una única familia variable — `Inter` (variable font).**

**Justificación:**
- **Rendimiento:** una sola fuente variable (~48 kB woff2, subset latín) protege el presupuesto de < 1,5 MB y evita FOUT múltiple; se carga con `font-display: swap` y `preload` `[Bible §9, §18]`.
- **Legibilidad técnica:** Inter está diseñada para UI y cifras; incluye `tabular-nums`, esencial para las métricas alineadas de casos de éxito (P2).
- **Licencia abierta** (SIL OFL) `[Bible §22]`.

*Alternativas descartadas:* (a) *Par display+texto (p. ej. Manrope + Inter)* — descartado: +1 petición y +peso sin beneficio claro; la jerarquía se logra con peso y tamaño. (b) *Fuente del sistema* — descartada: pierde consistencia multiplataforma que exige una marca premium `[Bible §22]`.

### 4.2 Escala tipográfica (fluida, modular)

Escala base 16 px, razón ~1,25 en desktop, comprimida en móvil mediante `clamp()` (mobile-first, P7). Alturas de línea generosas para lectura técnica.

| Token | Móvil → Desktop | Peso | Line-height | Uso |
|---|---|---|---|---|
| `display` | 36 → 56 px | 700 | 1,1 | Titular de hero (solo Home y portadas). |
| `h1` | 30 → 40 px | 700 | 1,15 | Título de página. **Uno por página** `[Bible: SEO on-page heredado]`. |
| `h2` | 24 → 32 px | 700 | 1,2 | Título de sección. |
| `h3` | 20 → 24 px | 600 | 1,3 | Subsección / título de tarjeta. |
| `h4` | 18 → 20 px | 600 | 1,4 | Encabezados menores. |
| `body-lg` | 18 px | 400 | 1,6 | Entradillas, párrafos destacados. |
| `body` | 16 px | 400 | 1,6 | Texto base. **Nunca menor de 16 px en cuerpo.** |
| `body-sm` | 14 px | 400 | 1,5 | Metadatos, captions, breadcrumbs. |
| `label` | 14 px | 500 | 1,4 | Etiquetas de formulario, botones pequeños. |
| `overline` | 12→13 px | 600, tracking +0,08 em, mayúsculas | 1,3 | Kickers de sección («SERVICIOS», «CASO DE ÉXITO»). |
| `metric` | 40 → 64 px | 700, `tabular-nums` | 1,0 | **Cifras de resultados** (−32 %, 1,2 GWh). Protagonista visual (P2). |

**Reglas:**
- Longitud de línea objetivo 60–75 caracteres (`max-width: 68ch` en prosa) — legibilidad de contenido técnico largo `[Bible §21: escaneabilidad]`.
- Jerarquía de encabezados semántica y sin saltos (h1→h2→h3) `[Bible §20]`.
- Cifras de métricas siempre con unidad explícita y fuente del dato — «datos antes que adjetivos» `[Bible §1, §3]`.

---

## 5. Espaciado y rejilla

### 5.1 Escala de espaciado

Base **4 px**, prescrita por el Bible `[Bible §22]`:

`space-1`=4 · `space-2`=8 · `space-3`=12 · `space-4`=16 · `space-6`=24 · `space-8`=32 · `space-12`=48 · `space-16`=64 · `space-24`=96 · `space-32`=128

**Reglas de ritmo vertical:**
- Separación entre **secciones de página**: `space-24` móvil / `space-32` desktop. El aire generoso es parte del registro premium (P4).
- Separación interna de una sección (título→contenido): `space-8`/`space-12`.
- Padding interno de tarjetas: `space-6` (24 px).
- Prohibido cualquier valor fuera de escala (excepciones = deuda documentada en PR) `[Bible §22, §30]`.

### 5.2 Rejilla

**12 columnas** `[Bible §22]`, contenedor máximo **1200 px** con padding lateral `space-4` (móvil) / `space-6` (tablet) / `space-8` (desktop). Gutter: 16 px móvil, 24 px tablet, 32 px desktop.

**Justificación del máximo 1200 px:** mantiene la línea de texto ≤ 75 caracteres con la escala definida y encuadra bien tarjetas 3×4 columnas; anchos mayores degradan legibilidad de contenido técnico `[Bible §21]`. La prosa larga (artículos, fichas legales) se limita además a `68ch` centrado.

Layouts base: 12 col (full), 8+4 (contenido+aside), 6+6 (split hero), 4+4+4 (tarjetas), 3×(4) o 2×(6) según densidad.

---

## 6. Responsive y breakpoints

**Mobile-first**: los estilos base son móviles; los breakpoints solo **añaden** complejidad `[Bible §23]`.

| Token | Min-width | Racional |
|---|---|---|
| *(base)* | 320 px | Mínimo soportado `[Bible §9]`. |
| `sm` | 640 px | Tarjetas pasan de 1 a 2 columnas. |
| `md` | 768 px | Aparece navegación horizontal compacta; formularios a 2 columnas. |
| `lg` | 1024 px | Rejilla completa 12 col; mega-menú; layouts 8+4. |
| `xl` | 1280 px | Contenedor alcanza su máximo (1200 px); solo ajustes de aire. |

**Reglas** `[Bible §23]`:
- Breakpoints por **contenido**, no por dispositivos: si un componente rompe antes, se le da un ajuste propio.
- Imágenes: `srcset` + `sizes` obligatorios; dimensiones reservadas (`width/height` o `aspect-ratio`) para CLS < 0,1 `[Bible §9, §18]`.
- **Sin scroll horizontal del cuerpo en ningún viewport** (tablas y diagramas scrollean dentro de su propio contenedor).
- Objetivos táctiles ≥ 44×44 px en móvil; ≥ 24×24 px siempre (WCAG 2.2 · 2.5.8) `[Bible §20]`.
- Se verifica el rango completo 320 px–4K `[Bible §9]`.

---

## 7. Iconografía

**Decisión: set lineal open-source “Lucide”, rejilla 24×24, trazo 1,75 px, esquinas redondeadas, un solo color por icono (currentColor).**

**Justificación:** el Bible exige iconografía **lineal, consistente, técnica, sin ilustración “cartoon”** `[Bible §22]`. Lucide cumple (lineal, ~1500 iconos, licencia ISC, tree-shakeable → solo se empaqueta lo usado, protegiendo el performance budget `[Bible §18]`). `currentColor` garantiza que los iconos hereden contraste verificado del texto (P6).

**Reglas:**
- Tamaños permitidos: 16 / 20 / 24 / 32 px (alineados a la escala de 4 px).
- Iconos **siempre acompañan, nunca sustituyen** al texto en acciones (excepdía iconos universales con `aria-label`: cerrar, menú) `[Bible §20]`.
- Iconos por servicio (6 líneas `[Bible §24]`): elegir 6 metáforas técnicas consistentes (p. ej. industria=factory, energía=zap, renovables=sun, MEP=layers, consultoría=clipboard-check, BIM=box) — misma familia, mismo trazo.
- Decorativos: `aria-hidden="true"`.

*Alternativas descartadas:* iconos rellenos/duotono — descartados por contradecir la directriz lineal del Bible; set propio a medida — descartado en MVP por coste; reconsiderable con el manual de marca (H10).

---

## 8. Elevación, bordes y superficies

El registro premium-técnico (P4) pide **profundidad mínima**: la jerarquía se construye con espacio y tipografía, no con sombras dramáticas.

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 4 px | Inputs, chips, badges. |
| `radius-md` | 8 px | Botones, tarjetas. |
| `radius-lg` | 16 px | Imágenes destacadas, bloques hero, modales. |
| `radius-full` | 9999 px | Avatares, pills de filtro. |
| `shadow-none` | — | Por defecto. |
| `shadow-sm` | `0 1px 2px rgb(0 0 0 / .06)` | Tarjetas en reposo (opcional; puede bastar borde). |
| `shadow-md` | `0 4px 12px rgb(0 0 0 / .08)` | Hover de tarjetas interactivas, dropdowns. |
| `shadow-lg` | `0 12px 32px rgb(0 0 0 / .12)` | Modales, mega-menú. |

**Reglas:** superficies claras (`white`/`gray-50`) alternadas para ritmo de secciones; bloques de énfasis en `blue-900` con `text-on-dark` (máx. 1–2 por página para no perder sobriedad). Bordes `1px gray-300` como separador preferente sobre sombras.

---

## 9. Animación y movimiento

**Filosofía:** el movimiento **explica**, no entretiene. El Bible descarta explícitamente experiencias muy animadas por coste de rendimiento y accesibilidad `[Bible §21: alternativas descartadas]`.

| Token | Valor | Uso |
|---|---|---|
| `duration-fast` | 150 ms | Hover, focus, toggles. |
| `duration-base` | 250 ms | Aparición de dropdowns, acordeones, toasts. |
| `duration-slow` | 400 ms | Modales, transiciones de filtro de portfolio. |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entradas (por defecto). |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Cambios de estado en el sitio. |

**Reglas duras:**
- Solo se animan `transform` y `opacity` (compositor; sin layout thrash) — protege INP < 200 ms `[Bible §9, §18]`.
- **`prefers-reduced-motion: reduce`** desactiva toda animación no esencial y las sustituye por cambios instantáneos `[Bible §20]`.
- Prohibidos: parallax, autoplay de vídeo con movimiento continuo, carruseles automáticos, animaciones en scroll que bloqueen la lectura (P1, P5).
- Permitido y recomendado: *fade-up* sutil (8–12 px, una sola vez) al entrar secciones en viewport; contadores animados en métricas (`metric`) de 0 al valor — refuerza P2 — siempre con el valor final ya presente en el DOM para SEO y reduced-motion.
- Skeletons para cargas dinámicas (formularios, asistente IA) `[Bible §21: rendimiento percibido heredado]`.

---

## 10. Estados interactivos

Todo componente interactivo define **obligatoriamente** los 7 estados `[Bible §21: estados de formulario; §20: foco visible]`:

| Estado | Especificación global |
|---|---|
| **Default** | Según tokens del componente. |
| **Hover** | Cambio de color de fondo/borde en `duration-fast`; solo en dispositivos con puntero (`@media (hover:hover)`). |
| **Focus-visible** | Anillo `focus-ring` (2 px `blue-700`, offset 2 px) **idéntico en todo el sistema**; nunca `outline: none` sin sustituto. Foco no oculto por elementos fijos (WCAG 2.2 · 2.4.11). |
| **Active/Pressed** | Oscurecimiento un paso (`action-hover`) + `transform: scale(0.98)` opcional. |
| **Disabled** | `gray-300` fondo / `gray-500` texto, `cursor: not-allowed`, `aria-disabled`. Nunca ocultar la razón: si un submit está deshabilitado, el formulario muestra qué falta. |
| **Loading** | Spinner 20 px + texto («Enviando…»); el botón conserva su ancho (sin salto de layout, CLS). `aria-busy="true"`. |
| **Error** | Borde y texto `color-error` + icono + mensaje textual específico y accionable, vinculado por `aria-describedby` `[Bible §35: mensajes claros; §20]`. |
| **Success** | Confirmación `green-700` + icono check + texto (p. ej. tras envío de formulario) `[Bible §35]`. |

---

## 11. Componentes

Inventario alineado con el previsto en el Bible `[Bible §22: botones, tarjetas de servicio, tarjeta de caso, formularios, banners CTA]`, ampliado con lo exigido por las funcionalidades `[Bible §6, §8]` y la navegación `[Bible §24]`. Todos consumen tokens semánticos y cumplen la §10.

### 11.1 Acciones

**Botón primario** — Fondo `color-action`, texto `text-on-action`, `radius-md`, padding 12×24, `label`/16 px 600. **Uno por vista** (P3). Uso: «Solicitar propuesta» `[Bible §21: CTAs orientados a valor]`.
**Botón secundario** — Borde 1,5 px `color-action`, texto `color-action`, fondo transparente. Uso: acción alternativa («Ver casos de éxito»).
**Botón terciario/ghost** — Solo texto `color-action` + icono flecha; para acciones de baja jerarquía («Ver todos»).
**Enlace en prosa** — `color-action` + **subrayado siempre** (el color no puede ser el único indicador, §3.3).
Tamaños: `sm` 36 px alto · `md` 44 px · `lg` 52 px (hero). Altura mínima táctil §6.

### 11.2 Tarjetas

**Tarjeta de servicio** — Icono de servicio (32 px, `blue-600`) + `h3` + descripción 2 líneas + enlace terciario. Borde `gray-300`, hover: borde `blue-600` + `shadow-md` + flecha desplazada 4 px. Toda la tarjeta clicable con un único enlace accesible. `[Bible §6.2, §24]`
**Tarjeta de caso de éxito** — Imagen 16:9 (`radius-md` superior, `aspect-ratio` reservado) + chips de sector/servicio + `h3` + **1 métrica destacada en `metric` pequeño (`green-700` si es ahorro)** + cliente. La métrica en la tarjeta es obligatoria: es la prueba de la propuesta de valor (P2) `[Bible §3, §6]`.
**Tarjeta de artículo/recurso** — Imagen opcional + categoría (`overline`) + `h3` + fecha/tiempo de lectura (`body-sm`, `text-muted`). Variante «lead magnet» con badge «Guía descargable» `[Bible §8 RF-12/13]`.
**Tarjeta de métrica (stat)** — Cifra `metric` + unidad + etiqueta `body-sm` + fuente del dato. Fondo `green-50` cuando es ahorro/sostenibilidad; `gray-50` resto (§3.1).
**Tarjeta de persona (equipo)** — Foto real cuadrada (`radius-lg`), nombre `h4`, cargo + colegiación `body-sm` `[Bible §6.4: certificaciones/equipo]`.

### 11.3 Formularios `[Bible §8 RF-06/07/14, §21]`

**Input / Textarea / Select** — Alto 48 px, borde `gray-300`, `radius-sm`, fondo `white`; etiqueta **siempre visible encima** (nunca placeholder como única etiqueta `[Bible §20]`); texto de ayuda `body-sm text-muted`; error según §10.
**Checkbox / Radio** — 20 px, marca `blue-700`; texto clicable completo. Consentimiento RGPD como checkbox **no premarcado** con enlace a privacidad `[Bible §42 L1]`.
**Grupo de formulario** — Máximo de campos imprescindibles (minimización `[Bible §10, §21]`); validación en tiempo real *tras* blur del campo (no mientras se teclea), resumen de errores enfocable al enviar `[Bible §20]`.
**Formulario de propuesta (organismo)** — Campos: nombre, empresa, email, teléfono (opcional), servicio de interés (select con taxonomía única `[Bible §28]`), mensaje, consentimiento. Estados success («Gracias — te responderá un ingeniero en 24–48 h» + siguiente paso) y error con reintento sin perder lo escrito `[Bible §35: no perder leads]`.

### 11.4 Navegación `[Bible §24]`

**Header** — Barra 72 px desktop / 64 px móvil, fondo `white`, borde inferior `gray-300`; logo izquierda; navegación: Servicios (mega-menú), Proyectos, Sectores*, Sobre nosotros, Recursos, Contacto; **CTA primario «Solicitar propuesta» siempre visible a la derecha**. Sticky con sombra `shadow-sm` al hacer scroll. Versión móvil: hamburguesa → panel a pantalla completa con acordeón; CTA fijo al pie del panel.
**Mega-menú de servicios** — Panel `shadow-lg` con las 6 tarjetas de servicio en 2×3 (icono + nombre + descripción 1 línea) + enlace «Todos los servicios». Navegable por teclado (flechas/Escape), `aria-expanded`.
**Footer** — Fondo `blue-900`, `text-on-dark`: mapa reducido del sitio, contacto/NAP (consistencia SEO local `[Bible §15]`), certificaciones (logos monocromos), redes, legal, selector de idioma (oculto hasta activar i18n `[Bible §7, ADR-009]`).
**Breadcrumbs** — `body-sm`, separador «/», en páginas de nivel ≥ 2; con `BreadcrumbList` schema `[Bible §8 RF-11]`.
**Paginación / Filtros de portfolio** — Pills `radius-full` para sector/servicio/año (taxonomía única `[Bible §28]`); estado activo `blue-100` + `blue-800`; los filtros actualizan la URL (compartible/indexable).

### 11.5 Contenido y prueba social

**Banner CTA** — Bloque `blue-900` a ancho completo, titular `h2` blanco + subtítulo + botón primario invertido (fondo `white`, texto `blue-800`). Se inserta al final de cada página de servicio/caso (P3) `[Bible §5 CU-01→CU-03]`.
**Testimonio** — Cita `body-lg` + nombre, cargo y empresa reales + logo. Nunca anónimo (credibilidad `[Bible §3]`).
**Logo wall** — Logos de clientes en gris (`grayscale`), 5–6 por fila; hover restaura color (hover solo estético, no funcional).
**Acordeón FAQ** — Título `h3` como `<button>` con chevron rotatorio (`duration-fast`); contenido con `FAQPage` schema `[Bible §8 RF-11]`.
**Timeline de metodología** — Pasos numerados verticales (móvil) / horizontales (desktop) para la sección «metodología» de servicios `[Bible §6.2]`.
**Tabla técnica** — Cabecera `gray-50`, filas cebra opcionales, `tabular-nums`; scroll horizontal interno en móvil (§6).
**Badge/Chip** — `radius-full`, `body-sm`; variantes: sector (`gray-100`), servicio (`blue-100`), métrica-éxito (`green-50`/`green-700`).

### 11.6 Feedback y sistema

**Alert/Toast** — 4 variantes semánticas (§3.3) con icono + texto + cierre; toasts `duration-base`, auto-descarte 6 s, `role="status"`/`role="alert"`.
**Modal** — `radius-lg`, `shadow-lg`, overlay `rgb(0 0 0 / .5)`; foco atrapado, Escape cierra, retorno de foco al disparador `[Bible §20]`. Uso restringido (P1): confirmaciones y lead magnet.
**Skeleton** — Bloques `gray-100` con shimmer suave (desactivado con reduced-motion) para cargas del BFF (§9).
**Páginas de error 404/500** — Mensaje claro y útil + búsqueda + enlaces a Home/Servicios/Contacto; sin detalles técnicos `[Bible §35]`.

### 11.7 Asistente IA (widget) `[Bible §8 RF-15, §16]`

- **Disparador:** botón flotante inferior-derecha 56 px, icono búsqueda/chat, etiqueta «Pregúntanos» (texto visible en desktop; solo icono+`aria-label` en móvil). Discreto: no pulsa ni rebota (P1, §9).
- **Panel:** lateral derecho (móvil: hoja inferior a pantalla casi completa), cabecera con título «Asistente de [NOMBRE_EMPRESA]» y **aviso de IA**: «Respuestas generadas con IA a partir del contenido de este sitio» (transparencia `[Bible §16, §42 L4]`).
- **Respuestas:** burbujas neutras (`gray-50` asistente / `blue-50` usuario); **cada respuesta lista sus fuentes** como enlaces a las páginas de origen (RAG anclado a fuentes, obligatorio `[Bible §16, ADR-005]`); si no hay fuente: mensaje honesto + CTA de contacto (guardarraíl `[Bible §16]`).
- **Estados:** typing (tres puntos animados, ocultos con reduced-motion), error de límite («Hemos recibido muchas consultas, inténtalo en unos minutos») `[Bible §17: rate limiting]`, y siempre salida visible a contacto humano.
- Carga **perezosa** (isla que solo hidrata al abrir): coste JS cero en la carga inicial `[Bible §12, §18]`.

---

## 12. Patrones de layout

Plantillas reutilizables que combinan la rejilla (§5.2) y las secciones:

| Patrón | Estructura | Uso |
|---|---|---|
| **Hero estándar** | 6+6: titular `display`/`h1` + subtítulo + 2 CTAs (primario+secundario) a la izquierda; imagen real de proyecto a la derecha (móvil: apilado, imagen después del CTA para LCP de texto rápido). | Home, portadas de sección. |
| **Hero de página interior** | 12 col: `overline` + `h1` + entradilla `body-lg` sobre fondo `gray-50`; breadcrumbs encima. | Servicios, casos, recursos. |
| **Banda de métricas** | 4×(3 col) tarjetas stat sobre fondo `blue-900` o `green-50`. | Home, fichas de caso. (P2) |
| **Grid de tarjetas** | 3×(4 col) desktop → 2 → 1; gap `space-6`. | Servicios, portfolio, blog. |
| **Contenido + aside** | 8+4: prosa `68ch` + aside sticky (índice, CTA, datos clave). | Artículos, fichas de servicio. |
| **Split alternado** | Filas 6+6 alternando imagen/texto. | «Sobre nosotros», metodología. |
| **Banda CTA final** | 12 col `blue-900` (§11.5). | Cierre de casi toda página (P3). |
| **Formulario centrado** | 6 col centradas (máx. 640 px). | Contacto, candidatura, lead magnet. |

**Anatomía vertical de toda página:** Header sticky → Hero → [secciones] → Banda CTA → Footer. Ninguna página termina sin CTA (P3) salvo las legales.

---

## 13. Pantallas

Especificación de las pantallas del MVP y F2, derivadas del sitemap `[Bible §24]`, los casos de uso `[Bible §5]` y los requisitos `[Bible §8]`. Para cada una: objetivo (del Bible), estructura en orden y justificación.

### 13.1 Home (`/`) — RF-01, CU-01
**Objetivo:** comunicar la propuesta de valor y encaminar a servicio/caso/contacto en un vistazo `[Bible §2 B1, §21]`.
1. **Hero estándar**: titular con la propuesta («Ingeniería que rinde: proyectos medibles en energía, industria e instalaciones» — texto final pendiente de H11) + CTA primario «Solicitar propuesta» + secundario «Ver casos de éxito». Imagen real de proyecto (LCP optimizada: AVIF, `fetchpriority=high`).
2. **Logo wall** de clientes (prueba social temprana `[Bible §3]`).
3. **Banda de métricas** (4 stats agregadas: proyectos, GWh ahorrados, años, sectores) — P2.
4. **Grid de 6 tarjetas de servicio** con kicker «Qué hacemos» `[Bible §24]`.
5. **Casos destacados** (3 tarjetas de caso con métrica) + enlace «Todos los proyectos».
6. **Bloque diferencial** (split 6+6): sostenibilidad rentable + certificaciones `[Bible §1, §3]`.
7. **Testimonio** destacado.
8. **Últimos recursos** (3 tarjetas, si F2 activa) — omite sin hueco vacío en MVP.
9. **Banda CTA final**.

### 13.2 Página de servicio (`/servicios/{slug}`) ×6 — RF-02, CU-01
**Objetivo:** convertir interés en solicitud, siguiendo la plantilla fijada por el Bible `[Bible §6.2]`: problema → enfoque → metodología → entregables → normativa → casos → FAQ → CTA.
1. Hero interior (breadcrumbs + `h1` + entradilla con el **problema del cliente**).
2. «Nuestro enfoque» (prosa 68ch + aside sticky con: datos clave, certificaciones aplicables y **CTA secundario persistente**).
3. **Timeline de metodología** (§11.5).
4. **Entregables** (lista con iconos check `green-700`).
5. **Normativa aplicable** (tabla técnica) — diferenciador de rigor `[Bible §3]`.
6. **Casos relacionados** (2–3 tarjetas filtradas por la taxonomía única `[Bible §28]`).
7. **FAQ** (acordeón + schema).
8. Banda CTA final con texto específico del servicio.

### 13.3 Portfolio (`/proyectos`) — RF-03, CU-02
**Objetivo:** evidenciar solvencia con exploración filtrable `[Bible §5 CU-02]`.
1. Hero interior.
2. **Barra de filtros** (pills: sector / servicio / año; estado en URL) `[Bible §8 RF-03]`.
3. Grid de tarjetas de caso (12→2→1 col) con **métrica visible en cada tarjeta** (P2).
4. Estado vacío de filtro: mensaje + botón «Quitar filtros» (nunca página en blanco).
5. Banda CTA.

### 13.4 Ficha de caso (`/proyectos/{slug}`) — RF-04, CU-02
**Objetivo:** ser la unidad de prueba de la propuesta de valor `[Bible §3, §6.3]`.
1. Hero interior con chips de sector/servicio + cliente.
2. **Banda de métricas del proyecto** (3–4 stats: ahorro %, kWh, plazo, inversión/ROI si publicable) — primera pantalla: el dato antes que el relato (P2).
3. Contenido 8+4: reto → solución → resultados (prosa) + aside sticky (datos técnicos, servicios aplicados, CTA).
4. Galería de imágenes reales (lazy, dimensiones reservadas).
5. **Testimonio del cliente** del proyecto.
6. Casos relacionados (mismo sector).
7. Banda CTA («¿Un reto similar? Hablemos»).

### 13.5 Sobre nosotros (`/sobre-nosotros`) + Equipo + Certificaciones — RF-05
**Objetivo:** solvencia y confianza para compradores de cumplimiento (Persona B) y talento (Persona E) `[Bible §4]`.
- Split alternado: historia/valores con fotografía real del equipo `[Bible §22]`.
- Banda de métricas de empresa.
- Grid de tarjetas de persona (equipo) con colegiación.
- **Certificaciones**: grid de logos ISO + descripciones (crítico para Persona B/D `[Bible §4]`).
- Banda CTA + enlace a Empleo.

### 13.6 Recursos (`/recursos`, `/recursos/{slug}`) — RF-12/13, CU-04 (F2)
- Listado: grid de tarjetas de artículo + filtro por categoría; tarjetas «lead magnet» destacadas con badge.
- Artículo: hero interior + prosa 68ch + aside sticky (índice del artículo, CTA de guía relacionada) + autor real (E-E-A-T) + artículos relacionados.
- **Lead magnet**: bloque intercalado con formulario mínimo (email + consentimiento) `[Bible §8 RF-13, §42 L1]`.

### 13.7 Empleo (`/empleo`) — RF-14, CU-06 (F2)
- Hero con cultura (fotografía real) + valores.
- Lista de ofertas (tarjetas con ubicación/modalidad) + formulario de candidatura (§11.3, con adjunto CV; validación server-side `[Bible §17]`).
- Estado sin ofertas: candidatura espontánea (no página vacía).

### 13.8 Contacto (`/contacto`) — RF-06/07, CU-03
**Objetivo:** conversión con mínima fricción; es la pantalla más crítica del sitio `[Bible §2 B1]`.
- Layout 6+6: **formulario de propuesta** (§11.3) a la izquierda; a la derecha: datos NAP, mapa estático (imagen, no iframe pesado — performance P5), horario, teléfono clicable (`tel:`), y expectativa de respuesta («Te contesta un ingeniero, no un bot») `[Bible §21]`.
- Página de éxito/estado success con próximos pasos y enlaces a casos (mantiene el recorrido).

### 13.9 Legales (`/legal/*`) — RF-08
- Prosa 68ch, tipografía `body`, índice lateral; **sin CTA comercial** (única excepción a P3, por adecuación).
- Fecha de última actualización visible `[Bible §42]`.

### 13.10 Sistema: 404 / 500 / búsqueda
- **404/500** según §11.6 `[Bible §35]`.
- **Búsqueda** (RF-16, F2): overlay desde el header con resultados agrupados por tipo (servicio/caso/recurso); accesible por teclado.

### 13.11 Asistente IA (RF-15, F2)
- Widget global (§11.7) presente en todas las páginas públicas salvo legales.

**Matriz pantalla × requisito (verificación de cobertura):** Home→RF-01 · Servicio→RF-02 · Portfolio→RF-03 · Caso→RF-04 · Sobre nosotros→RF-05 · Contacto→RF-06/07 · Legales→RF-08 · Recursos→RF-12/13 · Empleo→RF-14 · Asistente→RF-15 · Búsqueda→RF-16. Los RF-09/10/11 (CMS, analítica, SEO técnico) no tienen pantalla propia: son transversales. **Cobertura completa del alcance MVP+F2 sin pantallas huérfanas.**

---

## 14. Accesibilidad aplicada

Síntesis operativa (el marco normativo está en `[Bible §20]`):

- **Contraste:** todos los pares de tokens de §3.3 nacen verificados; ningún par nuevo entra al sistema sin ratio documentado.
- **Teclado:** orden de tabulación = orden visual; skip-link «Saltar al contenido» como primer elemento; mega-menú y modales con gestión de foco (§11.4, §11.6).
- **Formularios:** etiquetas visibles, errores textuales vinculados, resumen enfocable (§11.3).
- **Movimiento:** reduced-motion global (§9).
- **Semántica:** landmarks (`header/nav/main/footer`), un `h1` por página (§4.2), `alt` significativo en imágenes de proyecto (describe el proyecto, no «imagen de obra»).
- **Táctil:** objetivos §6.
- **Verificación:** axe en CI (bloqueante) + auditoría manual de las pantallas §13.1–13.4 y 13.8 antes de lanzar `[Bible §32]`.

---

## 15. Gobernanza del sistema

- **Fuente de tokens:** un único archivo de tokens (`config/`) consumido por Tailwind y documentado; cambiarlo exige PR revisado `[Bible §29, §30]`.
- **Biblioteca de componentes:** cada componente de §11 se documenta (Storybook u equivalente) con sus 7+ estados (§10) antes de considerarse «hecho» (DoD `[Bible §29]`).
- **Al llegar el manual de marca (cierra H10):** se sustituyen los primitivos de color/tipografía y se re-verifica la tabla de contraste §3.3; los componentes no se tocan (§2). El documento pasa a 🟢 y v1.1.0.
- **Nuevos componentes:** deben justificar por qué ningún componente existente sirve (evita duplicidad, coherente con el espíritu SSOT `[Bible §29]`).
- **QA visual:** Lighthouse ≥ 90 y axe sin bloqueantes son criterios de aceptación también para cambios «solo visuales» `[Bible §9, §32]`.

---

> **Trazabilidad completa:** este sistema no añade funcionalidades, páginas ni mensajes de negocio no presentes en el Bible; concreta visualmente §21–§24 dentro de las restricciones de §9 (calidad), §18 (rendimiento), §20 (accesibilidad) y §16 (IA con fuentes). Las únicas decisiones nuevas son de ejecución visual (valores de tokens, set de iconos, patrones de layout) y quedan todas justificadas arriba y sujetas a H10.
