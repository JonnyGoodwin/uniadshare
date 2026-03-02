import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { loginAsAdmin, testAdminEnv } from './admin-auth.js';
import { buildApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';
const env = loadEnv({ NODE_ENV: 'test', PORT: '3001', BASE_DOMAIN: 'example.com', ...testAdminEnv });
const app = buildApp(env);
let adminHeaders;
beforeAll(async () => {
    adminHeaders = await loginAsAdmin(app);
});
afterAll(async () => {
    await app.close();
});
describe('landing retrieval and disclosures', () => {
    it('serves published landing with disclosure and supports preview by versionId', async () => {
        const campaignRes = await app.inject({
            method: 'POST',
            url: '/api/pods',
            headers: adminHeaders,
            payload: { name: 'Landing Test', subdomain: 'lander' }
        });
        const podId = campaignRes.json().pod.id;
        const disclosureRes = await app.inject({
            method: 'POST',
            url: `/api/pods/${podId}/disclosures`,
            headers: adminHeaders,
            payload: { text: 'Primary publisher: Example; Co-reg: A, B' }
        });
        const disclosureId = disclosureRes.json().disclosure.id;
        const versionRes = await app.inject({
            method: 'POST',
            url: `/api/pods/${podId}/landing-versions`,
            headers: adminHeaders,
            payload: {
                templateRef: 'basic',
                content: {
                    headline: 'Hello world',
                    body: 'Top operators only',
                    ctaLabel: 'Join Free',
                    consentLabel: 'I agree',
                    successMessage: 'Thanks'
                },
                disclosureVersionId: disclosureId
            }
        });
        const versionId = versionRes.json().landingPageVersion.id;
        await app.inject({
            method: 'POST',
            url: `/api/pods/${podId}/landing-versions/${versionId}/publish`,
            headers: adminHeaders
        });
        const publishedRes = await app.inject({
            method: 'GET',
            url: `/api/landing/lander`
        });
        expect(publishedRes.statusCode).toBe(200);
        const published = publishedRes.json();
        expect(published.landingPageVersion.id).toBe(versionId);
        expect(published.disclosure.id).toBe(disclosureId);
        expect(published.disclosure.hash).toMatch(/^[a-f0-9]{64}$/);
        const previewRes = await app.inject({
            method: 'GET',
            url: `/api/landing/lander`,
            query: { versionId }
        });
        expect(previewRes.statusCode).toBe(200);
        expect(previewRes.json().landingPageVersion.id).toBe(versionId);
        const hostRes = await app.inject({
            method: 'GET',
            url: '/',
            headers: { host: 'lander.example.com' }
        });
        expect(hostRes.statusCode).toBe(200);
        expect(hostRes.headers['content-type']).toContain('text/html');
        expect(hostRes.payload).toContain('Hello world');
        expect(hostRes.payload).toContain('Primary publisher');
        const hostVersionRes = await app.inject({
            method: 'GET',
            url: `/?versionId=${versionId}`,
            headers: { host: 'lander.example.com' }
        });
        expect(hostVersionRes.statusCode).toBe(200);
        expect(hostVersionRes.payload).toContain('Hello world');
        const draftRes = await app.inject({
            method: 'GET',
            url: `/api/landing/lander`,
            query: { draft: 'true' }
        });
        expect(draftRes.statusCode).toBe(200);
        expect(draftRes.json().landingPageVersion.id).toBe(versionId);
    });
});
