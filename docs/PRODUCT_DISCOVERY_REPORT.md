# PRODUCT DISCOVERY REPORT — Validación Comercial del Producto

> **Naturaleza de este documento.** Es un **documento de trabajo estratégico** para la **Fase 0 de validación comercial**. **NO forma parte del SSOT** ni modifica el `PROJECT_BIBLE.md`. No cambia requisitos funcionales, prioridades MoSCoW, ADR ni el roadmap oficial (Bible §46). Sus recomendaciones son **hipótesis de negocio a contrastar**, no decisiones tomadas. Ante cualquier discrepancia, **prevalece el `PROJECT_BIBLE.md` (SSOT)**.

| Metadato | Valor |
|---|---|
| **Documento** | `docs/PRODUCT_DISCOVERY_REPORT.md` |
| **Tipo** | Referencia estratégica / entrada de Fase 0 (no normativo) |
| **Versión** | 1.0.0 |
| **Estado** | 🟡 Para validar en Fase 0 |
| **Fecha** | 2026-07-08 |
| **Autoría** | Comité de producto: Product Manager · UX Research Lead · Business Strategist · Growth Lead · Marketing Director |
| **Base analizada** | `PROJECT_BIBLE.md` v1.0 (SSOT), §1–§8, §16, §21, §24, §39, §41, §44, §46 |
| **Relación con el SSOT** | **Complementa**; no decide. Cualquier adopción exige actualización del Bible (v1.1) vía su gobernanza (§29). |

---

## Condición de revisión (obligatoria)

Las conclusiones de este informe **deberán revisarse de nuevo** —y solo entonces podrán proponerse al Bible— cuando se cumplan **las tres** condiciones:

1. Se **validen las hipótesis H1–H11** (Bible §44).
2. Se realicen las **entrevistas con clientes reales** (y operaciones perdidas).
3. Se **confirme el posicionamiento definitivo** de la empresa (marca y mensaje).

Hasta entonces, este documento es orientativo y **no** habilita cambios en la especificación.

---

## Advertencia previa del comité (unánime)

Todo el análisis descansa sobre **H1–H11 sin validar**. Este informe valida la **lógica** del producto; la **verdad de mercado** solo la darán las entrevistas de Fase 0. Donde el Bible es hipótesis, se señala explícitamente.

---

## 1. Cliente ideal (ICP)

**ICP primario — «La planta que paga la luz»:**

| Atributo | Definición |
|---|---|
| Tipo | Empresa industrial/manufacturera con planta(s) en España |
| Tamaño | 50–500 empleados; facturación 10–100 M€ |
| Dolor detonante | Coste energético alto y creciente; presión normativa (eficiencia, descarbonización); capex de instalaciones pendiente |
| Momento de compra | Ampliación/reforma de planta, auditoría energética, obligación normativa, subvención disponible (fondos UE) |
| Presupuesto proyecto | 30 k–500 k€ en servicios de ingeniería |
| Señal de cualificación | Tiene responsable de operaciones/mantenimiento propio y decisión en comité |

**ICP secundarios:** (a) promotor/property manager con activos terciarios (dolor: licencias y plazos); (b) administración pública (dolor: licitación con clasificación y referencias).

**Recomendación:** el MVP se optimiza para el primario; los secundarios se atienden, no se persiguen.

---

## 2. Buyer persona (primaria, profundizada)

**«Jordi, 48 — Director de Operaciones de planta industrial»**

- Ingeniero de formación; 15+ años en la casa; responde ante gerencia por coste, paradas y cumplimiento.
- **Cómo compra:** no compra por web — **valida** por web. Llega con un nombre que le dio un colega o un buscador («ingeniería eficiencia energética [provincia]»), y dedica 10 minutos a decidir si esa firma *merece una llamada*.
- **Qué busca en esos 10 minutos:** casos parecidos a su planta **con cifras** (% ahorro, plazo, payback), certificaciones, equipo real (no stock), señales de tamaño/solvencia.
- **Qué le expulsa:** web de folleto, promesas sin datos, formulario que huele a spam comercial, ausencia de teléfono.
- **Miedo dominante:** equivocarse de proveedor delante del comité. La web debe **reducir riesgo percibido**, no seducir.
- **Insight de UX Research:** el CTA ganador para Jordi no es «Solicitar propuesta» a puerta fría — es **«Hablar con un ingeniero»** (bajo compromiso, alto valor). El Bible ya lo intuye en §21; se recomienda hacerlo el CTA primario de las páginas de servicio, reservando «Solicitar propuesta» para portfolio/casos.

---

## 3. Problema principal

- **Del comprador:** *«No puedo distinguir una ingeniería solvente de una mediocre antes de contratarla»* — evaluación de solvencia técnica opaca, propuestas incomparables, riesgo alto.
- **De la empresa:** experiencia real invisible — vende por boca-oreja, su conocimiento no está empaquetado como prueba, y cada lead depende de la red personal de los socios (no escala, no se traza).

