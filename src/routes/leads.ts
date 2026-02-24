import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { DisclosureService } from '../services/disclosure-service.js';
import type { LeadService } from '../services/lead-service.js';

const leadSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).optional(),
  podId: z.string().min(1),
  landingPageVersionId: z.string().min(1).optional(),
  disclosureVersionId: z.string().min(1).optional(),
  consentedAt: z.coerce.date().optional(),
  metadata: z
    .object({
      utmSource: z.string().optional(),
      utmMedium: z.string().optional(),
      utmCampaign: z.string().optional(),
      utmTerm: z.string().optional(),
      utmContent: z.string().optional(),
      referrer: z.string().optional(),
      clickId: z.string().optional(),
      ip: z.string().optional(),
      userAgent: z.string().optional()
    })
    .optional()
});

export function registerLeadRoutes(
  app: FastifyInstance,
  leadService: LeadService,
  disclosureService: DisclosureService
): void {
  app.post('/api/leads', async (request, reply) => {
    const parsed = leadSchema.safeParse(request.body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const leadInput = {
      ...parsed.data,
      podId: parsed.data.podId
    };
    try {
      await disclosureService.assertExists(leadInput.disclosureVersionId);
      const storedLead = await leadService.ingest(leadInput);

      app.log.info({ leadId: storedLead.id, podId: storedLead.podId }, 'Lead ingested');

      return reply.code(202).send({
        status: 'accepted',
        lead: { id: storedLead.id, email: storedLead.email, podId: storedLead.podId }
      });
    } catch (err) {
      request.log.warn({ err }, 'Lead ingestion failed');
      return reply.badRequest(
        err instanceof Error ? err.message : 'Failed to ingest lead; invalid disclosure?'
      );
    }
  });
}
