import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { CampaignService } from '../services/campaign-service.js';
import { renderLandingPage } from '../templates/render.js';

const landingParamsSchema = z.object({
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

export function registerLandingRoutes(app: FastifyInstance, campaignService: CampaignService): void {
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
    const versionId = query.data.versionId;

    const landing = versionId
      ? await campaignService.getLandingVersionBySubdomain(subdomain, versionId)
      : query.data.draft
      ? await campaignService.getLatestLandingVersion(subdomain)
      : await campaignService.getPublishedLandingBySubdomain(subdomain);

    if (!landing) {
      return reply.notFound('Landing page not found');
    }

    // In a future step, render template; currently return structured data for SSR/SPA consumption.
    return {
      campaign: landing.campaign,
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
    const subdomain = extractSubdomain(request.headers.host, request.server.config.BASE_DOMAIN);
    if (!subdomain) {
      return reply.notFound('Subdomain not found');
    }

    const landing = await campaignService.getPublishedLandingBySubdomain(subdomain);
    if (!landing) {
      return reply.notFound('Landing page not found');
    }

    const html = renderLandingPage(
      landing.templateRef,
      landing.content,
      landing.disclosure?.text ?? undefined
    );

    reply.header('content-type', 'text/html');
    return reply.send(html);
  });
}
