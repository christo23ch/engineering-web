# Asistente IA / RAG (F2 — ADR-005, Bible §16)

> **Estado:** 🟢 Sistema RAG construido y probado · ⏳ **inerte hasta ratificación
> del cliente.** **DA-6 (presupuesto de IA + hard-stop) es la ÚNICA decisión que el
> Bible eleva a "REQUIERE RATIFICACIÓN DEL CLIENTE"** (§49, junto con H7). El
> asistente es **fail-closed**: sin presupuesto ratificado y con el hard-stop
> activo (por defecto), **rechaza toda consulta con un fallback honesto y no gasta
> un céntimo**.
>
> **SSOT:** Bible §16 (política de IA), §43 ADR-005 (RAG + Claude) / ADR-004
> (pgvector) / ADR-010 (embeddings DA-10), §28 (entidad Embedding), §38
> (variables), §49 (DA-6 presupuesto, DA-10 Voyage). Ante discrepancia,
> **prevalece el Bible**.

---

## 1. Arquitectura

```
Indexado (operador, npm run rag:index)          Consulta (POST /api/ia/consulta)
─────────────────────────────────────          ─────────────────────────────────
contenido (CMS / fallback honesto)              pregunta del usuario
   │ chunker (estructura + tamaño)                 │ rate limit IA (10/h) · validación
   ▼                                               ▼
Voyage embeddings (512-dim, DA-10)              caché durable (hit → responde)
   │                                               │ miss
   ▼                                               ▼
pgvector (embeddings, ADR-004)  ◀───────────    presupuesto DA-6 (fail-closed)
                                  búsqueda          │ permitido
                                  coseno            ▼
                                                 retrieval (umbral relevancia)
                                                    │ vacío → RECHAZO (sin alucinar)
                                                    ▼
                                                 prompt (RAG-anclado + guardarraíles)
                                                    ▼
                                                 Claude (Haiku, vía proxy BFF)
                                                    ▼
                                                 citation engine (verifica citas)
                                                    │ inválida → FALLBACK honesto
                                                    ▼
                                                 respuesta + citas · ledger · telemetría
```

- **Páginas 100 % SSG**; sólo `/api/ia/consulta` es *on-demand*.
- **Claude nunca se llama desde el navegador** (ADR-005): la clave vive sólo en
  el BFF (§17).

## 2. Política de no-alucinación (§16) — cómo se impone

Tres barreras, cada una verificada por tests:

1. **Umbral de relevancia** (`retrieval.ts`): si ningún chunk supera el mínimo
   coseno (0.35 por defecto), el *retrieval* devuelve VACÍO y el asistente
   **rechaza** — no se llama al modelo.
2. **Prompt RAG-anclado** (`prompt.ts`): el sistema obliga a responder SÓLO con
   las FUENTES aportadas, a **citar cada afirmación con `[n]`**, a emitir una
   frase de rechazo fija si no hay información, y a no inventar cifras, clientes,
   certificaciones ni plazos. El contenido de las FUENTES se trata como material
   **no confiable** (guardarraíl de inyección: se ignoran instrucciones dentro
   de una fuente; se neutraliza el forjado del cierre de fuente).
3. **Citation engine** (`citations.ts`): la respuesta del modelo **se verifica**:
   una cita fuera de rango es una cita **alucinada** → la respuesta se descarta y
   se degrada al fallback honesto; una respuesta con afirmaciones y **cero citas**
   también se descarta (regla de cita obligatoria). Sólo respuestas verificadas
   se muestran y se cachean, con la URL pública §24 de cada fuente.

## 3. DA-6 — presupuesto y hard-stop (requiere ratificación del cliente)

- **Número de presupuesto:** lo ratifica el cliente (`AI_MONTHLY_BUDGET`, USD/mes).
- **`checkBudget()` (fail-closed)**: hard-stop activo + sin presupuesto → BLOQUEA;
  hard-stop activo + gasto del mes ≥ presupuesto → BLOQUEA; hard-stop desactivado
  → permite (sólo monitoriza). Un bloqueo devuelve el **fallback honesto**, nunca
  un error.
- **Ledger durable** (`ai_usage`, una fila por mes UTC): acumula tokens y coste
  reales tras cada llamada de pago; sobrevive a invocaciones *serverless* y es
  compartido entre instancias.
- **Coste** (`claude.ts`): estimación por modelo (input/output por 1M tokens) con
  *fallback* conservador (tarifa más cara conocida) para modelos desconocidos —
  un guardián de presupuesto nunca infravalora el gasto. Precios **overridables**:
  el cliente ratifica cifras reales sin tocar código.

## 4. Caché

`ai_answer_cache`: clave = hash de la pregunta normalizada + versión del índice.
Un *hit* evita re-gastar en embeddings + generación (y es una mejora de latencia).
TTL configurable (7 días por defecto). Una **reindexación** (nueva versión de
índice) invalida transparentemente las respuestas cacheadas.

## 5. Indexado (`npm run rag:index`)

- Carga contenido (CMS si está configurado; *fallback* local honesto — las
  fuentes vacías producen cero chunks, nunca datos inventados).
- Chunker determinista → Voyage embeddings → upsert en pgvector.
- **Idempotente y barato**: sólo se re-embeben los chunks cuyo hash cambió; los
  no modificados se saltan; el contenido eliminado se poda. `analyze embeddings`
  al final (ivfflat).
