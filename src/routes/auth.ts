import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { issueAdminSessionToken } from '../auth/admin-session.js';
import { requireAdminAuth } from '../auth/guard.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export function registerAuthRoutes(app: FastifyInstance): void {
  app.post('/api/auth/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const adminEmail = app.config.ADMIN_EMAIL;
    const adminPassword = app.config.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      return reply.internalServerError('Admin authentication is not configured on the server');
    }

    if (parsed.data.email !== adminEmail || parsed.data.password !== adminPassword) {
      return reply.unauthorized('Invalid credentials');
    }

    const token = issueAdminSessionToken({
      email: adminEmail,
      secret: app.config.AUTH_SESSION_SECRET,
      ttlHours: app.config.AUTH_TOKEN_TTL_HOURS
    });

    return reply.send({
      token,
      admin: {
        email: adminEmail
      }
    });
  });

  app.get('/api/auth/me', { preHandler: requireAdminAuth }, async (request, reply) => {
    return reply.send({
      admin: {
        email: request.server.config.ADMIN_EMAIL
      }
    });
  });

  app.post('/api/auth/logout', { preHandler: requireAdminAuth }, async (_request, reply) => {
    return reply.code(204).send();
  });
}
