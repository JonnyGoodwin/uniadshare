import { randomUUID } from 'node:crypto';

import type { DeliveryJob, DeliveryQueue } from '../../services/delivery-service.js';

export class InMemoryDeliveryQueue implements DeliveryQueue {
  private jobs: DeliveryJob[] = [];

  async enqueue(job: Omit<DeliveryJob, 'id' | 'status'>): Promise<DeliveryJob> {
    const record: DeliveryJob = { ...job, id: randomUUID(), status: 'queued', attempts: [] };
    this.jobs.push(record);
    return record;
  }

  async markSent(id: string): Promise<void> {
    this.updateStatus(id, 'sent');
  }

  async markSuppressed(id: string): Promise<void> {
    this.updateStatus(id, 'suppressed');
  }

  async markFailed(id: string): Promise<void> {
    this.updateStatus(id, 'failed');
  }

  async all(): Promise<DeliveryJob[]> {
    return this.jobs;
  }

  private updateStatus(id: string, status: DeliveryJob['status']): void {
    const job = this.jobs.find((j) => j.id === id);
    if (job) {
      job.status = status;
      job.attempts?.push({ status, at: new Date().toISOString() });
    }
  }
}
