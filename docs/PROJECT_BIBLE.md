# PROJECT BIBLE — Documento Definitivo

> **Fuente única de verdad (Single Source of Truth, SSOT).**
> Este documento gobierna todas las fases del proyecto: producto, diseño, desarrollo, datos, IA, seguridad, SEO, automatización, marketing y operación. **Toda decisión posterior debe ser coherente con este documento.** Si una decisión lo contradice, o bien se alinea con él, o bien se actualiza este documento mediante el proceso de gobernanza descrito en la [§29](#29-convenciones-del-proyecto) y registrado como ADR en la [§43](#43-decisiones-de-arquitectura-adr).
>
> **Política documental (oficial).** Todos los demás documentos del repositorio (`CLAUDE.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/API.md`, `docs/UI_UX.md`, `docs/DESIGN_SYSTEM.md`, `docs/ROADMAP.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/CODING_STANDARDS.md`, `docs/SECURITY.md`, `docs/TESTING.md`) **complementan** a este Bible y **nunca** pueden contener decisiones distintas. **Toda decisión nueva se incorpora primero aquí** (como ADR en [§43](#43-decisiones-de-arquitectura-adr) o como decisión abierta en [§49](#49-anexo-de-decisiones-abiertas)) y solo después se refleja en los documentos derivados. Ante cualquier discrepancia, **prevalece el Bible**.

| Metadato | Valor |
|---|---|
| **Documento** | `docs/PROJECT_BIBLE.md` |
| **Versión** | 1.1.0 (oficial) |
| **Estado** | 🟢 Aprobado — versión **oficial 1.1** y **SSOT** del proyecto. **v1.1 (2026-07-13):** incorpora el cierre de la Fase 0 documentado en el *Informe Final de Gobernanza* — las decisiones abiertas DA-2…DA-10 quedan **ratificadas por el comité (propuesta), pendientes de ratificación única del cliente** ([§49](#49-anexo-de-decisiones-abiertas)), y las hipótesis ([§44](#44-hipótesis)) quedan **triadas** (bloqueantes / confirmación documental / diferibles) — **ninguna se da por validada**. La **capa de interfaz** de F1–F2 está construida y auditada (*LIBRARY APPROVED* + *FRONTEND APPROVED*); el backend/CMS/IA y el contenido real siguen pendientes. Ni el cierre de decisiones ni el estado de las hipótesis condicionan la oficialidad del SSOT. |
| **Fecha** | 2026-07-13 (v1.1) · 2026-07-08 (v1.0) |
| **Propietario (owner)** | Dirección / Cliente *(por confirmar)* |
| **Redactado por** | Equipo multidisciplinar: Software Architect · Product Owner · CTO · Lead Backend · Lead Frontend · Database Architect · UX/UI Lead · AI Engineer · QA Lead · DevOps · Security Engineer · Technical Writer |
| **Ámbito** | Plataforma web corporativa y de captación de leads B2B |
| **Reemplaza a** | Borrador 0.1.0 (23 secciones) — ver [§50](#50-resultado-de-la-autoauditoría) |

---

## Cómo leer este documento

- **Terminología:** los términos con significado fijo se definen en la [tabla de terminología canónica](#terminología-canónica) y en el [Glosario (§47)](#47-glosario). Se usan siempre igual en todo el documento.
- **Microestructura de calidad:** las secciones sustantivas (1–46) siguen el mismo esqueleto — **Objetivo · Descripción · Justificación · Impacto · Riesgos · Dependencias · Decisiones tomadas · Alternativas descartadas** — para que cada bloque sea autocontenido y accionable. Las secciones de referencia (47–49) usan un formato propio, justificado en la [autoauditoría (§50)](#50-resultado-de-la-autoauditoría).
- **Incertidumbre:** cuando una decisión no puede cerrarse con la información disponible, **no se inventa**: se marca con **`⚠️ INCERTIDUMBRE`**, se propone la mejor alternativa y se traslada al [Anexo de decisiones abiertas (§49)](#49-anexo-de-decisiones-abiertas).
- **Hipótesis:** los datos de empresa no facilitados (nombre, subsector, sedes…) se tratan como **`[HIPÓTESIS]`** verificables y se consolidan en la [§44](#44-hipótesis). El nombre comercial se referencia siempre con el token **`«[NOMBRE_EMPRESA]»`**.

### Terminología canónica

| Término | Significado fijo en este documento |
|---|---|
| **Plataforma** | El conjunto: sitio público + capa de servicios (formularios, IA, integraciones) + panel de contenidos. |
| **Sitio** | La web pública indexable (frontend orientado a visitantes). |
| **CMS** | Gestor de contenidos *headless* (fuente de verdad del contenido editorial). |
| **Lead** | Contacto comercial capturado por la Plataforma (formulario o descarga). |
| **Caso de éxito** / **Proyecto** | Ficha de portfolio de un trabajo realizado. Se usa «Proyecto (de portfolio)» cuando hay ambigüedad con el proyecto de software. |
| **Área privada** | Portal autenticado de cliente (alcance **futuro**, ver [§7](#7-funcionalidades-futuras)). |
| **BFF** | *Backend for Frontend*: capa serverless fina que orquesta formularios, IA e integraciones. |
| **RAG** | *Retrieval-Augmented Generation*: generación asistida por recuperación de contenido propio. |
| **SSOT** | *Single Source of Truth*: este documento. |
| **Core Web Vitals (CWV)** | Métricas de experiencia de Google: LCP, INP, CLS. |

---

## Tabla de contenidos

1. [Visión del producto](#1-visión-del-producto)
2. [Objetivos del negocio](#2-objetivos-del-negocio)
3. [Problemas que resuelve](#3-problemas-que-resuelve)
4. [Público objetivo](#4-público-objetivo)
5. [Casos de uso](#5-casos-de-uso)
6. [Funcionalidades principales](#6-funcionalidades-principales)
7. [Funcionalidades futuras](#7-funcionalidades-futuras)
8. [Requisitos funcionales](#8-requisitos-funcionales)
9. [Requisitos no funcionales](#9-requisitos-no-funcionales)
10. [Restricciones](#10-restricciones)
11. [Arquitectura general](#11-arquitectura-general)
12. [Arquitectura del frontend](#12-arquitectura-del-frontend)
13. [Arquitectura del backend](#13-arquitectura-del-backend)
14. [Arquitectura de datos](#14-arquitectura-de-datos)
15. [Integraciones externas](#15-integraciones-externas)
16. [Inteligencia Artificial](#16-inteligencia-artificial)
17. [Seguridad](#17-seguridad)
18. [Rendimiento](#18-rendimiento)
19. [Escalabilidad](#19-escalabilidad)
20. [Accesibilidad](#20-accesibilidad)
21. [UX](#21-ux)
22. [UI](#22-ui)
23. [Diseño responsive](#23-diseño-responsive)
24. [Navegación](#24-navegación)
25. [Gestión de usuarios](#25-gestión-de-usuarios)
26. [Roles](#26-roles)
27. [Permisos](#27-permisos)
28. [Modelo de datos de alto nivel](#28-modelo-de-datos-de-alto-nivel)
29. [Convenciones del proyecto](#29-convenciones-del-proyecto)
30. [Estándares de desarrollo](#30-estándares-de-desarrollo)
31. [Organización del repositorio](#31-organización-del-repositorio)
32. [Estrategia de testing](#32-estrategia-de-testing)
33. [Estrategia de despliegue](#33-estrategia-de-despliegue)
34. [Monitorización](#34-monitorización)
35. [Gestión de errores](#35-gestión-de-errores)
36. [Gestión de logs](#36-gestión-de-logs)
37. [Gestión de configuración](#37-gestión-de-configuración)
38. [Variables de entorno](#38-variables-de-entorno)
39. [Riesgos del proyecto](#39-riesgos-del-proyecto)
40. [Riesgos técnicos](#40-riesgos-técnicos)
41. [Riesgos de negocio](#41-riesgos-de-negocio)
42. [Riesgos legales](#42-riesgos-legales)
43. [Decisiones de arquitectura (ADR)](#43-decisiones-de-arquitectura-adr)
44. [Hipótesis](#44-hipótesis)
45. [Limitaciones conocidas](#45-limitaciones-conocidas)
46. [Roadmap de alto nivel](#46-roadmap-de-alto-nivel)
47. [Glosario](#47-glosario)
48. [Referencias](#48-referencias)
49. [Anexo de decisiones abiertas](#49-anexo-de-decisiones-abiertas)
50. [Resultado de la autoauditoría](#50-resultado-de-la-autoauditoría)

---

## 1. Visión del producto

**Objetivo.** Definir qué es la Plataforma y qué aspira a lograr a largo plazo.

**Descripción.** **`[HIPÓTESIS]`** La Plataforma es el sitio web corporativo y motor de captación de **«[NOMBRE_EMPRESA]»**, una ingeniería española moderna (30–80 personas) especializada en ingeniería industrial, energética, instalaciones (MEP) y renovables, con foco diferencial en **eficiencia energética y sostenibilidad rentable**. No es un folleto: es la infraestructura digital central de credibilidad, captación y conversión. A medio plazo incorpora **asistencia por IA** (búsqueda semántica y asistente sobre contenido propio) y un **área privada** de seguimiento para clientes.

**Justificación.** El sector de la ingeniería española tiene, en general, presencia digital técnicamente correcta pero débil en narrativa de resultados, SEO y captación (ver [§3](#3-problemas-que-resuelve); el análisis de competencia se formaliza como entrada de la Fase 0, ver [§44](#44-hipótesis)/[§46](#46-roadmap-de-alto-nivel)). Una plataforma orientada a datos, casos y conversión genera ventaja competitiva a coste relativo bajo.

**Impacto.** Alto y transversal: condiciona diseño, contenido, arquitectura técnica, SEO y procesos comerciales. Es el activo digital nuclear de la empresa.

**Riesgos.** Que se perciba como «otra web más»; mitigado por la orientación a resultados medibles y la prueba social (ver [§2](#2-objetivos-del-negocio), [§6](#6-funcionalidades-principales)).

**Dependencias.** Manual de marca, inventario de casos reales con métricas, validación de hipótesis de negocio ([§44](#44-hipótesis)).

**Decisiones tomadas.** La visión prioriza **captación de leads cualificados B2B** sobre notoriedad genérica. El sitio se construye *content-first* y *conversion-first*.

**Alternativas descartadas.** (a) *Portal transaccional/e-commerce* — descartado: el ciclo de venta es consultivo B2B, no de compra directa. (b) *Micrositio de campaña* — descartado: insuficiente para autoridad de marca sostenida.

---

## 2. Objetivos del negocio

**Objetivo.** Traducir la visión en metas de negocio medibles.

**Descripción.** Objetivos priorizados:

| # | Objetivo de negocio | Métrica asociada (ver [§46](#46-roadmap-de-alto-nivel) y KPIs) |
|---|---|---|
| B1 | Generar oportunidades comerciales cualificadas por canal digital. | Leads cualificados/mes; oportunidades (RFP/RFQ) originadas en web. |
| B2 | Reforzar autoridad y credibilidad técnica. | Casos publicados; tráfico orgánico; menciones/backlinks. |
| B3 | Reducir el coste de adquisición comercial. | Coste por lead (CPL); tasa visita→lead. |
| B4 | Atraer y retener talento. | Candidaturas cualificadas vía «Empleo». |
| B5 | Habilitar automatización de marketing y ventas. | % de leads con seguimiento automatizado en CRM. |

**Justificación.** La empresa vende servicios de alto valor y ciclo largo; el retorno del canal digital se maximiza optimizando la calidad del lead, no solo el volumen.

**Impacto.** Define la priorización funcional ([§6](#6-funcionalidades-principales), [§8](#8-requisitos-funcionales)) y los criterios de éxito.

**Riesgos.** Expectativas de retorno inmediato del SEO (medio-largo plazo); mitigado con canales complementarios (LinkedIn/Ads) y comunicación de expectativas.

**Dependencias.** CRM operativo ([§15](#15-integraciones-externas)); definición de «lead cualificado» acordada con el equipo comercial.

**Decisiones tomadas.** B1 es el objetivo primario; el resto lo soportan.

**Alternativas descartadas.** Priorizar *branding* puro sin captación — descartado por no ser medible ni sostenible para justificar la inversión.

---

## 3. Problemas que resuelve

**Objetivo.** Explicar los problemas concretos que la Plataforma resuelve para la empresa y para sus clientes.

**Descripción.**
- **Para la empresa:** baja generación de leads digitales; dificultad para demostrar resultados; dependencia del boca a boca; procesos comerciales no trazables; contenido desactualizado por depender de desarrolladores.
- **Para el cliente (comprador B2B):** dificultad para evaluar la solvencia técnica de una ingeniería; propuestas opacas; falta de casos con datos comparables; poca claridad sobre servicios y normativa aplicable.

**Justificación.** Estos problemas se derivan del análisis de competencia y de las buyer personas ([§4](#4-público-objetivo)); son la raíz de la propuesta de valor.

**Impacto.** Justifica funcionalidades clave: casos de éxito con métricas, páginas de servicio con normativa, formularios de propuesta trazables, CMS autónomo.

**Riesgos.** Resolver el problema equivocado si las hipótesis de negocio son falsas; mitigado por validación temprana ([§44](#44-hipótesis)).

**Dependencias.** Datos reales de casos y testimonios.

**Decisiones tomadas.** El sitio se organiza alrededor de **prueba de resultados** (casos con datos) y **claridad de servicio**.

**Alternativas descartadas.** Enfoque puramente estético sin datos — descartado: no resuelve el problema de evaluación de solvencia.

---

## 4. Público objetivo

**Objetivo.** Definir a quién sirve la Plataforma.

**Descripción.** Modelo B2B con comité de compra (3–5 decisores). Buyer personas **`[HIPÓTESIS]`**:

| Persona | Rol | Qué busca en la Plataforma |
|---|---|---|
| **A. Director de Planta / Operaciones** | Comprador técnico | Casos con datos, capacidad técnica, referencias del sector. |
| **B. Responsable de Compras** | Comprador económico/cumplimiento | Certificaciones, solvencia, tamaño, capacidad de respuesta. |
| **C. Promotor / Property Manager** | Terciario/inmobiliario | Portfolio visual, plazos, gestión integral de licencias. |
| **D. Administración pública** | Licitaciones | Experiencia en obra pública, clasificación, referencias verificables. |
| **E. Candidato/a** | Talento | Cultura, proyectos, oportunidades (soporta B4). |

**Justificación.** El contenido y la navegación deben servir a cada rol; un único mensaje no cubre al comité de compra.

**Impacto.** Determina la arquitectura de la información ([§11](#11-arquitectura-general)/[§24](#24-navegación)) y los CTAs.

**Riesgos.** Personas mal calibradas; mitigado validando con el equipo comercial.

**Dependencias.** Entrevistas comerciales; datos de CRM históricos si existen.

**Decisiones tomadas.** Persona A (comprador técnico) es la primaria; el sitio se optimiza para ella sin excluir a las demás.

**Alternativas descartadas.** Público B2C — descartado: no es el mercado de la empresa.

---

## 5. Casos de uso

**Objetivo.** Enumerar las interacciones clave usuario–Plataforma.

**Descripción.** Casos de uso primarios (CU):

| ID | Actor | Caso de uso | Resultado esperado |
|---|---|---|---|
| CU-01 | Visitante | Explorar servicios y entender el enfoque. | Comprensión clara; avance a caso o contacto. |
| CU-02 | Visitante | Filtrar y revisar casos de éxito por sector/servicio. | Evidencia de solvencia. |
| CU-03 | Lead | Solicitar propuesta (formulario). | Lead registrado en CRM + acuse por email. |
| CU-04 | Lead | Descargar recurso (whitepaper) dejando email. | Lead + secuencia de *nurturing*. |
| CU-05 | Visitante | Usar el asistente IA / búsqueda semántica. | Respuesta con fuentes del sitio; posible conversión. |
| CU-06 | Candidato/a | Enviar candidatura a una oferta. | Candidatura registrada. |
| CU-07 | Editor | Publicar/editar servicio, caso o artículo en el CMS. | Contenido publicado sin intervención de desarrollo. |
| CU-08 | Administrador | Gestionar usuarios del CMS y consentimientos. | Gobierno de acceso y cumplimiento. |
| CU-09 | Sistema | Enviar lead a CRM y disparar automatización. | Trazabilidad comercial. |
| CU-10 *(futuro)* | Cliente | Consultar estado de su proyecto en área privada. | Autoservicio de seguimiento. |

**Justificación.** Cada CU se traza a requisitos funcionales ([§8](#8-requisitos-funcionales)) y evita construir funcionalidades sin propósito.

**Impacto.** Base de la matriz de trazabilidad y del plan de pruebas ([§32](#32-estrategia-de-testing)).

**Riesgos.** CU futuros (CU-10) que condicionen prematuramente la arquitectura; mitigado marcándolos como futuros pero previendo extensibilidad.

**Dependencias.** Roles y permisos ([§26](#26-roles)/[§27](#27-permisos)).

**Decisiones tomadas.** CU-01 a CU-09 entran en el alcance inicial (CU-05 en su versión mínima); CU-10 es futuro.

**Alternativas descartadas.** Casos de uso transaccionales (pago online) — descartados por modelo de negocio.

---

## 6. Funcionalidades principales

**Objetivo.** Definir el alcance funcional nuclear (MVP y plataforma inicial).

**Descripción.**
1. **Home** con propuesta de valor, servicios destacados y CTA principal.
2. **Páginas de servicio** (una por línea) con plantilla común (problema → enfoque → metodología → entregables → normativa → casos → FAQ → CTA).
3. **Portfolio de casos de éxito** filtrable (sector, servicio, año) + **ficha de caso** con métricas, imágenes y testimonio.
4. **Sobre nosotros** (equipo, historia, certificaciones).
5. **Recursos/Blog** (artículos técnicos, guías, lead magnets).
6. **Empleo** con formulario de candidatura.
7. **Contacto / Solicitud de propuesta** con validación y trazabilidad a CRM.
8. **Asistente IA + búsqueda semántica** (versión mínima) sobre contenido publicado.
9. **CMS headless** para gestión autónoma de contenido.
10. **Cumplimiento legal** (consentimiento de cookies, textos legales) y **analítica**.

**Justificación.** Es el conjunto mínimo que cubre los objetivos B1–B5 y los CU-01…CU-09.

**Impacto.** Delimita el esfuerzo del MVP ([§46](#46-roadmap-de-alto-nivel)).

**Riesgos.** *Scope creep*; mitigado con priorización MoSCoW ([§8](#8-requisitos-funcionales)) y gobernanza.

**Dependencias.** Contenido real; CMS; CRM; proveedor de IA.

**Decisiones tomadas.** El asistente IA entra en versión mínima (búsqueda semántica + FAQ con fuentes), no como agente complejo.

**Alternativas descartadas.** Lanzar sin IA — descartado porque la IA está en la estructura obligatoria del producto y aporta diferenciación; se acota su alcance en lugar de eliminarla.

---

## 7. Funcionalidades futuras

**Objetivo.** Registrar el alcance diferido sin comprometer el MVP.

**Descripción.**
- **Multi-idioma** ES/EN (arquitectura preparada desde el inicio; activación posterior).
- **Área privada de cliente** (seguimiento de proyectos, documentos).
- **Calculadoras interactivas** (p. ej., estimación de ahorro energético).
- **Automatización avanzada** de marketing (lead scoring, secuencias segmentadas).
- **Portal de licitaciones** / repositorio de documentación para concursos.
- **Asistente IA avanzado** con acciones (agendar reunión, generar propuesta preliminar).

**Justificación.** Concentran valor pero incrementan complejidad, superficie de seguridad y coste; se difieren para no poner en riesgo el MVP.

**Impacto.** Condicionan decisiones de extensibilidad (i18n, autenticación) que sí se prevén en la arquitectura inicial.

**Riesgos.** Que se adelanten sin control; mitigado por gobernanza y roadmap.

**Dependencias.** Autenticación robusta ([§25](#25-gestión-de-usuarios)); madurez del CRM; validación de demanda.

**Decisiones tomadas.** i18n se **diseña** desde el inicio pero se **activa** después; área privada requiere PostgreSQL + autenticación gestionada (previstos, no desplegados en MVP).

**Alternativas descartadas.** Incluir área privada en el MVP — descartado por coste/seguridad frente a valor inmediato.

---

## 8. Requisitos funcionales

**Objetivo.** Especificar qué debe hacer la Plataforma, con prioridad.

**Descripción.** Notación **MoSCoW**: `[MUST]` MVP · `[SHOULD]` deseable · `[COULD]` futuro. Trazan a los CU de la [§5](#5-casos-de-uso).

| ID | Prioridad | Requisito | CU |
|---|---|---|---|
| RF-01 | MUST | Home con propuesta de valor, servicios y CTA. | CU-01 |
| RF-02 | MUST | Página por línea de servicio (plantilla común). | CU-01 |
| RF-03 | MUST | Portfolio filtrable por sector/servicio/año. | CU-02 |
| RF-04 | MUST | Ficha de caso con métricas, media y testimonio. | CU-02 |
| RF-05 | MUST | «Sobre nosotros» (equipo, certificaciones). | CU-01 |
| RF-06 | MUST | Formulario de solicitud de propuesta con validación. | CU-03 |
| RF-07 | MUST | Envío de formularios a email + persistencia + CRM. | CU-03/09 |
| RF-08 | MUST | Consentimiento de cookies y textos legales (RGPD/LSSI). | CU-08 |
| RF-09 | MUST | CMS *headless* para servicios, casos y recursos. | CU-07 |
| RF-10 | MUST | Analítica respetuosa con privacidad, con consentimiento. | — |
| RF-11 | MUST | `sitemap.xml`, `robots.txt`, datos estructurados. | — |
| RF-12 | SHOULD | Blog/Recursos con categorías y artículo detalle. | CU-04 |
| RF-13 | SHOULD | Lead magnets (descarga con captura de email). | CU-04 |
| RF-14 | SHOULD | Empleo + formulario de candidatura. | CU-06 |
| RF-15 | SHOULD | Búsqueda semántica + asistente IA (versión mínima). | CU-05 |
| RF-16 | SHOULD | Búsqueda interna de contenidos (texto). | CU-01 |
| RF-17 | COULD | Multi-idioma ES/EN. | — |
| RF-18 | COULD | Calculadora de ahorro energético. | — |
| RF-19 | COULD | Área privada de cliente. | CU-10 |
| RF-20 | COULD | Lead scoring y secuencias automatizadas. | CU-09 |

**Justificación.** La priorización garantiza un MVP entregable y coherente con los objetivos.

**Impacto.** Base del plan de sprints, de la trazabilidad y de las pruebas de aceptación.

**Riesgos.** Requisitos ambiguos; mitigado con criterios de aceptación por historia (definidos en *backlog*, fuera de este documento pero regidos por él).

**Dependencias.** CMS, CRM, proveedor IA, gestor de consentimiento.

**Decisiones tomadas.** RF-15 (IA) se clasifica `SHOULD` en versión mínima: no bloquea el lanzamiento pero es objetivo del primer post-MVP inmediato.

**Alternativas descartadas.** Marcar todos los requisitos como `MUST` — descartado: impide un MVP realista.

---

## 9. Requisitos no funcionales

**Objetivo.** Definir atributos de calidad medibles.

**Descripción.**

| Categoría | Requisito | Umbral objetivo (medible) |
|---|---|---|
| Rendimiento | Core Web Vitals «Good» | LCP < 2,5 s · INP < 200 ms · CLS < 0,1 (P75 móvil). |
| Rendimiento | Peso vista inicial | < 1,5 MB; imágenes AVIF/WebP. |
| Rendimiento | Lighthouse | ≥ 90 en Performance, SEO, Accessibility, Best Practices. |
| Disponibilidad | Uptime | ≥ 99,9 % mensual. |
| Accesibilidad | Estándar | **WCAG 2.2 AA**. |
| SEO técnico | Indexabilidad | 100 % de páginas clave indexables; *structured data* válido. |
| Seguridad | Transporte y cabeceras | HTTPS/TLS, HSTS, CSP, X-Frame-Options, etc. ([§17](#17-seguridad)). |
| Privacidad | RGPD/LOPDGDD | Consentimiento previo, minimización, DPA con proveedores. |
| Escalabilidad | Picos | Soportar ×10 tráfico sin degradación (CDN + caché). |
| Mantenibilidad | Calidad | CI verde obligatorio; cobertura en lógica crítica ([§32](#32-estrategia-de-testing)). |
| Compatibilidad | Navegadores | Últimas 2 versiones de Chrome/Firefox/Safari/Edge; 320px–4K. |
| Observabilidad | Monitorización | Logs estructurados, alertas de caída, RUM ([§34](#34-monitorización)). |
| i18n | Internacionalización | Arquitectura lista para ES/EN aunque se lance en ES. |
| Recuperación | Backups | Backup diario; RPO ≤ 24 h; RTO ≤ 4 h. |

**Justificación.** Convierten «calidad» en criterios verificables y auditables.

**Impacto.** Condicionan stack ([§11](#11-arquitectura-general)–[§13](#13-arquitectura-del-backend)) y pruebas.

**Riesgos.** Degradación por contenido (imágenes pesadas); mitigado con *performance budget* y pipeline de imágenes.

**Dependencias.** CDN, herramientas de medición, CI.

**Decisiones tomadas.** Los umbrales son de aceptación (bloquean el despliegue si no se cumplen en páginas clave).

**Alternativas descartadas.** Requisitos cualitativos («que vaya rápido») — descartados por no auditables.

---

## 10. Restricciones

**Objetivo.** Documentar límites impuestos.

**Descripción.**
- **Legales:** RGPD/LOPDGDD y LSSI-CE (España/UE) de obligado cumplimiento.
- **Idioma:** contenido primario en español.
- **Presupuesto y equipo:** **⚠️ INCERTIDUMBRE** — no facilitados; condicionan el **modelo de mantenimiento** (partner externo vs. interno), **no** la elección de stack ([§49](#49-anexo-de-decisiones-abiertas) DA-1 cerrada: Astro). Ver [§44](#44-hipótesis) H7.
- **Marca:** manual de marca no disponible; se usan directrices provisionales ([§22](#22-ui)).
- **Contenido:** dependencia de que el cliente aporte casos, textos y fotos reales.
- **Datos:** minimización — no se recogen datos personales innecesarios.

**Justificación.** Explicitar restricciones evita decisiones inviables.

**Impacto.** Afecta a stack, plazos y diseño.

**Riesgos.** Restricciones ocultas que emerjan tarde; mitigado con la sesión de descubrimiento (Fase 0).

**Dependencias.** Validación de hipótesis ([§44](#44-hipótesis)).

**Decisiones tomadas.** Se asume cumplimiento normativo UE/España como marco no negociable.

**Alternativas descartadas.** Alojar datos personales fuera de la UE sin garantías — descartado por cumplimiento.

---

## 11. Arquitectura general

**Objetivo.** Definir la arquitectura de referencia de la Plataforma.

**Descripción.** Arquitectura **Jamstack** con contenido *headless* y capa de servicios serverless (BFF):

```
[ Navegador ]
     │  HTML/CSS/JS estático + islas interactivas
     ▼
[ CDN global ] ──sirve──▶ Sitio (Astro SSG + rebuild por webhook)
     │                         │ build
     │                         ▼
     │                   [ CMS headless ]  ← Editores
     │
     ├──▶ [ BFF serverless ] ──▶ CRM (leads)
     │            │          ──▶ Email transaccional
     │            │          ──▶ Proveedor IA (RAG)  ──▶ [ Vector store / pgvector ]
     │            └──────────▶ [ PostgreSQL gestionado ] (leads; área privada futura)
     │
     └──▶ Analítica (con consentimiento)
```

**Justificación.** Un sitio de contenido con foco en SEO/rendimiento se beneficia de generación estática + CDN (velocidad, seguridad, coste). El *headless* separa contenido de presentación (autonomía editorial). El BFF aísla la lógica dinámica (formularios, IA) sin mantener un servidor monolítico.

**Impacto.** Determina frontend ([§12](#12-arquitectura-del-frontend)), backend ([§13](#13-arquitectura-del-backend)), datos ([§14](#14-arquitectura-de-datos)) y despliegue ([§33](#33-estrategia-de-despliegue)).

**Riesgos.** *Vendor lock-in* con plataforma/CMS; mitigado eligiendo estándares abiertos y garantizando exportabilidad.

**Dependencias.** Proveedor de hosting/CDN, CMS, base de datos gestionada, proveedor IA.

**Decisiones tomadas (resumen, detalle en ADR §43).** Jamstack + Astro + React islands + CMS headless + BFF serverless + PostgreSQL gestionado con pgvector.

**Alternativas descartadas.** (a) *Monolito tradicional (p. ej. WordPress clásico)* — **descartado definitivamente** ([§49](#49-anexo-de-decisiones-abiertas) DA-1 cerrada) por menor control de rendimiento y seguridad. (b) *SPA pura sin SSR/SSG* — descartado por penalización SEO.

---

## 12. Arquitectura del frontend

**Objetivo.** Definir la construcción del Sitio.

**Descripción.** **Astro** como framework con **generación estática (SSG) por defecto**; la actualización de contenido se resuelve mediante **rebuild disparado por webhook** del CMS (contrato portable, independiente del proveedor). La **regeneración incremental (ISR/ODB)** —regenerar solo las páginas afectadas sin reconstruir todo el sitio— es una **optimización dependiente del proveedor de hosting** ([§49](#49-anexo-de-decisiones-abiertas) DA-3), **no** una pieza arquitectónica: se adoptará solo si el proveedor elegido la ofrece y los tiempos de build lo justifican. Islas **React** (TypeScript) solo en componentes interactivos (formularios, asistente IA, filtros). Estilos con **Tailwind CSS** gobernado por **design tokens** ([§22](#22-ui)). Contenido consumido del CMS en *build time* (y en *runtime* vía BFF para lo dinámico). Componentes reutilizables documentados (idealmente en Storybook).

**Justificación.** Minimiza JavaScript enviado (mejor CWV y SEO) enviando HTML estático y «hidratando» solo lo imprescindible (arquitectura de islas).

**Impacto.** Rendimiento, accesibilidad y mantenibilidad del Sitio.

**Riesgos.** Complejidad de hidratación parcial; mitigado con guía de patrones y revisión.

**Dependencias.** CMS, sistema de diseño, BFF para datos dinámicos.

**Decisiones tomadas.** React como tecnología de isla (ecosistema/contratación/tipado); TypeScript estricto obligatorio. **Astro es el framework definitivo del sitio público** (DA-1 cerrada); no se renegocia en F1–F3.

> **Cláusula de reevaluación (única).** La elección de framework frontend podrá **revisarse únicamente antes del inicio de la Fase 4** y **solo si** el alcance del **área privada** cambia de forma significativa (p. ej. pasa a ser una aplicación autenticada extensa). En tal caso se evaluaría un framework orientado a app (p. ej. Next.js) **para el subdominio privado**, como aplicación separada, **sin migrar el sitio público**. Fuera de ese supuesto y ventana, el stack no se reabre.

**Alternativas descartadas.** (a) *Next.js* — válido, descartado como recomendación por mayor peso JS por defecto para un sitio mayoritariamente estático (se mantiene como alternativa, ADR-002). (b) *Vue/Svelte* — descartados por preferencia de ecosistema/contratación, no por capacidad.

---

## 13. Arquitectura del backend

**Objetivo.** Definir la capa de servicios dinámicos.

**Descripción.** **BFF serverless** (funciones edge/Node en TypeScript) responsable de: recepción y validación de formularios, antispam, **persistencia de leads con *outbox* durable** ([ADR-010](#43-decisiones-de-arquitectura-adr)), envío a CRM y email transaccional (mediante un ***worker* programado** que procesa el *outbox* con reintentos), y *proxy* seguro a los proveedores de IA —generación y embeddings— (las claves nunca en el cliente). Sin servidor de larga vida en el MVP. Para el **área privada futura** se prevé un backend de sesión/autenticación gestionado.

> **⚠️ Secuenciación obligatoria (DA-3 antes del BFF).** El *runtime* serverless **no es portable** entre proveedores (funciones Node de Vercel/Netlify ≠ Cloudflare Workers: APIs y limitaciones distintas). Por tanto, la **decisión de hosting ([§49](#49-anexo-de-decisiones-abiertas) DA-3) debe cerrarse ANTES de escribir el primer código del BFF** (en F0, no en F1). Mitigación recomendada para reducir el acoplamiento: adoptar una capa de BFF portable (p. ej. framework agnóstico Node/edge) que abstraiga el proveedor. No se selecciona proveedor en este documento; se fija únicamente la dependencia y su orden.

**Justificación.** El serverless cubre cargas intermitentes (formularios, IA) con coste bajo, escalado automático y sin operación de servidores.

**Impacto.** Seguridad (secretos server-side), coste y escalabilidad.

**Riesgos.** *Cold starts* y límites de ejecución; mitigado con funciones ligeras y, si procede, runtime edge.

**Dependencias.** Plataforma serverless, CRM, proveedor email, proveedor IA, PostgreSQL.

**Decisiones tomadas.** Toda integración con terceros y toda clave secreta residen en el BFF, nunca en el frontend.

**Alternativas descartadas.** (a) *Backend monolítico dedicado (Node/Nest siempre activo)* — descartado por operación/coste innecesarios para el MVP; reconsiderable con el área privada. (b) *Llamadas directas del cliente a la API de IA* — descartado por exposición de claves y falta de control de coste/abuso.

---

## 14. Arquitectura de datos

**Objetivo.** Definir dónde y cómo viven los datos.

**Descripción.** Tres dominios de datos separados por naturaleza:
1. **Contenido editorial** (servicios, casos, artículos): en el **CMS headless** (fuente de verdad del contenido).
2. **Datos operativos/personales** (leads, candidaturas, consentimientos): en **PostgreSQL gestionado** (región UE), con el CRM como sistema comercial de referencia.
3. **Índice semántico** para RAG: **pgvector** dentro del mismo PostgreSQL (evita infraestructura adicional).

Modelo conceptual en la [§28](#28-modelo-de-datos-de-alto-nivel).

**Justificación.** Separar contenido (versionable, editorial) de datos personales (sensibles, RGPD) reduce riesgo y clarifica responsabilidades. Reutilizar PostgreSQL para vectores minimiza operación.

**Impacto.** Cumplimiento, seguridad, portabilidad y coste.

**Riesgos.** Dispersión/duplicidad de datos entre CMS, DB y CRM; mitigado definiendo la fuente de verdad de cada dato y evitando duplicar el mismo dato como maestro en dos sistemas.

**Dependencias.** Proveedor PostgreSQL con pgvector y residencia UE; CRM.

**Decisiones tomadas.** Región de datos **UE**; el CRM es maestro del ciclo comercial del lead; PostgreSQL es maestro del registro de consentimiento y del índice RAG.

**Alternativas descartadas.** Base de datos vectorial dedicada (p. ej. servicio externo) — descartada en MVP por coste/operación; reconsiderable si el volumen lo exige (ADR-005).

---

## 15. Integraciones externas

**Objetivo.** Catalogar sistemas de terceros y su rol.

**Descripción.**

| Integración | Función | Notas |
|---|---|---|
| **CRM** (HubSpot/Brevo/Pipedrive) | Gestión de leads y automatización. | Maestro comercial. Elección abierta ([§49](#49-anexo-de-decisiones-abiertas) DA-2). |
| **Email transaccional** (p. ej. proveedor SMTP/API) | Acuses y notificaciones. | Server-side desde BFF. |
| **Proveedor de IA — generación** (Anthropic — Claude) | Asistente/RAG y clasificación. | Ver [§16](#16-inteligencia-artificial). |
| **Proveedor de embeddings** (Voyage AI recomendado — [§49](#49-anexo-de-decisiones-abiertas) DA-10) | Vectorización de contenido y consultas para RAG. | Server-side desde BFF; procesa contenido → **requiere DPA** y garantías UE/adecuación. |
| **Analítica** (Plausible o GA4) | Métricas de uso. | Con consentimiento; *privacy-first* preferido. |
| **Gestor de consentimiento (CMP)** | Cookies/RGPD. | Bloquea scripts hasta consentimiento. |
| **Google Search Console / Business Profile** | SEO y SEO local. | Verificación y datos NAP. |
| **CDN/WAF** | Distribución y protección. | Incluido con la plataforma de despliegue. |

**Justificación.** Externalizar capacidades no diferenciales (email, CRM, analítica) acelera el desarrollo y reduce mantenimiento.

**Impacto.** Dependencias operativas y de cumplimiento (DPA con cada proveedor que trate datos personales).

**Riesgos.** *Lock-in* y disponibilidad de terceros; mitigado con abstracción en el BFF y contratos de tratamiento.

**Dependencias.** Cuentas y claves de cada proveedor; DPAs firmados.

**Decisiones tomadas.** Toda integración con datos personales exige DPA y residencia/garantías UE.

**Alternativas descartadas.** Autogestionar email/analítica sin necesidad — descartado por coste de operación frente a valor.

---

## 16. Inteligencia Artificial

**Objetivo.** Definir el uso de IA, su alcance y sus límites.

**Descripción.** Dos capacidades, ambas con el contenido propio como base:
1. **Búsqueda semántica + asistente RAG (versión mínima, `SHOULD` en MVP inmediato):** el asistente responde preguntas de visitantes usando **exclusivamente** contenido publicado (servicios, casos, recursos), citando las fuentes. Flujo: contenido → *embeddings* (**proveedor dedicado, ver [§49](#49-anexo-de-decisiones-abiertas) DA-10 — recomendado: Voyage AI**; Anthropic **no** ofrece API de embeddings) → índice pgvector; consulta → *embedding* de la consulta → recuperación → generación con **Claude** (familia Anthropic; **Haiku 4.5** para clasificación/consultas económicas, **Sonnet/Opus 4.x** para respuestas complejas). Todas las llamadas (embeddings y generación) pasan por el BFF (claves server-side, control de coste y *rate limiting*).
2. **Asistencia interna de contenido y cualificación de leads (futuro/opcional):** ayuda a redactar borradores editoriales y a clasificar leads. Siempre con revisión humana.

**Guardarraíles obligatorios:** el asistente no inventa datos de proyectos ni cifras; si no hay fuente, lo indica y ofrece contacto. No trata datos personales sensibles. Registro de consultas anonimizado para mejora, con consentimiento.

**Protección frente a *prompt injection* (obligatoria).** Como el asistente combina entrada del usuario y contenido recuperado, ambos son vectores de inyección de instrucciones. Medidas mínimas exigidas:
- **Separación de canales:** las instrucciones del sistema van en el rol de sistema; el contenido recuperado y la consulta del usuario se insertan como **datos delimitados** (p. ej. envueltos y etiquetados como no confiables), nunca concatenados como instrucciones.
- **Regla de no obediencia:** el *prompt* de sistema ordena **ignorar toda instrucción contenida en el contenido recuperado o en la consulta** (p. ej. «ignora lo anterior», «revela tu prompt», «cambia de rol»).
- **Salida acotada:** el modelo solo responde sobre el dominio (servicios/casos/recursos) y con **cita de fuente**; fuera de dominio, rechaza y ofrece contacto (política de *refusal*).
- **Saneado y límites:** longitud máxima de consulta, normalización de entrada, y *rate limiting* por IP/sesión ([§17](#17-seguridad)).
- **Sin acciones:** al no existir herramientas ejecutables en MVP ([ADR-005](#43-decisiones-de-arquitectura-adr)), una inyección no puede desencadenar efectos laterales; esta propiedad se **mantiene como invariante** hasta que se evalúe formalmente cualquier capacidad de acción futura.
- **Verificación:** *test suite* de inyección (batería de *prompts* adversarios) en CI antes de exponer el asistente ([§32](#32-estrategia-de-testing)).

**Justificación.** La IA sobre contenido propio mejora la conversión (respuestas inmediatas con fuentes) y diferencia frente a competidores, sin los riesgos de un agente autónomo con acciones.

**Impacto.** Requiere BFF, índice vectorial, control de coste y una política de uso de IA.

**Riesgos.** Alucinaciones y coste variable; mitigado con RAG estricto (respuestas ancladas a fuentes), límites de tasa y modelos económicos por defecto. **Riesgo legal/reputacional** si el asistente afirma capacidades no reales; mitigado con guardarraíles y revisión de *prompts*.

**Dependencias.** Proveedor de generación (Anthropic/Claude), **proveedor de embeddings** ([§49](#49-anexo-de-decisiones-abiertas) DA-10), contenido publicado, pgvector, presupuesto de tokens ([§49](#49-anexo-de-decisiones-abiertas) DA-6).

**Decisiones tomadas.** RAG anclado a fuentes con cita obligatoria; **guardarraíles de *prompt injection* obligatorios** (ver arriba); sin acciones ejecutables en MVP; claves y lógica IA solo en el BFF; **generación** con Anthropic/Claude por defecto y **embeddings** con proveedor dedicado ([§49](#49-anexo-de-decisiones-abiertas) DA-10, recomendado Voyage AI), ambos con abstracción que permita sustituirlos.

**Alternativas descartadas.** (a) *Chatbot de respuestas libres sin RAG* — descartado por riesgo de alucinación. (b) *Modelo propio auto-alojado* — descartado por coste/operación desproporcionados para el volumen esperado. (c) *Estimador de ahorro por ML* — descartado en favor de un cálculo determinista basado en reglas de ingeniería (más explicable y auditable) cuando se implemente la calculadora ([§7](#7-funcionalidades-futuras)).

---

## 17. Seguridad

**Objetivo.** Proteger la Plataforma, sus datos y sus usuarios.

**Descripción.** Medidas por capa:
- **Transporte:** HTTPS/TLS obligatorio, HSTS.
- **Cabeceras:** CSP restrictiva, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **Formularios:** validación servidor, antispam (token/desafío), *rate limiting*, protección contra inyección.
- **Secretos:** solo en el BFF/gestor de secretos; nunca en el repositorio ni en el cliente.
- **IA:** *proxy* server-side, límites de tasa y de coste, saneado de entradas.
- **Dependencias:** análisis de vulnerabilidades (SCA) en CI; actualizaciones controladas.
- **Datos personales:** cifrado en tránsito y en reposo; acceso mínimo; registro de consentimientos.
- **CDN/WAF:** mitigación DDoS y filtrado.

**Justificación.** La superficie principal (formularios e IA) es el vector de abuso más probable; se protege de forma prioritaria.

**Impacto.** Cumplimiento, confianza y continuidad.

**Riesgos.** Spam/abuso de formularios e IA; fugas de secretos; dependencias vulnerables. Mitigaciones descritas arriba.

**Dependencias.** WAF/CDN, gestor de secretos, herramientas SCA, CMP.

**Decisiones tomadas.** Modelo *secure by default*: CSP restrictiva desde el inicio; ningún secreto en cliente; SCA bloqueante en CI para vulnerabilidades críticas.

**Alternativas descartadas.** Validación solo en cliente — descartada por insegura. CAPTCHA intrusivo por defecto — descartado por fricción; se usa antispam de baja fricción y se escala solo si hay abuso.

---

## 18. Rendimiento

**Objetivo.** Garantizar una experiencia rápida y sostenible.

**Descripción.** *Performance budget* explícito ([§9](#9-requisitos-no-funcionales)): CWV en verde, JS mínimo (islas), imágenes AVIF/WebP con dimensiones reservadas y *lazy-loading*, fuentes con `font-display: swap`, caché agresiva en CDN, *code-splitting*. Medición continua con Lighthouse CI y RUM.

**Justificación.** El rendimiento es factor de SEO y de conversión (impacto directo en objetivos de negocio).

**Impacto.** Ranking, tasa de conversión y coste de infraestructura.

**Riesgos.** Regresiones por contenido/terceros; mitigado con Lighthouse CI bloqueante y control de scripts de terceros vía CMP.

**Dependencias.** CDN, pipeline de imágenes, CI.

**Decisiones tomadas.** *Budget* de rendimiento verificado en CI como criterio de aceptación en páginas clave.

**Alternativas descartadas.** Optimización manual puntual sin presupuesto ni CI — descartada por no sostenible.

---

## 19. Escalabilidad

**Objetivo.** Asegurar que la Plataforma soporta crecimiento de tráfico y contenido.

**Descripción.** El contenido estático servido por CDN escala horizontalmente casi sin coste marginal. El BFF serverless escala automáticamente con la demanda. PostgreSQL gestionado permite escalar verticalmente y con réplicas de lectura si el área privada crece.

**Justificación.** El patrón Jamstack desacopla lecturas (estáticas, ilimitadas vía CDN) de escrituras (formularios/IA, serverless), que es exactamente el perfil de carga esperado.

**Impacto.** Absorbe picos (campañas, viralidad) sin rediseño.

**Riesgos.** Cuellos de botella en terceros (CRM/IA) o límites de plan serverless; mitigado con colas/reintentos y límites de tasa.

**Dependencias.** Planes de CDN, serverless y DB adecuados.

**Decisiones tomadas.** Objetivo de absorber ×10 de tráfico sin degradación ([§9](#9-requisitos-no-funcionales)).

**Alternativas descartadas.** Servidor único vertical — descartado por límite de escalado y punto único de fallo.

---

## 20. Accesibilidad

**Objetivo.** Garantizar una Plataforma usable por todas las personas.

**Descripción.** Cumplimiento **WCAG 2.2 nivel AA**: contraste ≥ 4,5:1 (≥ 3:1 texto grande), navegación completa por teclado con foco visible, HTML semántico y *landmarks* ARIA cuando proceda, etiquetas y errores de formulario accesibles, alt text, respeto a `prefers-reduced-motion`. Verificación automatizada (axe) en CI y auditoría manual en páginas clave.

**Justificación.** Es requisito de calidad, de alcance de audiencia y, en contratación pública, con frecuencia obligación legal (EN 301 549).

**Impacto.** Cumplimiento, SEO (solapamiento con buenas prácticas) y reputación.

**Riesgos.** Regresiones por nuevos componentes; mitigado con axe en CI y componentes accesibles por diseño.

**Dependencias.** Sistema de diseño accesible; herramientas de test.

**Decisiones tomadas.** WCAG 2.2 AA como criterio de aceptación; sin bloqueantes de accesibilidad para desplegar.

**Alternativas descartadas.** Accesibilidad «best-effort» sin verificación — descartada por no auditable ni conforme.

---

## 21. UX

**Objetivo.** Definir principios de experiencia de usuario.

**Descripción.** Principios: **claridad sobre creatividad**; **orientación a conversión** (cada página con un objetivo y un CTA claro); **escaneabilidad** (títulos, listas, datos destacados); **mobile-first**; **consistencia** de patrones. Recorridos clave optimizados: descubrir servicio → ver casos → solicitar propuesta; y descargar recurso → *nurturing*.

**Justificación.** El usuario B2B busca información y confianza, no ornamento; la experiencia debe reducir fricción hasta la conversión.

**Impacto.** Tasa de conversión y satisfacción.

**Riesgos.** Sobrecarga informativa; mitigado con jerarquía visual y contenido escaneable.

**Dependencias.** UI ([§22](#22-ui)), contenido, arquitectura de la información.

**Decisiones tomadas.** Máximo 3 clics de la Home a cualquier contenido clave; CTAs orientados a valor («Solicitar propuesta», «Hablar con un ingeniero»).

**Alternativas descartadas.** Experiencias muy animadas/experimentales — descartadas por fricción y coste de rendimiento/accesibilidad.

---

## 22. UI

**Objetivo.** Definir el sistema visual.

**Descripción.** **Sistema de diseño basado en tokens** (color, tipografía, espaciado, radios, sombras) como fuente única compartida entre diseño y desarrollo. Rejilla de 12 columnas; escala de espaciado 4/8 px. Componentes reutilizables (botones, tarjetas de servicio, tarjeta de caso, formularios, banners CTA). **`[HIPÓTESIS]`** directrices provisionales (a validar con manual de marca): paleta primaria azul técnico, acento verde (sostenibilidad), neutros grises; tipografía sans-serif geométrica de licencia abierta; iconografía lineal; fotografía de proyectos reales sobre banco de imágenes.

**Justificación.** Los tokens garantizan consistencia y velocidad de desarrollo, y permiten temas (claro/oscuro) e i18n.

**Impacto.** Coherencia de marca, mantenibilidad y accesibilidad (contraste).

**Riesgos.** Divergencia diseño-código; mitigado con tokens compartidos y biblioteca de componentes documentada.

**Dependencias.** Manual de marca (pendiente); Tailwind + tokens.

**Decisiones tomadas.** UI gobernada por tokens; contraste conforme a WCAG 2.2 AA por diseño.

**Alternativas descartadas.** Estilos ad hoc por página — descartados por inconsistencia y deuda técnica.

---

## 23. Diseño responsive

**Objetivo.** Asegurar una experiencia correcta en cualquier dispositivo.

**Descripción.** **Mobile-first** real: layouts fluidos (flexbox/grid), unidades relativas, imágenes `max-width:100%` y `srcset` para servir el tamaño adecuado. Puntos de ruptura basados en contenido, no en dispositivos concretos. Verificación en rango 320px–4K.

**Justificación.** Buena parte del tráfico B2B de investigación inicial ocurre en móvil; además el móvil es el criterio de indexación de Google (*mobile-first indexing*).

**Impacto.** SEO, conversión y accesibilidad.

**Riesgos.** *Layout shift* (CLS) por medios sin dimensiones; mitigado reservando espacio y con `srcset`.

**Dependencias.** Sistema de diseño; pipeline de imágenes.

**Decisiones tomadas.** Mobile-first como enfoque de diseño y desarrollo; sin *scroll* horizontal del cuerpo en ningún viewport.

**Alternativas descartadas.** Diseño desktop-first adaptado a móvil — descartado por peor rendimiento y experiencia móvil.

---

## 24. Navegación

**Objetivo.** Definir cómo se mueve el usuario por la Plataforma.

**Descripción.** **Header:** Servicios (mega-menú), Proyectos, Sectores *(opcional)*, Sobre nosotros, Recursos, Contacto + CTA destacado «Solicitar propuesta». **Footer:** mapa reducido, contacto, redes, legal, certificaciones, selector de idioma (cuando i18n esté activo). Migas de pan en páginas profundas. Búsqueda accesible desde el header. Profundidad máxima de 3 clics.

Mapa del sitio (sitemap lógico):

```
/
├── /servicios/{ingenieria-industrial | eficiencia-energetica | energias-renovables |
│                instalaciones-mep | consultoria-tecnica | digitalizacion-bim}
├── /proyectos  →  /proyectos/{slug}
├── /sectores   (opcional)
├── /sobre-nosotros  →  /equipo, /certificaciones
├── /recursos   →  /recursos/{slug}
├── /empleo
├── /contacto
└── /legal → /aviso-legal, /privacidad, /cookies
```

**Justificación.** Estructura orientada a los CU y a las personas, con rutas cortas a la conversión.

**Impacto.** Usabilidad, SEO (enlazado interno) y conversión.

**Riesgos.** Menú sobrecargado; mitigado con jerarquía clara y mega-menú organizado por servicio.

**Dependencias.** Arquitectura de la información; contenido.

**Decisiones tomadas.** URLs semánticas, en minúsculas y con guiones; una sola taxonomía de servicios reutilizada en navegación, filtros y SEO.

**Alternativas descartadas.** Navegación por «sectores» como eje principal — descartada en favor de «servicios» (los sectores se mantienen como filtro/segmento).

---

## 25. Gestión de usuarios

**Objetivo.** Definir qué usuarios existen y cómo se gestionan.

**Descripción.** En el MVP, los usuarios autenticados son **internos** (editores/administradores del CMS y del panel operativo). Los visitantes y leads **no** requieren cuenta. La autenticación interna la provee el CMS y/o un proveedor gestionado (p. ej. Auth0/Clerk/Supabase Auth). El **área privada de cliente** (futuro) introducirá usuarios externos autenticados; se prevé su modelo pero no se implementa en MVP.

**Justificación.** Evitar autenticación de visitantes reduce fricción y superficie de seguridad; la autenticación gestionada delega la complejidad crítica (MFA, recuperación) en un proveedor especializado.

**Impacto.** Seguridad, cumplimiento y experiencia.

**Riesgos.** Introducir área privada sin diseño de identidad sólido; mitigado difiriéndola y previendo el modelo desde ahora.

**Dependencias.** Proveedor de identidad; CMS.

**Decisiones tomadas.** Sin cuentas para visitantes en MVP; identidad interna gestionada por proveedor especializado.

**Alternativas descartadas.** Autenticación propia desde cero — descartada por riesgo de seguridad y coste.

---

## 26. Roles

**Objetivo.** Definir los roles del sistema.

**Descripción.**

| Rol | Descripción | Ámbito |
|---|---|---|
| **Visitante** | Usuario anónimo del Sitio. | Público (MVP). |
| **Lead** | Visitante que ha convertido (no autenticado). | Público (MVP). |
| **Editor** | Gestiona contenido en el CMS. | Interno (MVP). |
| **Administrador** | Gestiona usuarios, configuración y consentimientos. | Interno (MVP). |
| **Desarrollador/DevOps** | Gestiona código, despliegues e infraestructura. | Interno (MVP). |
| **Cliente** | Usuario externo autenticado del área privada. | Externo (**futuro**). |

**Justificación.** Roles mínimos y claros que cubren los CU sin sobre-ingeniería.

**Impacto.** Base de la matriz de permisos ([§27](#27-permisos)).

**Riesgos.** Proliferación de roles; mitigado manteniendo el conjunto mínimo y añadiendo solo con justificación.

**Dependencias.** Gestión de usuarios ([§25](#25-gestión-de-usuarios)).

**Decisiones tomadas.** Seis roles canónicos; «Cliente» es futuro.

**Alternativas descartadas.** Roles granulares por módulo desde el inicio — descartados por complejidad prematura.

---

## 27. Permisos

**Objetivo.** Definir qué puede hacer cada rol (control de acceso).

**Descripción.** Modelo **RBAC** (control de acceso basado en roles). Matriz resumida:

| Recurso / Acción | Visitante | Lead | Editor | Administrador | DevOps | Cliente (futuro) |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Ver contenido público | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enviar formularios | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear/editar contenido (CMS) | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Publicar contenido | ❌ | ❌ | ✅* | ✅ | ❌ | ❌ |
| Gestionar usuarios/roles | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Ver consentimientos/leads | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Configurar despliegue/infra | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Ver estado de sus proyectos | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*`*` La publicación por Editor puede requerir aprobación según flujo editorial (decisión abierta [§49](#49-anexo-de-decisiones-abiertas) DA-4).*

**Justificación.** RBAC es suficiente y comprensible para la escala prevista; el principio de **mínimo privilegio** guía la asignación.

**Impacto.** Seguridad y cumplimiento.

**Riesgos.** Configuración incorrecta de permisos; mitigado con pruebas de autorización y revisión.

**Dependencias.** Roles ([§26](#26-roles)); proveedor de identidad.

**Decisiones tomadas.** RBAC + mínimo privilegio; datos personales solo accesibles por Administrador.

**Alternativas descartadas.** ABAC (basado en atributos) — descartado por complejidad innecesaria a esta escala.

---

## 28. Modelo de datos de alto nivel

**Objetivo.** Describir las entidades principales y sus relaciones (conceptual, sin esquema físico).

**Descripción.** Entidades canónicas:

| Entidad | Descripción | Fuente de verdad |
|---|---|---|
| **Servicio** | Línea de servicio. | CMS |
| **Proyecto (caso de éxito)** | Trabajo realizado con métricas y media. | CMS |
| **Sector** | Segmento de mercado (taxonomía). | CMS |
| **Artículo/Recurso** | Contenido editorial (blog, guías, lead magnets). | CMS |
| **Miembro del equipo** | Persona del equipo. | CMS |
| **Certificación** | Acreditaciones de la empresa. | CMS |
| **Lead** | Contacto comercial capturado. | PostgreSQL + CRM |
| **Candidatura** | Solicitud de empleo. | PostgreSQL |
| **Consentimiento** | Registro RGPD de consentimientos. | PostgreSQL |
| **Documento de embedding** | Fragmento de contenido + vector para RAG. | PostgreSQL (pgvector) |
| **Cliente / Proyecto-cliente** *(futuro)* | Datos del área privada. | PostgreSQL |

Relaciones clave: `Servicio 1—N Proyecto`; `Proyecto N—M Sector`; `Artículo N—1 Servicio` (relacionado); `Lead N—1 Servicio` (interés); `Documento de embedding N—1` (Servicio/Proyecto/Artículo de origen).

**Justificación.** Modelo conceptual estable que orienta tanto el CMS como la base de datos operativa, evitando duplicar el maestro de cada dato.

**Impacto.** Coherencia de datos, SEO (taxonomía única) y RAG (trazabilidad de fuentes).

**Riesgos.** Duplicidad de taxonomías entre CMS y DB; mitigado con una taxonomía única de servicios/sectores.

**Dependencias.** Arquitectura de datos ([§14](#14-arquitectura-de-datos)).

**Decisiones tomadas.** Una sola taxonomía de `Servicio` y `Sector` compartida por contenido, navegación, filtros, SEO y RAG.

**Alternativas descartadas.** Taxonomías separadas por módulo — descartadas por riesgo de incoherencia.

---

## 29. Convenciones del proyecto

**Objetivo.** Fijar acuerdos de trabajo transversales.

**Descripción.**
- **Idioma del código y documentación técnica:** inglés en identificadores de código; español en documentación de producto (este documento) y contenido.
- **Control de versiones:** Git; ramas `main` (protegida) y `feat/*`, `fix/*`, `chore/*`, `docs/*`; PR obligatorio con ≥ 1 revisión y CI verde para fusionar.
- **Commits:** Conventional Commits (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`).
- **Gobernanza del SSOT:** cambios a este documento vía PR con justificación; decisiones de arquitectura significativas se registran como ADR ([§43](#43-decisiones-de-arquitectura-adr)); versionado SemVer del documento.
- **Definición de Hecho (DoD):** código revisado y fusionado, tests en verde, sin regresiones de rendimiento/accesibilidad, contenido cargado, documentación actualizada, validado en *staging*.

**Justificación.** Reglas explícitas reducen fricción y ambigüedad en un equipo multidisciplinar.

**Impacto.** Calidad, trazabilidad y velocidad sostenible.

**Riesgos.** Incumplimiento de convenciones; mitigado con automatización (linters, hooks, CI) y revisión.

**Dependencias.** Herramientas de CI y calidad ([§30](#30-estándares-de-desarrollo)).

**Decisiones tomadas.** `main` protegida; PR + CI verde bloqueantes; ADR para decisiones estructurales.

**Alternativas descartadas.** *Trunk-based* con push directo a `main` — descartado por falta de revisión en un equipo con roles diversos.

---

## 30. Estándares de desarrollo

**Objetivo.** Definir cómo se escribe y mantiene el código.

**Descripción.**
- **Lenguaje:** TypeScript en modo estricto (frontend, islas y BFF).
- **Calidad automática:** ESLint + Prettier obligatorios, ejecutados en *pre-commit* (hooks) y en CI.
- **Nomenclatura:** componentes `PascalCase`; funciones/variables `camelCase`; constantes `UPPER_SNAKE_CASE`; utilidades `kebab-case.ts`.
- **Diseño de componentes:** pequeños, con una sola responsabilidad; lógica reutilizable en hooks/utils; contenido siempre desde el CMS, nunca *hardcoded*.
- **Documentación:** JSDoc en utilidades públicas; `README` por paquete/carpeta relevante.
- **Análisis de seguridad:** SCA de dependencias en CI ([§17](#17-seguridad)).

**Justificación.** Estándares uniformes hacen el código legible, mantenible y seguro, y reducen la revisión manual.

**Impacto.** Mantenibilidad y onboarding.

**Riesgos.** Reglas demasiado rígidas que frenen; mitigado con configuración pragmática y revisable.

**Dependencias.** CI/CD ([§33](#33-estrategia-de-despliegue)).

**Decisiones tomadas.** TypeScript estricto y linters bloqueantes en CI.

**Alternativas descartadas.** JavaScript sin tipado — descartado por menor robustez y peor mantenibilidad.

---

## 31. Organización del repositorio

**Objetivo.** Definir la estructura de carpetas (ya inicializada en el repositorio).

**Descripción.**

```
engineering-web/
├── docs/            Documentación del proyecto (incluye este PROJECT_BIBLE.md)
├── src/             Código fuente de la Plataforma (Sitio + islas + BFF)
├── public/          Recursos servidos tal cual (favicon, robots.txt, sitemap)
├── assets/          Recursos de diseño (imágenes fuente, logos, iconos)
├── config/          Configuración (entornos, build, linters)
├── tests/           Pruebas automatizadas
├── scripts/         Scripts de utilidad y automatización
├── .github/workflows/  CI/CD (GitHub Actions)
└── .vscode/         Configuración recomendada del editor
```

**Justificación.** Estructura estándar, plana y predecible que separa código, contenido, configuración y pruebas.

**Impacto.** Onboarding y mantenibilidad.

**Riesgos.** Estructura que no encaje con la herramienta final (p. ej. convenciones de Astro); mitigado ajustando `src/` a la convención del framework al iniciar el desarrollo (ADR-002).

**Dependencias.** Elección de framework ([§12](#12-arquitectura-del-frontend)).

**Decisiones tomadas.** Se mantiene la estructura inicial ya creada; `src/` se subdividirá según Astro (p. ej. `pages/`, `components/`, `layouts/`, `lib/`) al comenzar el desarrollo.

**Alternativas descartadas.** *Monorepo* multi-paquete complejo — descartado por innecesario a esta escala; reconsiderable si el área privada crece.

---

## 32. Estrategia de testing

**Objetivo.** Definir cómo se asegura la calidad funcional.

**Descripción.** Pirámide de pruebas:
- **Unitarias:** lógica de utilidades, validaciones, transformación de datos.
- **Integración:** flujos de formularios (validación → persistencia → CRM/email), endpoints del BFF, integración con IA (con *mocks* del proveedor).
- **E2E (Playwright):** recorridos críticos — solicitar propuesta, descargar recurso, navegación clave.
- **Accesibilidad (axe):** automatizada en CI.
- **Rendimiento (Lighthouse CI):** presupuesto verificado en páginas clave.
- **Visual/regresión** *(opcional/SHOULD)*: sobre componentes del sistema de diseño.

CI ejecuta lint + unit + integración + build + axe + Lighthouse antes de permitir *merge*; E2E en *staging*.

**Justificación.** Enfocar el esfuerzo en los flujos que generan valor de negocio (conversión) y en los atributos de calidad medibles.

**Impacto.** Fiabilidad de las conversiones y prevención de regresiones.

**Riesgos.** Tests frágiles/lentos; mitigado priorizando pruebas de alto valor y datos estables.

**Dependencias.** Entorno de *staging*; *mocks* de terceros.

**Decisiones tomadas.** CI bloqueante con lint+unit+integración+axe+Lighthouse; E2E de rutas críticas obligatorio.

**Alternativas descartadas.** Cobertura 100 % como objetivo — descartada por coste desproporcionado; se prioriza cobertura de lógica crítica.

---

## 33. Estrategia de despliegue

**Objetivo.** Definir cómo llega el código a producción.

**Descripción.** **CI/CD con GitHub Actions.** Entornos: `local` → `staging` (preproducción no indexable) → `production`. *Deploy* continuo en cada *merge* a `main` (tras CI verde) mediante la plataforma de despliegue (Vercel/Netlify/Cloudflare Pages, ver [§49](#49-anexo-de-decisiones-abiertas) DA-3), con **previews** por PR. *Rollback* inmediato a la versión anterior. Los cambios de contenido del CMS disparan un **rebuild del sitio vía webhook** (mecanismo base y portable); la regeneración incremental por página (ISR/ODB) es una optimización **opcional dependiente del proveedor** ([§49](#49-anexo-de-decisiones-abiertas) DA-3), no un requisito.

**Justificación.** *Deploy* automatizado con previews reduce riesgo, acelera la iteración y permite revisar cambios visualmente antes de fusionar.

**Impacto.** Velocidad de entrega y estabilidad.

**Riesgos.** Despliegue de contenido roto; mitigado con previews, CI y *rollback*.

**Dependencias.** Plataforma de despliegue; CMS con webhooks.

**Decisiones tomadas.** *Deploy* continuo a producción desde `main` con CI verde; `staging` con `noindex`; previews por PR.

**Alternativas descartadas.** Despliegues manuales programados — descartados por lentitud y riesgo humano.

---

## 34. Monitorización

**Objetivo.** Observar la salud de la Plataforma.

**Descripción.** **Uptime/health checks** con alertas de caída; **RUM** (Real User Monitoring) de Core Web Vitals; **seguimiento de errores** (frontend y BFF) con agregación y alertas; panel de métricas clave. Integración con SEO (Search Console) y analítica de negocio (conversiones).

**Justificación.** No se puede garantizar disponibilidad y rendimiento ([§9](#9-requisitos-no-funcionales)) sin observabilidad.

**Impacto.** MTTR reducido y cumplimiento de SLOs.

**Riesgos.** Fatiga de alertas; mitigado con umbrales y priorización de alertas accionables.

**Dependencias.** Herramientas de monitorización/errores; consentimiento para RUM si aplica.

**Decisiones tomadas.** Alertas de caída y de error crítico activas desde el lanzamiento; RUM de CWV en producción.

**Alternativas descartadas.** Monitorización solo reactiva (esperar a que el usuario reporte) — descartada por impacto en disponibilidad/negocio.

---

## 35. Gestión de errores

**Objetivo.** Definir cómo se tratan los errores para usuario y sistema.

**Descripción.**
- **Usuario:** mensajes claros y accionables; páginas 404/500 útiles con navegación de retorno; estados de error de formulario específicos y accesibles; nunca exponer detalles técnicos ni datos sensibles.
- **Sistema:** captura centralizada; distinción error esperado/inesperado; **reintentos durables** de integraciones (CRM, email) mediante el **patrón *outbox*** ([ADR-010](#43-decisiones-de-arquitectura-adr)) —no en memoria, inviables en serverless— con *backoff* exponencial e idempotencia; *fallbacks* (si el CRM falla, el lead ya está persistido y el *worker* reintenta el envío).
- **Correlación:** identificador de traza por petición para diagnóstico.

**Justificación.** La resiliencia en la captura de leads es crítica: un fallo de terceros no debe perder un lead.

**Impacto.** No perder conversiones; mejor experiencia y diagnóstico.

**Riesgos.** Errores silenciados; mitigado con registro y alertas ([§34](#34-monitorización)).

**Dependencias.** Logs ([§36](#36-gestión-de-logs)); monitorización.

**Decisiones tomadas.** Los leads se persisten en PostgreSQL **antes** de intentar el envío a CRM/email, con reintentos durables vía *outbox* ([ADR-010](#43-decisiones-de-arquitectura-adr)); los mensajes de error nunca exponen internals.

**Alternativas descartadas.** Enviar a CRM sin persistencia previa — descartado por riesgo de pérdida de leads ante fallo del CRM.

---

## 36. Gestión de logs

**Objetivo.** Definir el registro de eventos del sistema.

**Descripción.** **Logs estructurados** (JSON) con nivel (`debug`/`info`/`warn`/`error`), *timestamp*, identificador de traza y contexto mínimo necesario. **Prohibido registrar datos personales o secretos** (cumplimiento y seguridad). Retención acotada y acorde a RGPD. Centralización y búsqueda en la herramienta de observabilidad.

**Justificación.** Logs estructurados permiten diagnóstico y correlación; excluir datos personales evita convertir los logs en un tratamiento de datos no controlado.

**Impacto.** Diagnóstico, cumplimiento y seguridad.

**Riesgos.** Fuga de datos personales en logs; mitigado con reglas de saneado y revisión.

**Dependencias.** Monitorización ([§34](#34-monitorización)); gestión de errores.

**Decisiones tomadas.** Logs estructurados sin PII ni secretos; retención mínima necesaria.

**Alternativas descartadas.** Logging verboso con volcado de peticiones completas — descartado por riesgo RGPD/seguridad.

---

## 37. Gestión de configuración

**Objetivo.** Definir cómo se gestiona la configuración por entorno.

**Descripción.** Configuración separada del código, por entorno (`local`/`staging`/`production`). **Secretos** en el gestor de secretos de la plataforma/CI, **nunca** en el repositorio. Configuración no sensible versionada en `config/`. Un archivo `.env.example` documenta las variables sin valores reales. Validación de la configuración al arranque del BFF (falla rápido si falta una variable requerida).

**Justificación.** Separar configuración de código (12-factor) permite el mismo artefacto en todos los entornos y protege los secretos.

**Impacto.** Seguridad, portabilidad y fiabilidad de despliegues.

**Riesgos.** Variables faltantes en producción; mitigado con validación al arranque y `.env.example` mantenido.

**Dependencias.** Gestor de secretos; CI/CD.

**Decisiones tomadas.** Secretos solo en gestor seguro; validación de configuración *fail-fast*.

**Alternativas descartadas.** Configuración *hardcoded* por entorno — descartada por insegura y frágil.

---

## 38. Variables de entorno

**Objetivo.** Catalogar las variables de configuración previstas (contrato de configuración).

**Descripción.** Listado de referencia (los nombres definitivos se fijan al integrar cada proveedor; valores reales **nunca** en el repositorio):

| Variable | Propósito | Sensible |
|---|---|---|
| `CMS_API_URL` / `CMS_API_TOKEN` | Acceso al CMS headless. | Token: sí |
| `CRM_API_BASE` / `CRM_API_KEY` / `CRM_WEBHOOK_SECRET` | Envío de leads al CRM y verificación de webhooks. | Sí |
| `EMAIL_PROVIDER` / `EMAIL_API_KEY` / `EMAIL_FROM` | Email transaccional (selector de proveedor + credenciales). | Clave: sí |
| `AI_PROVIDER` / `AI_PROVIDER_API_KEY` | Proveedor de IA de **generación** (`anthropic`) y su clave. | Clave: sí |
| `AI_MODEL_DEFAULT` / `AI_MODEL_COMPLEX` | Selección de modelos: por defecto (Haiku, económico) y para consultas complejas (Sonnet/Opus). | No |
| `EMBEDDINGS_PROVIDER` / `EMBEDDINGS_API_KEY` / `EMBEDDINGS_MODEL` | Proveedor de **embeddings** (`voyage`), su clave y modelo ([§49](#49-anexo-de-decisiones-abiertas) DA-10). | Clave: sí |
| `AI_MONTHLY_BUDGET` / `AI_BUDGET_HARD_STOP` | Presupuesto máximo mensual de IA y activación del corte duro al alcanzarlo ([§49](#49-anexo-de-decisiones-abiertas) DA-6). | No |
| `DATABASE_URL` / `DATABASE_VECTOR_POOL_SIZE` | Conexión PostgreSQL (con pgvector) y tamaño del pool vectorial. | URL: sí |
| `ANALYTICS_PROVIDER` / `ANALYTICS_ID` | Analítica: selector de proveedor e identificador (si aplica). | No |
| `CMP_SITE_ID` | Gestor de consentimiento. | No |
| `SITE_URL` / `NODE_ENV` / `ENVIRONMENT` | Entorno y URL base. | No |
| `RATE_LIMIT_*` | Límites antiabuso de formularios/IA. | No |
| `OUTBOX_WORKER_SECRET` | Autenticación (Bearer) del endpoint interno que procesa el outbox de leads ([§43](#43-decisiones-de-arquitectura-adr) ADR-010). En Vercel (DA-3) se duplica el mismo valor en `CRON_SECRET` para la inyección automática del cron. | Sí |
| `EMAIL_TO_INTERNAL` | Buzón interno que recibe las notificaciones de nuevos leads y candidaturas (ADR-008). | No |

**Justificación.** Un contrato explícito de configuración evita fallos de despliegue y clarifica dependencias.

**Impacto.** Fiabilidad de despliegues y seguridad.

**Riesgos.** Deriva entre `.env.example` y la realidad; mitigado con validación al arranque ([§37](#37-gestión-de-configuración)).

**Dependencias.** Integraciones ([§15](#15-integraciones-externas)).

**Decisiones tomadas.** Toda variable sensible se gestiona como secreto; `.env.example` se mantiene actualizado.

**Alternativas descartadas.** Claves embebidas en el frontend — descartadas por exposición ([§13](#13-arquitectura-del-backend)/[§17](#17-seguridad)).

---

## 39. Riesgos del proyecto

**Objetivo.** Consolidar los riesgos generales de ejecución.

**Descripción.**

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|:--:|:--:|---|
| P1 | Contenido real (casos, textos, fotos) llega tarde. | Alta | Alto | Inventario temprano; responsable de contenidos; *placeholders* controlados. |
| P2 | Hipótesis de negocio/marca incorrectas. | Media | Alto | Validación bloqueante en Fase 0 ([§44](#44-hipótesis)). |
| P3 | *Scope creep*. | Alta | Medio | MoSCoW estricto; gobernanza; ADR. |
| P4 | Falta de manual de marca. | Media | Medio | Directrices provisionales ([§22](#22-ui)); formalizar en Fase 0. |
| P5 | Equipo del cliente sin capacidad de mantener el stack. | Media | Alto | Partner de mantenimiento y/o formación (DA-1 cerrada: el stack Astro **no** se renegocia por este motivo). |

**Justificación.** Gestionar el riesgo explícitamente permite mitigarlo antes de que se materialice.

**Impacto.** Plazos, coste y calidad.

**Riesgos.** *(meta)* Subestimar riesgos; mitigado con revisión por fase.

**Dependencias.** Gobernanza; roadmap.

**Decisiones tomadas.** Validación de hipótesis como puerta de entrada a la Fase 1.

**Alternativas descartadas.** Gestión de riesgos informal — descartada por poco fiable.

---

## 40. Riesgos técnicos

**Objetivo.** Detallar riesgos de naturaleza técnica.

**Descripción.**

| # | Riesgo | Mitigación |
|---|---|---|
| T1 | Rendimiento degradado por imágenes/terceros. | *Performance budget* + Lighthouse CI bloqueante; control de scripts vía CMP. |
| T2 | *Vendor lock-in* (CMS/hosting/IA). | Estándares abiertos; exportabilidad; abstracción en BFF. |
| T3 | Alucinaciones o coste variable de IA. | RAG anclado a fuentes; modelos económicos por defecto; *rate limiting*. |
| T4 | Abuso/spam de formularios e IA. | Antispam, *rate limiting*, WAF, validación server-side. |
| T5 | Pérdida de leads por fallo de terceros. | Persistencia previa + reintentos ([§35](#35-gestión-de-errores)). |
| T6 | Dependencias vulnerables. | SCA en CI bloqueante para críticas. |
| T7 | Deriva de configuración/entornos. | Validación *fail-fast* + `.env.example`. |

**Justificación.** Anticipar los fallos técnicos más probables del patrón elegido.

**Impacto.** Disponibilidad, coste, seguridad y conversión.

**Riesgos.** *(meta)* Riesgos emergentes de nuevas dependencias; mitigado con revisión continua.

**Dependencias.** Secciones [§16](#16-inteligencia-artificial)–[§18](#18-rendimiento), [§35](#35-gestión-de-errores)–[§38](#38-variables-de-entorno).

**Decisiones tomadas.** Mitigaciones incorporadas como requisitos, no como buenas intenciones.

**Alternativas descartadas.** Aceptar el *lock-in* sin abstracción — descartado por coste de salida futuro.

---

## 41. Riesgos de negocio

**Objetivo.** Detallar riesgos de mercado y retorno.

**Descripción.**

| # | Riesgo | Mitigación |
|---|---|---|
| N1 | SEO sin resultados a corto plazo. | Gestión de expectativas; canales complementarios (LinkedIn/Ads); foco en *long-tail* comercial. |
| N2 | Bajo volumen de leads pese al sitio. | Optimización de conversión (CRO), lead magnets, iteración basada en datos. |
| N3 | Diferenciación insuficiente frente a competencia. | Territorio de marca «resultados con datos»; casos con métricas. |
| N4 | Desalineación entre marketing y comercial. | Definición común de «lead cualificado»; integración CRM; alertas al equipo. |

**Justificación.** El valor del proyecto se mide en negocio; sus riesgos deben gestionarse explícitamente.

**Impacto.** Retorno de la inversión.

**Riesgos.** *(meta)* Métricas mal elegidas; mitigado con KPIs de negocio, no de vanidad.

**Dependencias.** Objetivos ([§2](#2-objetivos-del-negocio)); automatización/marketing.

**Decisiones tomadas.** Priorizar calidad de lead sobre volumen bruto.

**Alternativas descartadas.** Medir el éxito solo por tráfico — descartado por ser métrica de vanidad.

---

## 42. Riesgos legales

**Objetivo.** Detallar riesgos de cumplimiento.

**Descripción.**

| # | Riesgo | Mitigación |
|---|---|---|
| L1 | Incumplimiento RGPD/LOPDGDD (consentimiento, datos de formularios). | CMP; consentimiento previo; minimización; registro de consentimientos; DPA con proveedores. |
| L2 | Incumplimiento LSSI-CE (aviso legal, cookies). | Textos legales completos; política de cookies; bloqueo de scripts hasta consentimiento. |
| L3 | Transferencias internacionales de datos. | Proveedores con residencia/garantías UE; DPA con cláusulas adecuadas. |
| L4 | IA que afirme capacidades no reales (publicidad engañosa). | Guardarraíles RAG; revisión de *prompts*; citación de fuentes. |
| L5 | Accesibilidad obligatoria (sector público, EN 301 549). | WCAG 2.2 AA verificado. |

**Justificación.** El marco UE/España impone obligaciones que, incumplidas, acarrean sanción y daño reputacional.

**Impacto.** Legal, económico y reputacional.

**Riesgos.** *(meta)* Cambios normativos; mitigado con revisión legal periódica.

**Dependencias.** Asesoría legal; CMP; DPAs.

**Decisiones tomadas.** Revisión legal de textos y flujos de datos antes del lanzamiento; datos personales en la UE.

**Alternativas descartadas.** Lanzar con textos legales genéricos sin revisión — descartado por riesgo de sanción.

---

## 43. Decisiones de arquitectura (ADR)

**Objetivo.** Registrar las decisiones estructurales y su justificación (formato ADR resumido).

**Descripción.**

| ADR | Decisión | Estado | Justificación (resumen) | Alternativas descartadas |
|---|---|---|---|---|
| **ADR-001** | Arquitectura **Jamstack** (estático + CDN + headless + BFF serverless). | Aceptada | Rendimiento/SEO/coste/seguridad para sitio de contenido con captación. | Monolito clásico; SPA sin SSR. |
| **ADR-002** | **Astro** + islas **React** + **TypeScript** (definitivo, DA-1 cerrada). | Aceptada | Mínimo JS, gran SEO/CWV, ecosistema React para interactividad. | Next.js — descartado para el sitio; **reevaluable solo para el área privada antes de F4** ([§12](#12-arquitectura-del-frontend)). Vue/Svelte descartados. |
| **ADR-003** | **CMS headless** como fuente de verdad del contenido. | Aceptada | Autonomía editorial; separación contenido/presentación. | WordPress acoplado. |
| **ADR-004** | **PostgreSQL gestionado (UE) con pgvector** para datos operativos + RAG. | Aceptada | Un solo motor para datos y vectores; residencia UE. | DB vectorial dedicada; NoSQL. |
| **ADR-005** | **RAG anclado a fuentes** con **Claude (Anthropic)** vía BFF; sin acciones en MVP. | Aceptada | Diferenciación con bajo riesgo de alucinación; claves protegidas. | Chatbot libre; modelo auto-alojado. |
| **ADR-006** | **RBAC + mínimo privilegio**; sin cuentas para visitantes en MVP. | Aceptada | Suficiente y seguro a esta escala; menor fricción. | ABAC; auth propia; login de visitantes. |
| **ADR-007** | **CI/CD GitHub Actions** con *deploy* continuo, previews y `staging` no indexable. | Aceptada | Entrega rápida y segura con revisión visual. | Despliegues manuales. |
| **ADR-008** | **Persistir leads antes de enviarlos** a CRM/email, con reintentos (mecanismo durable en ADR-010). | Aceptada | Evita pérdida de leads ante fallo de terceros. | Envío directo sin persistencia. |
| **ADR-009** | **i18n diseñado desde el inicio, activado después**. | Aceptada | Prepara ES/EN sin coste de lanzamiento. | i18n completo en MVP; ignorarlo. |
| **ADR-010** | **Patrón *Outbox* + reintento programado** para leads (persistencia durable). | Aceptada | En serverless los reintentos en memoria no sobreviven a la invocación; el *outbox* garantiza la entrega sin perder leads. | Reintentos solo en memoria; cola/broker dedicado (sobredimensionado a esta escala). |
| **ADR-011** | **Línea base de versiones: Astro 7 + Tailwind CSS v4 + Node ≥22.12** (motivada por seguridad). | Aceptada | Astro ≤ 5/6 arrastra 5 advisories **HIGH** (XSS en `define:vars`, replay de server islands, XSS por *slot*/*spread props*, SSRF en página de error) sin fix fuera del *major* 7. `@astrojs/tailwind` no soporta Astro 7 → se adopta **Tailwind v4 (`@tailwindcss/vite`, config CSS-first)**. No cambia la arquitectura (sigue Astro + islas React + Tailwind por tokens). | Permanecer en Astro 5 con XSS abiertos (descartado por seguridad); congelar primitivas de Astro (inviable para el producto). |

**Justificación.** Los ADR dejan trazabilidad del *porqué* de cada decisión, condición para que el SSOT sea coherente en el tiempo.

**Impacto.** Coherencia arquitectónica y onboarding.

**Riesgos.** ADR desactualizados; mitigado con la regla de que toda decisión estructural nueva genera o revisa un ADR ([§29](#29-convenciones-del-proyecto)).

**Dependencias.** Todas las secciones de arquitectura.

**Decisiones tomadas.** Las once ADR anteriores quedan aceptadas como línea base; los cambios se registran incrementando el número de ADR.

> **ADR-010 · Patrón *Outbox* (detalle).** El BFF, dentro de la **misma transacción** que crea el `Lead` en PostgreSQL, escribe un registro en una tabla ***outbox*** con estado `pending`. La respuesta al usuario se da tras esa persistencia (el lead **nunca** se pierde). Un **worker programado** (cron de la plataforma de despliegue) toma los `pending`, intenta el envío a CRM/email con ***backoff* exponencial**, y marca `sent` o incrementa el contador de reintentos hasta `failed` (con alerta, [§34](#34-monitorización)). Es **idempotente** (clave de deduplicación por registro) para tolerar reintentos y ejecuciones solapadas. Sustituye a los reintentos en memoria de [ADR-008](#43-decisiones-de-arquitectura-adr)/[§35](#35-gestión-de-errores), inviables en funciones efímeras. Depende de la persistencia de [§14](#14-arquitectura-de-datos) y de un *scheduler* del proveedor ([§49](#49-anexo-de-decisiones-abiertas) DA-3).

**Alternativas descartadas.** Documentar decisiones solo en actas dispersas — descartado por falta de trazabilidad.

---

## 44. Hipótesis

**Objetivo.** Consolidar los supuestos que deben validarse en la Fase 0.

**Descripción.** **Todas requieren validación en Fase 0.** Su confirmación **no** condiciona la oficialidad del documento (ya adoptado como **🟢 v1.0 / SSOT**): al validarse, se integran como actualización de contenido (v1.1). Mientras no se confirmen, el contenido dependiente se trata como **provisional** y así se marca.

| ID | Hipótesis | Si resulta falsa… |
|---|---|---|
| H1 | Ingeniería española de tamaño medio (30–80 pers.). | Ajustar escala, tono y stack. |
| H2 | Especialidad: industrial, energética, instalaciones, renovables. | Reescribir servicios ([§6](#6-funcionalidades-principales)) y SEO. |
| H3 | Diferenciación en eficiencia energética/sostenibilidad. | Revisar posicionamiento y mensajes. |
| H4 | Modelo B2B con comité de compra. | Revisar personas ([§4](#4-público-objetivo)) y CTAs. |
| H5 | Objetivo primario = generación de leads. | Reordenar prioridades funcionales. |
| H6 | Certificaciones ISO disponibles (9001/14001/45001). | Retirar esa prueba social. |
| H7 | Presupuesto/equipo compatibles con stack moderno (Astro/headless). | Contratar partner de mantenimiento/formación; **el stack no cambia** (DA-1 cerrada). |
| H8 | El cliente aporta responsable de contenidos. | Se agrava el riesgo P1; replanificar. |
| H9 | Idiomas ES (ahora) y EN (después). | Ajustar i18n y roadmap. |
| H10 | Directrices visuales provisionales (azul/verde, sans-serif). | Rehacer UI ([§22](#22-ui)) con el manual real. |
| H11 | Nombre comercial y *tagline* pendientes (`«[NOMBRE_EMPRESA]»`). | Bloqueante para diseño final. |

**Justificación.** Separar hechos de supuestos evita construir sobre premisas no verificadas.

**Impacto.** Condiciona todo el producto; por eso su validación es la puerta de la Fase 1.

**Riesgos.** Avanzar sin validar; mitigado con la puerta de Fase 0.

**Dependencias.** Sesión de descubrimiento con el cliente.

**Triaje de gobernanza (v1.1, Informe Final de Gobernanza — solo operativo; ninguna hipótesis se valida aquí):**

| Clase | Hipótesis | Motivo |
|---|---|---|
| 🔴 **Bloquean el lanzamiento** | **H6, H7, H8, H11** | H6 = afirmación de compliance (certificaciones); H7 = presupuesto que activa los proveedores ratificados; H8 = sin responsable de contenido no se cumple el *gate* de lanzamiento (6–8 casos con métricas verificadas); H11 = el nombre impregna dominio/`SITE_URL`, legales, `Organization` schema y marca. |
| 🟡 **Solo confirmación documental** | **H2, H3, H4, H9, H10** | Un documento del cliente las cierra; deben llegar antes del lanzamiento pero no exigen producción. H2 (taxonomía §24 ya publicada) es la de mayor impacto si resultara falsa. |
| 🟢 **Diferibles a post-lanzamiento** | **H1, H5** | Nada publicado depende de ellas (H1: ninguna cifra de plantilla publicada; H5: objetivos numéricos necesarios para el cuadro de KPIs, no para publicar). |

**Decisiones tomadas.** Ninguna hipótesis se da por cierta sin confirmación documental del cliente. El triaje anterior **no altera** esa regla: solo ordena el trabajo de cierre. La disciplina *«nada no validado se publica»* está protegida por la batería de tests del frontend.

**Alternativas descartadas.** Inventar datos para «rellenar» — descartado por instrucción explícita y por riesgo.

---

## 45. Limitaciones conocidas

**Objetivo.** Declarar con transparencia lo que el documento y el alcance inicial no cubren.

**Descripción.**
- Datos de empresa no confirmados (ver [§44](#44-hipótesis)); el documento es accionable pero **provisional** hasta validarlos.
- El **manual de marca** definitivo no existe aún; la UI parte de directrices provisionales.
- **Presupuesto, equipo y proveedores concretos** (CRM, hosting, CMS) están abiertos ([§49](#49-anexo-de-decisiones-abiertas)).
- El **área privada**, la **calculadora** y la **automatización avanzada** son alcance futuro, no especificado a nivel de detalle.
- Las **estimaciones de roadmap** son orientativas.

**Justificación.** Declarar límites evita expectativas incorrectas y falsos supuestos de completitud.

**Impacto.** Gestión de expectativas y planificación.

**Riesgos.** Tomar lo provisional como definitivo; mitigado con el **seguimiento explícito** de hipótesis ([§44](#44-hipótesis)) y decisiones abiertas ([§49](#49-anexo-de-decisiones-abiertas)), y con el marcado de todo contenido dependiente como provisional.

**Dependencias.** Fase 0 de descubrimiento.

**Decisiones tomadas.** El documento es **oficial (🟢 v1.0 / SSOT)**; los supuestos y proveedores pendientes se rastrean en [§44](#44-hipótesis) y [§49](#49-anexo-de-decisiones-abiertas), y su cierre se integrará como actualización de contenido (v1.1).

**Alternativas descartadas.** Presentar el documento como cerrado/definitivo pese a las incógnitas — descartado por honestidad y rigor.

---

## 46. Roadmap de alto nivel

**Objetivo.** Secuenciar la entrega en fases con hitos.

**Descripción.** **⚠️ INCERTIDUMBRE** en fechas exactas (dependen de recursos y del modelo de mantenimiento, ver [§44](#44-hipótesis) H7). Secuencia lógica:

| Fase | Contenido | Hito |
|---|---|---|
| **F0 — Descubrimiento** (sem. 1–2) | Validar hipótesis ([§44](#44-hipótesis)); manual de marca; keyword research; inventario de casos; cerrar decisiones abiertas ([§49](#49-anexo-de-decisiones-abiertas)). **DA-3 (hosting) y DA-10 (embeddings) deben cerrarse en F0, antes del BFF/RAG de F1–F2.** **Estructura de repo ✅ hecha. Bible 🟢 v1.0 oficial ✅.** | Hipótesis validadas y decisiones cerradas → **actualización de contenido v1.1** del SSOT. |
| **F1 — MVP** (sem. 3–8) | RF-01…RF-11: Home, servicios, portfolio, sobre nosotros, contacto, legal; CMS; formularios→CRM; SEO técnico; analítica; RGPD. **Capa de interfaz ✅ construida y auditada** (biblioteca de UI *LIBRARY APPROVED* + todas las pantallas del [§13 DESIGN_SYSTEM] + Header/Footer + SEO técnico → *FRONTEND APPROVED*, con contenido honesto: plantillas fieles y fuentes tipadas vacías, sin datos inventados). **BFF ✅ construido y probado** (2026-07-14): endpoints de captación (`/api/leads`, `/api/candidatures`) con validación en frontera y *rate limiting* durable ([§17](#17-seguridad)); persistencia PostgreSQL (Lead/Candidatura/Consentimiento, [§28](#28-modelo-de-datos)) con **outbox transaccional + worker de reintentos** (ADR-010); integraciones **Brevo** (CRM DA-2 + email DA-8) y capa de lectura **Sanity** (DA-7) con *fallback* honesto — todo operativo en cuanto existan credenciales. Las páginas siguen 100 % SSG; solo `/api/*` es *on-demand*. **Pendiente:** altas/credenciales de proveedores (ratificación [§49](#49-anexo-de-decisiones-abiertas)), cableado de los formularios aprobados → `/api`, analítica/CMP y despliegue. | Lanzamiento del Sitio. |
| **F2 — Contenido + IA mínima** (mes 3–4) | RF-12…RF-16: blog/recursos, lead magnets, empleo, **asistente IA/búsqueda semántica (mín.)**, búsqueda interna; datos estructurados completos; CWV afinados. **Interfaz del asistente IA y de recursos/empleo/lead-magnet ✅ construida** (widget sin lógica de backend); **pendiente:** RAG, embeddings, contenido real y presupuesto/hard-stop de IA (DA-6, pendiente de ratificación del cliente). | IA en producción; motor de contenido. |
| **F3 — Automatización + i18n** (mes 5–6) | RF-17 y RF-20: multi-idioma ES/EN, automatización de marketing (lead scoring), A/B testing de conversión. | Crecimiento y multi-idioma. |
| **F4 — Área privada + avanzado** (6 m+) | RF-18 (calculadora de ahorro) y RF-19 (área privada); IA avanzada. | Autoservicio de cliente. |

**Justificación.** Entregar valor incremental, validando antes de invertir en lo complejo.

**Impacto.** Planificación, presupuesto y expectativas.

**Riesgos.** Adelantar fases futuras; mitigado con gobernanza y MoSCoW.

**Dependencias.** Validación de hipótesis; recursos.

**Decisiones tomadas.** La Fase 1 no comienza hasta cerrar la Fase 0 (validación).

**Alternativas descartadas.** *Big bang* (todo en un único lanzamiento) — descartado por riesgo y falta de validación temprana.

---

## 47. Glosario

> *Sección de referencia: no aplica la microestructura de calidad de 8 puntos (ver justificación en [§50](#50-resultado-de-la-autoauditoría)).*

| Término | Definición |
|---|---|
| **ADR** | *Architecture Decision Record*: registro de una decisión de arquitectura. |
| **B2B** | *Business to Business*: negocio entre empresas. |
| **BFF** | *Backend for Frontend*: capa de servicios orientada al frontend. |
| **BIM** | *Building Information Modeling*: modelado de información de construcción. |
| **CMP** | *Consent Management Platform*: gestor de consentimiento de cookies. |
| **CMS** | *Content Management System* (aquí, *headless*). |
| **CRM** | *Customer Relationship Management*: gestión de relaciones con clientes. |
| **CRO** | *Conversion Rate Optimization*: optimización de conversión. |
| **Core Web Vitals (CWV)** | Métricas de experiencia de página: LCP, INP, CLS. |
| **CTA** | *Call To Action*: llamada a la acción. |
| **DPA** | *Data Processing Agreement*: contrato de encargo de tratamiento (RGPD). |
| **E2E** | *End-to-end*: pruebas de extremo a extremo. |
| **i18n** | Internacionalización. |
| **ISR** | *Incremental Static Regeneration*: regeneración estática incremental. En este proyecto es una **optimización opcional dependiente del proveedor de hosting** (DA-3), no una pieza arquitectónica; la base es SSG + rebuild por webhook ([§12](#12-arquitectura-del-frontend)). |
| **Jamstack** | Arquitectura de sitios con front estático + servicios vía API. |
| **Lead** | Contacto comercial potencial. |
| **MEP** | *Mechanical, Electrical, Plumbing*: instalaciones. |
| **MoSCoW** | Priorización: Must/Should/Could/Won't. |
| **MVP** | *Minimum Viable Product*: producto mínimo viable. |
| **PII** | *Personally Identifiable Information*: datos personales. |
| **RAG** | *Retrieval-Augmented Generation*. |
| **RBAC** | *Role-Based Access Control*: control de acceso por roles. |
| **RGPD/LOPDGDD** | Reglamento y ley españoles de protección de datos. |
| **RPO/RTO** | Objetivo de punto/tiempo de recuperación (backups). |
| **RUM** | *Real User Monitoring*: monitorización de usuarios reales. |
| **SCA** | *Software Composition Analysis*: análisis de dependencias. |
| **SSG/SSR** | Generación estática / renderizado en servidor. |
| **SSOT** | *Single Source of Truth*: este documento. |
| **WCAG** | *Web Content Accessibility Guidelines*. |

---

## 48. Referencias

> *Sección de referencia: no aplica la microestructura de calidad de 8 puntos.*

- **RGPD** — Reglamento (UE) 2016/679, de protección de datos.
- **LOPDGDD** — Ley Orgánica 3/2018 (España).
- **LSSI-CE** — Ley 34/2002 de servicios de la sociedad de la información.
- **WCAG 2.2** — W3C Web Content Accessibility Guidelines 2.2 (nivel AA).
- **EN 301 549** — Requisitos de accesibilidad para productos y servicios TIC (contratación pública UE).
- **Core Web Vitals** — Documentación de web.dev / Google Search.
- **Schema.org** — Vocabulario de datos estructurados.
- **Conventional Commits** — Especificación de mensajes de commit.
- **The Twelve-Factor App** — Metodología de configuración y despliegue.
- **Documentación oficial** de: Astro, React, TypeScript, Tailwind CSS, PostgreSQL/pgvector, GitHub Actions, y del proveedor de IA (Anthropic — Claude).
- **Documento interno base:** borrador 0.1.0 de este PROJECT_BIBLE (reemplazado por esta versión).

*Las URLs y versiones concretas se fijarán en la Fase 0 al elegir proveedores.*

---

## 49. Anexo de decisiones abiertas

> Decisiones que **no** pudieron cerrarse con la información disponible durante la redacción v1.0. Para cada una se documenta la incertidumbre y se propone la mejor alternativa con ventajas e inconvenientes.
>
> **Actualización v1.1 (2026-07-13) — cierre de Fase 0 por gobernanza.** El *Informe Final de Gobernanza* ratifica DA-2…DA-10 **por propuesta del comité, pendientes de una ratificación única del cliente** (DA-6 se eleva al cliente junto con H7). Las descripciones de cada DA se conservan íntegras abajo; la resolución ratificada y sus **reservas** (condiciones de cierre) se consolidan en la tabla siguiente. Verificado por el comité: ninguna resolución contradice otra DA, ningún ADR ([§43](#43-decisiones-de-arquitectura-adr)), ni el catálogo §38, ni aumenta deuda técnica.

| DA | Resolución ratificada (propuesta) | Estado | Reserva / condición de cierre | Plan B |
|---|---|---|---|---|
| DA-1 | Astro (definitiva) | ✅ CERRADA (v1.0) | — | — |
| DA-2 | **Brevo** (CRM) | APROBADA CON RESERVAS | DPA UE; revisión a 2 trimestres contra H4/H5 | HubSpot Starter |
| DA-3 | **Vercel** (funciones región UE) | APROBADA CON RESERVAS | Plan con cron suficiente para el worker (ADR-010); dominio depende de H11 | Netlify |
| DA-4 | **Aprobación 2 niveles** (Casos/Certif./Legal), directa para Artículos | APROBADA | Si el tier del CMS no soporta workflow: convención editorial documentada | — |
| DA-5 | **Supabase UE** (pgvector + pooler) | APROBADA CON RESERVAS | **Tier de pago desde A1** (el gratuito pausa proyectos); región UE-Frankfurt | Neon |
| DA-6 | Asistente con cita obligatoria + búsqueda semántica (ES); 150 €/mes, corte duro 100% | **REQUIERE RATIFICACIÓN DEL CLIENTE** | El importe es compromiso de gasto (H7); mecanismo de control aprobado | Recorte a solo-búsqueda |
| DA-7 | **Sanity** (CMS) | APROBADA CON RESERVAS | Regla vinculante: **cero datos personales en el CMS**; workflow DA-4 según tier | Storyblok |
| DA-8 | **Brevo** (email, consolidado con DA-2) | APROBADA | KPI de entregabilidad en A1 | Resend |
| DA-9 | **Plausible** (UE, sin cookies) | APROBADA | Reevaluar GA4 solo si la inversión en Ads lo exige | GA4 con consentimiento |
| DA-10 | **Voyage AI** `voyage-3-lite` (ratifica §38) | APROBADA CON RESERVAS | Permanencia condicionada a evaluación de recuperación sobre corpus ES (C1) | OpenAI / Cohere |

> **Efecto sobre el lanzamiento:** ocho decisiones quedan cerradas por el comité; DA-6 (importe) queda a firma del cliente. Ninguna reserva altera arquitectura, ADRs ni la nomenclatura §38 → **el cierre no genera refactorización**. La actualización a estado definitivo de cada DA se producirá al recibir la ratificación del cliente.

### DA-1 · Perfil de stack — ✅ **CERRADA: Astro (definitiva)**
- **Decisión (cerrada):** el stack **definitivo** del proyecto es **Astro + CMS headless + BFF serverless** (ver [ADR-001](#43-decisiones-de-arquitectura-adr)/[ADR-002](#43-decisiones-de-arquitectura-adr)). **WordPress queda descartado** como plataforma; no es una alternativa viva.
- **Justificación:** control total de rendimiento, SEO y seguridad, alineado con los umbrales de [§9](#9-requisitos-no-funcionales) y con el objetivo de captación de [§2](#2-objetivos-del-negocio). Es la base sobre la que se apoyan el resto de ADR.
- **Mitigación del antiguo motivo de duda (mantenimiento):** si el equipo del cliente careciera de perfil técnico suficiente ([§44](#44-hipótesis) H7), la respuesta **no** es cambiar de stack, sino **contratar un partner de mantenimiento y/o formación** ([§39](#39-riesgos-del-proyecto) P5). El stack **no se renegocia** por este motivo.

### DA-2 · Proveedor de CRM
- **Incertidumbre:** herramientas ya usadas por el equipo comercial y presupuesto.
- **Opciones:** HubSpot (potente, ecosistema; coste elevado al escalar) · Brevo (buena relación precio/valor; menos avanzado) · Pipedrive (ventas simples; automatización más limitada).
- **Propuesta:** Brevo o HubSpot según madurez comercial. **Decidir en F0.**

### DA-3 · Plataforma de despliegue/CDN
- **Opciones:** Vercel (DX excelente; coste al escalar) · Netlify (similar) · Cloudflare Pages (coste/red muy competitivos; DX algo menor).
- **Propuesta:** Cloudflare Pages por coste/rendimiento, o Vercel por DX. **Decidir en F0.**

### DA-4 · Flujo editorial del CMS (¿publicación directa o con aprobación?)
- **Incertidumbre:** tamaño y gobernanza del equipo de contenidos.
- **Propuesta:** aprobación por Administrador si hay varios editores; publicación directa si el equipo es pequeño. Afecta a la matriz de permisos ([§27](#27-permisos)).

### DA-5 · Residencia y proveedor concreto de PostgreSQL
- **Opciones:** Supabase, Neon u otro gestionado, siempre con **región UE** y soporte de **pgvector**.
- **Criterio de selección obligatorio:** **pooler de conexiones apto para serverless** (p. ej. PgBouncer/pooler integrado en modo *transaction*). El BFF serverless abre muchas conexiones efímeras; sin pooler se agota el límite de PostgreSQL. Requisito eliminatorio.
- **Propuesta:** elegir el que garantice UE + pgvector + backups gestionados + pooler serverless. **Decidir en F0.**

### DA-6 · Alcance real del asistente IA en F2 (y presupuesto)
- **Incertidumbre:** volumen de consultas y apetito de coste.
- **Criterio de selección obligatorio:** fijar un **presupuesto máximo mensual de IA (€/mes)** y una **política de corte** al alcanzarlo: al llegar al umbral, el BFF **degrada con elegancia** (deshabilita el asistente y ofrece búsqueda léxica + contacto) en lugar de seguir gastando. No basta con *rate limiting*: debe existir **corte duro por presupuesto** (`AI_MONTHLY_BUDGET` / `AI_BUDGET_HARD_STOP`, ver [§38](#38-variables-de-entorno)).
- **Propuesta:** empezar con búsqueda semántica + FAQ con fuentes (bajo coste, Haiku por defecto), presupuesto conservador con corte duro, y ampliar según uso. **Decidir en F0.**

### DA-7 · Proveedor de CMS headless
- **Incertidumbre:** presupuesto, modelo de contenido y preferencia de alojamiento (SaaS vs. autogestionado).
- **Opciones:** Strapi (open source, autogestionado; control total, más operación) · Sanity (tiempo real, potente; coste al escalar) · Storyblok (editor visual; orientado a marketing) · Contentful (maduro; coste elevado).
- **Criterio de selección obligatorio:** evaluar el **coste por usuario/editor (*seat*)** del plan, ya que los CMS SaaS escalan el precio por asiento y es la partida que más crece con el equipo de contenidos; contrastarlo con el nº de editores previsto ([§26](#26-roles)).
- **Propuesta:** Sanity o Storyblok si se prioriza SaaS y rapidez editorial; Strapi si se prioriza control y coste. Concreta el ADR-003. **Decidir en F0.**

### DA-8 · Proveedor de email transaccional
- **Incertidumbre:** volumen de envíos, plantillas y ecosistema del CRM elegido (DA-2).
- **Opciones:** SendGrid (maduro, escalable) · Brevo (integra CRM+email; sinergia si DA-2 = Brevo) · Resend (DX moderna, sencillo).
- **Propuesta:** alinear con DA-2 (Brevo si se elige como CRM); Resend/SendGrid en caso contrario. **Decidir en F0.**

### DA-9 · Herramienta de analítica
- **Incertidumbre:** requisitos de medición y equilibrio privacidad/RGPD vs. profundidad de datos.
- **Opciones:** Plausible (sin cookies, RGPD-friendly, sin banner) · GA4 (gratuito, potente; requiere consentimiento y banner) · PostHog (producto+analítica; más operación).
- **Propuesta:** Plausible por defecto (privacidad y simplicidad); GA4 solo si el negocio exige su ecosistema, gestionando consentimiento ([§17](#17-seguridad)/CMP). **Decidir en F0.**

### DA-10 · Proveedor de embeddings para RAG
- **Contexto (por qué existe):** el pipeline RAG ([§16](#16-inteligencia-artificial)) necesita **vectorizar** contenido y consultas. **Anthropic/Claude —proveedor de generación— NO ofrece API de embeddings**, por lo que se requiere un proveedor específico. Sin esta decisión, el RAG (RF-15) es inconstruible.
- **Opciones analizadas:**
  - **Voyage AI** — *embeddings* de máxima calidad en *retrieval* (líder en *benchmarks*); es el proveedor **recomendado oficialmente por Anthropic** como complemento de Claude; modelos económicos (`voyage-3-lite`) y de dominio; buen coste/rendimiento. ❌ Empresa más pequeña (riesgo de proveedor menor); tratamiento de datos a revisar (DPA).
  - **OpenAI** (`text-embedding-3-small/large`) — muy barato, ubicuo, excelente *tooling* y estabilidad; gran comunidad. ❌ Introduce un **segundo gran proveedor de IA** en el stack (competidor del de generación) y su gobernanza de datos/UE debe revisarse con cuidado.
  - **Cohere** (`embed-v3`) — fuerte en *retrieval* multilingüe, con modo específico *search document/query*; opción empresarial sólida. ❌ Coste algo superior; menor tracción que OpenAI.
- **Decisión (recomendada, confirmar coste/DPA en F0): Voyage AI.**
  - **Justificación:** (1) **mejor calidad de recuperación** disponible, lo que impacta directamente en la utilidad del asistente y en el guardarraíl anti-alucinación (mejores fuentes recuperadas = respuestas mejor ancladas); (2) **alineamiento con Anthropic** (proveedor recomendado para el ecosistema Claude), coherente con [ADR-005](#43-decisiones-de-arquitectura-adr); (3) **coste bajo** con `voyage-3-lite` para el volumen esperado ([§16](#16-inteligencia-artificial)); (4) el diseño exige **abstracción del proveedor** en el BFF, de modo que sustituirlo por OpenAI/Cohere sea re-embeber el corpus (horas) sin cambios de arquitectura — decisión **reversible barata**.
  - **Requisitos de cierre en F0:** firmar **DPA** con garantías UE/adecuación (el proveedor procesa el contenido); fijar modelo (`voyage-3-lite` por defecto) y coste dentro del presupuesto de DA-6; verificar consistencia de dimensiones con el esquema pgvector ([§14](#14-arquitectura-de-datos)).
  - **Plan B:** OpenAI `text-embedding-3-small` si el coste, la disponibilidad o el DPA de Voyage no encajaran.

---

## 50. Resultado de la autoauditoría

**Objetivo.** Dejar constancia de la revisión de coherencia, duplicidades, ambigüedad y consistencia terminológica realizada antes de cerrar la versión 1.0.0.

### 50.1 Problemas encontrados
1. **Duplicidad potencial de riesgos:** los riesgos aparecían en varias secciones ([§39](#39-riesgos-del-proyecto)–[§42](#42-riesgos-legales)) con solapamiento posible con los riesgos técnicos por sección.
2. **Ambigüedad del alcance de la IA:** el borrador previo trataba la IA como «futura», pero la estructura obligatoria exige una sección de IA de primer nivel.
3. **Ambigüedad terminológica:** «Proyecto» podía significar tanto un caso de portfolio como el proyecto de software.
4. **Contradicción de prioridad:** la IA figuraba como `COULD` (futura) y a la vez como funcionalidad principal esperada.
5. **Duplicidad de taxonomías:** riesgo de definir «Servicio/Sector» por separado en CMS, navegación, SEO y datos.
6. **Inconsistencia de nombre de empresa:** varios placeholders posibles para el nombre comercial.
7. **Microestructura de 8 puntos poco natural** en secciones de referencia (Glosario, Referencias, Anexo).

### 50.2 Correcciones realizadas
1. **Riesgos reorganizados** en cuatro planos sin solapamiento: proyecto ([§39](#39-riesgos-del-proyecto)), técnicos ([§40](#40-riesgos-técnicos)), negocio ([§41](#41-riesgos-de-negocio)) y legales ([§42](#42-riesgos-legales)); los riesgos por sección remiten a estas tablas en lugar de duplicarlas.
2. **IA reclasificada** como **versión mínima `SHOULD`** (objetivo de F2 inmediato), no como «futura», resolviendo la contradicción con la sección obligatoria de IA. La IA avanzada con acciones queda como futura.
3. **Terminología fijada:** se usa «Proyecto (caso de éxito)» / «Proyecto (de portfolio)» para el contenido, y «proyecto» (minúscula, sin cualificar) para el proyecto de software; recogido en la [tabla de terminología canónica](#terminología-canónica).
4. **Prioridad de IA unificada** en [§6](#6-funcionalidades-principales), [§8](#8-requisitos-funcionales) (RF-15 `SHOULD`) y [§16](#16-inteligencia-artificial): coherente en todo el documento.
5. **Taxonomía única** de `Servicio`/`Sector` establecida como decisión ([§28](#28-modelo-de-datos-de-alto-nivel)) y referida desde navegación ([§24](#24-navegación)) y SEO.
6. **Nombre de empresa unificado** en el token único **`«[NOMBRE_EMPRESA]»`** en todo el documento.
7. **Deviación documentada:** las secciones 47–49 usan formato de referencia/anexo en lugar de la microestructura de 8 puntos, por ser catálogos (glosario/referencias) y registro de incertidumbres (anexo), donde «Riesgos/Dependencias» no aportaría valor. Se declara aquí explícitamente para no inducir a error.

### 50.3 Decisiones tomadas durante la revisión
- Este documento **reemplaza** al borrador 0.1.0 (23 secciones) y pasa a ser la única versión válida del PROJECT_BIBLE.
- Se mantienen **claramente marcadas** las incertidumbres (**DA-1 cerrada: Astro definitivo**; abiertas **DA-2…DA-10**) e hipótesis (H1…H11); **no se han inventado datos** para cerrarlas, conforme a las instrucciones.
- El documento se adopta oficialmente como **🟢 versión 1.0 y SSOT** del proyecto. La validación de hipótesis y el cierre de las decisiones abiertas en la Fase 0 producirán **actualizaciones de contenido (v1.1)**, pero **no condicionan** la oficialidad de esta versión 1.0: el estado 🟢 se refiere a la **adopción del documento como fuente única de verdad**, no a que todo supuesto esté ya confirmado.

### 50.4 Verificaciones de consistencia superadas
- ✅ Sin contradicciones de prioridad detectadas tras la corrección (IA, MoSCoW).
- ✅ Terminología consistente (verificada contra la tabla canónica y el glosario).
- ✅ Referencias cruzadas internas coherentes (roles↔permisos, datos↔arquitectura, riesgos↔mitigaciones, ADR↔decisiones de sección).
- ✅ Cada decisión de arquitectura tiene justificación y alternativas descartadas ([§43](#43-decisiones-de-arquitectura-adr)).
- ✅ Incertidumbres no resueltas trasladadas al anexo ([§49](#49-anexo-de-decisiones-abiertas)) en lugar de resolverse por suposición.

### 50.5 Consolidación de preparación para desarrollo (revisión del comité de arquitectura)

Ronda de endurecimiento del SSOT tras la revisión crítica del comité de arquitectura, sin cambiar stack ni arquitectura general:
1. **DA-1 cerrada** — **Astro definitivo**; WordPress descartado y eliminada toda ambigüedad ([§10](#10-restricciones), [§11](#11-arquitectura-general), [§39](#39-riesgos-del-proyecto), [§44](#44-hipótesis), [§46](#46-roadmap-de-alto-nivel), [§49](#49-anexo-de-decisiones-abiertas)).
2. **DA-10 creada** — proveedor de **embeddings** (recomendado **Voyage AI**), pieza que faltaba en el pipeline RAG ([§15](#15-integraciones-externas), [§16](#16-inteligencia-artificial), [§38](#38-variables-de-entorno), [§49](#49-anexo-de-decisiones-abiertas)).
3. **ADR-010 creada** — patrón ***outbox*** para persistencia durable de leads y reintentos, sustituyendo los reintentos en memoria inviables en serverless ([§13](#13-arquitectura-del-backend), [§35](#35-gestión-de-errores), [§43](#43-decisiones-de-arquitectura-adr)).
4. **DA-3 secuenciada** — el hosting debe cerrarse **antes** del BFF (dependencia de *runtime*), sin elegir aún proveedor ([§13](#13-arquitectura-del-backend), [§46](#46-roadmap-de-alto-nivel)).
5. **ISR reencuadrado** — la base es **SSG + rebuild por webhook**; ISR es optimización opcional dependiente del hosting, no arquitectura ([§11](#11-arquitectura-general), [§12](#12-arquitectura-del-frontend), [§33](#33-estrategia-de-despliegue), [§47](#47-glosario)).
6. **Prompt injection** — guardarraíles obligatorios añadidos al RAG ([§16](#16-inteligencia-artificial)).
7. **Criterios de selección** — pooler serverless (DA-5), coste por *seat* del CMS (DA-7), presupuesto mensual de IA + corte duro (DA-6, [§38](#38-variables-de-entorno)).
8. **Cláusula de reevaluación frontend** — solo antes de F4 y solo si el área privada cambia significativamente ([§12](#12-arquitectura-del-frontend), [ADR-002](#43-decisiones-de-arquitectura-adr)).

Resultado: **10 ADR** (ADR-001…010) y **10 decisiones** de anexo (**DA-1 cerrada**, **DA-2…DA-10 abiertas**). Documento apto como especificación oficial para iniciar desarrollo.

### 50.6 Actualización de línea base por seguridad (ADR-011)

Auditoría de infraestructura del comité de arquitectura: Astro ≤ 5/6 arrastra 5 advisories **HIGH** (XSS/SSRF) cuyo *fix* solo existe en Astro 7 (*major*), y `@astrojs/tailwind` no soporta Astro 7 → obliga a **Tailwind v4**. Se decide (**ADR-011**, aprobado por CTO) actualizar la línea base a **Astro 7 + Tailwind CSS v4 + Node ≥22.12**. **No cambia la arquitectura** (Jamstack + Astro + islas React + Tailwind por tokens intactos); solo cambian versiones y el mecanismo de config de Tailwind (JS → CSS-first `@theme`). El `DESIGN_SYSTEM.md` conserva todos sus tokens; solo se adapta su vehículo de implementación. Resultado: **11 ADR** (ADR-001…011).

---

> **Siguiente paso:** con el documento ya adoptado como **🟢 v1.0 oficial (SSOT)**, ejecutar la **Fase 0** — validar las [hipótesis (§44)](#44-hipótesis) y cerrar las [decisiones abiertas (§49)](#49-anexo-de-decisiones-abiertas) con el cliente. El cierre de esos puntos se integrará como **actualización de contenido (v1.1)** manteniendo la oficialidad del SSOT, y habilitará la Fase 1 del [roadmap](#46-roadmap-de-alto-nivel).
