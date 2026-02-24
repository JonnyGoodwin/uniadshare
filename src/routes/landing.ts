import type { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';

import type { PodService } from '../services/pod-service.js';
import { renderLandingPage } from '../templates/render.js';

const landingParamsSchema = z.object({
  subdomain: z.string().min(1)
});
const previewParamsSchema = z.object({
  subdomain: z.string().min(1)
});

const landingQuerySchema = z.object({
  versionId: z.string().optional(),
  draft: z.coerce.boolean().optional()
});

function extractSubdomain(host: string | undefined, baseDomain?: string): string | null {
  if (!host) return null;
  const hostname = host.split(':')[0];
  if (!baseDomain) return null;
  const normalizedBase = baseDomain.split(':')[0];
  if (!hostname.endsWith(normalizedBase)) return null;
  const suffix = normalizedBase.startsWith('.') ? normalizedBase : `.${normalizedBase}`;
  const subdomain = hostname.replace(suffix, '');
  if (!subdomain || subdomain === hostname) return null;
  return subdomain;
}

export function registerLandingRoutes(app: FastifyInstance, podService: PodService): void {
  async function resolveLandingBySubdomain(
    subdomain: string,
    query: { versionId?: string; draft?: boolean }
  ) {
    if (query.versionId) {
      return podService.getLandingVersionBySubdomain(subdomain, query.versionId);
    }
    if (query.draft) {
      return podService.getLatestLandingVersion(subdomain);
    }
    return podService.getPublishedLandingBySubdomain(subdomain);
  }

  async function sendLandingHtml(
    reply: { header: (name: string, value: string) => void; send: (payload: string) => unknown },
    landing: {
      templateRef: string;
      content: Record<string, unknown>;
      disclosure?: { text: string } | null;
      podId: string;
      id: string;
      disclosureVersionId?: string | null;
    }
  ) {
    const html = renderLandingPage(
      landing.templateRef,
      landing.content,
      landing.disclosure?.text ?? undefined,
      {
        podId: landing.podId,
        landingPageVersionId: landing.id,
        disclosureVersionId: landing.disclosureVersionId
      }
    );

    reply.header('content-type', 'text/html');
    return reply.send(html);
  }

  app.get('/api/landing/:subdomain', async (request, reply) => {
    const params = landingParamsSchema.safeParse(request.params);
    const query = landingQuerySchema.safeParse(request.query);

    if (!params.success || !query.success) {
      const errors = [
        ...(params.success ? [] : params.error.errors),
        ...(query.success ? [] : query.error.errors)
      ];
      const message = errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const { subdomain } = params.data;
    const landing = await resolveLandingBySubdomain(subdomain, query.data);

    if (!landing) {
      return reply.notFound('Landing page not found');
    }

    // In a future step, render template; currently return structured data for SSR/SPA consumption.
    return {
      pod: landing.pod,
      landingPageVersion: {
        id: landing.id,
        templateRef: landing.templateRef,
        content: landing.content,
        status: landing.status,
        publishedAt: landing.publishedAt
      },
      disclosure: landing.disclosure
    };
  });

  app.get('/', async (request, reply) => {
    const query = landingQuerySchema.safeParse(request.query);
    if (!query.success) {
      const message = query.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const subdomain = extractSubdomain(request.headers.host, request.server.config.BASE_DOMAIN);
    if (!subdomain) {
      return reply.notFound('Subdomain not found');
    }

    const landing = await resolveLandingBySubdomain(subdomain, query.data);

    if (!landing) {
      return reply.notFound('Landing page not found');
    }

    return sendLandingHtml(reply, landing);
  });

  async function handlePreview(
    request: { params: unknown; query: unknown },
    reply: FastifyReply
  ) {
    const params = previewParamsSchema.safeParse(request.params);
    const query = landingQuerySchema.safeParse(request.query);
    if (!params.success || !query.success) {
      const errors = [
        ...(params.success ? [] : params.error.errors),
        ...(query.success ? [] : query.error.errors)
      ];
      const message = errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const landing = await resolveLandingBySubdomain(params.data.subdomain, query.data);
    if (!landing) {
      return reply.notFound('Landing page not found');
    }

    return sendLandingHtml(reply, landing);
  }

  app.get('/preview/:subdomain', async (request, reply) => {
    return handlePreview(request, reply);
  });

  app.get('/api/preview/:subdomain', async (request, reply) => {
    return handlePreview(request, reply);
  });

  app.get('/:slug', async (request, reply) => {
    const slugParams = z.object({ slug: z.string().min(1) }).safeParse(request.params);
    if (!slugParams.success) {
      const message = slugParams.error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      return reply.badRequest(message);
    }

    const subdomain = extractSubdomain(request.headers.host, request.server.config.BASE_DOMAIN);
    if (!subdomain) {
      return reply.notFound('Subdomain not found');
    }

    const landing = await podService.getPublishedLandingBySubdomainAndSlug(
      subdomain,
      slugParams.data.slug
    );
    if (!landing) {
      return reply.notFound('Landing page not found');
    }

    return sendLandingHtml(reply, landing);
  });
}
