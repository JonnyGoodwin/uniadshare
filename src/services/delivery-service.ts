import { createHash } from 'node:crypto';

import type { Lead } from '../domain/lead.js';

export type DeliveryJob = {
  id: string;
  leadId: string;
  sponsorId: string;
  status: 'queued' | 'sent' | 'suppressed' | 'failed';
  method: 'webhook';
  endpoint: string;
  attempts?: Array<{ status: string; at?: string }>;
};

export interface DeliveryQueue {
  enqueue(job: Omit<DeliveryJob, 'id' | 'status'>): Promise<DeliveryJob>;
  markSent(id: string): Promise<void>;
  markSuppressed(id: string): Promise<void>;
  markFailed(id: string): Promise<void>;
  all(): Promise<DeliveryJob[]>;
}

export interface SuppressionService {
  isSuppressed(sponsorId: string, emailHash: string): Promise<boolean>;
}

export interface WebhookAdapter {
  send(endpoint: string, payload: unknown): Promise<{ success: boolean }>;
}

export class DeliveryService {
  constructor(
    private readonly queue: DeliveryQueue,
    private readonly suppression: SuppressionService,
    private readonly webhook: WebhookAdapter,
    private readonly defaultEndpoint: string = 'https://example.com/webhook'
  ) {}

  async enqueueLead(
    lead: Lead,
    sponsors: { sponsorId: string; webhookEndpoint: string; role: string }[]
  ): Promise<void> {
    const emailHash = createHash('sha256').update(lead.email.toLowerCase()).digest('hex');
    const targets =
      sponsors.length > 0
        ? sponsors
        : [{ sponsorId: 'default', webhookEndpoint: this.defaultEndpoint, role: 'primary' }];

    for (const target of targets) {
      const suppressed = await this.suppression.isSuppressed(target.sponsorId, emailHash);
      const job = await this.queue.enqueue({
        leadId: lead.id,
        sponsorId: target.sponsorId,
        method: 'webhook',
        endpoint: target.webhookEndpoint
      });

      if (suppressed) {
        await this.queue.markSuppressed(job.id);
        continue;
      }

      const payload = {
        lead: {
          id: lead.id,
          email: lead.email,
          podId: lead.podId,
          landingPageVersionId: lead.landingPageVersionId,
          disclosureVersionId: lead.disclosureVersionId,
          disclosureHash: lead.disclosureHash,
          metadata: lead.metadata
        },
        sponsor: { id: target.sponsorId, role: target.role }
      };

      const result = await this.webhook.send(job.endpoint, payload);
      if (result.success) {
        await this.queue.markSent(job.id);
      } else {
        await this.queue.markFailed(job.id);
      }
    }
  }

  listDeliveries(): Promise<DeliveryJob[]> {
    return this.queue.all();
  }
}
