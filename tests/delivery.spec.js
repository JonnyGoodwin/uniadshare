import { createHash } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { loadEnv } from '../src/config/env.js';
import { InMemoryPodRepository } from '../src/infra/memory/pod-repo.js';
import { InMemoryDeliveryQueue } from '../src/infra/memory/delivery-queue.js';
import { InMemoryDisclosureRepository } from '../src/infra/memory/disclosure-repo.js';
import { InMemoryLeadRepository } from '../src/infra/memory/lead-repo.js';
import { InMemorySuppressionService } from '../src/infra/memory/suppression-service.js';
import { InMemoryWebhookAdapter } from '../src/infra/memory/webhook-adapter.js';
import { PodService } from '../src/services/pod-service.js';
import { DeliveryService } from '../src/services/delivery-service.js';
import { DisclosureService } from '../src/services/disclosure-service.js';
import { LeadService } from '../src/services/lead-service.js';
const env = loadEnv({ NODE_ENV: 'test', PORT: '3001', BASE_DOMAIN: 'example.com' });
const deliveryQueue = new InMemoryDeliveryQueue();
const suppressionService = new InMemorySuppressionService();
const webhookAdapter = new InMemoryWebhookAdapter();
const disclosureRepo = new InMemoryDisclosureRepository();
const disclosureService = new DisclosureService(disclosureRepo);
const podService = new PodService(new InMemoryPodRepository(), disclosureService);
const deliveryService = new DeliveryService(deliveryQueue, suppressionService, webhookAdapter, env.WEBHOOK_DEFAULT_ENDPOINT);
const leadRepo = new InMemoryLeadRepository();
const leadService = new LeadService(leadRepo, disclosureService, deliveryService, podService);
const app = buildApp(env, {
    leadService,
    podService,
    disclosureService,
    deliveryService
});
afterAll(async () => {
    await app.close();
});
describe('delivery pipeline', () => {
    it('stores disclosure hash on lead and enqueues delivery', async () => {
        const campaignRes = await app.inject({
            method: 'POST',
            url: '/api/pods',
            payload: { name: 'Delivery Pod', subdomain: 'deliver' }
        });
        const podId = campaignRes.json().pod.id;
        const disclosureRes = await app.inject({
            method: 'POST',
            url: `/api/pods/${podId}/disclosures`,
            payload: { text: 'Disclosure text for hashing' }
        });
        const disclosureId = disclosureRes.json().disclosure.id;
        const disclosureHash = disclosureRes.json().disclosure.hash;
        const leadRes = await app.inject({
            method: 'POST',
            url: '/api/leads',
            payload: {
                email: 'queue@example.com',
                podId,
                disclosureVersionId: disclosureId
            }
        });
        expect(leadRes.statusCode).toBe(202);
        const jobs = await deliveryQueue.all();
        const job = jobs.find((j) => j.leadId === leadRes.json().lead.id);
        expect(job).toBeDefined();
        expect(job?.status).toBe('sent');
        // Verify hash stored
        const storedLead = leadRepo.all().find((l) => l.id === leadRes.json().lead.id);
        expect(storedLead?.disclosureHash).toBe(disclosureHash);
    });
    it('marks job suppressed when suppression list hit', async () => {
        const suppressionHash = createHash('sha256')
            .update('suppressed@example.com')
            .digest('hex');
        suppressionService.addSuppression('default', suppressionHash);
        const leadRes = await app.inject({
            method: 'POST',
            url: '/api/leads',
            payload: {
                email: 'suppressed@example.com',
                podId: 'cmp_suppressed'
            }
        });
        expect(leadRes.statusCode).toBe(202);
        const jobs = await deliveryQueue.all();
        const job = jobs.find((j) => j.leadId === leadRes.json().lead.id);
        expect(job?.status).toBe('suppressed');
    });
    it('lists deliveries via API', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/deliveries'
        });
        expect(res.statusCode).toBe(200);
        expect(res.json().deliveries.length).toBeGreaterThan(0);
    });
});