El producto ataca los dos lados con el mismo activo: **prueba verificable de resultados**. Coherente con Bible §3. ✅

---

## 4. Propuesta de valor

Propuesta del comité (para validar con H3/H11 en F0):

> **«Ingeniería que demuestra lo que ahorra: proyectos industriales y energéticos con resultados medidos — % de ahorro, plazo y retorno — antes de que firmes nada.»**

- Para Jordi: *reduce tu riesgo — mira 15 plantas como la tuya y lo que pasó en ellas.*
- Sustancia: la propuesta de valor del **sitio** es el **portfolio con métricas**. Todo lo demás (blog, IA, empleo) es soporte.
- **Advertencia del Business Strategist:** esta propuesta **solo funciona si el cliente aporta 8–12 casos reales con cifras publicables** (Bible §39 P1). Si los clientes finales no autorizan cifras, hay que preparar el plan B: casos anonimizados por sector («Planta alimentaria, 32% ahorro térmico»). Añadir esa autorización a la checklist de F0.

---

## 5. Diferenciación

| Eje | Evaluación del comité |
|---|---|
| **Resultados con datos** (territorio del Bible) | ✅ **Diferenciador real.** El sector publica fotos de obras, no métricas. Defendible mientras la competencia no copie — ventana de 2–3 años. |
| **Sostenibilidad rentable** (H3) | ⚠️ **Diferenciador solo si se formula como dinero.** «Sostenibilidad» a secas es commodity discursiva; «payback de la descarbonización» sí diferencia. Validar formulación en F0. |
| **Asistente IA** | ❌ **No es diferenciación comercial.** Jordi no elige ingeniería por un chatbot. Es un *nice-to-have* de experiencia. Su clasificación `SHOULD`/F2 en el Bible es correcta — no subirla. |
| **Velocidad de respuesta** (lead → contacto) | 💡 **Diferenciador barato e infraexplotado:** responder en <4 h laborables con un ingeniero (no un comercial) vence a la mayoría del sector. Ya habilitado por ADR-008/010 + CRM. Convertirlo en promesa pública y KPI. |

---

## 6. Ventajas competitivas (defendibles)

1. **Activo de contenido acumulativo:** cada caso publicado con métricas es un activo SEO + ventas que la competencia no puede replicar sin tener los proyectos. Compuesto en el tiempo.
2. **SEO long-tail técnico-comercial:** «ingeniería + [servicio] + [sector/provincia]» — competencia débil, intención alta. El stack (CWV, SSG) da ventaja técnica real aquí.
3. **Trazabilidad comercial completa** (web→CRM→dato): permite optimizar CPL mientras el sector sigue sin medir nada (Bible B3, B5).
4. **Credenciales empaquetadas** (ISO H6, equipo, certificaciones) listas para licitación pública — reduce fricción en el ICP secundario (b) casi gratis.

---

## 7. Riesgos de mercado

| # | Riesgo | Prob. | Gravedad | Respuesta recomendada |
|---|---|:--:|:--:|---|
| M1 | **El boca-oreja domina el sector: la web valida, no origina.** Los leads fríos pueden ser pocos aunque la web sea excelente. | Alta | Alta | Reencuadrar KPI del MVP: además de leads/mes, medir **influencia** (visitas a casos desde ofertas en curso, menciones «os vi la web»). No juzgar el proyecto solo por leads fríos en 6 meses. |
| M2 | SEO tarda 6–12 meses; expectativas de retorno inmediato (Bible N1). | Alta | Media | Ya comunicado en el Bible ✅; complementar con LinkedIn orgánico de los socios (canal natural B2B ingeniería, coste 0). |
| M3 | El cliente no consigue autorización para publicar cifras de casos (variante dura de P1). | Media | **Crítica** | Plan B de casos anonimizados; gestionarlo como criterio de cierre de H8 en F0. |
| M4 | Hipótesis de posicionamiento falsas (H2/H3): la firma resulta ser generalista sin diferenciación real. | Media | Alta | Las entrevistas de F0 deben incluir **3–5 clientes reales y 2 operaciones perdidas** — no solo a los socios. |
| M5 | Ciclo de venta largo (6–18 meses) diluye la atribución web→ingreso. | Alta | Media | Medir SQL y oportunidades originadas/influidas, no ventas, el primer año. |

---

## 8. Funcionalidades imprescindibles (confirmadas)

El corte `MUST` del Bible (RF-01…RF-11) es **correcto**. Jerarquía interna recomendada:

1. **RF-03/RF-04 — Portfolio + ficha de caso con métricas** → *es el producto*. Máxima calidad aquí.
2. **RF-02 — Páginas de servicio** con normativa y FAQ → capturan el long-tail SEO.
3. **RF-06/RF-07 — Formulario→CRM con trazabilidad** (+ promesa de respuesta <4 h).
4. **RF-05 — Sobre nosotros/certificaciones** → reducción de riesgo percibido; crítico para licitaciones.
5. RF-01, RF-08…RF-11 — necesarios, no diferenciales.

