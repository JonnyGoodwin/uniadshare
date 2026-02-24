import type { FastifyInstance } from 'fastify';

import { listLandingTemplates } from '../templates/catalog.js';

export function registerTemplateRoutes(app: FastifyInstance): void {
  app.get('/api/templates', async (_request, reply) => {
    const templates = listLandingTemplates();
    return reply.send({ templates });
  });
}
