import type { FastifyReply, FastifyRequest } from 'fastify';

import { extractBearerToken, verifyAdminSessionToken } from './admin-session.js';

function hasAdminCredentials(request: FastifyRequest): boolean {
  return Boolean(request.server.config.ADMIN_EMAIL && request.server.config.ADMIN_PASSWORD);
}

export async function requireAdminAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!hasAdminCredentials(request)) {
    reply.internalServerError('Admin authentication is not configured on the server');
    return;
  }

  const token = extractBearerToken(request.headers.authorization);
  if (!token) {
    reply.unauthorized('Authentication required');
    return;
  }

  const session = verifyAdminSessionToken(token, request.server.config.AUTH_SESSION_SECRET);
  if (!session) {
    reply.unauthorized('Invalid or expired session');
    return;
  }

  if (session.email !== request.server.config.ADMIN_EMAIL) {
    reply.unauthorized('Invalid or expired session');
    return;
  }
}
