import { afterAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';

const env = loadEnv({ NODE_ENV: 'test', PORT: '3001' });
const app = buildApp(env);

afterAll(async () => {
  await app.close();
});

describe('campaigns', () => {
  it('creates a campaign and landing page version, then publishes it', async () => {
    const createCampaign = await app.inject({
      method: 'POST',
      url: '/api/campaigns',
      payload: { name: 'Test Campaign', subdomain: 'test' }
    });

    expect(createCampaign.statusCode).toBe(201);
    const campaignId = createCampaign.json().campaign.id as string;

    const createVersion = await app.inject({
      method: 'POST',
      url: `/api/campaigns/${campaignId}/landing-versions`,
      payload: {
        templateRef: 'basic',
        content: {
          headline: 'Hello',
          body: 'Body copy',
          ctaLabel: 'Join',
          consentLabel: 'I agree',
          successMessage: 'Thanks'
        }
      }
    });

    expect(createVersion.statusCode).toBe(201);
    const versionId = createVersion.json().landingPageVersion.id as string;

    const publishVersion = await app.inject({
      method: 'POST',
      url: `/api/campaigns/${campaignId}/landing-versions/${versionId}/publish`
    });

    expect(publishVersion.statusCode).toBe(200);
    const published = publishVersion.json().landingPageVersion;
    expect(published.status).toBe('published');
    expect(published.publishedAt).toBeTruthy();
  });

  it('updates and deletes a sponsor', async () => {
    const createCampaign = await app.inject({
      method: 'POST',
      url: '/api/campaigns',
      payload: { name: 'Sponsor Campaign', subdomain: 'sponsor-test' }
    });
    const campaignId = createCampaign.json().campaign.id as string;

    const sponsorRes = await app.inject({
      method: 'POST',
      url: `/api/campaigns/${campaignId}/sponsors`,
      payload: {
        name: 'Sponsor A',
        webhookEndpoint: 'https://example.com/webhook',
        role: 'primary'
      }
    });
    expect(sponsorRes.statusCode).toBe(201);
    const sponsorId = sponsorRes.json().sponsor.sponsorId as string;

    const updateRes = await app.inject({
      method: 'PATCH',
      url: `/api/campaigns/${campaignId}/sponsors/${sponsorId}`,
      payload: { name: 'Sponsor A Updated' }
    });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.json().sponsor.name).toBe('Sponsor A Updated');

    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/api/campaigns/${campaignId}/sponsors/${sponsorId}`
    });
    expect(deleteRes.statusCode).toBe(204);
  });
});
