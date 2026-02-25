import type { DeliveryService } from './delivery-service.js';
import type { DisclosureService } from './disclosure-service.js';
import type { PodService } from './pod-service.js';
import type { Lead, LeadInput, LeadRepository } from '../domain/lead.js';

export class LeadService {
  constructor(
    private readonly repo: LeadRepository,
    private readonly disclosureService: DisclosureService,
    private readonly deliveryService: DeliveryService,
    private readonly podService: PodService
  ) {}

  async ingest(lead: LeadInput): Promise<Lead> {
    let disclosureHash: string | undefined;
    if (lead.disclosureVersionId) {
      const disclosure = await this.disclosureService.getById(lead.disclosureVersionId);
      if (!disclosure) {
        throw new Error('Disclosure version not found');
      }
      disclosureHash = disclosure.hash;
    }

    const stored = await this.repo.save({ ...lead, disclosureHash });
    const sponsors = await this.podService.listSponsors(lead.podId);
    await this.deliveryService.enqueueLead(stored, sponsors);
    return stored;
  }

  async getConsentEvidence(email: string, podId?: string): Promise<Lead[]> {
    return this.repo.findByEmail(email, podId);
  }
}
