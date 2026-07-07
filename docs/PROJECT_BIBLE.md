# PROJECT BIBLE — Documento Maestro

> **Fuente única de verdad (Single Source of Truth).** Este documento gobierna todas las fases posteriores del proyecto: diseño, desarrollo, SEO, automatización y marketing. Cualquier decisión que contradiga este documento debe, o bien alinearse con él, o bien actualizarlo mediante el proceso de cambios descrito en la sección [16](#16-gobernanza-del-documento).

| Metadato | Valor |
|---|---|
| **Nombre del documento** | PROJECT_BIBLE.md |
| **Versión** | 0.1.0 (borrador inicial) |
| **Estado** | 🟡 En revisión — pendiente de validar supuestos |
| **Última actualización** | 2026-07-07 |
| **Responsable (owner)** | Dirección / Cliente *(por confirmar)* |
| **Ámbito** | Sitio web corporativo + base para automatización y marketing |

---

## Tabla de contenidos

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Visión, misión y valores](#2-visión-misión-y-valores)
3. [Propuesta de valor](#3-propuesta-de-valor)
4. [Identidad de marca](#4-identidad-de-marca)
5. [Servicios](#5-servicios)
6. [Clientes objetivo (Buyer Personas)](#6-clientes-objetivo-buyer-personas)
7. [Análisis de competencia](#7-análisis-de-competencia)
8. [Posicionamiento](#8-posicionamiento)
9. [Tono y estilo de comunicación](#9-tono-y-estilo-de-comunicación)
10. [Requisitos funcionales](#10-requisitos-funcionales)
11. [Requisitos no funcionales](#11-requisitos-no-funcionales)
12. [Arquitectura de la información](#12-arquitectura-de-la-información)
13. [Estrategia SEO](#13-estrategia-seo)
14. [Stack tecnológico recomendado](#14-stack-tecnológico-recomendado)
15. [Convenciones de desarrollo](#15-convenciones-de-desarrollo)
16. [Reglas UX/UI](#16-reglas-uxui)
17. [Estrategia de automatización y marketing](#17-estrategia-de-automatización-y-marketing)
18. [Roadmap](#18-roadmap)
19. [Riesgos](#19-riesgos)
20. [Supuestos](#20-supuestos)
21. [Criterios de éxito (KPIs)](#21-criterios-de-éxito-kpis)
22. [Gobernanza del documento](#22-gobernanza-del-documento)
23. [Glosario](#23-glosario)

---

> ### ⚠️ Nota sobre supuestos
> No se proporcionaron datos concretos de la empresa (nombre comercial, subsector de ingeniería, ciudad, tamaño, catálogo de servicios real). Para que este documento sea accionable, se han adoptado supuestos razonables y **coherentes entre sí**, marcados en el texto con la etiqueta **`[SUPUESTO]`** y consolidados en la [sección 20](#20-supuestos). Sustituya cada supuesto por el dato real antes de aprobar el documento (`Estado → 🟢 Aprobado`).

---

## 1. Resumen ejecutivo

**`[SUPUESTO]`** El proyecto consiste en el diseño y desarrollo del sitio web corporativo de **«Ingeniería [NOMBRE]»**, una consultora de ingeniería española de tamaño medio (30–80 personas) con sede principal en España y vocación internacional, especializada en **ingeniería industrial, energética y de instalaciones** con foco en eficiencia energética, transición sostenible y digitalización de proyectos.

El sitio web no es un folleto estático: es la **infraestructura central de captación, credibilidad y conversión** de la empresa. Debe (1) transmitir autoridad técnica, (2) generar leads cualificados B2B, (3) servir de repositorio de casos de éxito y (4) actuar como base de datos estructurada para las fases posteriores de SEO, automatización de marketing y ventas.

**Objetivo de negocio primario:** aumentar la generación de oportunidades comerciales cualificadas (RFP/RFQ, solicitudes de propuesta) desde canal digital.

**Horizonte:** MVP en **8–10 semanas**; plataforma completa y optimizada en **6 meses**.

---

## 2. Visión, misión y valores

### 2.1 Visión
> Ser la referencia en ingeniería española que combina **excelencia técnica y compromiso con la sostenibilidad**, reconocida por proyectos que son a la vez eficientes, rentables y responsables con el planeta.

### 2.2 Misión
> Diseñar, calcular y ejecutar soluciones de ingeniería que resuelvan problemas complejos de nuestros clientes con rigor, transparencia y visión a largo plazo, apoyándonos en la mejor ingeniería y en la tecnología disponible.

### 2.3 Valores

| Valor | Qué significa en la práctica |
|---|---|
| **Rigor técnico** | Cálculos verificables, normativa vigente, cero improvisación. |
| **Transparencia** | Presupuestos claros, plazos realistas, comunicación honesta del riesgo. |
| **Sostenibilidad** | Cada proyecto evalúa su impacto energético y ambiental. |
| **Compromiso** | Acompañamos al cliente del anteproyecto a la puesta en marcha. |
| **Innovación aplicada** | Adoptamos tecnología (BIM, gemelos digitales, IA) cuando aporta valor real, no por moda. |

*Todos los enunciados anteriores están marcados implícitamente como **`[SUPUESTO]`** hasta validación de dirección.*

---

## 3. Propuesta de valor

### 3.1 Propuesta de valor central (Value Proposition Statement)

> **Para** responsables de operaciones, plantas industriales y promotores **que necesitan** ejecutar proyectos de ingeniería complejos con garantías, **«Ingeniería [NOMBRE]»** es una consultora que **entrega proyectos técnicamente impecables, en plazo y optimizados energéticamente**, **a diferencia de** las grandes ingenierías impersonales o los estudios pequeños sin capacidad, **porque** combinamos la cercanía de un equipo dedicado con la solvencia de una firma consolidada y métricas verificables de ahorro.

### 3.2 Pilares de valor (los 4 mensajes que el sitio debe demostrar)

1. **Rigor demostrable** — casos de éxito con datos reales (kWh ahorrados, €, plazos cumplidos).
2. **Especialización sectorial** — no hacemos «de todo»; dominamos nuestros nichos.
3. **Sostenibilidad rentable** — la eficiencia energética como retorno de inversión, no como coste.
4. **Acompañamiento integral** — un único interlocutor de principio a fin del proyecto.

### 3.3 Prueba (cómo se sustancia en el sitio)
Certificaciones (ISO 9001/14001/45001 *`[SUPUESTO]`*), colegiación profesional, portfolio con métricas, testimonios nominales, logos de clientes, premios y participación en asociaciones sectoriales.

---

## 4. Identidad de marca

### 4.1 Personalidad de marca
Profesional, fiable, técnica pero accesible. Arquetipos dominantes: **El Sabio** (conocimiento, autoridad) + **El Creador** (soluciones a medida). Evita el arquetipo «Héroe agresivo» propio del marketing de consumo.

### 4.2 Identidad verbal
- **Nombre:** *`[SUPUESTO — pendiente]`*
- **Tagline propuesto (borrador):** «Ingeniería que rinde. Hoy y mañana.» *`[SUPUESTO]`*
- **Idiomas:** Español (principal), Inglés (internacional). Considerar catalán/portugués en fase 2 según mercados. *`[SUPUESTO]`*

### 4.3 Identidad visual (directrices; el manual de marca completo es entregable aparte)

> **`[SUPUESTO]`** — A falta de manual de marca, se proponen las siguientes directrices como punto de partida. **No usar en producción sin validación de diseño.**

| Elemento | Directriz |
|---|---|
| **Paleta primaria** | Azul técnico/corporativo (confianza, ingeniería) como color de marca. |
| **Paleta secundaria** | Verde (sostenibilidad) como acento. Neutros (grises) para estructura. |
| **Tipografía** | Sans-serif geométrica y legible para UI (p. ej. Inter, Manrope o similar de licencia abierta). Jerarquía clara. |
| **Iconografía** | Lineal, consistente, técnica. Sin ilustraciones «cartoon». |
| **Fotografía** | Proyectos reales > banco de imágenes. Personas reales del equipo. |
| **Contraste** | Cumplir WCAG 2.2 AA como mínimo (ver [§16](#16-reglas-uxui)). |

### 4.4 Uso incorrecto
No deformar el logo, no usar sobre fondos de bajo contraste, no combinar con tipografías ajenas al sistema, no usar imágenes de stock genéricas de «gente de negocios sonriendo».

---

## 5. Servicios

> **`[SUPUESTO]`** — Catálogo propuesto según el posicionamiento asumido. Ajustar a la cartera real.

### 5.1 Líneas de servicio

| # | Servicio | Descripción breve | Entregables típicos |
|---|---|---|---|
| S1 | **Ingeniería industrial** | Diseño y optimización de plantas, procesos y líneas productivas. | Proyectos, layouts, cálculos, dirección de obra. |
| S2 | **Eficiencia energética** | Auditorías, certificación y proyectos de ahorro. | Auditoría energética, plan de medidas, certificados. |
| S3 | **Energías renovables** | Fotovoltaica, autoconsumo, almacenamiento. | Proyecto, legalización, dirección facultativa. |
| S4 | **Instalaciones (MEP)** | Climatización, electricidad, PCI, fontanería. | Proyectos de instalaciones, cálculos, BIM. |
| S5 | **Consultoría y due diligence técnica** | Asesoría, viabilidad, informes periciales. | Informes técnicos, dictámenes. |
| S6 | **Digitalización / BIM** | Modelado, gemelos digitales, gestión de activos. | Modelos BIM, coordinación, gestión de datos. |

### 5.2 Estructura de cada página de servicio (plantilla)
Problema del cliente → Enfoque de la empresa → Metodología (fases) → Entregables → Normativa aplicable → Casos relacionados → Preguntas frecuentes → CTA (solicitar propuesta).

---

## 6. Clientes objetivo (Buyer Personas)

> **`[SUPUESTO]`** — Personas B2B representativas. Validar con el equipo comercial.

### Persona A — «Director de Planta / Operaciones» (comprador técnico)
- **Contexto:** industria manufacturera, energía o logística. Presiona por reducir costes energéticos y evitar paradas.
- **Objetivos:** fiabilidad, ROI, cumplimiento normativo.
- **Dolores:** proveedores que incumplen plazos, propuestas opacas.
- **Qué busca en el sitio:** casos con datos, capacidad técnica, referencias del sector.

### Persona B — «Responsable de Compras / Contratación»
- **Objetivos:** solvencia, certificaciones, cumplimiento, precio competitivo.
- **Qué busca:** acreditaciones, tamaño de la empresa, capacidad de respuesta.

### Persona C — «Promotor / Property Manager»
- **Contexto:** promoción inmobiliaria, terciario, retail.
- **Qué busca:** portfolio visual, plazos, gestión integral de licencias.

### Persona D — «Administración pública / licitaciones»
- **Qué busca:** experiencia en obra pública, clasificación de contratista, referencias verificables.

**Mapa de decisión:** en B2B intervienen 3–5 personas (comité de compra). El sitio debe servir a **cada rol** con contenido específico (técnico, financiero, de cumplimiento).

---

## 7. Análisis de competencia

> **`[SUPUESTO]`** — Marco de análisis y arquetipos competitivos. Sustituir por nombres reales tras un benchmarking de 8–12 competidores directos.

### 7.1 Tipología de competidores

| Tipo | Fortalezas | Debilidades explotables |
|---|---|---|
| **Grandes ingenierías nacionales** | Marca, capacidad, referencias. | Impersonales, caras, lentas, poco cercanas. |
| **Estudios locales pequeños** | Cercanía, precio. | Poca capacidad, web pobre, sin métricas. |
| **Consultoras energéticas puras** | Foco, agilidad. | Alcance limitado, no cubren proyecto integral. |
| **Ingenierías internacionales** | Metodología, tecnología. | Menos conocimiento de normativa local española. |

### 7.2 Ejes de comparación (plantilla de benchmarking)
Para cada competidor real, evaluar (0–5): calidad web, SEO (visibilidad orgánica), casos de éxito publicados, claridad de servicios, presencia en LinkedIn, velocidad de carga, propuesta de valor diferenciada, generación de contenido/blog.

### 7.3 Hallazgo estratégico (hipótesis)
**Oportunidad detectada `[SUPUESTO]`:** la mayoría de webs de ingeniería españolas son técnicamente correctas pero **débiles en storytelling de resultados, SEO y captación**. Un sitio orientado a **datos, casos y conversión** genera ventaja competitiva significativa a bajo coste relativo.

---

## 8. Posicionamiento

### 8.1 Declaración de posicionamiento
> Ingeniería de **especialidad y resultados medibles** para empresas que quieren la solvencia de una gran firma con la cercanía de un equipo dedicado, con la **eficiencia energética y la sostenibilidad** como sello diferencial.

### 8.2 Mapa de posicionamiento
- **Eje X:** Generalista ←→ Especialista → *nos situamos en Especialista.*
- **Eje Y:** Commodity/precio ←→ Valor/resultados → *nos situamos en Valor.*

### 8.3 Territorio de marca a apropiar
**«Ingeniería que ahorra energía y dinero, con datos.»** Todo el contenido refuerza este territorio.

---

## 9. Tono y estilo de comunicación

### 9.1 Principios
- **Claro antes que técnico**: explicar como a un directivo inteligente, no a un tribunal de tesis.
- **Datos antes que adjetivos**: «reducimos un 32 % el consumo» > «gran ahorro».
- **Honesto**: no prometer lo que no se puede cumplir.
- **Cercano y profesional**: trato de «usted» institucional en textos formales; «tú» permitido en blog/redes según canal *`[SUPUESTO — decisión de marca]`*.

### 9.2 Guía rápida (Do / Don't)

| ✅ Hacer | ❌ Evitar |
|---|---|
| Frases cortas, voz activa. | Jerga innecesaria, siglas sin explicar. |
| Verbos de acción y resultado. | Superlativos vacíos («los mejores»). |
| Cifras y unidades correctas. | Promesas absolutas o sin respaldo. |
| Consistencia terminológica. | Anglicismos gratuitos. |

### 9.3 Microcopy y CTAs
CTAs orientados a valor: **«Solicitar propuesta»**, **«Hablar con un ingeniero»**, **«Ver casos de éxito»**. Evitar genéricos («Enviar», «Más info»).

---

## 10. Requisitos funcionales

> Notación: **`[MUST]`** imprescindible MVP · **`[SHOULD]`** deseable · **`[COULD]`** futuro (MoSCoW).

### 10.1 Público / marketing
- **RF-01 `[MUST]`** Home con propuesta de valor, servicios destacados y CTA principal.
- **RF-02 `[MUST]`** Página por cada línea de servicio (plantilla §5.2).
- **RF-03 `[MUST]`** Portfolio / casos de éxito filtrable por sector y servicio.
- **RF-04 `[MUST]`** Ficha de caso de éxito con métricas, imágenes y testimonio.
- **RF-05 `[MUST]`** Página «Sobre nosotros» (equipo, historia, certificaciones).
- **RF-06 `[MUST]`** Formulario de contacto / solicitud de propuesta con validación.
- **RF-07 `[MUST]`** Página de contacto con datos, mapa y horarios.
- **RF-08 `[SHOULD]`** Blog / centro de recursos (artículos técnicos, guías).
- **RF-09 `[SHOULD]`** Página de empleo / «Trabaja con nosotros» + formulario de candidatura.
- **RF-10 `[SHOULD]`** Descarga de recursos (whitepapers) con captación de email (lead magnet).
- **RF-11 `[COULD]`** Calculadora interactiva (p. ej. ahorro energético estimado).
- **RF-12 `[COULD]`** Portal de cliente / área privada de seguimiento de proyecto.
- **RF-13 `[COULD]`** Multi-idioma (ES/EN) con conmutador.

### 10.2 Sistema / plataforma
- **RF-14 `[MUST]`** Gestión de contenido (CMS) para editar servicios, casos y blog sin desarrollador.
- **RF-15 `[MUST]`** Envío de formularios a email + almacenamiento + integración CRM.
- **RF-16 `[MUST]`** Consentimiento de cookies (RGPD) y gestión de preferencias.
- **RF-17 `[SHOULD]`** Búsqueda interna de contenidos.
- **RF-18 `[SHOULD]`** Sitemap XML y feeds automáticos.
- **RF-19 `[COULD]`** Automatización marketing (secuencias email, scoring de leads).

### 10.3 Legal / cumplimiento
- **RF-20 `[MUST]`** Aviso legal, Política de privacidad, Política de cookies (LSSI-CE + RGPD/LOPDGDD).
- **RF-21 `[MUST]`** Registro de consentimientos de formularios.

---

## 11. Requisitos no funcionales

| Categoría | Requisito | Objetivo medible |
|---|---|---|
| **Rendimiento** | Web rápida | LCP < 2,5 s · INP < 200 ms · CLS < 0,1 (Core Web Vitals «Good») en móvil P75. |
| **Rendimiento** | Peso de página | < 1,5 MB por vista inicial; imágenes en formatos modernos (AVIF/WebP). |
| **Disponibilidad** | Uptime | ≥ 99,9 % mensual. |
| **Accesibilidad** | Estándar | **WCAG 2.2 nivel AA**. |
| **SEO técnico** | Indexabilidad | 100 % de páginas clave indexables; datos estructurados válidos. |
| **Seguridad** | Transporte | HTTPS/TLS obligatorio, HSTS, cabeceras de seguridad (CSP, X-Frame-Options). |
| **Seguridad** | Protección | Antispam en formularios, rate limiting, protección DDoS/CDN. |
| **Privacidad** | RGPD | Consentimiento previo, minimización de datos, DPA con proveedores. |
| **Escalabilidad** | Tráfico | Soportar picos ×10 sin degradación (CDN + caché). |
| **Mantenibilidad** | Código | Cobertura de tests en lógica crítica; CI verde obligatorio para desplegar. |
| **Compatibilidad** | Navegadores | Últimas 2 versiones de Chrome, Firefox, Safari, Edge; responsive 320px–4K. |
| **Observabilidad** | Monitorización | Logs, alertas de caída, analítica de rendimiento y errores. |
| **i18n** | Internacionalización | Arquitectura preparada para multi-idioma aunque se lance en ES. |
| **Backups** | Recuperación | Backup diario, RPO ≤ 24 h, RTO ≤ 4 h. |

---

## 12. Arquitectura de la información

### 12.1 Mapa del sitio (sitemap lógico)

```
/  (Home)
├── /servicios
│   ├── /servicios/ingenieria-industrial
│   ├── /servicios/eficiencia-energetica
│   ├── /servicios/energias-renovables
│   ├── /servicios/instalaciones-mep
│   ├── /servicios/consultoria-tecnica
│   └── /servicios/digitalizacion-bim
├── /proyectos            (portfolio filtrable)
│   └── /proyectos/{slug} (caso de éxito)
├── /sectores             (opcional: industria, terciario, público…)
├── /sobre-nosotros
│   ├── /sobre-nosotros/equipo
│   └── /sobre-nosotros/certificaciones
├── /recursos             (blog / guías)
│   └── /recursos/{slug}
├── /empleo
├── /contacto
└── /legal
    ├── /legal/aviso-legal
    ├── /legal/privacidad
    └── /legal/cookies
```

### 12.2 Navegación
- **Header:** Servicios (mega-menú), Proyectos, Sectores, Sobre nosotros, Recursos, Contacto + CTA destacado «Solicitar propuesta».
- **Footer:** mapa reducido, datos de contacto, redes, legal, certificaciones, selector de idioma.
- **Profundidad máxima:** 3 clics desde Home a cualquier contenido clave.

### 12.3 Taxonomía de contenidos
- **Casos de éxito** etiquetados por: `sector`, `servicio`, `ubicación`, `año`, `métricas`.
- **Recursos** por: `categoría`, `servicio relacionado`, `tipo` (artículo/guía/nota técnica).

---

## 13. Estrategia SEO

### 13.1 Objetivos
Posicionar por intención **comercial y de especialidad**, no solo por marca. Convertir el sitio en fuente de leads orgánicos.

### 13.2 Arquitectura SEO — clústeres temáticos (topic clusters)

| Página pilar (pillar) | Contenido de apoyo (cluster) |
|---|---|
| Eficiencia energética industrial | auditoría energética, ISO 50001, ahorro en climatización, casos con ROI. |
| Autoconsumo fotovoltaico | legalización, subvenciones, almacenamiento, amortización. |
| Instalaciones MEP | PCI, climatización eficiente, BIM MEP, normativa CTE/RITE. |

### 13.3 Investigación de palabras clave (marco)
Combinar: **`[servicio] + [sector] + [ubicación]`** (p. ej. «ingeniería eficiencia energética industria [ciudad]»). Priorizar **long-tail** transaccional con intención comercial sobre términos genéricos de alto volumen. *`[SUPUESTO]` — el keyword research real es entregable de fase 1.*

### 13.4 SEO on-page (checklist obligatorio por página)
- Un solo `<h1>` con keyword principal.
- `title` (≤ 60 car.) y `meta description` (≤ 155 car.) únicos y persuasivos.
- URLs limpias, semánticas, en minúsculas y con guiones.
- Encabezados jerárquicos (h2/h3) semánticos.
- Enlazado interno hacia pilares y casos relacionados.
- Alt text descriptivo en todas las imágenes.
- Contenido original ≥ 600 palabras en páginas clave.

### 13.5 SEO técnico
- Datos estructurados **Schema.org**: `Organization`, `LocalBusiness`, `Service`, `Article`, `BreadcrumbList`, `FAQPage`.
- `sitemap.xml` + `robots.txt` correctos; canónicas; sin contenido duplicado.
- Core Web Vitals en verde (ver §11).
- Renderizado SSR/SSG para indexación completa.
- `hreflang` cuando se active multi-idioma.

### 13.6 SEO local
Perfil de **Google Business Profile** optimizado, NAP (Name-Address-Phone) consistente, reseñas, páginas de sedes si hay varias.

### 13.7 Off-page / autoridad
Notas técnicas de calidad enlazables, presencia en medios sectoriales, colaboración con asociaciones, perfil de LinkedIn corporativo activo.

### 13.8 Medición
Search Console + analítica sin cookies o con consentimiento; seguimiento de posiciones, CTR, conversiones orgánicas.

---

## 14. Stack tecnológico recomendado

> Recomendación con alternativas. La elección final depende del perfil del equipo de mantenimiento y del presupuesto. **`[SUPUESTO]` — decisión pendiente de aprobar.**

### 14.1 Opción recomendada (equilibrio rendimiento/SEO/DX)

| Capa | Recomendación | Alternativa | Motivo |
|---|---|---|---|
| **Framework** | **Astro** (con islas React) | Next.js | SSG por defecto = máxima velocidad y SEO; ideal para sitio de contenido. |
| **UI / componentes** | React + TypeScript | Vue/Svelte | Ecosistema, contratación, tipado. |
| **Estilos** | Tailwind CSS + tokens de diseño | CSS Modules | Consistencia, velocidad, mantenibilidad. |
| **CMS** | Headless (Strapi / Sanity / Storyblok) | WordPress headless | Edición sin tocar código; separación contenido/presentación. |
| **Formularios/backend** | Serverless (funciones edge) + servicio de email | Backend Node dedicado | Coste bajo, escalable, sin servidor que mantener. |
| **Base de datos** | PostgreSQL gestionado *(solo si hay área privada)* | — | Estándar, fiable. |
| **Hosting/deploy** | Plataforma de despliegue con CDN global (Vercel/Netlify/Cloudflare) | VPS + Nginx | Deploy continuo, CDN, HTTPS automático. |
| **Analítica** | Analítica respetuosa con privacidad (p. ej. Plausible) o GA4 con consentimiento | Matomo self-hosted | RGPD-friendly. |
| **CRM/Marketing** | HubSpot / Brevo / Pipedrive | — | Captación y nurturing de leads. |
| **Búsqueda** | Pagefind (estático) / Algolia | — | Búsqueda rápida sin backend pesado. |

### 14.2 Alternativa «bajo mantenimiento no técnico»
Si el equipo no es técnico: **WordPress** con tema a medida ligero + plugins mínimos (SEO, caché, formularios, RGPD) y hosting gestionado. Menor control de rendimiento, mayor autonomía editorial.

### 14.3 Herramientas transversales
Git + GitHub, CI/CD (GitHub Actions), gestor de dependencias, ESLint/Prettier, Lighthouse CI, gestor de secretos.

---

## 15. Convenciones de desarrollo

### 15.1 Control de versiones
- **Ramas:** `main` (producción, protegida) · `develop` *(opcional)* · `feat/*`, `fix/*`, `chore/*`, `docs/*`.
- **Pull Requests obligatorios** con al menos 1 revisión y CI en verde para fusionar.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) → `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

### 15.2 Estructura del repositorio (ya inicializada)

```
/docs        Documentación del proyecto (incluye este PROJECT_BIBLE.md)
/src         Código fuente de la aplicación
/public      Recursos servidos tal cual (favicon, robots.txt, sitemap)
/assets      Recursos de diseño (imágenes fuente, logos, iconos)
/config      Configuración (entornos, linters, build)
/tests       Pruebas automatizadas
/scripts     Scripts de utilidad y automatización
/.github     Workflows de CI/CD y plantillas
/.vscode     Configuración recomendada del editor
```

### 15.3 Calidad de código
- **TypeScript** en modo estricto.
- **Linter + formateador** obligatorios (ESLint + Prettier), ejecutados en pre-commit y en CI.
- **Convención de nombres:** componentes `PascalCase`, funciones/variables `camelCase`, constantes `UPPER_SNAKE_CASE`, archivos de componente `PascalCase.tsx`, utilidades `kebab-case.ts`.
- **Componentes pequeños y con una sola responsabilidad**; lógica reutilizable en hooks/utils.

### 15.4 Testing
- **Unitarias** para lógica y utilidades.
- **Integración** para formularios y flujos críticos.
- **E2E** (Playwright) para rutas clave (contacto, envío de propuesta).
- **Accesibilidad automatizada** (axe) en CI.
- CI ejecuta lint + tests + build + Lighthouse antes de permitir merge.

### 15.5 Definición de «Hecho» (Definition of Done)
Una tarea está terminada cuando: código revisado y fusionado, tests pasan, sin regresiones de accesibilidad/rendimiento, contenido cargado, documentación actualizada, y desplegado en entorno de *staging* validado.

### 15.6 Entornos
`local` → `staging` (preproducción, no indexable) → `production`. Variables de entorno por entorno, nunca secretos en el repositorio.

---

## 16. Reglas UX/UI

### 16.1 Principios de experiencia
- **Claridad sobre creatividad**: el usuario B2B busca información, no efectos.
- **Orientación a conversión**: cada página tiene un objetivo y un CTA claro.
- **Escaneabilidad**: títulos, listas, datos destacados; no muros de texto.
- **Mobile-first** y responsive real (no solo «que quepa»).

### 16.2 Sistema de diseño
- **Design tokens** para color, tipografía, espaciado, radios y sombras — fuente única compartida con desarrollo.
- **Rejilla** de 12 columnas; espaciado en escala (4/8 px).
- **Componentes reutilizables** documentados (idealmente en Storybook): botones, tarjetas de servicio, tarjeta de caso, formularios, banners de CTA.

### 16.3 Accesibilidad (obligatoria, WCAG 2.2 AA)
- Contraste texto ≥ 4,5:1 (≥ 3:1 texto grande).
- Navegable por teclado; foco visible.
- Alt text, etiquetas de formulario, mensajes de error accesibles.
- Respetar `prefers-reduced-motion`.
- HTML semántico y landmarks ARIA cuando corresponda.

### 16.4 Reglas de formularios
- Mínimos campos posibles; validación en tiempo real y mensajes claros.
- Estados visibles: normal, foco, error, éxito, cargando.
- Confirmación explícita tras envío + email de acuse.

### 16.5 Rendimiento percibido
Imágenes con `lazy-loading` y dimensiones reservadas (evitar CLS), *skeletons* en cargas, fuentes con `font-display: swap`.

### 16.6 Consistencia
Un único estilo de botones, iconos, tono de microcopy y tratamiento de imágenes en todo el sitio.

---

## 17. Estrategia de automatización y marketing

> Base para las fases posteriores. El sitio debe generar los datos que alimentan estos flujos.

### 17.1 Captación (lead generation)
- Lead magnets (guías descargables) → captura de email con consentimiento.
- Formularios conectados al CRM con etiquetado de origen (UTM).
- Newsletter técnica periódica.

### 17.2 Automatización (marketing automation)
- Secuencia de bienvenida tras descarga/contacto.
- *Lead scoring* según interacción y servicio de interés.
- Alertas al equipo comercial ante lead cualificado.
- Recordatorios y *nurturing* segmentado por sector.

### 17.3 Contenido
Calendario editorial alineado con clústeres SEO (§13). Reutilización: 1 caso de éxito → artículo + post LinkedIn + nota para newsletter.

### 17.4 Canales
LinkedIn (principal B2B), email, medios sectoriales, Google Business Profile. Publicidad de pago (Google/LinkedIn Ads) opcional en fase 3.

### 17.5 Medición de marketing
Atribución de leads por canal, coste por lead, tasa de conversión lead→oportunidad→cliente.

---

## 18. Roadmap

> Estimaciones **`[SUPUESTO]`**; ajustar según recursos reales.

### Fase 0 — Descubrimiento y base *(sem. 1–2)*
- Validar supuestos de este documento, manual de marca, keyword research, inventario de contenidos y casos.
- **Estructura del repositorio inicializada ✅** (hecho).

### Fase 1 — MVP *(sem. 3–8)*
- Diseño (design system + maquetas clave) y desarrollo de: Home, Servicios, Proyectos, Sobre nosotros, Contacto, Legal.
- CMS operativo, formularios + CRM, SEO técnico base, analítica y RGPD.
- **Hito: lanzamiento del sitio corporativo.**

### Fase 2 — Contenido y SEO *(mes 3–4)*
- Blog/recursos, clústeres de contenido, casos de éxito ampliados, lead magnets.
- Optimización Core Web Vitals y datos estructurados completos.

### Fase 3 — Automatización y crecimiento *(mes 5–6)*
- Automatización de marketing, secuencias, scoring, multi-idioma (ES/EN).
- A/B testing de conversión, calculadoras interactivas.

### Fase 4 — Iteración continua *(6 m+)*
- Mejora basada en datos, nuevos contenidos, expansión internacional.

---

## 19. Riesgos

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Contenido real (casos, textos, fotos) llega tarde. | Alta | Alto | Inventario temprano; responsable de contenidos; plantillas; placeholders controlados. |
| R2 | Supuestos de marca/servicios incorrectos. | Media | Alto | Validar este documento antes de diseñar (bloqueante). |
| R3 | Falta de manual de marca. | Media | Medio | Definir directrices mínimas (§4.3) y formalizar en Fase 0. |
| R4 | SEO sin resultados a corto plazo. | Alta | Medio | Gestión de expectativas: SEO es medio-largo plazo; combinar con LinkedIn/Ads. |
| R5 | Rendimiento degradado por imágenes pesadas. | Media | Medio | Pipeline de optimización de imágenes obligatorio; presupuesto de rendimiento. |
| R6 | Incumplimiento RGPD/cookies. | Baja | Alto | Revisión legal; gestor de consentimiento; DPA con proveedores. |
| R7 | Dependencia de proveedor (CMS/hosting). | Media | Medio | Elegir estándares abiertos; exportabilidad de datos; evitar *lock-in*. |
| R8 | Equipo interno sin capacidad de mantener el stack. | Media | Alto | Elegir stack acorde al perfil; formación; documentación; alternativa WordPress. |
| R9 | Alcance creciente (scope creep). | Alta | Medio | MoSCoW estricto; cambios vía gobernanza (§22). |
| R10 | Seguridad (spam, ataques a formularios). | Media | Medio | CDN/WAF, antispam, rate limiting, cabeceras de seguridad. |

---

## 20. Supuestos

> **Todos deben validarse antes de aprobar el documento (Estado → 🟢).** Sustituir cada uno por el dato real.

| ID | Supuesto | Impacto si es falso |
|---|---|---|
| A1 | La empresa es una ingeniería española de tamaño medio (30–80 pers.). | Ajustar tono, servicios y escala del proyecto. |
| A2 | Especialidad: industrial, energética, instalaciones, renovables. | Reescribir §5 Servicios y §13 SEO. |
| A3 | Foco diferencial en eficiencia energética/sostenibilidad. | Cambia posicionamiento (§8) y mensajes (§3). |
| A4 | Modelo B2B (empresas, promotores, administración). | Cambian personas (§6) y CTAs. |
| A5 | Idiomas: ES principal, EN en fase 2. | Ajustar arquitectura i18n y roadmap. |
| A6 | Certificaciones ISO 9001/14001/45001 disponibles. | Retirar prueba social; revisar §3.3. |
| A7 | Existe presupuesto para stack moderno (Astro/headless). | Optar por WordPress (§14.2). |
| A8 | El objetivo primario es generación de leads. | Reordenar prioridades funcionales. |
| A9 | Habrá un responsable de contenidos por parte del cliente. | Riesgo R1 se agrava; replanificar. |
| A10 | Paleta azul/verde y tipografía sans-serif abierta. | Rehacer directrices visuales (§4.3). |
| A11 | Nombre comercial y tagline pendientes. | Bloqueante para diseño final. |
| A12 | Estimaciones de roadmap orientativas. | Replanificar fechas. |

---

## 21. Criterios de éxito (KPIs)

### 21.1 Negocio (los que importan)
- **Leads cualificados/mes** desde canal digital: objetivo inicial **`[SUPUESTO]`** ≥ 15/mes a los 6 meses.
- **Coste por lead** decreciente trimestre a trimestre.
- **Tasa de conversión** visita → lead ≥ 2 % **`[SUPUESTO]`**.
- **Oportunidades (RFP/RFQ)** originadas en web.

### 21.2 SEO / tráfico
- Tráfico orgánico creciente (objetivo: +30 % semestral tras Fase 2 **`[SUPUESTO]`**).
- Nº de keywords en top 10 para términos comerciales objetivo.
- Autoridad de dominio y backlinks de calidad crecientes.

### 21.3 Experiencia / técnica
- **Core Web Vitals en verde** (P75 móvil).
- **WCAG 2.2 AA** cumplido (auditoría sin bloqueantes).
- **Lighthouse** ≥ 90 en Rendimiento, SEO, Accesibilidad, Buenas prácticas.
- **Uptime** ≥ 99,9 %.

### 21.4 Contenido / marca
- Nº de casos de éxito publicados (objetivo: ≥ 12 en 6 meses **`[SUPUESTO]`**).
- Cadencia de publicación de recursos sostenida.
- Crecimiento de seguidores y engagement en LinkedIn.

### 21.5 Criterio global de éxito
> El proyecto es un éxito si a los **6 meses** el sitio genera un flujo **medible y creciente de leads cualificados**, cumple los estándares técnicos (rendimiento, accesibilidad, SEO) y es **mantenible de forma autónoma** por el equipo del cliente.

---

## 22. Gobernanza del documento

- **Propietario:** Dirección / Cliente *(por confirmar)*.
- **Cómo proponer cambios:** *pull request* a este archivo con justificación; revisión del owner.
- **Versionado:** SemVer del documento (`MAJOR.MINOR.PATCH`). Cambios de alcance = MAJOR.
- **Cadencia de revisión:** al cierre de cada fase del roadmap.
- **Regla de oro:** ante conflicto entre este documento y una decisión posterior, **prevalece este documento** hasta que se actualice formalmente.

---

## 23. Glosario

| Término | Definición |
|---|---|
| **B2B** | *Business to Business*: venta entre empresas. |
| **BIM** | *Building Information Modeling*: modelado de información de construcción. |
| **CMS** | *Content Management System*: gestor de contenidos. |
| **Core Web Vitals** | Métricas de Google de experiencia de página (LCP, INP, CLS). |
| **CTA** | *Call To Action*: llamada a la acción. |
| **DPA** | *Data Processing Agreement*: contrato de encargo de tratamiento (RGPD). |
| **Lead** | Contacto comercial potencial. |
| **MEP** | *Mechanical, Electrical, Plumbing*: instalaciones. |
| **MoSCoW** | Priorización: Must/Should/Could/Won't. |
| **MVP** | *Minimum Viable Product*: producto mínimo viable. |
| **RGPD** | Reglamento General de Protección de Datos. |
| **ROI** | *Return On Investment*: retorno de la inversión. |
| **SSG/SSR** | Generación estática / renderizado en servidor. |
| **WCAG** | *Web Content Accessibility Guidelines*: pautas de accesibilidad. |

---

> **Siguiente paso recomendado:** revisar y validar la [sección 20 (Supuestos)](#20-supuestos) con dirección. Una vez confirmados, cambiar el `Estado` de la cabecera a **🟢 Aprobado** y comenzar la Fase 1 del [roadmap](#18-roadmap).
