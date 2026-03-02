import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { requireAdminAuth } from '../auth/guard.js';
import type { DeliveryService } from '../services/delivery-service.js';

const querySchema = z.object({
  leadId: z.string().optional(),
  sponsorId: z.string().optional()
});

export function registerDeliveryRoutes(app: FastifyInstance, deliveryService: DeliveryService): void {
  app.get('/api/deliveries', { preHandler: requireAdminAuth }, async (request, reply) => {
    const parsed = querySchema.safeParse(request.query);
    if (!parsed.success) {
      const message = parsed.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const deliveries = await deliveryService.listDeliveries();
    const filtered = deliveries.filter((d) => {
      if (parsed.data.leadId && d.leadId !== parsed.data.leadId) return false;
      if (parsed.data.sponsorId && d.sponsorId !== parsed.data.sponsorId) return false;
      return true;
    });
    return reply.send({ deliveries: filtered });
  });
}
