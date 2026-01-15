import { prisma } from './client.js';
import type { DeliveryJob, DeliveryQueue } from '../../services/delivery-service.js';

export class PrismaDeliveryQueue implements DeliveryQueue {
  async enqueue(job: Omit<DeliveryJob, 'id' | 'status'>): Promise<DeliveryJob> {
    const record = await prisma.deliveryAttempt.create({
      data: {
        leadId: job.leadId,
        sponsorId: job.sponsorId,
        method: job.method,
        status: 'pending',
        response: { endpoint: job.endpoint, attempts: [] }
      }
    });
    return {
      id: record.id,
      leadId: record.leadId,
      sponsorId: record.sponsorId,
      status: 'queued',
      method: record.method as DeliveryJob['method'],
      endpoint: job.endpoint
    };
  }

  async markSent(id: string): Promise<void> {
    await prisma.deliveryAttempt.update({
      where: { id },
      data: {
        status: 'sent',
        response: this.appendAttempt(await this.getResponse(id), { status: 'sent' })
      }
    });
  }

  async markSuppressed(id: string): Promise<void> {
    await prisma.deliveryAttempt.update({
      where: { id },
      data: {
        status: 'suppressed',
        response: this.appendAttempt(await this.getResponse(id), { status: 'suppressed' })
      }
    });
  }

  async markFailed(id: string): Promise<void> {
    await prisma.deliveryAttempt.update({
      where: { id },
      data: {
        status: 'failed',
        response: this.appendAttempt(await this.getResponse(id), { status: 'failed' })
      }
    });
  }

  async all(): Promise<DeliveryJob[]> {
    const attempts = await prisma.deliveryAttempt.findMany();
    return attempts.map((a) => ({
      id: a.id,
      leadId: a.leadId,
      sponsorId: a.sponsorId,
      status: (a.status === 'pending' ? 'queued' : a.status) as DeliveryJob['status'],
      method: a.method as DeliveryJob['method'],
      endpoint: (a.response as { endpoint?: string } | null)?.endpoint ?? '',
      attempts: ((a.response as { attempts?: Array<{ status: string; at?: string }> } | null)
        ?.attempts ?? []) as Array<{ status: string; at?: string }>
    }));
  }

  private async getResponse(id: string): Promise<Record<string, unknown> | null> {
    const record = await prisma.deliveryAttempt.findUnique({
      where: { id },
      select: { response: true }
    });
    return (record?.response as Record<string, unknown> | null) ?? null;
  }

  private appendAttempt(
    response: Record<string, unknown> | null,
    attempt: Record<string, unknown>
  ): Record<string, unknown> {
    const attempts = (response?.attempts as Record<string, unknown>[] | undefined) ?? [];
    return {
      ...(response ?? {}),
      attempts: [...attempts, { ...attempt, at: new Date().toISOString() }]
    };
  }
}
