<!--
  PULL REQUEST — aligned with docs/PROJECT_BIBLE.md (SSOT) and its documentary
  policy. Fill in every section; delete guidance comments before submitting.
  Commits must be Conventional Commits (Bible §29) — commitlint/CI will verify.
  Mark N/A where a section does not apply, but do not delete it.
-->

## Resumen

<!-- Qué hace este PR y por qué, en 1–3 frases. -->

---

## 1. Tipo de cambio

- [ ] `feat` — nueva capacidad
- [ ] `fix` — corrección de defecto
- [ ] `refactor` — cambio interno sin alterar comportamiento
- [ ] `perf` — mejora de rendimiento
- [ ] `test` — solo pruebas
- [ ] `docs` — solo documentación
- [ ] `chore` / `ci` / `build` — tooling, infraestructura o dependencias
- [ ] Cambio con **impacto en arquitectura** (requiere ADR — ver §4)

## 2. Secciones del PROJECT_BIBLE afectadas

<!-- Lista las secciones del SSOT que este PR implementa, toca o depende de. -->

- Secciones: <!-- p. ej. §12 (frontend), §16 (IA), §22 (UI), §28 (datos) / N/A -->
- Requisitos / casos de uso: <!-- p. ej. RF-03, CU-02 / N/A -->
- Tokens del DESIGN_SYSTEM: <!-- p. ej. §3 color, §4 tipografía / N/A -->

## 3. ADR afectadas

<!-- Referencia las ADR relacionadas (§43). Si el PR introduce o cambia una
     decisión estructural, DEBE registrarse una ADR nueva en el Bible primero. -->

- ADR relacionadas: <!-- p. ej. ADR-002, ADR-011 / N/A -->
- [ ] Este PR **no** modifica ninguna decisión de arquitectura existente, **o**
- [ ] Introduce/actualiza una ADR (nº: ______) registrada en el Bible §43.

## 4. Actualización del SSOT (política documental)

<!-- El PROJECT_BIBLE es la única fuente de verdad. Toda decisión nueva se
     incorpora PRIMERO al Bible (ADR §43 o decisión abierta §49) y solo después
     a los documentos derivados (CLAUDE.md, README.md, docs/*). -->

- [ ] Este PR **no** introduce ninguna decisión que contradiga el Bible.
- [ ] Si introduce una decisión nueva, se ha incorporado **primero** al Bible y
      luego propagado a los documentos derivados.
- [ ] `CLAUDE.md`, `README.md` y `docs/*` quedan **coherentes** con el Bible.
- [ ] N/A — el PR no afecta a decisiones ni a documentación normativa.

## 5. Checklist de accesibilidad (Bible §20 — WCAG 2.2 AA)

- [ ] `npm run audit:a11y` (axe) sin violaciones en las vistas afectadas.
- [ ] Navegación por teclado completa y **foco visible** (§10 DESIGN_SYSTEM).
- [ ] Contraste AA verificado (texto ≥ 4,5:1; texto grande ≥ 3:1).
- [ ] HTML semántico / *landmarks*; etiquetas de formulario visibles y asociadas.
- [ ] `alt` significativo en imágenes; `prefers-reduced-motion` respetado.
- [ ] N/A — sin cambios de interfaz.

## 6. Checklist de rendimiento (Bible §18 / §9 — Core Web Vitals)

- [ ] Sin regresión de CWV (LCP < 2,5 s · INP < 200 ms · CLS < 0,1, P75 móvil).
- [ ] JavaScript mínimo (islas solo donde es imprescindible; zero-JS por defecto).
- [ ] Imágenes optimizadas (AVIF/WebP, dimensiones reservadas, `lazy`).
- [ ] Lighthouse ≥ 90 (Performance/SEO/Accessibility/Best Practices) en páginas clave.
- [ ] N/A — sin impacto en rendimiento.

## 7. Checklist de testing (Bible §32)

- [ ] `npm run typecheck` en verde (TypeScript strict).
- [ ] `npm run lint` y `npm run format:check` en verde.
- [ ] `npm test` (unit + integración) en verde; pruebas añadidas/actualizadas.
- [ ] E2E de rutas críticas (`npm run test:e2e`) cuando aplique.
- [ ] Cobertura de la lógica crítica introducida.

## 8. Checklist de seguridad (Bible §17)

- [ ] **Sin secretos** ni claves en el código; configuración vía `.env` (catálogo §38).
- [ ] Validación server-side de entradas; sin superficie nueva sin control (BFF).
- [ ] `npm audit` sin vulnerabilidades **critical** nuevas.
- [ ] Si toca IA/RAG: guardarraíles de *prompt injection* mantenidos (§16).
- [ ] Datos personales conforme a RGPD (minimización, DPA) cuando aplique.
- [ ] N/A — sin implicaciones de seguridad.

---

## Capturas / preview

<!-- Adjunta capturas o el enlace del preview del PR si hay cambios de UI. -->

## Notas para el revisor

<!-- Contexto, decisiones tomadas, dudas abiertas, riesgos conocidos. -->