- Es el **único** lugar donde se gasta legítimamente en embeddings (trabajo por
  lotes, operado, no el asistente en vivo).
- **Versión de índice** = `${modelo}#${CORPUS_REVISION}`: un cambio de modelo o de
  estrategia de chunking reindexa bajo una versión nueva (sin mezclar esquemas).

## 6. Observabilidad (§34)

- `ai_events`: una fila por consulta — resultado (answered/refused/fallback/
  error), modelo, nº de chunks recuperados, tokens in/out, coste, *cache hit*,
  latencia. Telemetría operativa, **no** una entidad §28.
- Logs estructurados con redacción de PII (kernel §36). El texto de la pregunta se
  retiene para revisión de calidad (§16); aplicar política de retención/rotación
  operativamente.
- `/api/health` reporta el estado de las capacidades `ai` y `embeddings` (sólo
  estado, nunca valores).

## 7. Puesta en marcha (al ratificar DA-6 + credenciales)

1. **Anthropic** (ADR-005): crear clave → `AI_PROVIDER_API_KEY`. Modelos por
   defecto ya fijados (`AI_MODEL_DEFAULT=claude-haiku-4.5`,
   `AI_MODEL_COMPLEX=claude-opus-4-8`).
2. **Voyage** (DA-10): crear clave → `EMBEDDINGS_API_KEY`
   (`EMBEDDINGS_MODEL=voyage-3-lite`, **512 dim** — debe coincidir con la columna
   pgvector; si cambia el modelo, cambian columna y guardia de código juntos).
3. **Presupuesto (cliente, DA-6):** fijar `AI_MONTHLY_BUDGET` (USD/mes) y confirmar
   `AI_BUDGET_HARD_STOP=true`. **Hasta este paso, el asistente rechaza todo.**
4. **pgvector**: `npm run db:migrate` aplica `0002_embeddings.sql` (extensión
   vector + tablas). Supabase soporta pgvector nativamente (DA-5).
5. **Indexar**: `npm run rag:index`.
6. Ajustar `AI_RATE_LIMIT_WINDOW`/`AI_RATE_LIMIT_MAX` si procede (por defecto
   3600/10).

## 8. Endpoint

`POST /api/ia/consulta` — cuerpo `{ "pregunta": "…" }`. Responde **siempre 200**
con cuerpo estructurado honesto:

```jsonc
{ "data": {
  "outcome": "answered" | "refused" | "fallback",
  "respuesta": "… texto con marcadores [n] …",
  "citas": [{ "marker": 1, "sourceType": "service", "sourceSlug": "…",
              "sourceTitle": "…", "url": "/servicios/…" }],
  "enlaces": [ /* buscador + contacto cuando no hay respuesta directa */ ],
  "cacheHit": false
} }
```

- `400` sólo por validación (pregunta 3–1000 chars); `429` por *rate limit* de IA;
  `405` en métodos no-POST. Un asistente **no disponible** (sin credenciales,
  presupuesto bloqueado, error upstream) es un **200 fallback**, no un 5xx —
  el widget es *progressive enhancement* y sigue siendo útil (buscador/contacto).

## 9. Testing

| Capa | Dónde | Qué cubre |
|---|---|---|
| Vector store | `tests/integration/embeddings.test.ts` | Coseno real pgvector ⇄ in-memory, ranking, idempotencia, guardia de dimensión. |
| Chunker | `tests/unit/server/chunker.test.ts` | Segmentación, overlap, límites, hashes, honestidad. |
| Voyage / Claude | `tests/unit/server/{voyage,claude}.test.ts` | Auth, forma de request, dimensión, mapeo de errores, coste. |
| Prompt / citas | `tests/unit/server/ai-prompt.test.ts` | Reglas §16, inyección, extracción/validación de citas. |
| Pipeline + retrieval | `tests/integration/rag-pipeline.test.ts` | Indexado idempotente + poda, retrieval con umbral (rechazo). |
| Presupuesto + caché | `tests/integration/ai-budget-cache.test.ts` | DA-6 fail-closed, rollover mensual, caché + TTL + invalidación. |
| Orquestador + endpoint | `tests/integration/assistant.test.ts` | Respuesta+citas+ledger, caché sin gasto, rechazo, fallback (cita alucinada/presupuesto/upstream), 400/429/405/200-fallback. |
| e2e | `tests/e2e/api.spec.ts` | Fallback honesto sin credenciales sobre el servidor real. |

## 10. Variables (§38 — nombres canónicos)

| Variable | Uso |
|---|---|
| `AI_PROVIDER_API_KEY` | Clave Anthropic (generación, vía proxy BFF). |
| `AI_MODEL_DEFAULT` / `AI_MODEL_COMPLEX` | Haiku por defecto / Opus para consultas complejas. |
| `AI_MONTHLY_BUDGET` / `AI_BUDGET_HARD_STOP` | **DA-6**: tope mensual (USD) + corte duro (fail-closed). |
| `AI_RATE_LIMIT_WINDOW` / `AI_RATE_LIMIT_MAX` | Antiabuso específico de IA (def. 3600/10). |
| `EMBEDDINGS_API_KEY` / `EMBEDDINGS_MODEL` | Voyage (DA-10), voyage-3-lite (512 dim). |
| `DATABASE_URL` | PostgreSQL + pgvector (DA-5). |
