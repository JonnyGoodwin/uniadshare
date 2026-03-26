import { prisma } from './client.js';
import type { Lead, LeadInput, LeadRepository } from '../../domain/lead.js';

export class PrismaLeadRepository implements LeadRepository {
  async save(input: LeadInput): Promise<Lead> {
    const metadata = {
      ...(input.metadata ?? {}),
      ...(input.phone ? { phone: input.phone } : {})
    };
    const record = await prisma.lead.create({
      data: {
        email: input.email ?? '',
        name: input.name,
        podId: input.podId,
        landingPageVersionId: input.landingPageVersionId,
        disclosureVersionId: input.disclosureVersionId,
        consentedAt: input.consentedAt ?? new Date(),
        disclosureHash: input.disclosureHash,
        metadata,
        events: {
          create: {
            type: 'consent_recorded',
            detail: {
              source: 'api'
            }
          }
        }
      }
    });

    return {
      id: record.id,
      email: record.email || undefined,
      name: record.name ?? undefined,
      phone:
        record.metadata && typeof record.metadata === 'object' && 'phone' in (record.metadata as Record<string, unknown>)
          ? ((record.metadata as Record<string, unknown>).phone as string | undefined)
          : undefined,
      podId: record.podId,
      landingPageVersionId: record.landingPageVersionId,
      disclosureVersionId: record.disclosureVersionId,
      disclosureHash: record.disclosureHash ?? undefined,
      consentedAt: record.consentedAt,
      metadata: (record.metadata as Record<string, unknown>) ?? undefined,
      createdAt: record.createdAt
    };
  }

  async findByEmail(email: string, podId?: string): Promise<Lead[]> {
    const leads = await prisma.lead.findMany({
      where: {
        email: email.toLowerCase(),
        ...(podId ? { podId } : {})
      },
      include: {
        disclosureVersion: true,
        landingPageVersion: true
      }
    });

    return leads.map((record) => ({
      id: record.id,
      email: record.email || undefined,
      name: record.name ?? undefined,
      phone:
        record.metadata && typeof record.metadata === 'object' && 'phone' in (record.metadata as Record<string, unknown>)
          ? ((record.metadata as Record<string, unknown>).phone as string | undefined)
          : undefined,
      podId: record.podId,
      landingPageVersionId: record.landingPageVersionId ?? undefined,
      disclosureVersionId: record.disclosureVersionId ?? undefined,
      disclosureHash: record.disclosureHash ?? undefined,
      consentedAt: record.consentedAt,
      metadata: (record.metadata as Record<string, unknown>) ?? undefined,
      createdAt: record.createdAt
    }));
  }
}
