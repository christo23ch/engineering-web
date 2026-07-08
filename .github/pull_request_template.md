<!--
  PR template — aligned with docs/PROJECT_BIBLE.md (SSOT) and its documentary
  policy. Fill in each section; delete guidance comments. Keep the commit(s)
  Conventional Commits compliant (Bible §29) — CI/commitlint will check.
-->

## Resumen

<!-- Qué hace este PR y por qué, en 1–3 frases. -->

## Tipo de cambio

- [ ] `feat` — nueva capacidad
- [ ] `fix` — corrección
- [ ] `chore` / `ci` / `build` — tooling / infraestructura
- [ ] `docs` — documentación
- [ ] `refactor` / `test` / `perf`

## Trazabilidad al PROJECT_BIBLE (SSOT)

<!-- El Bible es la única fuente de verdad. Referencia lo que aplique. -->

- Secciones del Bible afectadas o implementadas: <!-- p. ej. §12, §22 -->
- ADR relacionada(s): <!-- p. ej. ADR-002, ADR-011 / N/A -->
- Requisitos / casos de uso: <!-- p. ej. RF-03, CU-02 / N/A -->
- Tokens del DESIGN_SYSTEM tocados: <!-- p. ej. §3 color / N/A -->

## Política documental

- [ ] Este PR **no** introduce ninguna decisión que contradiga el Bible.
- [ ] Si introduce una decisión nueva, se ha incorporado **primero** al Bible
      (ADR en §43 o decisión abierta en §49) y luego a los documentos derivados.
- [ ] `CLAUDE.md` / `README.md` / `docs/*` quedan coherentes con el Bible.

## Calidad (Bible §30 / §32) — gates de CI

- [ ] `npm run typecheck` en verde (TypeScript strict).
- [ ] `npm run lint` y `npm run format:check` en verde.
- [ ] `npm test` (unit + integration) en verde.
- [ ] E2E / rutas críticas (`npm run test:e2e`) cuando aplique.

## Accesibilidad y rendimiento (Bible §18 / §20)

- [ ] Accesibilidad **WCAG 2.2 AA** (axe sin violaciones) en las vistas tocadas.
- [ ] Sin regresión de Core Web Vitals / presupuesto (JS mínimo, imágenes optimizadas).

## Seguridad (Bible §17)

- [ ] Sin secretos ni claves en el código; variables vía `.env` (catálogo §38).
- [ ] Entradas validadas server-side donde aplique; sin superficie nueva sin control.
- [ ] `npm audit` sin vulnerabilidades **critical** nuevas.

## Capturas / preview (si hay cambios de UI)

<!-- Adjunta capturas o el enlace del preview del PR. -->

## Notas para el revisor

<!-- Contexto, decisiones, dudas abiertas. -->
