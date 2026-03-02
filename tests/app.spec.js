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
describe('health', () => {
    it('returns ok', async () => {
        const response = await app.inject({ method: 'GET', url: '/health' });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: 'ok' });
    });
});
describe('admin auth', () => {
    it('rejects protected endpoint without auth header', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/templates'
        });
        expect(response.statusCode).toBe(401);
    });
    it('rejects invalid login credentials', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                email: testAdminEnv.ADMIN_EMAIL,
                password: 'wrong-password'
            }
        });
        expect(response.statusCode).toBe(401);
    });
});
describe('lead intake', () => {
    it('accepts a valid lead and returns 202', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/leads',
            payload: {
                email: 'test@example.com',
                podId: 'cmp_123',
                landingPageVersionId: 'lpv_1',
                metadata: {
                    utmSource: 'google',
                    referrer: 'https://example.com'
                }
            }
        });
        expect(response.statusCode).toBe(202);
        const body = response.json();
        expect(body.status).toBe('accepted');
        expect(body.lead.email).toBe('test@example.com');
        expect(body.lead.podId).toBe('cmp_123');
        expect(body.lead.id).toBeTruthy();
    });
    it('returns 400 on invalid lead payload', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/leads',
            payload: {
                email: 'not-an-email',
                podId: ''
            }
        });
        expect(response.statusCode).toBe(400);
    });
    it('returns consent evidence for an email', async () => {
        await app.inject({
            method: 'POST',
            url: '/api/leads',
            payload: {
                email: 'consent@example.com',
                podId: 'cmp_consent'
            }
        });
        const response = await app.inject({
            method: 'GET',
            url: '/api/consent',
            headers: adminHeaders,
            query: { email: 'consent@example.com' }
        });
        expect(response.statusCode).toBe(200);
        expect(response.json().leads.length).toBeGreaterThan(0);
    });
});
