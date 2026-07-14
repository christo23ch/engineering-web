/**
 * Local structural validation of the schema registry — no network, no
 * project. Compiles the schemas with Sanity's own schema compiler and
 * prints the registered types; throws on structural problems (bad field
 * shapes, invalid members, name collisions). Complements `sanity schema
 * validate` (which needs API egress) for offline environments.
 *
 * Run: npm run schema:check:local
 */
import { Schema } from '@sanity/schema';
import { schemaTypes } from '../schemas/index';

const compiled = Schema.compile({
  name: 'engineering-web',
  types: schemaTypes,
});

const names = compiled
  .getTypeNames()
  .filter((name: string) =>
    schemaTypes.some((definition) => definition.name === name),
  );

if (names.length !== schemaTypes.length) {
  console.error('missing types after compile:', names);
  process.exit(1);
}
console.error(`schema OK — ${String(names.length)} types compiled:`, names);
