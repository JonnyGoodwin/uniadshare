import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { loginAsAdmin, testAdminEnv } from './admin-auth.js';
import { buildApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';
const env = loadEnv({ NODE_ENV: 'test', PORT: '3001', ...testAdminEnv });
const app = buildApp(env);
let adminHeaders;
beforeAll(async () => {
    adminHeaders = await loginAsAdmin(app);
});
afterAll(async () => {
    await app.close();
});
describe('pods', () => {
    it('creates a pod and landing page version, then publishes it', async () => {
        const createPod = await app.inject({
            method: 'POST',
            url: '/api/pods',
            headers: adminHeaders,
            payload: { name: 'Test Pod', subdomain: 'test' }
        });
        expect(createPod.statusCode).toBe(201);
        const podId = createPod.json().pod.id;
        const createVersion = await app.inject({
            method: 'POST',
            url: `/api/pods/${podId}/landing-versions`,
            headers: adminHeaders,
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
        const versionId = createVersion.json().landingPageVersion.id;
        const publishVersion = await app.inject({
            method: 'POST',
            url: `/api/pods/${podId}/landing-versions/${versionId}/publish`,
            headers: adminHeaders
        });
        expect(publishVersion.statusCode).toBe(200);
        const published = publishVersion.json().landingPageVersion;
        expect(published.status).toBe('published');
        expect(published.publishedAt).toBeTruthy();
    });
    it('updates and deletes a sponsor', async () => {
        const createPod = await app.inject({
            method: 'POST',
            url: '/api/pods',
            headers: adminHeaders,
            payload: { name: 'Sponsor Pod', subdomain: 'sponsor-test' }
        });
        const podId = createPod.json().pod.id;
        const sponsorRes = await app.inject({
            method: 'POST',
            url: `/api/pods/${podId}/sponsors`,
            headers: adminHeaders,
            payload: {
                name: 'Sponsor A',
                webhookEndpoint: 'https://example.com/webhook',
                role: 'primary'
            }
        });
        expect(sponsorRes.statusCode).toBe(201);
        const sponsorId = sponsorRes.json().sponsor.sponsorId;
        const updateRes = await app.inject({
            method: 'PATCH',
            url: `/api/pods/${podId}/sponsors/${sponsorId}`,
            headers: adminHeaders,
            payload: { name: 'Sponsor A Updated' }
        });
        expect(updateRes.statusCode).toBe(200);
        expect(updateRes.json().sponsor.name).toBe('Sponsor A Updated');
        const deleteRes = await app.inject({
            method: 'DELETE',
            url: `/api/pods/${podId}/sponsors/${sponsorId}`,
            headers: adminHeaders
        });
        expect(deleteRes.statusCode).toBe(204);
    });
});
