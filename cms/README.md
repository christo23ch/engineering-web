# Sanity Studio (DA-7)

Studio del CMS para `engineering-web`. **Workspace propio**: sus dependencias
no forman parte de la web (`npm install` aquí dentro, no en la raíz).

```bash
cd cms
npm install
cp .env.example .env       # rellenar tras crear el proyecto Sanity
npm run dev                # Studio en local
npm run typecheck          # tsc del workspace (tipos reales de sanity v4)
npm run schema:check       # validación del CLI de Sanity (requiere red)
npm run schema:check:local # compilación estructural offline (@sanity/schema)
```

- **Esquemas** (`schemas/`): las 6 entidades CMS del Bible §28 + objetos.
  No importan el paquete `sanity` (helpers tipados locales en
  `schemas/define.ts`), de modo que la suite de tests raíz los verifica
  contra el contrato GROQ/zod sin instalar el Studio.
- **Workflow DA-4** (`workflow/`): borrador → en revisión → aprobado; el
  botón *Publish* queda deshabilitado hasta «Aprobado» y el rol `redactor`
  no lo ve.
- **Cola de revisión** (`desk/structure.ts`): lista viva de documentos
  `en_revision`.
- **Preview** (`preview.ts`): "Open preview" → ruta pública §24.

Runbook completo (creación del proyecto, roles, CORS, tokens, webhooks,
revalidación/ISR): [`../docs/CMS.md`](../docs/CMS.md).
