import { randomUUID } from 'node:crypto';

import type { Lead, LeadInput, LeadRepository } from '../../domain/lead.js';

export class InMemoryLeadRepository implements LeadRepository {
  private leads: Lead[] = [];

  async save(input: LeadInput): Promise<Lead> {
    const lead: Lead = {
      ...input,
      id: randomUUID(),
      createdAt: input.consentedAt ?? new Date()
    };
    this.leads.push(lead);
    return lead;
  }

  all(): Lead[] {
    return this.leads;
  }

  async findByEmail(email: string, campaignId?: string): Promise<Lead[]> {
    return this.leads.filter(
      (l) => l.email.toLowerCase() === email.toLowerCase() && (!campaignId || l.campaignId === campaignId)
    );
  }
}
