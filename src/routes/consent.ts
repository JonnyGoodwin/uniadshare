import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { requireAdminAuth } from '../auth/guard.js';
import type { LeadService } from '../services/lead-service.js';

const querySchema = z.object({
  email: z.string().email(),
  podId: z.string().optional()
});

export function registerConsentRoutes(app: FastifyInstance, leadService: LeadService): void {
  app.get('/api/consent', { preHandler: requireAdminAuth }, async (request, reply) => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      const message = parsed.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const leads = await leadService.getConsentEvidence(parsed.data.email, parsed.data.podId);
    return reply.send({ leads });
  });
}
