/**
 * Form outcome vocabulary — SINGLE SOURCE OF TRUTH shared by the BFF and the
 * rendered page (Bible §13 progressive enhancement).
 *
 * Pages are SSG and cannot read a query string server-side, so the BFF
 * redirects a zero-JS submission back to the form page with an outcome
 * FRAGMENT and the pre-rendered banner is revealed with CSS `:target`. That
 * only works while both sides agree on the exact identifiers — so they are
 * declared once here, and both `server/http/form-flow.ts` (which picks the
 * fragment) and `components/content/FormStatus.astro` (which renders the
 * banners) consume this module. No literal is repeated anywhere else, and
 * tests/unit/form-status.contract.test.ts pins the agreement.
 *
 * Note: there is deliberately NO success fragment. A successful submission is
 * a screen of its own (`SUCCESS_PATH`, DESIGN_SYSTEM §13.8), not a banner on
 * the form — redirecting there is what makes a refresh unable to resubmit.
 */
import type { AlertVariant } from '@/lib/ui/alert-variants';

/** Approved success screen for every capture form (DESIGN_SYSTEM §13.8). */
export const SUCCESS_PATH = '/contacto/gracias';

/**
 * Closed set of outcome fragments. Spanish per ADR-009; adding a case here
 * forces both the server mapping and the rendered banners to follow.
 */
export const FORM_STATUS_FRAGMENTS = {
  validacion: 'error-validacion',
  limite: 'error-limite',
  noDisponible: 'error-no-disponible',
  inesperado: 'error-inesperado',
} as const;

export type FormStatusFragment =
  (typeof FORM_STATUS_FRAGMENTS)[keyof typeof FORM_STATUS_FRAGMENTS];

export interface FormStatusBanner {
  /** DOM id — the fragment the BFF redirects to. */
  fragment: FormStatusFragment;
  variant: AlertVariant;
  title: string;
  body: string;
}

/**
 * The banners, in render order. Copy is honest by construction: it says what
 * happened, never claims the submission was stored when it was not, and never
 * promises a wait shorter than the configured anti-abuse window — the page is
 * static and cannot know `RATE_LIMIT_WINDOW` (§38, one hour by default), so
 * the throttling banner commits to no specific time at all.
 */
export const FORM_STATUS_BANNERS: readonly FormStatusBanner[] = [
  {
    fragment: FORM_STATUS_FRAGMENTS.validacion,
    variant: 'error',
    title: 'Revisa los datos del formulario',
    body: 'Algún campo no es válido o falta por completar (incluido el consentimiento). Corrígelo y vuelve a enviarlo.',
  },
  {
    fragment: FORM_STATUS_FRAGMENTS.limite,
    variant: 'warning',
    title: 'Has alcanzado el límite de envíos',
    body: 'Hemos recibido varias solicitudes desde tu conexión y hemos pausado el envío temporalmente. Vuelve a intentarlo más tarde o escríbenos por otra vía.',
  },
  {
    fragment: FORM_STATUS_FRAGMENTS.noDisponible,
    variant: 'warning',
    title: 'El envío no está disponible ahora mismo',
    body: 'No hemos podido registrar tu solicitud. Vuelve a intentarlo más tarde o escríbenos por otra vía.',
  },
  {
    fragment: FORM_STATUS_FRAGMENTS.inesperado,
    variant: 'error',
    title: 'No hemos podido enviar tu solicitud',
    body: 'Ha ocurrido un error inesperado y tu solicitud no se ha registrado. Vuelve a intentarlo más tarde.',
  },
];
