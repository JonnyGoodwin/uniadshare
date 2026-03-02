import type { FastifyInstance } from 'fastify';

import { requireAdminAuth } from '../auth/guard.js';
import { listLandingTemplates } from '../templates/catalog.js';

export function registerTemplateRoutes(app: FastifyInstance): void {
  app.get('/api/templates', { preHandler: requireAdminAuth }, async (_request, reply) => {
    const templates = listLandingTemplates();
    return reply.send({ templates });
  });
}