---

## 9. Funcionalidades a eliminar o degradar

> ⚠️ **Recomendaciones NO aplicadas.** Esta tabla **no** modifica las prioridades MoSCoW del Bible (§8). Cualquier adopción requiere validación en F0 y actualización del SSOT (v1.1) vía gobernanza (§29). Se documenta como propuesta a contrastar.

| RF (prioridad Bible) | Recomendación del comité | Motivo |
|---|---|---|
| RF-16 Búsqueda interna (SHOULD) | **Degradar a COULD** | Un sitio de ~40 páginas con buena navegación no necesita buscador; apenas se usará. Esfuerzo mejor puesto en casos. |
| RF-15 Asistente IA (SHOULD/F2) | **Mantener, con condición de activación:** lanzar solo cuando existan ≥20 piezas de contenido indexable; si no, deslizar a F3 | Un RAG sobre corpus pobre da respuestas pobres → daña la credibilidad, que es justo lo que el sitio debe construir. |
| RF-18 Calculadora de ahorro (COULD/F4) | **Revalorar: subir a SHOULD en F2 como *lead magnet*** si F0 confirma el dolor energético | Una calculadora simple («estima tu ahorro») captura más leads cualificados que un asistente IA, con coste menor y determinista (§16 ya prefiere cálculo por reglas). Intercambio de valor: dato del visitante ↔ estimación útil. **(Discrepancia del Growth Lead con la prioridad actual del Bible.)** |
| RF-20 Lead scoring (COULD) | Confirmar COULD (no antes de ~50 leads/mes) | Scoring sin volumen es teatro estadístico. |
| «Sectores» como página (§24, opcional) | **Eliminar como página propia en MVP**; mantener solo como filtro del portfolio | Duplica contenido con servicios; canibaliza SEO; coste editorial alto. |
| RF-14 Empleo (SHOULD) | Mantener, pero **última prioridad de F2** | Soporta B4, no B1; una página simple basta al inicio. |

**Nada del `MUST` debe eliminarse.** El alcance MVP está bien acotado.

---

## 10. Roadmap comercial recomendado (ajustes sobre F0–F4)

> ⚠️ **NO altera el roadmap oficial** (Bible §46). Son ajustes de negocio a contrastar en F0.

- **F0 (sem. 1–2) — añadir al plan actual:** ① 3–5 entrevistas a clientes reales + 2 deals perdidos (valida H2–H5 y M4); ② definición firmada de «lead cualificado» + objetivo numérico (leads/mes, CPL) con el equipo comercial; ③ autorización de cifras de casos (M3) e inventario de 8–12 casos; ④ decisión del mensaje de valor (validar la formulación de §4).
- **F1 (sem. 3–8) — MVP como está**, con dos matices: lanzar con **mínimo 8 casos completos** (si no hay 8, retrasar el lanzamiento antes que lanzar vacío) y CTA primario «Hablar con un ingeniero» + promesa <4 h.
- **F2 (mes 3–4) — reordenar:** primero motor de contenido + **calculadora como lead magnet** (si F0 la valida) + 2–3 lead magnets descargables; el **asistente IA al final de F2 o inicio de F3**, condicionado al corpus (≥20 piezas). LinkedIn orgánico de socios en paralelo (coste 0).
- **F3 (mes 5–6) — como está** (i18n EN solo si hay demanda exterior real confirmada en F0/H9; si no, deslizar).
- **F4 — área privada:** mantener como está; **no** construir hasta que ≥3 clientes la pidan explícitamente.

---

## Veredicto del comité

**El producto tiene sentido comercial — condicionado.** La lógica *problema → propuesta → funcionalidad* es coherente y el alcance está bien disciplinado. Las tres condiciones de las que depende todo:

1. Que existan **8–12 casos con cifras publicables** (M3 — el mayor riesgo comercial del proyecto, por encima de cualquier riesgo técnico).
2. Que F0 valide el dolor energético y el modelo de compra **con clientes reales y no solo con los socios** (M4).
3. Aceptar que la web será primero un **validador de reputación** y después un generador de leads fríos (M1) — con KPIs que reflejen ambas cosas.

Nada de lo anterior modifica el Bible: son recomendaciones para cerrar/validar en Fase 0. Las degradaciones (RF-16/RF-18/«Sectores») requerirían, si se aprueban tras F0, una actualización **v1.1** del SSOT conforme a su gobernanza (§29).

---

**Fin de PRODUCT_DISCOVERY_REPORT.md — documento de trabajo, no normativo. El `PROJECT_BIBLE.md` sigue siendo el único SSOT del proyecto.**
