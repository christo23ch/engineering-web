/**
 * Typed identity helpers for schema definitions.
 *
 * Sanity schemas are plain objects; `defineType`/`defineField` in the
 * `sanity` package are compile-time sugar. These local equivalents keep the
 * schema files (a) importable by the root test suite and typechecked by
 * `astro check` WITHOUT the Studio's dependencies installed, and (b) valid
 * verbatim inside the Studio (structurally identical shapes). Only
 * Studio-runtime modules (sanity.config.ts, workflow/, desk/) import the
 * real `sanity` package.
 */

/** Chainable validation rule — structurally compatible with Sanity's Rule. */
export interface SchemaRule {
  required(): SchemaRule;
  min(value: number): SchemaRule;
  max(value: number): SchemaRule;
  integer(): SchemaRule;
  error(message: string): SchemaRule;
  warning(message: string): SchemaRule;
}

export type ValidationFn = (rule: SchemaRule) => SchemaRule | SchemaRule[];

export interface SchemaOptionItem {
  title: string;
  value: string;
}

export interface SchemaOptions {
  list?: SchemaOptionItem[];
  layout?: string;
  source?: string;
  maxLength?: number;
  hotspot?: boolean;
  [key: string]: unknown;
}

export interface ArrayMemberDef {
  type: string;
  to?: { type: string }[];
  [key: string]: unknown;
}

export interface FieldDef {
  name: string;
  title?: string;
  type: string;
  description?: string;
  rows?: number;
  of?: ArrayMemberDef[];
  to?: { type: string }[];
  fields?: FieldDef[];
  options?: SchemaOptions;
  validation?: ValidationFn;
  initialValue?: unknown;
  readOnly?: boolean;
  hidden?: boolean;
}

export interface PreviewDef {
  select?: Record<string, string>;
  prepare?: (selection: Record<string, unknown>) => {
    title?: string;
    subtitle?: string;
  };
}

export interface TypeDef {
  name: string;
  title?: string;
  type: 'document' | 'object' | 'image';
  description?: string;
  fields?: FieldDef[];
  options?: SchemaOptions;
  preview?: PreviewDef;
  validation?: ValidationFn;
}

export const defineType = (def: TypeDef): TypeDef => def;
export const defineField = (def: FieldDef): FieldDef => def;
