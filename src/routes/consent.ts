import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';

import type { LeadService } from '../services/lead-service.js';

const querySchema = z.object({
  email: z.string().email(),
  campaignId: z.string().optional()
});

function ensureAdmin(request: FastifyRequest): boolean {
  const adminKey = request.server.config.ADMIN_API_KEY;
  if (!adminKey) return true;
  const headerKey = request.headers['x-admin-key'];
  return typeof headerKey === 'string' && headerKey === adminKey;
}

export function registerConsentRoutes(app: FastifyInstance, leadService: LeadService): void {
  app.get('/api/consent', async (request, reply) => {
    if (!ensureAdmin(request)) {
      return reply.unauthorized('Invalid admin key');
    }

    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      const message = parsed.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const leads = await leadService.getConsentEvidence(parsed.data.email, parsed.data.campaignId);
    return reply.send({ leads });
  });
}
