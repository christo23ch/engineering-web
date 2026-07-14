# ROADMAP

> **Estado:** 📝 Placeholder — pendiente de redacción.
> **Propósito:** Hoja de ruta por fases (F0–F4), hitos, criterios de aceptación y dependencias.
> **SSOT:** Ver `docs/PROJECT_BIBLE.md` §46 (roadmap oficial). Este documento derivará y trazará a esa sección; **no** la sustituye ni la altera.

> **Progreso a 2026-07-13 (derivado de Bible §46, v1.1):**
> - **F0 — Descubrimiento/Scaffolding:** ✅ **cerrada.** Scaffolding técnico completo; decisiones DA-2…DA-10 **ratificadas por el comité, pendientes de ratificación única del cliente** (§49); hipótesis H1–H11 **triadas** (ninguna validada, §44).
> - **F1 — MVP:** 🔶 **capa de interfaz ✅ construida y auditada** (biblioteca UI *LIBRARY APPROVED* + todas las pantallas del §13 DESIGN_SYSTEM + Header/Footer + SEO → *FRONTEND APPROVED*, con contenido honesto: fuentes tipadas vacías, sin datos inventados). **BFF ✅ construido y probado (2026-07-14):** endpoints de captación con validación y *rate limiting* durable, persistencia PostgreSQL con outbox transaccional + worker de reintentos (ADR-010), Brevo (DA-2/DA-8). **Integración CMS Sanity ✅ completa (2026-07-14):** Studio propio (`cms/`, workflow DA-4, roles, preview), plantillas cableadas a los *loaders* con *fallback* honesto y webhook de publicación → rebuild (ADR-001) — ver `docs/CMS.md`. **Pendiente:** credenciales/altas de proveedores (§49), cableado de formularios → `/api`, analítica/CMP y despliegue.
> - **F2 — Contenido + IA:** 🔶 interfaz del asistente IA ✅ + **backend RAG ✅ construido y probado (2026-07-14)**: pipeline sobre pgvector (chunker, embeddings Voyage DA-10, recuperación con umbral), Claude vía proxy BFF (ADR-005), *prompt* + *citation engine* anti-alucinación (§16), presupuesto DA-6 fail-closed, caché, *fallback* honesto, `/api/ia/consulta` — ver `docs/AI.md`. **Inerte hasta ratificación de DA-6** + credenciales + contenido real (`npm run rag:index`).
> - **F3 / F4:** ⏳ sin iniciar.
>
> Cualquier detalle prevalece según **Bible §46**.

> ⚠️ **Revisión obligatoria antes de la Fase de Desarrollo.** El documento de trabajo
> [`PRODUCT_DISCOVERY_REPORT.md`](./PRODUCT_DISCOVERY_REPORT.md) (validación comercial, no
> normativo) **deberá revisarse antes del inicio de la Fase de Desarrollo (F1)**. Sus
> recomendaciones se contrastarán una vez: (1) validadas las hipótesis H1–H11 (Bible §44);
> (2) realizadas las entrevistas con clientes; (3) confirmado el posicionamiento definitivo.
> Cualquier cambio que de ahí resulte se incorporará **primero** al `PROJECT_BIBLE.md` (SSOT)
> como actualización v1.1, conforme a su gobernanza (§29). Hasta entonces, el roadmap vigente
> es el de **Bible §46**, sin alteraciones.

<!-- Contenido pendiente. Estructura creada por el CTO/Arquitecto en la fase de inicialización. -->
