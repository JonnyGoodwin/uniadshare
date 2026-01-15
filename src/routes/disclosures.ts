import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { DisclosureService } from '../services/disclosure-service.js';

const disclosureSchema = z.object({
  text: z.string().min(1)
});

export function registerDisclosureRoutes(
  app: FastifyInstance,
  disclosureService: DisclosureService
): void {
  app.post('/api/campaigns/:campaignId/disclosures', async (request, reply) => {
    const params = z.object({ campaignId: z.string().min(1) }).safeParse(request.params);
    const body = disclosureSchema.safeParse(request.body);
    if (!params.success || !body.success) {
      const errors = [
        ...(params.success ? [] : params.error.errors),
        ...(body.success ? [] : body.error.errors)
      ];
      const message = errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const disclosure = await disclosureService.create({
      campaignId: params.data.campaignId,
      text: body.data.text
    });

    return reply.code(201).send({ disclosure });
  });
}
