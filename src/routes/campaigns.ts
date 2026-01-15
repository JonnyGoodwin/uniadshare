import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import type { CampaignService } from '../services/campaign-service.js';
import type { DisclosureService } from '../services/disclosure-service.js';

const createCampaignSchema = z.object({
  name: z.string().min(1),
  subdomain: z.string().min(1)
});

const createLandingVersionSchema = z.object({
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
const sponsorParams = z.object({ campaignId: z.string().min(1), sponsorId: z.string().min(1) });

export function registerCampaignRoutes(
  app: FastifyInstance,
  campaignService: CampaignService,
  disclosureService: DisclosureService
): void {
  app.get('/api/campaigns', async (_request, reply) => {
    const campaigns = await campaignService.listCampaigns();
    return reply.send({ campaigns });
  });

  app.post('/api/campaigns', async (request, reply) => {
    const parsed = createCampaignSchema.safeParse(request.body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const campaign = await campaignService.createCampaign(parsed.data);
    return reply.code(201).send({ campaign });
  });

  app.post('/api/campaigns/:campaignId/landing-versions', async (request, reply) => {
    const params = z.object({ campaignId: z.string().min(1) }).safeParse(request.params);
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

    const version = await campaignService.createLandingPageVersion({
      campaignId: params.data.campaignId,
      ...body.data
    });

    return reply.code(201).send({ landingPageVersion: version });
  });

  app.post(
    '/api/campaigns/:campaignId/landing-versions/:versionId/publish',
    async (request, reply) => {
      const params = z
        .object({ campaignId: z.string().min(1), versionId: z.string().min(1) })
        .safeParse(request.params);
      if (!params.success) {
        const message = params.error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join('; ');
        return reply.badRequest(message);
      }

      try {
        const published = await campaignService.publishLandingPageVersion(
          params.data.campaignId,
          params.data.versionId
        );
        return reply.code(200).send({ landingPageVersion: published });
      } catch (err) {
        request.log.error({ err }, 'Failed to publish landing page version');
        return reply.notFound('Landing page version not found for campaign');
      }
    }
  );

  app.post('/api/campaigns/:campaignId/sponsors', async (request, reply) => {
    const params = z.object({ campaignId: z.string().min(1) }).safeParse(request.params);
    const body = addSponsorSchema.safeParse(request.body);
    if (!params.success || !body.success) {
      const errors = [
        ...(params.success ? [] : params.error.errors),
        ...(body.success ? [] : body.error.errors)
      ];
      const message = errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const sponsor = await campaignService.addSponsor(params.data.campaignId, body.data);
    return reply.code(201).send({ sponsor });
  });

  app.get('/api/campaigns/:campaignId/sponsors', async (request, reply) => {
    const params = z.object({ campaignId: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      const message = params.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const sponsors = await campaignService.listSponsors(params.data.campaignId);
    return reply.send({ sponsors });
  });

  app.patch('/api/campaigns/:campaignId/sponsors/:sponsorId', async (request, reply) => {
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
      const sponsor = await campaignService.updateSponsor(
        params.data.campaignId,
        params.data.sponsorId,
        body.data
      );
      return reply.send({ sponsor });
    } catch (err) {
      request.log.warn({ err }, 'Failed to update sponsor');
      return reply.notFound('Sponsor not found for campaign');
    }
  });

  app.delete('/api/campaigns/:campaignId/sponsors/:sponsorId', async (request, reply) => {
    const params = sponsorParams.safeParse(request.params);
    if (!params.success) {
      const message = params.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    try {
      await campaignService.removeSponsor(params.data.campaignId, params.data.sponsorId);
      return reply.code(204).send();
    } catch (err) {
      request.log.warn({ err }, 'Failed to delete sponsor');
      return reply.notFound('Sponsor not found for campaign');
    }
  });

  app.get('/api/campaigns/:campaignId', async (request, reply) => {
    const params = z.object({ campaignId: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      const message = params.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('; ');
      return reply.badRequest(message);
    }

    const campaign = await campaignService.findById(params.data.campaignId);
    if (!campaign) return reply.notFound('Campaign not found');

    const [sponsors, landingPageVersions] = await Promise.all([
      campaignService.listSponsors(params.data.campaignId),
      campaignService.listLandingVersions(params.data.campaignId)
    ]);

    return reply.send({ campaign, sponsors, landingPageVersions });
  });
}
