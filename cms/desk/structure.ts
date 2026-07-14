/**
 * Desk structure (Studio runtime): the six §28 entities in editorial order
 * plus the DA-4 review queue — a live list of everything in `en_revision`,
 * so the level-2 reviewer never has to hunt for pending work.
 */
import type { StructureResolver } from 'sanity/structure';
import { ESTADO_EDITORIAL } from '../schemas/constants';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.documentTypeListItem('service').title('Servicios'),
      S.documentTypeListItem('caseStudy').title('Casos de éxito'),
      S.documentTypeListItem('article').title('Artículos / Recursos'),
      S.documentTypeListItem('teamMember').title('Equipo'),
      S.documentTypeListItem('certification').title('Certificaciones'),
      S.documentTypeListItem('sector').title('Sectores (taxonomía)'),
      S.divider(),
      S.listItem()
        .title('Pendientes de revisión (DA-4)')
        .child(
          S.documentList()
            .title('Pendientes de revisión')
            .filter('estadoEditorial == $estado')
            .params({ estado: ESTADO_EDITORIAL.enRevision }),
        ),
    ]);
