import type { IconName } from '@/lib/ui/icons';

/**
 * Service-line taxonomy — the single source of truth for the six service lines.
 * Slugs come from Bible §24 (sitemap), icons from DESIGN_SYSTEM §7. Consumed by
 * the Home service grid (§13.1) and the service page template (§13.2), so both
 * agree on the routes (no 404 drift).
 *
 * Copy is DEFINITIONAL and PROVISIONAL (what each line is / the domain problem
 * it addresses) — not a fabricated claim. Real editorial content lands via the
 * CMS (DA-7).
 */
export interface Service {
  slug: string;
  name: string;
  icon: IconName;
  /** One-line summary for the Home service card. */
  description: string;
  /** The client-side problem framing for the service-page hero (§13.2). */
  problem: string;
}

export const services: Service[] = [
  {
    slug: 'ingenieria-industrial',
    name: 'Ingeniería industrial',
    icon: 'factory',
    description:
      'Diseño y optimización de procesos e instalaciones industriales.',
    problem:
      'Optimizar procesos e instalaciones industriales sin comprometer la seguridad ni la continuidad de la operación.',
  },
  {
    slug: 'eficiencia-energetica',
    name: 'Eficiencia energética',
    icon: 'zap',
    description:
      'Auditoría y mejora del rendimiento energético de instalaciones.',
    problem:
      'Reducir el consumo y el coste energético de instalaciones existentes con inversiones justificadas por datos.',
  },
  {
    slug: 'energias-renovables',
    name: 'Energías renovables',
    icon: 'sun',
    description: 'Proyectos de generación renovable y autoconsumo.',
    problem:
      'Incorporar generación renovable y autoconsumo con criterios técnicos y de rentabilidad.',
  },
  {
    slug: 'instalaciones-mep',
    name: 'Instalaciones (MEP)',
    icon: 'layers',
    description: 'Instalaciones mecánicas, eléctricas y de fontanería.',
    problem:
      'Diseñar instalaciones mecánicas, eléctricas y de fontanería fiables y conformes a la normativa aplicable.',
  },
  {
    slug: 'consultoria-tecnica',
    name: 'Consultoría técnica',
    icon: 'clipboard-check',
    description: 'Asesoramiento técnico y cumplimiento de normativa aplicable.',
    problem:
      'Tomar decisiones técnicas con el respaldo de ingeniería independiente y trazable.',
  },
  {
    slug: 'digitalizacion-bim',
    name: 'Digitalización BIM',
    icon: 'box',
    description: 'Modelado BIM y digitalización de activos e infraestructuras.',
    problem:
      'Digitalizar activos e infraestructuras para gestionar su ciclo de vida con datos fiables.',
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
