import { prisma } from './client.js';
import type { Lead, LeadInput, LeadRepository } from '../../domain/lead.js';

export class PrismaLeadRepository implements LeadRepository {
  async save(input: LeadInput): Promise<Lead> {
    const record = await prisma.lead.create({
      data: {
        email: input.email,
        name: input.name,
        campaignId: input.campaignId,
        landingPageVersionId: input.landingPageVersionId,
        disclosureVersionId: input.disclosureVersionId,
        consentedAt: input.consentedAt ?? new Date(),
        disclosureHash: input.disclosureHash,
        metadata: input.metadata ?? {},
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
      email: record.email,
      name: record.name ?? undefined,
      campaignId: record.campaignId,
      landingPageVersionId: record.landingPageVersionId,
      disclosureVersionId: record.disclosureVersionId,
      disclosureHash: record.disclosureHash ?? undefined,
      consentedAt: record.consentedAt,
      metadata: (record.metadata as Record<string, unknown>) ?? undefined,
      createdAt: record.createdAt
    };
  }

  async findByEmail(email: string, campaignId?: string): Promise<Lead[]> {
    const leads = await prisma.lead.findMany({
      where: {
        email: email.toLowerCase(),
        ...(campaignId ? { campaignId } : {})
      },
      include: {
        disclosureVersion: true,
        landingPageVersion: true
      }
    });

    return leads.map((record) => ({
      id: record.id,
      email: record.email,
      name: record.name ?? undefined,
      campaignId: record.campaignId,
      landingPageVersionId: record.landingPageVersionId ?? undefined,
      disclosureVersionId: record.disclosureVersionId ?? undefined,
      disclosureHash: record.disclosureHash ?? undefined,
      consentedAt: record.consentedAt,
      metadata: (record.metadata as Record<string, unknown>) ?? undefined,
      createdAt: record.createdAt
    }));
  }
}
