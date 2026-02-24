import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { PodService } from '../services/pod-service.js';
import type { DisclosureService } from '../services/disclosure-service.js';
import { validateTemplateContent } from '../templates/catalog.js';

const createPodSchema = z.object({
  name: z.string().min(1),
  subdomain: z.string().min(1)
});

const createLandingVersionSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  templateRef: z.string().min(1),
  content: z.record(z.any()),
  disclosureVersionId: z.string().min(1).optional()
});

const addSponsorSchema = z.object({
  name: z.string().min(1),
  webhookEndpoint: z.string().url(),
  role: z.string().min(1),
  privacyUrl: z.string().url().optional(),
  termsUrl: z.string().url().optional()
});
const updateSponsorSchema = addSponsorSchema.partial().extend({
  name: z.string().min(1).optional(),
  webhookEndpoint: z.string().url().optional(),
  role: z.string().min(1).optional()
});
const sponsorParams = z.object({ podId: z.string().min(1), sponsorId: z.string().min(1) });

export function registerPodRoutes(
  app: FastifyInstance,
  podService: PodService,
  disclosureService: DisclosureService
): void {
  app.get('/api/pods', async (_request, reply) => {
    const pods = await podService.listPods();
    return reply.send({ pods });
  });

  app.post('/api/pods', async (request, reply) => {
    const parsed = createPodSchema.safeParse(request.body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const pod = await podService.createPod(parsed.data);
    return reply.code(201).send({ pod });
  });

  app.post('/api/pods/:podId/landing-versions', async (request, reply) => {
    const params = z.object({ podId: z.string().min(1) }).safeParse(request.params);
    const body = createLandingVersionSchema.safeParse(request.body);
    if (!params.success || !body.success) {
      const errors = [
        ...(params.success ? [] : params.error.errors),
        ...(body.success ? [] : body.error.errors)
      ];
      const message = errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    if (body.data.disclosureVersionId) {
      try {
        await disclosureService.assertExists(body.data.disclosureVersionId);
      } catch {
        return reply.badRequest('Invalid disclosureVersionId');
      }
    }

    const templateErrors = validateTemplateContent(body.data.templateRef, body.data.content);
    if (templateErrors.length > 0) {
      return reply.badRequest(templateErrors.join('; '));
    }

    try {
      const version = await podService.createLandingPageVersion({
        podId: params.data.podId,
        ...body.data,
        autoPublish: true
      });

      return reply.code(201).send({ landingPageVersion: version });
    } catch (err) {
      request.log.warn({ err }, 'Failed to create landing page version');
      return reply.badRequest(err instanceof Error ? err.message : 'Failed to create landing page version');
    }
  });

  app.post(
    '/api/pods/:podId/landing-versions/:versionId/publish',
    async (request, reply) => {
      const params = z
        .object({ podId: z.string().min(1), versionId: z.string().min(1) })
        .safeParse(request.params);
      if (!params.success) {
        const message = params.error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join('; ');
        return reply.badRequest(message);
      }

      try {
        const published = await podService.publishLandingPageVersion(
          params.data.podId,
          params.data.versionId
        );
        return reply.code(200).send({ landingPageVersion: published });
      } catch (err) {
        request.log.error({ err }, 'Failed to publish landing page version');
        return reply.notFound('Landing page version not found for pod');
      }
    }
  );

  app.post('/api/pods/:podId/sponsors', async (request, reply) => {
    const params = z.object({ podId: z.string().min(1) }).safeParse(request.params);
    const body = addSponsorSchema.safeParse(request.body);
    if (!params.success || !body.success) {
      const errors = [
        ...(params.success ? [] : params.error.errors),
        ...(body.success ? [] : body.error.errors)
      ];
      const message = errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const sponsor = await podService.addSponsor(params.data.podId, body.data);
    return reply.code(201).send({ sponsor });
  });

  app.get('/api/pods/:podId/sponsors', async (request, reply) => {
    const params = z.object({ podId: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      const message = params.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const sponsors = await podService.listSponsors(params.data.podId);
    return reply.send({ sponsors });
  });

  app.patch('/api/pods/:podId/sponsors/:sponsorId', async (request, reply) => {
    const params = sponsorParams.safeParse(request.params);
    const body = updateSponsorSchema.safeParse(request.body);
    if (!params.success || !body.success) {
      const errors = [
        ...(params.success ? [] : params.error.errors),
        ...(body.success ? [] : body.error.errors)
      ];
      const message = errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    try {
      const sponsor = await podService.updateSponsor(
        params.data.podId,
        params.data.sponsorId,
        body.data
      );
      return reply.send({ sponsor });
    } catch (err) {
      request.log.warn({ err }, 'Failed to update sponsor');
      return reply.notFound('Sponsor not found for pod');
    }
  });

  app.delete('/api/pods/:podId/sponsors/:sponsorId', async (request, reply) => {
    const params = sponsorParams.safeParse(request.params);
    if (!params.success) {
      const message = params.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    try {
      await podService.removeSponsor(params.data.podId, params.data.sponsorId);
      return reply.code(204).send();
    } catch (err) {
      request.log.warn({ err }, 'Failed to delete sponsor');
      return reply.notFound('Sponsor not found for pod');
    }
  });

  app.get('/api/pods/:podId', async (request, reply) => {
    const params = z.object({ podId: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      const message = params.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const pod = await podService.findById(params.data.podId);
    if (!pod) return reply.notFound('Pod not found');

    const [sponsors, landingPageVersions] = await Promise.all([
      podService.listSponsors(params.data.podId),
      podService.listLandingVersions(params.data.podId)
    ]);

    return reply.send({ pod, sponsors, landingPageVersions });
  });
}
